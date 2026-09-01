'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// ── Schemas ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  hostelName: z.string().min(2, 'Hostel name is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
})

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type LoginValues = z.infer<typeof loginSchema>
type SignupValues = z.infer<typeof signupSchema>
type ForgotValues = z.infer<typeof forgotSchema>
type ResetValues = z.infer<typeof resetSchema>

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

// ── Shared ────────────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}

function PasswordInput({
  id,
  placeholder,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        className={cn('pr-10', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function SuccessIcon() {
  return (
    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
      <Check className="h-7 w-7 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
    </div>
  )
}

// ── Login Form ────────────────────────────────────────────────────────────────

export function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginValues) => {
    setLoading(true)
    setFormError(null)
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setFormError(body?.message ?? 'Login failed. Please try again.')
        return
      }
      const json = await res.json()
      localStorage.setItem('dormos-token', json.accessToken)
      localStorage.setItem('dormos-refresh-token', json.refreshToken)
      localStorage.setItem('dormos-user', JSON.stringify(json.user))
      localStorage.setItem('dormos-memberships', JSON.stringify(json.memberships ?? []))
      router.push('/dashboard')
    } catch {
      setFormError('Could not reach the server. Is the API running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your DormOS account</p>
      </div>

      {formError && (
        <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="mt-1.5"
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput id="password" placeholder="••••••••" {...register('password')} />
          <FieldError message={errors.password?.message} />
        </div>

        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don’t have an account?{' '}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}

// ── Signup Form ───────────────────────────────────────────────────────────────

export function SignupForm() {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) })

  const onSubmit = async (data: SignupValues) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    console.log(data)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Start your 14-day free trial. No credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
            Full name
          </Label>
          <Input
            id="fullName"
            placeholder="Ahmed Khan"
            className="mt-1.5"
            {...register('fullName')}
          />
          <FieldError message={errors.fullName?.message} />
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Work email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@hostel.com"
            className="mt-1.5"
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <Label htmlFor="hostelName" className="text-sm font-medium text-foreground">
            Hostel name
          </Label>
          <Input
            id="hostelName"
            placeholder="Sunrise Student Hostel"
            className="mt-1.5"
            {...register('hostelName')}
          />
          <FieldError message={errors.hostelName?.message} />
        </div>

        <div>
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </Label>
          <PasswordInput id="password" placeholder="Min. 8 characters" className="mt-1.5" {...register('password')} />
          <FieldError message={errors.password?.message} />
        </div>

        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By signing up, you agree to our{' '}
        <Link href="#" className="underline hover:text-foreground">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="#" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

// ── Forgot Password Form ──────────────────────────────────────────────────────

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) })

  const onSubmit = async (data: ForgotValues) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setSent(true)
    console.log(data)
  }

  if (sent) {
    return (
      <div className="text-center">
        <SuccessIcon />
        <h2 className="text-xl font-bold text-foreground">Check your email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We’ve sent a password reset link to your email address. It may take a minute to arrive.
        </p>
        <Link
          href="/login"
          className="mt-6 block text-sm text-primary font-medium hover:underline"
        >
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Forgot your password?</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your email and we’ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="mt-1.5"
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reset link'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered your password?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

// ── Reset Password Form ───────────────────────────────────────────────────────

export function ResetPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetValues>({ resolver: zodResolver(resetSchema) })

  const onSubmit = async (data: ResetValues) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setDone(true)
    console.log(data)
  }

  if (done) {
    return (
      <div className="text-center">
        <SuccessIcon />
        <h2 className="text-xl font-bold text-foreground">Password updated!</h2>
        <p className="mt-2 text-sm text-muted-foreground">Your password has been changed successfully.</p>
        <Link
          href="/login"
          className={cn(buttonVariants(), 'mt-6 w-full justify-center')}
        >
          Sign in to your account
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Set new password</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            New password
          </Label>
          <PasswordInput id="password" placeholder="Min. 8 characters" className="mt-1.5" {...register('password')} />
          <FieldError message={errors.password?.message} />
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
            Confirm new password
          </Label>
          <PasswordInput id="confirmPassword" placeholder="Repeat your password" className="mt-1.5" {...register('confirmPassword')} />
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update password'}
        </Button>
      </form>
    </div>
  )
}
