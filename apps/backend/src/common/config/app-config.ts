const WEAK_JWT_SECRETS = new Set([
  'dev_secret_key_change_in_production',
  'your_super_secret_jwt_key_change_in_production',
]);

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required when NODE_ENV=production');
    }
    return 'dev_secret_key_change_in_production';
  }
  if (process.env.NODE_ENV === 'production' && WEAK_JWT_SECRETS.has(secret)) {
    throw new Error('JWT_SECRET must not use a default/weak value in production');
  }
  return secret;
}

export function validateProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const missing: string[] = [];
  if (!process.env.JWT_SECRET?.trim()) missing.push('JWT_SECRET');
  if (!process.env.DB_PASSWORD?.trim()) missing.push('DB_PASSWORD');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  getJwtSecret();
}
