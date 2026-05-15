const mockSend = jest.fn();
const mockSesSend = jest.fn();

jest.mock('@aws-sdk/client-ses', () => ({
  SESClient: jest.fn().mockImplementation(() => ({ send: mockSesSend })),
  SendEmailCommand: jest.fn().mockImplementation((i: unknown) => i),
}));

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn().mockReturnValue({ send: mockSend }),
  },
  ScanCommand: jest.fn().mockImplementation((i: unknown) => i),
  PutCommand: jest.fn().mockImplementation((i: unknown) => i),
}));

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: jest.fn().mockReturnValue('test-uuid-1234'),
}));

import { handler } from '../lambda/communications';
import type { APIGatewayProxyEvent } from 'aws-lambda';

function event(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
  return {
    httpMethod: 'GET',
    path: '/communications/templates',
    resource: '/communications/templates',
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

const RECIPIENT = {
  employeeId: 'i1',
  firstAndLastName: 'Alice',
  intern_name: 'Alice',     // kept for custom-template token test
  managerContact: 'Bob',
  manager_name: 'Bob',      // kept for custom-template token test
  managerEmail: 'bob@company.com',
  mentorContact: 'Carol',
  mentorEmail: 'carol@company.com',
  stage: 'Stage 1',
};

beforeEach(() => {
  mockSend.mockReset();
  mockSesSend.mockReset();
  mockSesSend.mockResolvedValue({});
});

// ─── GET /communications/templates ───────────────────────────────────────────

describe('GET /communications/templates', () => {
  test('returns all templates as an array', async () => {
    const res = await handler(event());
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('each template has required fields', async () => {
    const res = await handler(event());
    const body = JSON.parse(res.body);
    for (const tmpl of body) {
      expect(tmpl).toHaveProperty('id');
      expect(tmpl).toHaveProperty('name');
      expect(tmpl).toHaveProperty('category');
      expect(tmpl).toHaveProperty('subject');
      expect(tmpl).toHaveProperty('body');
    }
  });

  test('includes expected categories', async () => {
    const res = await handler(event());
    const body = JSON.parse(res.body);
    const categories = [...new Set(body.map((t: { category: string }) => t.category))];
    expect(categories).toContain('FTE Conversion');
    expect(categories).toContain('Performance Review');
    expect(categories).toContain('General');
  });
});

// ─── GET /communications/templates/{templateId} ───────────────────────────────

describe('GET /communications/templates/{templateId}', () => {
  test('returns a specific template by ID', async () => {
    const res = await handler(event({
      resource: '/communications/templates/{templateId}',
      pathParameters: { templateId: 'perf-check-in' },
    }));
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.id).toBe('perf-check-in');
    expect(body.category).toBe('Performance Review');
  });

  test('returns a FTE conversion template', async () => {
    const res = await handler(event({
      resource: '/communications/templates/{templateId}',
      pathParameters: { templateId: 'fte-hiring-prep' },
    }));
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.id).toBe('fte-hiring-prep');
    expect(body.category).toBe('FTE Conversion');
  });

  test('returns 404 for unknown template ID', async () => {
    const res = await handler(event({
      resource: '/communications/templates/{templateId}',
      pathParameters: { templateId: 'does-not-exist' },
    }));
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body).error).toMatch(/not found/i);
  });
});

// ─── POST /communications/preview ────────────────────────────────────────────

describe('POST /communications/preview', () => {
  test('renders subject and body with intern fields', async () => {
    const res = await handler(event({
      resource: '/communications/preview',
      httpMethod: 'POST',
      body: JSON.stringify({
        templateId: 'perf-check-in',
        intern: RECIPIENT,
      }),
    }));
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.subject).toContain('Alice');
    expect(body.body).toContain('Bob');
  });

  test('leaves unreplaced placeholders unchanged when field is missing', async () => {
    const res = await handler(event({
      resource: '/communications/preview',
      httpMethod: 'POST',
      body: JSON.stringify({
        templateId: 'perf-check-in',
        intern: {},
      }),
    }));
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.subject).toContain('{{');
  });

  test('returns 404 for unknown template', async () => {
    const res = await handler(event({
      resource: '/communications/preview',
      httpMethod: 'POST',
      body: JSON.stringify({ templateId: 'bad-id', intern: {} }),
    }));
    expect(res.statusCode).toBe(404);
  });
});

// ─── POST /communications/send ────────────────────────────────────────────────

