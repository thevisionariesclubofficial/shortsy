import type { APIGatewayProxyResultV2 } from 'aws-lambda';

const JSON_HEADER = { 'Content-Type': 'application/json' };

export function ok<T>(data: T, status = 200): APIGatewayProxyResultV2 {
  return { statusCode: status, headers: JSON_HEADER, body: JSON.stringify(data) };
}

export function created<T>(data: T): APIGatewayProxyResultV2 {
  return ok(data, 201);
}

export function noContent(): APIGatewayProxyResultV2 {
  return { statusCode: 204, body: '' };
}

export function apiError(
  statusCode: number,
  code: string,
  message: string,
  requestId = 'n/a',
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: JSON_HEADER,
    body: JSON.stringify({
      error: {
        code,
        message,
        status:    statusCode,
        timestamp: new Date().toISOString(),
        requestId,
      },
    }),
  };
}
