'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"
import { ArrowLeft } from 'lucide-react'

type User = {
  email: string
  name: string
  provider: string
}

export default function EnhancedAuthFlow() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [otp, setOTP] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(60)
  const { toast } = useToast()
  const otpInputs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser')
    if (loggedInUser) {
      setIsLoggedIn(true)
      setCurrentUser(JSON.parse(loggedInUser))
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (showOTPInput && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [showOTPInput, timer])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('http://188.166.113.178:5000/api/auth/loginWithSignup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to send OTP')
      }

      setShowOTPInput(true)
      setTimer(60) // Reset the timer when sending a new OTP
      toast({
        title: "OTP Sent",
        description: "Please check your email for the OTP code.",
      })
    } catch (error) {
      console.error('Error sending OTP:', error)
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('http://188.166.113.178:5000/api/auth/verifyOtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otp.join('')
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to verify OTP')
      }

      const data = await response.json()

      // Assuming the API returns some user data on successful verification
      const user: User = {
        email: email,
        name: data.name || email.split('@')[0], // Use the name from API response if available
        provider: 'email'
      }
      loginUser(user)

      // Redirect to main page
      router.push('/') // Adjust this path as needed
    } catch (error) {
      console.error('Error verifying OTP:', error)
      toast({
        title: "Error",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOTP = [...otp]
      newOTP[index] = value
      setOTP(newOTP)

      // Move to next input if value is entered
      if (value !== '' && index < 5) {
        otpInputs.current[index + 1]?.focus()
      }
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      otpInputs.current[index - 1]?.focus()
    }
  }

  const loginUser = (user: User) => {
    setIsLoggedIn(true)
    setCurrentUser(user)
    localStorage.setItem('currentUser', JSON.stringify(user))
    toast({
      title: "Login successful",
      description: `Welcome, ${user.name}!`,
    })
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
    setShowOTPInput(false)
    setOTP(['', '', '', '', '', ''])
    setEmail('')
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  const handleBackToEmail = () => {
    setShowOTPInput(false)
    setOTP(['', '', '', '', '', ''])
    setTimer(60)
  }

  if (isLoggedIn && currentUser) {
    return (
        <div className='flex-center main-height-width'>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome, {currentUser.name}!</CardTitle>
          <CardDescription>You are currently logged in.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Email: {currentUser.email}</p>
          {/* <p className="text-sm text-muted-foreground">Provider: {currentUser.provider}</p> */}
        </CardContent>
        <CardContent>
          <Button onClick={handleLogout} className="w-full">Logout</Button>
        </CardContent>
      </Card>
      </div>
    )
  }

  return (
    <div className='flex-center main-height-width'>
      <h1 className='font-12 font-bold mb-3'>
        VTranslate
      </h1>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            {showOTPInput ? "Enter the OTP sent to your email" : "Enter your email to login"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showOTPInput ? (
            <form onSubmit={handleSendOTP}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    placeholder="Enter your email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button className="w-full mt-4" type="submit" disabled={isLoading}>
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="grid w-full items-center gap-4">
                <Button 
                  variant="ghost" 
                  className="w-fit p-2" 
                  onClick={handleBackToEmail}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Email
                </Button>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="otp" className="ml-3">OTP Code</Label>
                  <div className="flex justify-center space-x-2">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        pattern="\d{1}"
                        maxLength={1}
                        className="w-10 h-10 text-center"
                        value={digit}
                        onChange={(e) => handleOTPChange(index, e.target.value)}
                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                        ref={(el) => (otpInputs.current[index] = el)}
                      />
                    ))}
                  </div>
                </div>
                <Button 
                  className="w-full mt-2" 
                  variant="outline" 
                  onClick={handleSendOTP} 
                  disabled={isLoading || timer > 0}
                >
                  {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                </Button>
              </div>
              <Button className="w-full mt-4" type="submit" disabled={isLoading}>
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Verify OTP
              </Button>
            </form>
          )}
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              Log in with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}