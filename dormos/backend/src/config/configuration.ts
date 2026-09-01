export interface AppConfig {
  nodeEnv: string
  isProduction: boolean
  port: number
  appUrl: string
  frontendUrl: string
  apiPrefix: string

  database: {
    url: string
    poolMin: number
    poolMax: number
  }

  redis: {
    url: string
  }

  auth: {
    betterAuthSecret: string
    betterAuthUrl: string
    jwtAccessSecret: string
    jwtRefreshSecret: string
    jwtAccessTtl: number
    jwtRefreshTtl: number
    cookieSecure: boolean
    cookieSameSite: 'lax' | 'strict' | 'none'
    sessionExpiresIn: number
    rememberMeExpiresIn: number
  }

  corsOrigins: string[]
  csrfTokenName: string

  throttle: {
    ttl: number
    limit: number
    authLimit: number
  }

  cloudinary: {
    cloudName: string
    apiKey: string
    apiSecret: string
    folder: string
  }

  mail: {
    host: string
    port: number
    secure: boolean
    user: string
    password: string
    from: string
    enabled: boolean
  }

  log: {
    level: string
    redactKeys: string[]
    pretty: boolean
  }

  backup: {
    enabled: boolean
    s3Endpoint: string
    s3Bucket: string
    s3AccessKey: string
    s3SecretKey: string
  }

  swaggerEnabled: boolean
}

const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

const toBool = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined || value === '') return fallback
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase())
}

const toArray = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: (process.env.NODE_ENV ?? 'development') === 'production',
  port: toInt(process.env.PORT, 3001),
  appUrl: process.env.APP_URL ?? 'http://localhost:3001',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  apiPrefix: process.env.API_PREFIX ?? 'api',

  database: {
    url: process.env.DATABASE_URL ?? '',
    poolMin: toInt(process.env.DATABASE_POOL_MIN, 2),
    poolMax: toInt(process.env.DATABASE_POOL_MAX, 10),
  },

  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },

  auth: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET ?? '',
    betterAuthUrl: process.env.BETTER_AUTH_URL ?? '',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    jwtAccessTtl: toInt(process.env.JWT_ACCESS_TTL, 900),
    jwtRefreshTtl: toInt(process.env.JWT_REFRESH_TTL, 2592000),
    cookieSecure: toBool(process.env.COOKIE_SECURE, false),
    cookieSameSite: (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') ?? 'lax',
    sessionExpiresIn: toInt(process.env.SESSION_EXPIRES_IN, 86400),
    rememberMeExpiresIn: toInt(process.env.REMEMBER_ME_EXPIRES_IN, 2592000),
  },

  corsOrigins: toArray(process.env.CORS_ORIGINS),
  csrfTokenName: process.env.CSRF_TOKEN_NAME ?? 'x-csrf-token',

  throttle: {
    ttl: toInt(process.env.THROTTLE_TTL, 60),
    limit: toInt(process.env.THROTTLE_LIMIT, 100),
    authLimit: toInt(process.env.AUTH_THROTTLE_LIMIT, 10),
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
    folder: process.env.CLOUDINARY_FOLDER ?? 'dormos',
  },

  mail: {
    host: process.env.SMTP_HOST ?? 'smtp.resend.com',
    port: toInt(process.env.SMTP_PORT, 465),
    secure: toBool(process.env.SMTP_SECURE, true),
    user: process.env.SMTP_USER ?? '',
    password: process.env.SMTP_PASSWORD ?? '',
    from: process.env.MAIL_FROM ?? 'DormOS <no-reply@dormos.pk>',
    enabled: toBool(process.env.MAIL_ENABLED, false),
  },

  log: {
    level: process.env.LOG_LEVEL ?? 'info',
    redactKeys: toArray(process.env.LOG_REDACT_KEYS),
    pretty: toBool(process.env.LOG_PRETTY, false),
  },

  backup: {
    enabled: toBool(process.env.BACKUP_ENABLED, false),
    s3Endpoint: process.env.BACKUP_S3_ENDPOINT ?? '',
    s3Bucket: process.env.BACKUP_S3_BUCKET ?? 'dormos-backups',
    s3AccessKey: process.env.BACKUP_S3_ACCESS_KEY ?? '',
    s3SecretKey: process.env.BACKUP_S3_SECRET_KEY ?? '',
  },

  swaggerEnabled: toBool(process.env.SWAGGER_ENABLED, true),
})
