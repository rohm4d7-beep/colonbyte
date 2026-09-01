import { IsEmail, IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator'

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string
}

export class LogoutDto {
  @IsUUID()
  refreshToken!: string
}
