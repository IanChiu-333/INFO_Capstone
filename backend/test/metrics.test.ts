const mockSend = jest.fn();

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn().mockReturnValue({ send: mockSend }),
  },
  ScanCommand: jest.fn().mockImplementation((i: unknown) => i),
}));

import { handler } from '../lambda/metrics';
import type { APIGatewayProxyEvent } from 'aws-lambda';

function event(resource: string): APIGatewayProxyEvent {
  return {
    httpMethod: 'GET',
    path: resource,
    resource,
    pathParameters: null,
    queryStringParameters: null,
    headers: {},
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    body: null,
    isBase64Encoded: false,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    stageVariables: null,
  };
}

// Covers all metric types: active, inactive with exit, with risk flags, FTE data
const SAMPLE_INTERNS = [
  {
    "Employee ID": 'i1',
    "First and Last Name": 'Alice',
    "Program Status": 'Active',
    "Stage": 'Stage 1',
    "Site Location": 'Seattle',
    "Start Date": '2025-10-01',
    "Stage 2 Promo Date": '2025-12-01',
    "Manager Contact": 'Bob',
    "Mentor Contact": 'Carol',
    "Hiring Meeting Date": '2027-06-01',
  },
  {
    "Employee ID": 'i2',
    "First and Last Name": 'Dave',
    "Program Status": 'Inactive',
    "Stage": 'Stage 3',
    "Site Location": 'New York',
    "Start Date": '2022-01-01',
    "Exit Date": '2025-01-01',
    "Stage 3 Promo Date": '2024-06-01',
    "Manager Contact": 'Eve',
    "Mentor Contact": 'Frank',
    "Grad Date": '2026-05-01',
    "Hiring Meeting Date": '2024-11-01',
    "Hiring Meeting Outcome": 'Inclined',
    "FTE Offer Status": 'Accepted',
  },
  {
    "Employee ID": 'i3',
    "First and Last Name": 'Grace',
    "Program Status": 'Inactive',
    "Stage": 'Stage 2',
    "Site Location": 'Seattle',
    "Start Date": '2023-01-01',
    "Exit Date": '2024-06-01',
    "Manager Contact": 'Henry',
    "Mentor Contact": '',
    "Stage 2 Promo Date": '2021-01-01',
    mentorChangeLog: ['date1', 'date2'],
  },
];

beforeEach(() => {
  mockSend.mockReset();
  mockSend.mockResolvedValue({ Items: SAMPLE_INTERNS });
});

// ─── GET /metrics/overview ────────────────────────────────────────────────────

describe('GET /metrics/overview', () => {
  test('returns total by program status', async () => {
    const res = await handler(event('/metrics/overview'));
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.totalByStatus).toMatchObject({
      Active: 1,
      Inactive: 2,
    });
  });

  test('counts active interns by location', async () => {
    const res = await handler(event('/metrics/overview'));
    const { byLocation } = JSON.parse(res.body);
    expect(byLocation.Seattle).toBe(1);
    expect(byLocation['New York']).toBeUndefined(); // Dave is Inactive, not Active
  });

  test('returns joiners and leavers by month arrays', async () => {
    const res = await handler(event('/metrics/overview'));
    const { joinersByMonth, leaversByMonth } = JSON.parse(res.body);
    expect(Array.isArray(joinersByMonth)).toBe(true);
    expect(Array.isArray(leaversByMonth)).toBe(true);
    const oct2025 = joinersByMonth.find((m: { month: string }) => m.month === '2025-10');
    expect(oct2025?.count).toBe(1); // Alice
  });

  test('returns net growth by month', async () => {
    const res = await handler(event('/metrics/overview'));
    const { netGrowthByMonth } = JSON.parse(res.body);
    expect(Array.isArray(netGrowthByMonth)).toBe(true);
    expect(netGrowthByMonth[0]).toHaveProperty('month');
    expect(netGrowthByMonth[0]).toHaveProperty('net');
  });

  test('returns average time in program', async () => {
    const res = await handler(event('/metrics/overview'));
    const { avgTimeInProgramMonths } = JSON.parse(res.body);
    expect(typeof avgTimeInProgramMonths).toBe('number');
    expect(avgTimeInProgramMonths).toBeGreaterThanOrEqual(0);
  });
});

