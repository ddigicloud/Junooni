import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { ResetPasswordForm } from './components/reset-password-form'

export default function ResetPassword() {
  return (
    <AuthLayout>
      <Card className='p-6'>
        {/* <div className='mb-2 flex flex-col space-y-2 text-left'>
          <h1 className='text-md font-semibold tracking-tight'>
            Reset Password
          </h1>
          <p className='text-sm text-muted-foreground'>
            Create a new password for your account.
          </p>
        </div> */}
        <ResetPasswordForm />
        <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
          Remember your password?{' '}
          <Link
            to='/sign-in'
            className='underline underline-offset-4 hover:text-primary'
          >
            Login
          </Link>
        </p>
      </Card>
    </AuthLayout>
  )
}