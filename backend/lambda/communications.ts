import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { randomUUID } from "crypto";

const ses = new SESClient({});
const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

const SES_FROM = process.env.SES_FROM_EMAIL!;
const AUDIT_TABLE = process.env.AUDIT_TABLE_NAME!;

function ok(body: unknown): APIGatewayProxyResult {
  return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(body) };
}
function err(code: number, msg: string): APIGatewayProxyResult {
  return { statusCode: code, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: msg }) };
}

function fillTemplate(template: string, fields: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => fields[key] ?? `{{${key}}}`);
}

// ─── Template Library ─────────────────────────────────────────────────────────

const TEMPLATES: Record<string, { id: string; name: string; category: string; subject: string; body: string }> = {
  "fte-hiring-prep": {
    id: "fte-hiring-prep",
    name: "Hiring Meeting Preparation",
    category: "FTE Conversion",
    subject: "Upcoming Hiring Meeting for {{firstAndLastName}}",
    body: `Hi {{mentorContact}} and {{managerContact}},

This is a reminder that the hiring meeting for {{firstAndLastName}} is scheduled for {{hiringMeetingDate}}.

Intern Details:
- Name: {{firstAndLastName}}
- Stage: {{stage}}
- Location: {{siteLocation}}
- Start Date: {{startDate}}

Please come prepared with performance feedback and any relevant documentation.

Best regards,
JDP Program Team`,
  },
  "fte-full-time-expectations": {
    id: "fte-full-time-expectations",
    name: "Full-Time Expectations Communication",
    category: "FTE Conversion",
    subject: "Your Full-Time Offer with Amazon — Next Steps",
    body: `Hi {{firstAndLastName}},

Congratulations on your strong performance in the Junior Developer Program!

We'd like to share information about transitioning to a full-time role at Amazon. Your expected graduation is {{gradDate}} ({{graduationCohort}} cohort).

Please connect with your manager {{managerContact}} and mentor {{mentorContact}} for next steps.

Best regards,
JDP Program Team`,
  },
  "fte-offer-extension": {
    id: "fte-offer-extension",
    name: "Offer Extension Notification",
    category: "FTE Conversion",
    subject: "Full-Time Offer Extended — {{firstAndLastName}}",
    body: `Hi {{managerContact}},

A full-time offer has been extended to {{firstAndLastName}} from the JDP program.

Please follow up to ensure they have everything needed to make their decision.

Best regards,
JDP Program Team`,
  },
  "fte-offer-ready-followup": {
    id: "fte-offer-ready-followup",
    name: "Offer Ready Wiki Follow-Up",
    category: "FTE Conversion",
    subject: "Follow-Up: {{firstAndLastName}} on Offer Ready Wiki",
    body: `Hi {{managerContact}},

We noticed {{firstAndLastName}} has been on the Offer Ready Wiki Page for an extended period. Please provide an update on their offer status.

Best regards,
JDP Program Team`,
  },
  "perf-may-review-prep": {
    id: "perf-may-review-prep",
    name: "May Review Preparation",
    category: "Performance Review",
    subject: "May Performance Review — {{firstAndLastName}}",
    body: `Hi {{mentorContact}} and {{managerContact}},

The May performance review cycle is approaching for {{firstAndLastName}} ({{stage}}, {{siteLocation}}).

Please submit your review feedback by the deadline. Contact your program manager with any questions.

Best regards,
JDP Program Team`,
  },
  "perf-october-review-prep": {
    id: "perf-october-review-prep",
    name: "October Review Preparation",
    category: "Performance Review",
    subject: "October Performance Review — {{firstAndLastName}}",
    body: `Hi {{mentorContact}} and {{managerContact}},

The October performance review cycle is approaching for {{firstAndLastName}} ({{stage}}, {{siteLocation}}).

Please submit your review feedback by the deadline.

Best regards,
JDP Program Team`,
  },
  "perf-check-in": {
    id: "perf-check-in",
    name: "At-Risk Intern Check-In",
    category: "Performance Review",
    subject: "Check-In Request for {{firstAndLastName}}",
    body: `Hi {{managerContact}},

We'd like to schedule a check-in regarding {{firstAndLastName}}'s progress in {{stage}}. They have been flagged for follow-up.

Please reach out to the program team at your earliest convenience.

Best regards,
JDP Program Team`,
  },
  "perf-mentor-assignment": {
    id: "perf-mentor-assignment",
    name: "Mentor Assignment Notification",
    category: "Performance Review",
    subject: "Mentor Assignment Update for {{firstAndLastName}}",
    body: `Hi {{managerContact}},

This is a notification that {{mentorContact}} has been assigned as the mentor for {{firstAndLastName}}.

Please ensure introductions are made and the mentorship plan is in place.

Best regards,
JDP Program Team`,
  },
  "perf-pip": {
    id: "perf-pip",
    name: "Performance Improvement Plan Notification",
    category: "Performance Review",
    subject: "Performance Improvement Plan — {{firstAndLastName}}",
    body: `Hi {{managerContact}} and {{mentorContact}},

A Performance Improvement Plan has been initiated for {{firstAndLastName}}. Please review the plan details and provide support as outlined.

Best regards,
JDP Program Team`,
  },
  "general-program-update": {
    id: "general-program-update",
    name: "General Program Update",
    category: "General",
    subject: "JDP Program Update",
    body: `Hi {{managerContact}},

This is a general update from the Junior Developer Program regarding {{firstAndLastName}} ({{stage}}, {{siteLocation}}).

Please contact your program manager for details.

Best regards,
JDP Program Team`,
  },
  "general-manager-followup": {
    id: "general-manager-followup",
    name: "Manager Follow-Up",
    category: "General",
    subject: "Follow-Up Request: {{firstAndLastName}}",
    body: `Hi {{managerContact}},

We'd like to follow up regarding {{firstAndLastName}}'s progress and current status in the program.

Please respond at your earliest convenience.

Best regards,
JDP Program Team`,
  },
};

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const resource = event.resource;
  const method = event.httpMethod;
  const templateId = event.pathParameters?.templateId;

  try {
    // GET /communications/templates
    if (resource === "/communications/templates" && method === "GET") {
      return ok(Object.values(TEMPLATES));
    }

    // GET /communications/templates/{templateId}
    if (resource === "/communications/templates/{templateId}" && method === "GET") {
      const tmpl = TEMPLATES[templateId!];
      if (!tmpl) return err(404, "Template not found");
      return ok(tmpl);
    }

    // POST /communications/preview
    if (resource === "/communications/preview" && method === "POST") {
      const { templateId: tid, intern } = JSON.parse(event.body ?? "{}");
      const tmpl = TEMPLATES[tid];
      if (!tmpl) return err(404, "Template not found");
      const fields = intern as Record<string, string>;
      return ok({
        subject: fillTemplate(tmpl.subject, fields),
        body: fillTemplate(tmpl.body, fields),
      });
    }

    // POST /communications/send
    if (resource === "/communications/send" && method === "POST") {
      const { recipients, templateId: tid, customSubject, customBody } = JSON.parse(event.body ?? "{}");
      if (!recipients?.length) return err(400, "recipients is required");

      const tmpl = TEMPLATES[tid];
      const subjectTmpl = customSubject ?? tmpl?.subject;
      const bodyTmpl = customBody ?? tmpl?.body;
      if (!subjectTmpl || !bodyTmpl) return err(400, "templateId or customSubject+customBody required");

      const results: { firstAndLastName: string; status: string }[] = [];

      for (const intern of recipients) {
        const fields = intern as Record<string, string>;
        const toAddresses = [intern.managerEmail, intern.mentorEmail].filter(Boolean) as string[];
        if (!toAddresses.length) {
          results.push({ firstAndLastName: intern.firstAndLastName, status: "skipped — no recipients" });
          continue;
        }

        await ses.send(
          new SendEmailCommand({
            Source: SES_FROM,
            Destination: { ToAddresses: toAddresses },
            Message: {
              Subject: { Data: fillTemplate(subjectTmpl, fields) },
              Body: { Text: { Data: fillTemplate(bodyTmpl, fields) } },
            },
          })
        );
        results.push({ firstAndLastName: intern.firstAndLastName, status: "sent" });
      }

      await ddb.send(
        new PutCommand({
          TableName: AUDIT_TABLE,
          Item: {
            logId: randomUUID(),
            timestamp: new Date().toISOString(),
            templateId: tid ?? "custom",
            recipientCount: recipients.length,
            recipients: recipients.map((i: Record<string, string>) => i.firstAndLastName),
            results,
          },
        })
      );

      return ok({ sent: results.filter((r) => r.status === "sent").length, results });
    }

    // GET /communications/audit
    if (resource === "/communications/audit" && method === "GET") {
      const result = await ddb.send(new ScanCommand({ TableName: AUDIT_TABLE }));
      const items = (result.Items ?? []).sort((a, b) =>
        (b.timestamp as string).localeCompare(a.timestamp as string)
      );
      return ok(items);
    }

    return err(404, "Route not found");
  } catch (e) {
    console.error(e);
    return err(500, "Internal server error");
  }
}
