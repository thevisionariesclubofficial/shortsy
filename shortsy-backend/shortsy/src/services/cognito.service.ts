import {
  SignUpCommand,
  AdminConfirmSignUpCommand,
  InitiateAuthCommand,
  AdminGetUserCommand,
  ForgotPasswordCommand,
  GlobalSignOutCommand,
  AuthFlowType,
  CognitoIdentityProviderServiceException,
} from '@aws-sdk/client-cognito-identity-provider';
import { createHmac } from 'crypto';
import { cognitoClient, ENV } from '../config/aws';

// ── Public types ──────────────────────────────────────────────────────────────
export interface UserBasic {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class CognitoError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'CognitoError';
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────
function secretHash(username: string): string | undefined {
  const secret = process.env.COGNITO_CLIENT_SECRET;
  if (!secret || !ENV.userPoolClientId) return undefined;
  return createHmac('sha256', secret)
    .update(username + ENV.userPoolClientId)
    .digest('base64');
}

function mapCognitoError(err: unknown, ctx: string): CognitoError {
  if (!(err instanceof CognitoIdentityProviderServiceException)) throw err;

  switch (err.name) {
    case 'UsernameExistsException':
      return new CognitoError(409, 'EMAIL_ALREADY_EXISTS', 'Email is already registered');
    case 'InvalidPasswordException':
      return new CognitoError(422, 'VALIDATION_ERROR', err.message);
    case 'NotAuthorizedException':
      if (ctx === 'refresh') return new CognitoError(401, 'TOKEN_INVALID',      'Refresh token is invalid or expired');
      if (ctx === 'logout')  return new CognitoError(401, 'TOKEN_INVALID',      'Access token is invalid');
      return new CognitoError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    case 'UserNotFoundException':
      return new CognitoError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'); // no enumeration
    case 'UserNotConfirmedException':
      return new CognitoError(401, 'INVALID_CREDENTIALS', 'Account is not confirmed');
    case 'TooManyRequestsException':
    case 'LimitExceededException':
      return new CognitoError(429, 'RATE_LIMITED', 'Too many requests, please try again later');
    case 'ExpiredCodeException':
      return new CognitoError(401, 'TOKEN_EXPIRED', 'The verification code has expired');
    default:
      return new CognitoError(500, 'INTERNAL_ERROR', err.message);
  }
}

function mapAttrs(
  attrs: Array<{ Name?: string; Value?: string }>,
  userId: string,
  createDate?: Date,
): UserBasic {
  const get = (name: string) => attrs.find(a => a.Name === name)?.Value ?? '';
  return {
    id:          userId,
    email:       get('email'),
    displayName: get('name') || get('email').split('@')[0],
    avatarUrl:   get('picture') || null,
    createdAt:   createDate?.toISOString() ?? new Date().toISOString(),
  };
}

function mapTokens(
  result: { AccessToken?: string; RefreshToken?: string; ExpiresIn?: number },
  fallbackRefreshToken?: string,
): AuthTokens {
  return {
    accessToken:  result.AccessToken  ?? '',
    refreshToken: result.RefreshToken ?? fallbackRefreshToken ?? '',
    expiresIn:    result.ExpiresIn    ?? 900,
  };
}

// ── Public operations ─────────────────────────────────────────────────────────
export async function signup(email: string, password: string, displayName: string) {
  try {
    const hash = secretHash(email);

    const signupRes = await cognitoClient.send(new SignUpCommand({
      ClientId:   ENV.userPoolClientId,
      Username:   email,
      Password:   password,
      SecretHash: hash,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name',  Value: displayName },
      ],
    }));

    const userId = signupRes.UserSub ?? email;

    // Auto-confirm — skip email verification for seamless onboarding
    await cognitoClient.send(new AdminConfirmSignUpCommand({
      UserPoolId: ENV.userPoolId,
      Username:   email,
    }));

    // Immediately exchange for tokens
    const authRes = await cognitoClient.send(new InitiateAuthCommand({
      AuthFlow:  AuthFlowType.USER_PASSWORD_AUTH,
      ClientId:  ENV.userPoolClientId,
      AuthParameters: {
        USERNAME:   email,
        PASSWORD:   password,
        ...(hash ? { SECRET_HASH: hash } : {}),
      },
    }));

    const userRes = await cognitoClient.send(new AdminGetUserCommand({
      UserPoolId: ENV.userPoolId,
      Username:   email,
    }));

    return {
      user:   mapAttrs(userRes.UserAttributes ?? [], userId, userRes.UserCreateDate),
      tokens: mapTokens(authRes.AuthenticationResult ?? {}),
    };
  } catch (err) {
    throw mapCognitoError(err, 'signup');
  }
}

export async function login(email: string, password: string) {
  try {
    const hash = secretHash(email);

    const authRes = await cognitoClient.send(new InitiateAuthCommand({
      AuthFlow:  AuthFlowType.USER_PASSWORD_AUTH,
      ClientId:  ENV.userPoolClientId,
      AuthParameters: {
        USERNAME:   email,
        PASSWORD:   password,
        ...(hash ? { SECRET_HASH: hash } : {}),
      },
    }));

    const userRes = await cognitoClient.send(new AdminGetUserCommand({
      UserPoolId: ENV.userPoolId,
      Username:   email,
    }));

    const userId = userRes.UserAttributes?.find(a => a.Name === 'sub')?.Value ?? email;

    return {
      user:   mapAttrs(userRes.UserAttributes ?? [], userId, userRes.UserCreateDate),
      tokens: mapTokens(authRes.AuthenticationResult ?? {}),
    };
  } catch (err) {
    throw mapCognitoError(err, 'login');
  }
}

export async function forgotPassword(email: string): Promise<void> {
  try {
    await cognitoClient.send(new ForgotPasswordCommand({
      ClientId:   ENV.userPoolClientId,
      Username:   email,
      SecretHash: secretHash(email),
    }));
  } catch (err) {
    if (
      err instanceof CognitoIdentityProviderServiceException &&
      err.name === 'UserNotFoundException'
    ) return; // Swallow — anti-enumeration
    throw mapCognitoError(err, 'forgot');
  }
}

export async function refreshToken(token: string) {
  try {
    const authRes = await cognitoClient.send(new InitiateAuthCommand({
      AuthFlow:  AuthFlowType.REFRESH_TOKEN_AUTH,
      ClientId:  ENV.userPoolClientId,
      AuthParameters: { REFRESH_TOKEN: token },
    }));
    return { tokens: mapTokens(authRes.AuthenticationResult ?? {}, token) };
  } catch (err) {
    throw mapCognitoError(err, 'refresh');
  }
}

export async function logout(accessToken: string): Promise<void> {
  try {
    await cognitoClient.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
  } catch (err) {
    throw mapCognitoError(err, 'logout');
  }
}

export async function getUser(userId: string): Promise<UserBasic> {
  const res = await cognitoClient.send(new AdminGetUserCommand({
    UserPoolId: ENV.userPoolId,
    Username:   userId,
  }));
  return mapAttrs(res.UserAttributes ?? [], userId, res.UserCreateDate);
}
