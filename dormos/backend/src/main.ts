import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { Logger } from 'nestjs-pino'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  const config = app.get(ConfigService)
  const logger = app.get(Logger)

  app.useLogger(logger)
  app.use(helmet())
  app.use(cookieParser())
  app.setGlobalPrefix(config.get<string>('apiPrefix') ?? 'api')

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const origins = config.get<string[]>('corsOrigins') ?? []
      if (!origin || origins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`))
      }
    },
    credentials: true,
    exposedHeaders: [config.get<string>('csrfTokenName') ?? 'x-csrf-token'],
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  app.enableShutdownHooks()

  if (config.get<boolean>('swaggerEnabled')) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('DormOS API')
      .setDescription('Production-grade multi-tenant hostel management SaaS backend')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('docs', app, document)
  }

  const port = config.get<number>('port') ?? 3001
  await app.listen(port)
  logger.log(`DormOS API listening on ${config.get<string>('appUrl')} (port ${port})`)
}

void bootstrap()
