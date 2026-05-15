const mockSend = jest.fn();

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn().mockReturnValue({ send: mockSend }),
  },
  ScanCommand: jest.fn().mockImplementation((i: unknown) => i),
  GetCommand: jest.fn().mockImplementation((i: unknown) => i),
  PutCommand: jest.fn().mockImplementation((i: unknown) => i),
  UpdateCommand: jest.fn().mockImplementation((i: unknown) => i),
  DeleteCommand: jest.fn().mockImplementation((i: unknown) => i),
}));

import { handler } from '../lambda/interns';
import type { APIGatewayProxyEvent } from 'aws-lambda';

function event(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
  return {
    httpMethod: 'GET',
    path: '/interns',
    resource: '/interns',
    pathParameters: null,
    queryStringParameters: null,
    headers: {},
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    body: null,
    isBase64Encoded: false,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    stageVariables: null,
    ...overrides,
  };
}

const INTERNS = [
  {
    employeeId: 'i1',
    firstAndLastName: 'Alice Smith',
    programStatus: 'Active',
    stage: 'Stage 1',
    siteLocation: 'Seattle',
    startDate: '2024-01-15',
    graduationCohort: 'May',
    managerContact: 'Bob Manager',
    managerEmail: 'bob@company.com',
    mentorContact: 'Carol Mentor',
    mentorEmail: 'carol@company.com',
    reviewEligibilityMay: 'Yes',
    reviewEligibilityOctober: 'No',
    stage2PromoDate: '2025-01-01',
    hiringMeetingDate: '2027-06-01',
  },
  {
    employeeId: 'i2',
    firstAndLastName: 'Dave Jones',
    programStatus: 'Active',
    stage: 'Stage 2',
    siteLocation: 'New York',
    startDate: '2023-06-01',
    managerContact: 'Eve Manager',
    managerEmail: 'eve@company.com',
    mentorContact: '',
    mentorEmail: '',
    stage2PromoDate: '2021-01-01',
    mentorChangeLog: ['2023-04-01', '2023-07-01'],
  },
];

beforeEach(() => {
  mockSend.mockReset();
});

// ─── GET /interns ─────────────────────────────────────────────────────────────

describe('GET /interns', () => {
  test('returns all interns', async () => {
    mockSend.mockResolvedValue({ Items: INTERNS });
    const res = await handler(event());
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(2);
  });

  test('filters by stage', async () => {
    mockSend.mockResolvedValue({ Items: INTERNS });
    const res = await handler(event({ queryStringParameters: { stage: 'Stage 1' } }));
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0].employeeId).toBe('i1');
  });

  test('filters by location', async () => {
    mockSend.mockResolvedValue({ Items: INTERNS });
    const res = await handler(event({ queryStringParameters: { location: 'New York' } }));
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0].employeeId).toBe('i2');
  });

  test('filters by programStatus', async () => {
    mockSend.mockResolvedValue({ Items: INTERNS });
    const res = await handler(event({ queryStringParameters: { programStatus: 'Active' } }));
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(2);
  });

  test('filters by manager name (case-insensitive partial match)', async () => {
    mockSend.mockResolvedValue({ Items: INTERNS });
    const res = await handler(event({ queryStringParameters: { manager: 'bob' } }));
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0].employeeId).toBe('i1');
  });

  test('filters by search on intern name', async () => {
    mockSend.mockResolvedValue({ Items: INTERNS });
    const res = await handler(event({ queryStringParameters: { search: 'alice' } }));
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0].employeeId).toBe('i1');
  });

  test('filters by reviewEligibility=May', async () => {
    mockSend.mockResolvedValue({ Items: INTERNS });
    const res = await handler(event({ queryStringParameters: { reviewEligibility: 'May' } }));
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0].employeeId).toBe('i1');
  });

  test('returns upcoming meetings sorted by date', async () => {
    mockSend.mockResolvedValue({ Items: INTERNS });
    const res = await handler(event({ queryStringParameters: { upcomingMeetings: 'true' } }));
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0].employeeId).toBe('i1');
  });

  test('attaches _riskFlags when withRiskFlags=true', async () => {
    mockSend.mockResolvedValue({ Items: INTERNS });
    const res = await handler(event({ queryStringParameters: { withRiskFlags: 'true' } }));
    const body = JSON.parse(res.body);
    const dave = body.find((i: { employeeId: string }) => i.employeeId === 'i2');
    expect(dave._riskFlags).toContain('no_mentor');
    expect(dave._riskFlags).toContain('mentor_changes');
    expect(dave._riskFlags).toContain('at_risk');
  });

  test('attaches _riskFlags when riskFlags filter is active', async () => {
    mockSend.mockResolvedValue({ Items: INTERNS });
    const res = await handler(event({ queryStringParameters: { riskFlags: 'no_mentor' } }));
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0]._riskFlags).toContain('no_mentor');
  });

  test('returns empty array when no interns match filter', async () => {
    mockSend.mockResolvedValue({ Items: INTERNS });
    const res = await handler(event({ queryStringParameters: { stage: 'Stage 3' } }));
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(0);
  });

  test('handles empty Items from DynamoDB', async () => {
    mockSend.mockResolvedValue({ Items: [] });
    const res = await handler(event());
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toHaveLength(0);
  });
});