// ─── GET /metrics/performance-reviews ────────────────────────────────────────

describe('GET /metrics/performance-reviews', () => {
  test('returns intern counts by stage (active only)', async () => {
    const res = await handler(event('/metrics/performance-reviews'));
    expect(res.statusCode).toBe(200);
    const { byStage } = JSON.parse(res.body);
    expect(byStage['Stage 1']).toBe(1); // Alice
    expect(byStage['Stage 2']).toBeUndefined(); // Grace is Inactive, not Active
  });

  test('returns dwell distribution with green/yellow/red buckets for each stage', async () => {
    const res = await handler(event('/metrics/performance-reviews'));
    const { dwellDistribution } = JSON.parse(res.body);
    for (const stage of ['Stage 1', 'Stage 2', 'Stage 3']) {
      expect(dwellDistribution[stage]).toHaveProperty('green');
      expect(dwellDistribution[stage]).toHaveProperty('yellow');
      expect(dwellDistribution[stage]).toHaveProperty('red');
    }
  });

  test('returns risk summary with flagged interns', async () => {
    const res = await handler(event('/metrics/performance-reviews'));
    const { riskSummary } = JSON.parse(res.body);
    expect(typeof riskSummary.total).toBe('number');
    expect(Array.isArray(riskSummary.flaggedInterns)).toBe(true);
    // Alice (active, has mentor, not exceeding dwell) should NOT be flagged
    const aliceFlagged = riskSummary.flaggedInterns.find(
      (i: Record<string, unknown>) => i["Employee ID"] === 'i1'
    );
    expect(aliceFlagged).toBeUndefined();
  });

  test('returns approaching promotion list', async () => {
    const res = await handler(event('/metrics/performance-reviews'));
    const { approachingPromotion } = JSON.parse(res.body);
    expect(Array.isArray(approachingPromotion)).toBe(true);
  });

  test('returns average time per stage', async () => {
    const res = await handler(event('/metrics/performance-reviews'));
    const { avgTimePerStage } = JSON.parse(res.body);
    expect(typeof avgTimePerStage).toBe('object');
  });
});

// ─── GET /metrics/fte-conversions ─────────────────────────────────────────────

describe('GET /metrics/fte-conversions', () => {
  test('returns graduating interns by cohort for current year', async () => {
    const res = await handler(event('/metrics/fte-conversions'));
    expect(res.statusCode).toBe(200);
    const { graduatingByCohort } = JSON.parse(res.body);
    expect(typeof graduatingByCohort).toBe('object');
  });

  test('returns incline breakdown from hiring meeting outcomes', async () => {
    const res = await handler(event('/metrics/fte-conversions'));
    const { inclineBreakdown } = JSON.parse(res.body);
    expect(inclineBreakdown.Inclined).toBe(1); // Dave
  });

  test('returns offer acceptance rate using FTE Offer Status', async () => {
    const res = await handler(event('/metrics/fte-conversions'));
    const { offerAcceptance } = JSON.parse(res.body);
    expect(offerAcceptance.extended).toBe(1); // Dave: Accepted (not "Not Extended")
    expect(offerAcceptance.accepted).toBe(1); // Dave: Accepted
    expect(offerAcceptance.rate).toBe(100);
  });

  test('returns upcoming hiring meetings', async () => {
    const res = await handler(event('/metrics/fte-conversions'));
    const { upcomingHiringMeetings } = JSON.parse(res.body);
    expect(Array.isArray(upcomingHiringMeetings)).toBe(true);
    expect(upcomingHiringMeetings[0]["Employee ID"]).toBe('i1');
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe('error handling', () => {
  test('returns 404 for unknown metrics route', async () => {
    const res = await handler(event('/metrics/unknown'));
    expect(res.statusCode).toBe(404);
  });

  test('returns 500 when DynamoDB throws', async () => {
    mockSend.mockRejectedValue(new Error('DB failure'));
    const res = await handler(event('/metrics/overview'));
    expect(res.statusCode).toBe(500);
  });

  test('all responses include CORS header', async () => {
    const res = await handler(event('/metrics/overview'));
    expect(res.headers?.['Access-Control-Allow-Origin']).toBe('*');
  });
});
