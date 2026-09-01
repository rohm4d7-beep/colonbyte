import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus'
import { PrismaService } from '../../database'

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => ({
        environment: {
          status: 'up' as const,
          nodeEnv: this.config.get<string>('nodeEnv'),
          uptime: process.uptime(),
        },
      }),
    ])
  }
}
