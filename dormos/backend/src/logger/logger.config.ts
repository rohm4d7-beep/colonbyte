import { ConfigService } from '@nestjs/config'
import { Params } from 'nestjs-pino'

export function buildLoggerOptions(config: ConfigService): Params {
  const level = config.get<string>('log.level') ?? 'info'
  const redactKeys = config.get<string[]>('log.redactKeys') ?? []
  const pretty = config.get<boolean>('log.pretty') ?? false

  return {
    pinoHttp: {
      level,
      redact: {
        paths: redactKeys,
        censor: '[REDACTED]',
      },
      transport: pretty
        ? {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              colorize: true,
              translateTime: 'SYS:HH:MM:ss',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
      serializers: {
        req: (req) => ({ id: req.id, method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
      autoLogging: {
        ignore: (req) => req.url === '/health' || req.url === '/api/health',
      },
    },
  }
}
