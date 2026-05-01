import * as cdk from "aws-cdk-lib/core";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import * as path from "path";

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ─── DynamoDB ───────────────────────────────────────────────────────────────

    // Reference the interns table you create and populate with dummy data
    const tableName = this.node.tryGetContext("tableName") ?? process.env.TABLE_NAME ?? "sprout-interns";
    const internsTable = dynamodb.Table.fromTableName(this, "InternsTable", tableName);

    // CDK-managed audit log table
    const auditTable = new dynamodb.Table(this, "AuditLogTable", {
      tableName: "sprout-audit-log",
      partitionKey: { name: "logId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ─── Lambda helpers ─────────────────────────────────────────────────────────

    const bundling: lambdaNodejs.BundlingOptions = {
      externalModules: [],
      forceDockerBundling: false,
    };

    function makeFn(scope: Construct, id: string, entry: string, env: Record<string, string>) {
      return new lambdaNodejs.NodejsFunction(scope, id, {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry,
        handler: "handler",
        environment: env,
        bundling,
      });
    }

    // ─── Lambda Functions ───────────────────────────────────────────────────────

    const internsLambda = makeFn(this, "InternsHandler", path.join(__dirname, "../lambda/interns.ts"), {
      TABLE_NAME: tableName,
    });

    const metricsLambda = makeFn(this, "MetricsHandler", path.join(__dirname, "../lambda/metrics.ts"), {
      TABLE_NAME: tableName,
    });

    const commsLambda = makeFn(this, "CommunicationsHandler", path.join(__dirname, "../lambda/communications.ts"), {
      SES_FROM_EMAIL: this.node.tryGetContext("sesFromEmail") ?? "noreply@example.com",
      AUDIT_TABLE_NAME: auditTable.tableName,
    });

    // ─── Permissions ────────────────────────────────────────────────────────────

    internsTable.grantReadWriteData(internsLambda);
    internsTable.grantReadData(metricsLambda);

    auditTable.grantReadWriteData(commsLambda);

    commsLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: ["*"],
      })
    );

    // ─── API Gateway ────────────────────────────────────────────────────────────

    const api = new apigateway.RestApi(this, "SproutApi", {
      restApiName: "SPROUT API",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const internsInt = new apigateway.LambdaIntegration(internsLambda);
    const metricsInt = new apigateway.LambdaIntegration(metricsLambda);
    const commsInt = new apigateway.LambdaIntegration(commsLambda);

    // ── /interns ────────────────────────────────────────────────────────────────
    // GET  ?stage=&location=&programStatus=&graduationCohort=&manager=&mentor=
    //      &search=&riskFlags=&reviewEligibility=May|October&upcomingMeetings=true&withRiskFlags=true
    // POST (create intern)
    const interns = api.root.addResource("interns");
    interns.addMethod("GET", internsInt);
    interns.addMethod("POST", internsInt);

    // ── /interns/{internId} ─────────────────────────────────────────────────────
    const intern = interns.addResource("{internId}");
    intern.addMethod("GET", internsInt);
    intern.addMethod("PATCH", internsInt);
    intern.addMethod("DELETE", internsInt);

    // ── /metrics ─────────────────────────────────────────────────────────────────
    const metrics = api.root.addResource("metrics");

    // GET /metrics/overview — total by status, by location, joiners/leavers per month,
    //   attrition, net growth, avg time in program, post-program retention, promotion timeline
    metrics.addResource("overview").addMethod("GET", metricsInt);

    // GET /metrics/performance-reviews — by stage, avg time per stage, dwell distribution,
    //   approaching promotion, risk summary, review eligibility (May + October)
    metrics.addResource("performance-reviews").addMethod("GET", metricsInt);

    // GET /metrics/fte-conversions — graduating by cohort, hiring→offer timeline,
    //   incline breakdown, offer acceptance rate, offer ready page, upcoming meetings
    metrics.addResource("fte-conversions").addMethod("GET", metricsInt);

    // ── /communications ──────────────────────────────────────────────────────────
    const comms = api.root.addResource("communications");

    // POST /communications/send — bulk email via SES, writes audit log
    comms.addResource("send").addMethod("POST", commsInt);

    // POST /communications/preview — render template with intern fields, no send
    comms.addResource("preview").addMethod("POST", commsInt);

    // GET /communications/audit — full audit log (sorted newest first)
    comms.addResource("audit").addMethod("GET", commsInt);

    // GET  /communications/templates — full template library
    // (templates are hardcoded in Lambda; no DB needed)
    const templates = comms.addResource("templates");
    templates.addMethod("GET", commsInt);

    // GET /communications/templates/{templateId}
    templates.addResource("{templateId}").addMethod("GET", commsInt);

    // ─── Outputs ─────────────────────────────────────────────────────────────────

    new cdk.CfnOutput(this, "ApiUrl", { value: api.url, exportName: "SproutApiUrl" });
    new cdk.CfnOutput(this, "AuditTableName", { value: auditTable.tableName });
  }
}
