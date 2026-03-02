import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { S3Client } from '@aws-sdk/client-s3';

const region = process.env.REGION ?? process.env.AWS_REGION ?? 'ap-south-1';

// ── AWS clients (reused across warm Lambda invocations) ───────────────────────
export const dynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region }),
  { marshallOptions: { removeUndefinedValues: true } },
);

export const cognitoClient = new CognitoIdentityProviderClient({ region });

export const s3 = new S3Client({ region });

// ── DynamoDB table names ───────────────────────────────────────────────────────
export const TABLES = {
  CONTENT:  process.env.CONTENT_TABLE  ?? 'shortsy-content-dev',
  RENTALS:  process.env.RENTALS_TABLE  ?? 'shortsy-rentals-dev',
  PROGRESS: process.env.PROGRESS_TABLE ?? 'shortsy-progress-dev',
  ORDERS:   process.env.ORDERS_TABLE   ?? 'shortsy-orders-dev',
  PREMIUMS: process.env.PREMIUMS_TABLE ?? 'shortsy-premiums-dev',
} as const;

// ── Environment constants ──────────────────────────────────────────────────────
export const ENV = {
  region:           process.env.REGION              ?? 'ap-south-1',
  userPoolId:       process.env.USER_POOL_ID        ?? '',
  userPoolClientId: process.env.USER_POOL_CLIENT_ID ?? '',
  cdnBase:          process.env.CDN_BASE            ?? 'https://cdn.shortsy.app',
  s3Bucket:         process.env.S3_MEDIA_BUCKET     ?? '',
  razorpayKeyId:    process.env.RAZORPAY_KEY_ID     ?? '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
  streamExpiry:     parseInt(process.env.STREAM_EXPIRY_SECONDS ?? '3600', 10),
  premiumsTableName: process.env.PREMIUMS_TABLE ?? 'shortsy-premiums-dev',
} as const;
