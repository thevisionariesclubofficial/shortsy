import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyEventV2,
} from 'aws-lambda';

/**
 * Extract the authenticated user from Cognito JWT claims.
 * API Gateway HTTP API injects these at requestContext.authorizer.jwt.claims.
 */
export function getUser(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const claims = event.requestContext.authorizer.jwt.claims;
  return {
    id:    claims['sub'] as string,
    email: (claims['email'] ?? claims['cognito:username'] ?? '') as string,
  };
}

/** Parse JSON body safely; returns null on invalid/missing body. */
export function parseBody<T = Record<string, unknown>>(event: APIGatewayProxyEventV2): T | null {
  try {
    return event.body ? (JSON.parse(event.body) as T) : null;
  } catch {
    return null;
  }
}

/** Get the API Gateway request ID for error envelopes. */
export function reqId(event: APIGatewayProxyEventV2): string {
  return event.requestContext.requestId ?? 'n/a';
}
