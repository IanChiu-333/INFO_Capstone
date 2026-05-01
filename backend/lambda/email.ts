import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const ses = new SESClient({});
const SES_FROM = process.env.SES_FROM_EMAIL!;

function ok(body: unknown) {
  return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(body) };
}
function err(code: number, msg: string) {
  return { statusCode: code, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: msg }) };
}

function fillTemplate(template: string, fields: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => fields[key] ?? `{{${key}}}`);
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const { recipients, subject, templateBody, fields } = JSON.parse(event.body ?? "{}");

    if (!recipients?.length || !subject || !templateBody) {
      return err(400, "recipients, subject, and templateBody are required");
    }

    const results: { email: string; status: string }[] = [];

    for (const intern of recipients) {
      const merged = fillTemplate(templateBody, { ...intern, ...fields });
      await ses.send(
        new SendEmailCommand({
          Source: SES_FROM,
          Destination: { ToAddresses: [intern.managerEmail, intern.mentorEmail].filter(Boolean) },
          Message: {
            Subject: { Data: fillTemplate(subject, intern) },
            Body: { Text: { Data: merged } },
          },
        })
      );
      results.push({ email: intern.internName, status: "sent" });
    }

    return ok({ sent: results.length, results });
  } catch (e) {
    console.error(e);
    return err(500, "Internal server error");
  }
}
