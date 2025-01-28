"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CookieConsent() {
  const [open, setOpen] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Alltid true
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      setOpen(true)
    }
  }, [])

  const handleAcceptAll = () => {
    setPreferences({
      necessary: true,
      analytics: true,
      marketing: true
    })
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true
    })
  }

  const handleAcceptSelected = () => {
    saveConsent(preferences)
  }

  const saveConsent = (settings: typeof preferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      ...settings,
      timestamp: new Date().toISOString()
    }))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Informasjonskapsler (cookies)</DialogTitle>
          <DialogDescription>
            Vi bruker informasjonskapsler for å forbedre din brukeropplevelse. I henhold til norsk lov trenger vi ditt samtykke for å fortsette.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Informasjon</TabsTrigger>
            <TabsTrigger value="settings">Innstillinger</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <div className="text-sm space-y-4">
              <p>
                Vi bruker tre typer informasjonskapsler:
              </p>
              <ul className="list-disc pl-4 space-y-2">
                <li><strong>Nødvendige:</strong> Disse er påkrevd for at nettstedet skal fungere og kan ikke deaktiveres.</li>
                <li><strong>Analyse:</strong> Hjelper oss å forstå hvordan besøkende bruker nettstedet, slik at vi kan forbedre det.</li>
                <li><strong>Markedsføring:</strong> Brukes til å spore effektiviteten av vår markedsføring og tilpasse innhold.</li>
              </ul>
              <p>
                Du kan når som helst endre dine valg ved å klikke på "Informasjonskapsler" nederst på siden.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nødvendige</p>
                  <p className="text-sm text-gray-500">Påkrevd for grunnleggende funksjonalitet</p>
                </div>
                <input type="checkbox" checked disabled className="accent-[#2C435F]" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Analyse</p>
                  <p className="text-sm text-gray-500">Hjelper oss å forbedre nettstedet</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences(prev => ({...prev, analytics: e.target.checked}))}
                  className="accent-[#2C435F]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Markedsføring</p>
                  <p className="text-sm text-gray-500">Brukes til målrettet markedsføring</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences(prev => ({...prev, marketing: e.target.checked}))}
                  className="accent-[#2C435F]"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-4">
          <Button variant="outline" onClick={handleAcceptSelected}>
            Godta valgte
          </Button>
          <Button onClick={handleAcceptAll} className="bg-[#2C435F] hover:bg-[#2C435F]/80">
            Godta alle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 