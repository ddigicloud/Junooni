/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { useNavigate } from '@tanstack/react-router'

/* --- Validation Schemas --- */

// Step 1: Registration (email & password)
const step1Schema = z.object({
  email: z.string().min(1, { message: 'Please enter your email' }).email({
    message: 'Invalid email address',
  }),
  password: z.string().min(7, {
    message: 'Password must be at least 7 characters long',
  }),
})

// Step 2: Vendor Profile (additional vendor info)
const step2Schema = z.object({
  companyName: z.string().min(1, { message: 'Company name is required' }),
  vendorName: z.string().min(1, { message: 'Vendor name is required' }),
  gstNumber: z.string().min(1, { message: 'GST number is required' }),
  handle: z.string().min(1, { message: 'Handle is required' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
})

type Step1FormData = z.infer<typeof step1Schema>
type Step2FormData = z.infer<typeof step2Schema>

export default function SignupForm() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  // Step 1 form: Account registration
  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: { email: '', password: '' },
  })

  // Step 2 form: Vendor profile details
  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      companyName: '',
      vendorName: '',
      gstNumber: '',
      handle: '',
      firstName: '',
      lastName: '',
    },
  })

  // Handle submission of step 1: Register with email & password.
  async function onStep1Submit(data: Step1FormData) {
    setIsLoading(true)
    setMessage('')
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/auth/vendor/emailpass/register`,
        {
          email: data.email,
          password: data.password,
        },
        { headers: { 'Content-Type': 'application/json' } },
      )
      if (response.data.token) {
        const token = response.data.token
        setAuthToken(token)
        localStorage.setItem('token', token)
        setStep(2)
      } else {
        setMessage('No token received from registration.')
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Registration failed.')
      // eslint-disable-next-line no-console
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle submission of step 2: Create vendor profile.
  async function onStep2Submit(data: Step2FormData) {
    if (!authToken) {
      setMessage('Authentication token is missing.')
      return
    }
    setIsLoading(true)
    setMessage('')
    try {
      const vendorData = {
        name: data.companyName,
        vendor_name: data.vendorName,
        gst_number: data.gstNumber,
        handle: data.handle,
        admin: {
          // Using the email provided in step 1.
          email: step1Form.getValues('email'),
          first_name: data.firstName,
          last_name: data.lastName,
        },
      }

      const response = await axios.post(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors`, vendorData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 200 || response.status === 201) {
        setMessage('Vendor registration successful!')
        // Redirect to the dashboard or desired page.
        navigate({ to: '/' })
      } else {
        setMessage('Failed to create vendor profile.')
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'An error occurred'
      setMessage(errorMessage)
      // eslint-disable-next-line no-console
      console.error('Vendor profile submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {step === 1 && (
        <Form {...step1Form}>
          <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4">
            <FormField
              control={step1Form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={step1Form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Registering...' : 'Continue to Next Step'}
            </Button>
            {message && <p className="text-sm text-center text-red-500">{message}</p>}
          </form>
        </Form>
      )}

      {step === 2 && (
        <Form {...step2Form}>
          <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-4">
            <FormField
              control={step2Form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Company Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={step2Form.control}
              name="vendorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Vendor Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={step2Form.control}
              name="gstNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Number</FormLabel>
                  <FormControl>
                    <Input placeholder="GST Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={step2Form.control}
              name="handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="@handle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={step2Form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={step2Form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Creating Vendor...' : 'Submit'}
            </Button>
            {message && <p className="text-sm text-center text-red-500">{message}</p>}
          </form>
        </Form>
      )}
    </div>
  )
}
