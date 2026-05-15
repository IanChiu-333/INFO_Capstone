import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

// Stage dwell thresholds in months
const STAGE_THRESHOLDS: Record<string, { yellow: number; red: number }> = {
  "Stage 1": { yellow: 10, red: 12 },
  "Stage 2": { yellow: 10, red: 12 },
  "Stage 3": { yellow: 15, red: 18 },
};

function ok(body: unknown): APIGatewayProxyResult {
  return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(body) };
}
function err(code: number, msg: string): APIGatewayProxyResult {
  return { statusCode: code, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: msg }) };
}

function monthsBetween(dateStr: string, toDate = new Date()): number {
  const d = new Date(dateStr);
  return (toDate.getFullYear() - d.getFullYear()) * 12 + (toDate.getMonth() - d.getMonth());
}

function getStageStartDate(intern: Record<string, unknown>): string | undefined {
  const stage = intern.stage as string;
  if (stage === "Stage 3") return (intern.stage3PromoDate ?? intern.stage2PromoDate ?? intern.startDate) as string | undefined;
  if (stage === "Stage 2") return (intern.stage2PromoDate ?? intern.startDate) as string | undefined;
  return intern.startDate as string | undefined;
}

function computeRiskFlags(intern: Record<string, unknown>): string[] {
  const flags: string[] = [];
  const now = new Date();
  const stage = intern.stage as string;
  const thresholds = STAGE_THRESHOLDS[stage];
  const stageStartDate = getStageStartDate(intern);

  if (thresholds && stageStartDate) {
    const monthsInStage = monthsBetween(stageStartDate, now);
    if (monthsInStage > thresholds.red) flags.push("exceeding_dwell_time");
    if (monthsInStage > thresholds.red) flags.push("promotion_overdue");
  }

  if (!intern.mentorContact || (intern.mentorContact as string).trim() === "") {
    flags.push("no_mentor");
  }

  const changeLog = intern.mentorChangeLog as string[] | undefined;
  if (Array.isArray(changeLog) && changeLog.length >= 2) {
    flags.push("mentor_changes");
  }

  if (flags.length >= 2) flags.push("at_risk");

  return flags;
}

function applyFilters(
  items: Record<string, unknown>[],
  params: Record<string, string | undefined>
): Record<string, unknown>[] {
  const {
    stage, location, programStatus, graduationCohort,
    manager, mentor, search, riskFlags, reviewEligibility, year,
  } = params;

  let result = items;

  if (stage) result = result.filter((i) => i.stage === stage);
  if (location) result = result.filter((i) => i.siteLocation === location);
  if (programStatus) result = result.filter((i) => i.programStatus === programStatus);
  if (graduationCohort) result = result.filter((i) => i.graduationCohort === graduationCohort);
  if (manager) result = result.filter((i) => (i.managerContact as string)?.toLowerCase().includes(manager.toLowerCase()));
  if (mentor) result = result.filter((i) => (i.mentorContact as string)?.toLowerCase().includes(mentor.toLowerCase()));
  if (search) result = result.filter((i) => (i.firstAndLastName as string)?.toLowerCase().includes(search.toLowerCase()));
  if (year) result = result.filter((i) => i.startDate && (i.startDate as string).startsWith(year));

  if (reviewEligibility === "May") result = result.filter((i) => i.reviewEligibilityMay === "Yes");
  if (reviewEligibility === "October") result = result.filter((i) => i.reviewEligibilityOctober === "Yes");

  if (riskFlags) {
    const requestedFlags = riskFlags.split(",");
    result = result.filter((i) => {
      const flags = computeRiskFlags(i);
      return requestedFlags.some((f) => flags.includes(f));
    });
  }

  return result;
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod;
  const employeeId = event.pathParameters?.employeeId;
  const params = (event.queryStringParameters ?? {}) as Record<string, string | undefined>;

  try {
    // GET /interns or GET /interns?upcomingMeetings=true
    if (method === "GET" && !employeeId) {
      const result = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));
      let items = (result.Items ?? []) as Record<string, unknown>[];

      if (params.upcomingMeetings === "true") {
        const now = new Date().toISOString().split("T")[0];
        items = items
          .filter((i) => i.hiringMeetingDate && (i.hiringMeetingDate as string) >= now)
          .sort((a, b) =>
            (a.hiringMeetingDate as string).localeCompare(b.hiringMeetingDate as string)
          );
        return ok(items);
      }

      items = applyFilters(items, params);

      if (params.withRiskFlags === "true" || params.riskFlags) {
        items = items.map((i) => ({ ...i, _riskFlags: computeRiskFlags(i) }));
      }

      return ok(items);
    }

    // GET /interns/{employeeId}
    if (method === "GET" && employeeId) {
      const result = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: { employeeId } }));
      if (!result.Item) return err(404, "Intern not found");
      return ok({ ...result.Item, _riskFlags: computeRiskFlags(result.Item as Record<string, unknown>) });
    }

    // POST /interns
    if (method === "POST") {
      const body = JSON.parse(event.body ?? "{}");
      if (!body.employeeId) return err(400, "employeeId is required");
      await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: body }));
      return ok(body);
    }

    // PATCH /interns/{employeeId}
    if (method === "PATCH" && employeeId) {
      const body = JSON.parse(event.body ?? "{}");
      const keys = Object.keys(body);
      if (!keys.length) return err(400, "No fields to update");

      const updateExpr = "SET " + keys.map((_k, i) => `#k${i} = :v${i}`).join(", ");
      const exprNames = Object.fromEntries(keys.map((k, idx) => [`#k${idx}`, k]));
      const exprValues = Object.fromEntries(keys.map((k, idx) => [`:v${idx}`, body[k]]));

      const result = await ddb.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { employeeId },
          UpdateExpression: updateExpr,
          ExpressionAttributeNames: exprNames,
          ExpressionAttributeValues: exprValues,
          ReturnValues: "ALL_NEW",
        })
      );
      return ok(result.Attributes);
    }

    // DELETE /interns/{employeeId}
    if (method === "DELETE" && employeeId) {
      await ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { employeeId } }));
      return ok({ deleted: employeeId });
    }

    return err(405, "Method not allowed");
  } catch (e) {
    console.error(e);
    return err(500, "Internal server error");
  }
}
