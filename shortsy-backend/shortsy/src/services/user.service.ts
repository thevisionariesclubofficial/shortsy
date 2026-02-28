import {
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminDeleteUserCommand,
  InitiateAuthCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { cognitoClient, dynamo, ENV, TABLES } from '../config/aws';
import type { UserBasic } from './cognito.service';

type UserProfile = UserBasic & {
  stats: {
    totalRentals:          number;
    totalWatchTimeMinutes: number;
    favouriteGenre:        string;
  };
};

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const res = await cognitoClient.send(new AdminGetUserCommand({
    UserPoolId: ENV.userPoolId,
    Username:   userId,
  }));

  const get   = (name: string) => res.UserAttributes?.find(a => a.Name === name)?.Value ?? '';
  const sub   = get('sub') || userId;
  const email = get('email');

  // Fetch stats in parallel from DynamoDB
  const [rentalsRes, progressRes] = await Promise.all([
    dynamo.send(new QueryCommand({
      TableName:                 TABLES.RENTALS,
      KeyConditionExpression:    'userId = :uid',
      ExpressionAttributeValues: { ':uid': userId },
      Select:                    'COUNT',
    })),
    dynamo.send(new QueryCommand({
      TableName:                 TABLES.PROGRESS,
      KeyConditionExpression:    'userId = :uid',
      ExpressionAttributeValues: { ':uid': userId },
    })),
  ]);

  const totalWatchSecs = (progressRes.Items ?? []).reduce(
    (sum: number, item: Record<string, unknown>) => sum + ((item.currentTime as number) ?? 0),
    0,
  );

  return {
    id:          sub,
    email,
    displayName: get('name') || email.split('@')[0],
    avatarUrl:   get('picture') || null,
    createdAt:   res.UserCreateDate?.toISOString() ?? new Date().toISOString(),
    stats: {
      totalRentals:          rentalsRes.Count ?? 0,
      totalWatchTimeMinutes: Math.floor(totalWatchSecs / 60),
      favouriteGenre:        'Drama', // TODO: derive from rental history
    },
  };
}

export async function updateUserProfile(
  userId:  string,
  updates: { displayName?: string; avatarUrl?: string },
): Promise<UserBasic> {
  const attrs: Array<{ Name: string; Value: string }> = [];
  if (updates.displayName) attrs.push({ Name: 'name',    Value: updates.displayName });
  if (updates.avatarUrl)   attrs.push({ Name: 'picture', Value: updates.avatarUrl });

  if (attrs.length > 0) {
    await cognitoClient.send(new AdminUpdateUserAttributesCommand({
      UserPoolId:     ENV.userPoolId,
      Username:       userId,
      UserAttributes: attrs,
    }));
  }

  const res = await cognitoClient.send(new AdminGetUserCommand({
    UserPoolId: ENV.userPoolId,
    Username:   userId,
  }));
  const get = (name: string) => res.UserAttributes?.find(a => a.Name === name)?.Value ?? '';

  return {
    id:          userId,
    email:       get('email'),
    displayName: get('name') || get('email').split('@')[0],
    avatarUrl:   get('picture') || null,
    createdAt:   res.UserCreateDate?.toISOString() ?? new Date().toISOString(),
  };
}

export async function deleteUser(
  userId:   string,
  email:    string,
  password: string,
): Promise<void> {
  // Verify password first — prevents unauthorised deletion
  try {
    await cognitoClient.send(new InitiateAuthCommand({
      AuthFlow:  AuthFlowType.USER_PASSWORD_AUTH,
      ClientId:  ENV.userPoolClientId,
      AuthParameters: { USERNAME: email, PASSWORD: password },
    }));
  } catch {
    const err = new Error('Invalid password');
    (err as NodeJS.ErrnoException & { code: string; status: number }).code   = 'INVALID_CREDENTIALS';
    (err as NodeJS.ErrnoException & { code: string; status: number }).status = 401;
    throw err;
  }

  await cognitoClient.send(new AdminDeleteUserCommand({
    UserPoolId: ENV.userPoolId,
    Username:   userId,
  }));
}
