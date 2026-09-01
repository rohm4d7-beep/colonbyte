import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../database'
import { compare } from 'bcryptjs'
import { randomUUID } from 'node:crypto'

export interface AuthUserPayload {
  sub: string
  email: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password')
    }
    if (!user.isActive) {
      throw new UnauthorizedException('This account has been disabled')
    }

    const memberships = await this.prisma.membership.findMany({
      where: { userId: user.id, status: 'Active' },
      include: {
        organization: true,
        hostel: true,
        role: { include: { permissions: true } },
      },
    })

    const payload: AuthUserPayload = { sub: user.id, email: user.email }
    const accessToken = await this.jwt.signAsync(payload)

    const refreshTtl = this.config.get<number>('auth.jwtRefreshTtl') ?? 2592000
    const refreshToken = randomUUID()
    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + refreshTtl * 1000),
      },
    })

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.get<number>('auth.jwtAccessTtl') ?? 900,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
      memberships: memberships.map((m) => ({
        id: m.id,
        status: m.status,
        organization: { id: m.organization.id, name: m.organization.name, currency: m.organization.currency },
        hostel: m.hostel
          ? { id: m.hostel.id, name: m.hostel.name, location: m.hostel.location, initials: m.hostel.initials, color: m.hostel.color, plan: m.hostel.plan }
          : null,
        role: { id: m.role.id, name: m.role.name, type: m.role.type, permissions: m.role.permissions },
      })),
    }
  }

  async me(authorization?: string) {
    const userId = await this.resolveUserId(authorization)
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new UnauthorizedException('Invalid session')

    const memberships = await this.prisma.membership.findMany({
      where: { userId: user.id, status: 'Active' },
      include: { organization: true, hostel: true, role: { include: { permissions: true } } },
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
      memberships: memberships.map((m) => ({
        id: m.id,
        status: m.status,
        organization: { id: m.organization.id, name: m.organization.name, currency: m.organization.currency },
        hostel: m.hostel
          ? { id: m.hostel.id, name: m.hostel.name, location: m.hostel.location, initials: m.hostel.initials, color: m.hostel.color, plan: m.hostel.plan }
          : null,
        role: { id: m.role.id, name: m.role.name, type: m.role.type, permissions: m.role.permissions },
      })),
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { refreshToken },
      data: { revokedAt: new Date() },
    })
  }

  private async resolveUserId(authorization?: string): Promise<string> {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header')
    }
    const token = authorization.slice(7)
    try {
      const payload = await this.jwt.verifyAsync<AuthUserPayload>(token)
      return payload.sub
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