describe('POST /communications/send', () => {
  test('sends one email per recipient and writes audit log', async () => {
    mockSend.mockResolvedValue({});
    const res = await handler(event({
      resource: '/communications/send',
      httpMethod: 'POST',
      body: JSON.stringify({
        templateId: 'perf-check-in',
        recipients: [RECIPIENT],
      }),
    }));
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.sent).toBe(1);
    expect(body.results[0].status).toBe('sent');
    expect(mockSesSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledTimes(1); // audit log write
  });

  test('sends to both manager and mentor emails', async () => {
    mockSend.mockResolvedValue({});
    await handler(event({
      resource: '/communications/send',
      httpMethod: 'POST',
      body: JSON.stringify({ templateId: 'perf-check-in', recipients: [RECIPIENT] }),
    }));
    const sesCall = mockSesSend.mock.calls[0][0];
    expect(sesCall.Destination.ToAddresses).toContain('bob@company.com');
    expect(sesCall.Destination.ToAddresses).toContain('carol@company.com');
  });

  test('skips intern with no manager or mentor email', async () => {
    mockSend.mockResolvedValue({});
    const noEmail = { ...RECIPIENT, managerEmail: undefined, mentorEmail: undefined };
    const res = await handler(event({
      resource: '/communications/send',
      httpMethod: 'POST',
      body: JSON.stringify({ templateId: 'perf-check-in', recipients: [noEmail] }),
    }));
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.sent).toBe(0);
    expect(body.results[0].status).toMatch(/skipped/);
    expect(mockSesSend).not.toHaveBeenCalled();
  });

  test('sends multiple recipients and counts correctly', async () => {
    mockSend.mockResolvedValue({});
    const r2 = { ...RECIPIENT, employeeId: 'i2', firstAndLastName: 'Dave' };
    const res = await handler(event({
      resource: '/communications/send',
      httpMethod: 'POST',
      body: JSON.stringify({ templateId: 'perf-check-in', recipients: [RECIPIENT, r2] }),
    }));
    const body = JSON.parse(res.body);
    expect(body.sent).toBe(2);
    expect(mockSesSend).toHaveBeenCalledTimes(2);
  });

  test('sends with custom subject and body instead of a template', async () => {
    mockSend.mockResolvedValue({});
    const res = await handler(event({
      resource: '/communications/send',
      httpMethod: 'POST',
      body: JSON.stringify({
        customSubject: 'Hello {{intern_name}}',
        customBody: 'Dear {{manager_name}}, this is a custom message.',
        recipients: [RECIPIENT],
      }),
    }));
    expect(res.statusCode).toBe(200);
    expect(mockSesSend).toHaveBeenCalledTimes(1);
    const sesCall = mockSesSend.mock.calls[0][0];
    expect(sesCall.Message.Subject.Data).toContain('Alice');
    expect(sesCall.Message.Body.Text.Data).toContain('Bob');
  });

  test('returns 400 when recipients array is empty', async () => {
    const res = await handler(event({
      resource: '/communications/send',
      httpMethod: 'POST',
      body: JSON.stringify({ templateId: 'perf-check-in', recipients: [] }),
    }));
    expect(res.statusCode).toBe(400);
  });

  test('returns 400 when neither templateId nor custom body is provided', async () => {
    const res = await handler(event({
      resource: '/communications/send',
      httpMethod: 'POST',
      body: JSON.stringify({ recipients: [RECIPIENT] }),
    }));
    expect(res.statusCode).toBe(400);
  });

  test('audit log entry uses the fixed UUID from mock', async () => {
    mockSend.mockResolvedValue({});
    await handler(event({
      resource: '/communications/send',
      httpMethod: 'POST',
      body: JSON.stringify({ templateId: 'perf-check-in', recipients: [RECIPIENT] }),
    }));
    const putCall = mockSend.mock.calls[0][0];
    expect(putCall.Item.logId).toBe('test-uuid-1234');
    expect(putCall.Item.recipientCount).toBe(1);
  });
});

// ─── GET /communications/audit ────────────────────────────────────────────────

describe('GET /communications/audit', () => {
  test('returns audit entries sorted newest first', async () => {
    const entries = [
      { logId: 'l1', timestamp: '2025-01-01T00:00:00Z' },
      { logId: 'l3', timestamp: '2025-03-01T00:00:00Z' },
      { logId: 'l2', timestamp: '2025-02-01T00:00:00Z' },
    ];
    mockSend.mockResolvedValue({ Items: entries });
    const res = await handler(event({ resource: '/communications/audit', httpMethod: 'GET' }));
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body[0].logId).toBe('l3');
    expect(body[1].logId).toBe('l2');
    expect(body[2].logId).toBe('l1');
  });

  test('returns empty array when no audit entries exist', async () => {
    mockSend.mockResolvedValue({ Items: [] });
    const res = await handler(event({ resource: '/communications/audit', httpMethod: 'GET' }));
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toHaveLength(0);
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe('error handling', () => {
  test('returns 404 for unknown route', async () => {
    const res = await handler(event({ resource: '/communications/unknown', httpMethod: 'GET' }));
    expect(res.statusCode).toBe(404);
  });

  test('returns 500 when DynamoDB throws on audit read', async () => {
    mockSend.mockRejectedValue(new Error('DB error'));
    const res = await handler(event({ resource: '/communications/audit', httpMethod: 'GET' }));
    expect(res.statusCode).toBe(500);
  });

  test('all responses include CORS header', async () => {
    const res = await handler(event());
    expect(res.headers?.['Access-Control-Allow-Origin']).toBe('*');
  });
});