// ─── GET /interns/{employeeId} ────────────────────────────────────────────────

describe('GET /interns/{employeeId}', () => {
  test('returns intern with computed risk flags', async () => {
    mockSend.mockResolvedValue({ Item: INTERNS[0] });
    const res = await handler(event({
      resource: '/interns/{employeeId}',
      pathParameters: { employeeId: 'i1' },
    }));
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.employeeId).toBe('i1');
    expect(Array.isArray(body._riskFlags)).toBe(true);
  });

  test('returns 404 when intern not found', async () => {
    mockSend.mockResolvedValue({ Item: undefined });
    const res = await handler(event({
      resource: '/interns/{employeeId}',
      pathParameters: { employeeId: 'missing' },
    }));
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body).error).toMatch(/not found/i);
  });
});

// ─── POST /interns ────────────────────────────────────────────────────────────

describe('POST /interns', () => {
  test('creates a new intern and returns it', async () => {
    mockSend.mockResolvedValue({});
    const newIntern = { employeeId: 'i3', firstAndLastName: 'New Person', programStatus: 'Active' };
    const res = await handler(event({
      httpMethod: 'POST',
      body: JSON.stringify(newIntern),
    }));
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.employeeId).toBe('i3');
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  test('returns 400 when employeeId is missing', async () => {
    const res = await handler(event({
      httpMethod: 'POST',
      body: JSON.stringify({ firstAndLastName: 'No ID' }),
    }));
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toMatch(/employeeId/);
  });
});

// ─── PATCH /interns/{employeeId} ──────────────────────────────────────────────

describe('PATCH /interns/{employeeId}', () => {
  test('updates fields and returns updated intern', async () => {
    const updated = { ...INTERNS[0], stage: 'Stage 2' };
    mockSend.mockResolvedValue({ Attributes: updated });
    const res = await handler(event({
      httpMethod: 'PATCH',
      resource: '/interns/{employeeId}',
      pathParameters: { employeeId: 'i1' },
      body: JSON.stringify({ stage: 'Stage 2' }),
    }));
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).stage).toBe('Stage 2');
  });

  test('returns 400 when body is empty', async () => {
    const res = await handler(event({
      httpMethod: 'PATCH',
      resource: '/interns/{employeeId}',
      pathParameters: { employeeId: 'i1' },
      body: JSON.stringify({}),
    }));
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toMatch(/No fields/i);
  });
});

// ─── DELETE /interns/{employeeId} ─────────────────────────────────────────────

describe('DELETE /interns/{employeeId}', () => {
  test('deletes intern and returns its ID', async () => {
    mockSend.mockResolvedValue({});
    const res = await handler(event({
      httpMethod: 'DELETE',
      resource: '/interns/{employeeId}',
      pathParameters: { employeeId: 'i1' },
    }));
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).deleted).toBe('i1');
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe('error handling', () => {
  test('returns 405 for unsupported method', async () => {
    const res = await handler(event({ httpMethod: 'PUT' }));
    expect(res.statusCode).toBe(405);
  });

  test('returns 500 when DynamoDB throws', async () => {
    mockSend.mockRejectedValue(new Error('DynamoDB failure'));
    const res = await handler(event());
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body).error).toMatch(/internal server error/i);
  });

  test('all responses include CORS header', async () => {
    mockSend.mockResolvedValue({ Items: [] });
    const res = await handler(event());
    expect(res.headers?.['Access-Control-Allow-Origin']).toBe('*');
  });
});
