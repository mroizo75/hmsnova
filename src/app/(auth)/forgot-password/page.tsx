'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      if (!res.ok) {
        throw new Error('Kunne ikke sende e-post')
      }

      toast.success('E-post for passordgjenoppretting er sendt!')
      setEmail('')
    } catch (error) {
      console.error('Feil ved glemt passord:', error)
      toast.error('Noe gikk galt. Prøv igjen senere.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-md max-w-md w-full">
        <h1 className="text-2xl font-semibold mb-4">Glemt Passord</h1>
        <p className="text-sm text-gray-600 mb-4">Skriv inn e-postadressen din, så sender vi en lenke for å nullstille passordet ditt.</p>

        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full mb-4"
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {isLoading ? 'Sender...' : 'Nullstill passord'}
        </button>
      </form>
    </div>
  )
} 