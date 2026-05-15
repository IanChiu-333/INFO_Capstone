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
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => fields[key] ?? `{{${key}}}`);
}

// ─── Template Library ─────────────────────────────────────────────────────────

const TEMPLATES: Record<string, { id: string; name: string; category: string; subject: string; body: string }> = {
  "fte-hiring-prep": {
    id: "fte-hiring-prep",
    name: "Hiring Meeting Preparation",
    category: "FTE Conversion",
    subject: "Upcoming Hiring Meeting for {{First and Last Name}}",
    body: `Hi {{Mentor Contact}} and {{Manager Contact}},

This is a reminder that the hiring meeting for {{First and Last Name}} is scheduled for {{Hiring Meeting Date}}.

Intern Details:
- Name: {{First and Last Name}}
- Stage: {{Stage}}
- Location: {{Site Location}}
- Start Date: {{Start Date}}

Please come prepared with performance feedback and any relevant documentation.

Best regards,
JDP Program Team`,
  },
  "fte-full-time-expectations": {
    id: "fte-full-time-expectations",
    name: "Full-Time Expectations Communication",
    category: "FTE Conversion",
    subject: "Your Full-Time Offer with Amazon — Next Steps",
    body: `Hi {{First and Last Name}},

Congratulations on your strong performance in the Junior Developer Program!

We'd like to share information about transitioning to a full-time role at Amazon. Your expected graduation is {{Grad Date}}.

Please connect with your manager {{Manager Contact}} and mentor {{Mentor Contact}} for next steps.

Best regards,
JDP Program Team`,
  },
  "fte-offer-extension": {
    id: "fte-offer-extension",
    name: "Offer Extension Notification",
    category: "FTE Conversion",
    subject: "Full-Time Offer Extended — {{First and Last Name}}",
    body: `Hi {{Manager Contact}},

A full-time offer has been extended to {{First and Last Name}} from the JDP program.

Please follow up to ensure they have everything needed to make their decision.

Best regards,
JDP Program Team`,
  },
  "fte-offer-ready-followup": {
    id: "fte-offer-ready-followup",
    name: "Offer Ready Wiki Follow-Up",
    category: "FTE Conversion",
    subject: "Follow-Up: {{First and Last Name}} on Offer Ready Wiki",
    body: `Hi {{Manager Contact}},

We noticed {{First and Last Name}} has been on the Offer Ready Wiki Page for an extended period. Please provide an update on their offer status.

Best regards,
JDP Program Team`,
  },
  "perf-may-review-prep": {
    id: "perf-may-review-prep",
    name: "May Review Preparation",
    category: "Performance Review",
    subject: "May Performance Review — {{First and Last Name}}",
    body: `Hi {{Mentor Contact}} and {{Manager Contact}},

The May performance review cycle is approaching for {{First and Last Name}} ({{Stage}}, {{Site Location}}).

Please submit your review feedback by the deadline. Contact your program manager with any questions.

Best regards,
JDP Program Team`,
  },
  "perf-october-review-prep": {
    id: "perf-october-review-prep",
    name: "October Review Preparation",
    category: "Performance Review",
    subject: "October Performance Review — {{First and Last Name}}",
    body: `Hi {{Mentor Contact}} and {{Manager Contact}},

The October performance review cycle is approaching for {{First and Last Name}} ({{Stage}}, {{Site Location}}).

Please submit your review feedback by the deadline.

Best regards,
JDP Program Team`,
  },
  "perf-check-in": {
    id: "perf-check-in",
    name: "At-Risk Intern Check-In",
    category: "Performance Review",
    subject: "Check-In Request for {{First and Last Name}}",
    body: `Hi {{Manager Contact}},

We'd like to schedule a check-in regarding {{First and Last Name}}'s progress in {{Stage}}. They have been flagged for follow-up.

Please reach out to the program team at your earliest convenience.

Best regards,
JDP Program Team`,
  },
  "perf-mentor-assignment": {
    id: "perf-mentor-assignment",
    name: "Mentor Assignment Notification",
    category: "Performance Review",
    subject: "Mentor Assignment Update for {{First and Last Name}}",
    body: `Hi {{Manager Contact}},

This is a notification that {{Mentor Contact}} has been assigned as the mentor for {{First and Last Name}}.

Please ensure introductions are made and the mentorship plan is in place.

Best regards,
JDP Program Team`,
  },
  "perf-pip": {
    id: "perf-pip",
    name: "Performance Improvement Plan Notification",
    category: "Performance Review",
    subject: "Performance Improvement Plan — {{First and Last Name}}",
    body: `Hi {{Manager Contact}} and {{Mentor Contact}},

A Performance Improvement Plan has been initiated for {{First and Last Name}}. Please review the plan details and provide support as outlined.

Best regards,
JDP Program Team`,
  },
  "general-program-update": {
    id: "general-program-update",
    name: "General Program Update",
    category: "General",
    subject: "JDP Program Update",
    body: `Hi {{Manager Contact}},

This is a general update from the Junior Developer Program regarding {{First and Last Name}} ({{Stage}}, {{Site Location}}).

Please contact your program manager for details.

Best regards,
JDP Program Team`,
  },
  "general-manager-followup": {
    id: "general-manager-followup",
    name: "Manager Follow-Up",
    category: "General",
    subject: "Follow-Up Request: {{First and Last Name}}",
    body: `Hi {{Manager Contact}},

We'd like to follow up regarding {{First and Last Name}}'s progress and current status in the program.

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

      const results: { "First and Last Name": string; status: string }[] = [];

      for (const intern of recipients) {
        const fields = intern as Record<string, string>;
        const toAddresses = [intern["Manager Email"], intern["Mentor Email"]].filter(Boolean) as string[];
        if (!toAddresses.length) {
          results.push({ "First and Last Name": intern["First and Last Name"], status: "skipped — no recipients" });
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
        results.push({ "First and Last Name": intern["First and Last Name"], status: "sent" });
      }

      await ddb.send(
        new PutCommand({
          TableName: AUDIT_TABLE,
          Item: {
            logId: randomUUID(),
            timestamp: new Date().toISOString(),
            templateId: tid ?? "custom",
            recipientCount: recipients.length,
            recipients: recipients.map((i: Record<string, string>) => i["First and Last Name"]),
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
