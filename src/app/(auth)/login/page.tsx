'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { toast } from "sonner"
import Image from "next/image"

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const isAdminLogin = searchParams.get('admin') === 'true'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        toast.error("Ugyldig innlogging")
      } else {
        const response = await fetch('/api/auth/session')
        const session = await response.json()
        
        if (searchParams.get('admin') === 'true') {
          if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPPORT') {
            window.location.href = '/admin/dashboard'
          } else {
            toast.error("Ingen tilgang til admin-panel")
            window.location.href = '/dashboard'
          }
        } else {
          if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPPORT') {
            window.location.href = '/admin/dashboard'
          } else if (session?.user?.role === 'EMPLOYEE') {
            window.location.href = '/employee-dashboard'
          } else {
            window.location.href = '/dashboard'
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error("Kunne ikke logge inn")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="text-2xl font-bold text-[#3F546E]">
              <Image src="/HMSNova-logo.svg" alt="HMS Nova" width={100} height={100} className="w-full h-full"/>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">
            {isAdminLogin ? "Systemadministrasjon" : "Velkommen tilbake"}
          </CardTitle>
          <CardDescription className="text-center">
            {isAdminLogin 
              ? "Logg inn på systemadministrasjonspanelet" 
              : "Logg inn på din konto for å fortsette"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="E-post"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Passord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#3F546E] hover:bg-[#2C435F]"
              disabled={isLoading}
            >
              {isLoading ? "Logger inn..." : "Logg inn"}
            </Button>
          </form>
          {!isAdminLogin && (
            <>
              <div className="mt-4 text-center text-sm">
                <Link href="/forgot-password" className="text-[#3F546E] hover:underline">
                  Glemt passord?
                </Link>
              </div>
              <div className="mt-4 text-center text-sm">
                Har du ikke en konto?{" "}
                <Link href="/register" className="text-[#3F546E] hover:underline">
                  Registrer deg her
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 