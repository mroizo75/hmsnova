'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { validateCompany, type ParsedCompanyData } from "@/lib/services/brreg-service"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

interface FormData {
  orgNumber: string;
  companyName: string;
  organizationType: string;
  organizationCode: string;
  website?: string;
  address?: {
    street: string;
    streetNo?: string;
    postalCode: string;
    city: string;
  };
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    orgNumber: '',
    companyName: '',
    organizationType: '',
    organizationCode: '',
    website: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [companyData, setCompanyData] = useState<ParsedCompanyData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isCompanyValidated, setIsCompanyValidated] = useState(false)

  const validateOrgNumber = async () => {
    if (formData.orgNumber.length !== 9) {
      toast.error('Organisasjonsnummeret må være 9 siffer')
      return
    }

    setIsValidating(true)
    try {
      const company = await validateCompany(formData.orgNumber)
      if (company) {
        setCompanyData(company)
        setFormData(prev => ({
          ...prev,
          companyName: company.name,
          organizationType: company.organizationType,
          organizationCode: company.organizationCode,
          website: company.website || '',
          address: company.address
        }))
        setIsCompanyValidated(true)
        toast.success('Bedrift funnet i Brønnøysundregistrene')
      } else {
        toast.error('Fant ikke bedriften i Brønnøysundregistrene')
        setIsCompanyValidated(false)
      }
    } catch (error) {
      toast.error('Kunne ikke validere organisasjonsnummeret')
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isCompanyValidated) {
      toast.error('Bedriften må valideres først')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passordene må være like')
      return
    }

    setIsLoading(true)
    try {
      const website = formData.website?.replace(/^https?:\/\//, '') || null;

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: {
            orgNumber: formData.orgNumber,
            name: formData.companyName,
            organizationType: formData.organizationType,
            organizationCode: formData.organizationCode,
            website: website,
            address: formData.address
          },
          user: {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: 'COMPANY_ADMIN'
          }
        })
      })

      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        toast.success('Registrering vellykket!')
        window.location.href = '/login?registered=true'
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err: { field: string; message: string }) => {
            if (err.field === 'user.password') {
              toast.error(
                <div>
                  <p>Passordkrav:</p>
                  <p>{err.message}</p>
                </div>
              )
            } else {
              toast.error(`${err.field}: ${err.message}`)
            }
          })
        } else if (data.message) {
          toast.error(data.message)
        } else {
          toast.error('En ukjent feil oppstod under registrering')
        }
        console.error('Registration failed:', data)
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Kunne ikke fullføre registreringen')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="text-2xl font-bold text-green-700">
              innut.io
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Opprett ny konto</CardTitle>
          <CardDescription className="text-center">
            Registrer din bedrift for å komme i gang
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Organisasjonsnummer"
                  value={formData.orgNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    if (value.length <= 9) {
                      setFormData({...formData, orgNumber: value})
                      setIsCompanyValidated(false)
                    }
                  }}
                  required
                  maxLength={9}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={validateOrgNumber}
                  disabled={isValidating || formData.orgNumber.length !== 9}
                  className="bg-green-700 hover:bg-green-800"
                >
                  {isValidating ? "Sjekker..." : "Valider"}
                </Button>
              </div>
              {isCompanyValidated && (
                <p className="text-sm text-green-600">✓ Bedrift validert</p>
              )}
            </div>

            {isCompanyValidated && companyData && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bedriftsnavn</label>
                  <Input value={formData.companyName} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organisasjonsform</label>
                  <Input value={formData.organizationType} disabled />
                </div>
                {formData.website && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nettside</label>
                    <Input value={formData.website} disabled />
                  </div>
                )}
                {formData.address && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Adresse</label>
                    <Input 
                      value={`${formData.address.street} ${formData.address.streetNo || ''}, ${formData.address.postalCode} ${formData.address.city}`} 
                      disabled 
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Input
                placeholder="Ditt navn"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="E-post"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Passord"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Bekreft passord"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-700 hover:bg-green-800"
              disabled={isLoading || !isCompanyValidated}
            >
              {isLoading ? "Registrerer..." : "Registrer bedrift"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Har du allerede en konto?{" "}
            <Link href="/login" className="text-green-700 hover:underline">
              Logg inn her
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 