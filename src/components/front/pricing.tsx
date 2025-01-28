"use client"

import Link from "next/link"
import { useState } from "react"
import { ContactModal } from "@/components/contact-modal"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Info } from "lucide-react"

type EmployeeRange = "1-5" | "5-10" | "10-30"
type StorageSize = "1GB" | "5GB" | "10GB" | "20GB"
type PlanType = "standard" | "plus" | "premium"

const PricingSection = () => {
    const [isMonthly, setIsMonthly] = useState(true);
    const [selectedEmployees, setSelectedEmployees] = useState<Record<PlanType, EmployeeRange>>({
        standard: "1-5",
        plus: "1-5",
        premium: "1-5"
    });
    const [selectedStorage, setSelectedStorage] = useState<Record<PlanType, StorageSize>>({
        standard: "1GB",
        plus: "1GB",
        premium: "1GB"
    });
    const [includeVernerunde, setIncludeVernerunde] = useState<Record<string, "yes" | "no">>({
        standard: "no",
        premium: "no"
    });

    const basePrices = {
        standard: { monthly: 699, yearly: 8388 },
        plus: { monthly: 1699, yearly: 20388 },
        premium: { monthly: 2290, yearly: 27480 }
    };

    const employeePricing: Record<EmployeeRange, number> = {
        "1-5": 0,
        "5-10": 299,
        "10-30": 599
    };

    const storagePricing: Record<StorageSize, number> = {
        "1GB": 0,
        "5GB": 199,
        "10GB": 399,
        "20GB": 699
    };

    const calculatePrice = (plan: string) => {
        const basePrice = isMonthly ? basePrices[plan as keyof typeof basePrices].monthly : basePrices[plan as keyof typeof basePrices].yearly;
        const employeePrice = employeePricing[selectedEmployees[plan as PlanType]];
        const storagePrice = storagePricing[selectedStorage[plan as PlanType]];
        
        // Vernerunde: 416 kr/mnd (5000 kr/år)
        const vernerundePrice = includeVernerunde[plan] === "yes" 
            ? (isMonthly ? 416 : 5000)
            : 0;

        if (isMonthly) {
            return basePrice + employeePrice + storagePrice + vernerundePrice;
        } else {
            // Årlig pris: (basePrice er allerede årlig) + (månedlige tillegg * 12) + vernerundePrice (årlig)
            return basePrice + (employeePrice + storagePrice) * 12 + vernerundePrice;
        }
    };

    return (
        <section id="pricing" className="py-24">
            <div className="max-w-7xl mx-auto px-5 sm:px-10 md:px-12 lg:px-5">
                <div className="flex flex-col  space-y-10">
                    <div className="flex gap-10 flex-col items-center">
                        <div className="text-center max-w-2xl">
                            <h2 className="text-3xl font-semibold text-[#2C435F] dark:text-gray-200 md:text-4xl xl:text-5xl leading-tight">HMS Nova Prispakker</h2>
                        </div>
                        <div className="min-w-max flex justify-center md:justify-end">
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg shadow-gray-200/40 dark:shadow-none flex items-center relative p-1">
                                <button 
                                    onClick={() => setIsMonthly(true)} 
                                    className={`flex items-center h-9 w-max px-4 rounded-lg ${
                                        isMonthly ? 'bg-[#2C435F] dark:bg-[#2C435F] text-white' : 'text-[#2C435F] hover:text-[#3F546E] dark:text-gray-300'
                                    }`}
                                >
                                    Månedlig
                                </button>
                                <button 
                                    onClick={() => setIsMonthly(false)}
                                    className={`flex items-center h-9 w-max px-4 ${
                                        !isMonthly ? 'bg-[#2C435F] dark:bg-[#2C435F] text-white' : 'text-[#2C435F] hover:text-[#3F546E] dark:text-gray-300'
                                    }`}
                                >
                                    Årlig
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mx-auto">
                        <div className="rounded-lg border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 p-6 sm:p-10 space-y-6">
                            <div className="text-center space-y-3 relative">
                                <PackageInfoModal />
                                <h2 className="font-semibold text-2xl text-gray-900 dark:text-white">
                                    Standard
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Grunnleggende HMS-pakke for små og mellomstore bedrifter
                                </p>
                            </div>
                            <div className="flex relative py-3 before:absolute before:top-1/2 before:inset-0 before:h-px before:bg-gray-100 dark:before:bg-gray-900" />
                            <div className="text-center space-y-2">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {calculatePrice('standard').toFixed(0)},-
                                    <span className="text-lg"> per {isMonthly ? 'måned' : 'år'}</span>
                                </p>
                                {isMonthly && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {calculatePrice('standard').toFixed(0)},- per år
                                    </p>
                                )}
                            </div>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                <p className="text-sm font-medium">Velg antall ansatte:</p>
                                <select 
                                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-900"
                                    value={selectedEmployees.standard}
                                    onChange={(e) => setSelectedEmployees({...selectedEmployees, standard: e.target.value as EmployeeRange})}
                                >
                                    <option value="1-5">1-5 ansatte</option>
                                    <option value="5-10">5-10 ansatte (+299,- /mnd)</option>
                                    <option value="10-30">10-30 ansatte (+599,- /mnd)</option>
                                </select>
                                
                                <p className="text-sm font-medium mt-4">Velg lagringskapasitet:</p>
                                <select 
                                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-900"
                                    value={selectedStorage.standard}
                                    onChange={(e) => setSelectedStorage({...selectedStorage, standard: e.target.value as StorageSize})}
                                >
                                    <option value="1GB">1GB (inkludert)</option>
                                    <option value="5GB">5GB (+199,- /mnd)</option>
                                    <option value="10GB">10GB (+399,- /mnd)</option>
                                    <option value="20GB">20GB (+699,- /mnd)</option>
                                </select>
                            </div>
                            <div className="space-y-2 mt-4">
                                <label className="text-sm text-gray-600">Vernerunde-modul (+416 kr/mnd)</label>
                                <Select 
                                    onValueChange={(value) => setIncludeVernerunde(prev => ({...prev, standard: value as "yes" | "no"}))} 
                                    defaultValue="no"
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Velg alternativ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no">Nei</SelectItem>
                                        <SelectItem value="yes">Ja (+5000 kr/år)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                                <li>• HMS Håndbok</li>
                                <li>• Avvikshåndtering</li>
                                <li>• Risikovurdering</li>
                                <li>• Dokumenthåndtering</li>
                                <li>• Ansatthåndtering</li>
                                <li>• 1GB Sky Lagring</li>
                            </ul>
                            <div className="flex relative py-3 before:absolute before:top-1/2 before:inset-0 before:h-px before:bg-gray-100 dark:before:bg-gray-900" />
                            <div className="flex justify-center">
                                <Button className="outline-none w-max flex items-center mx-auto h-11 px-5 rounded-md bg-gray-100 dark:bg-gray-900 text-[#2C435F] hover:text-[#3F546E] dark:text-gray-300" asChild>
                                    <Link href="/register">Velg Standard</Link>
                                </Button>
                            </div>
                        </div>
                        <div className="rounded-lg relative border border-gray-100 dark:border-gray-900 bg-gray-100 dark:bg-gray-900 p-6 sm:p-10">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1 rounded-b-lg bg-gray-200 dark:bg-gray-950 text-gray-700 dark:text-gray-300">
                                Anbefalt
                            </div>
                            <div className="space-y-6">
                                <div className="text-center space-y-3 relative">
                                    <PackageInfoModal />
                                    <h2 className="font-semibold text-2xl text-gray-900 dark:text-white">
                                        Standard + HMS Rådgivning
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Komplett pakke med profesjonell rådgivning
                                    </p>
                                </div>
                                <div className="flex relative py-3 before:absolute before:top-1/2 before:inset-0 before:h-px before:bg-gray-200 dark:before:bg-gray-800" />
                                <div className="text-center space-y-2">
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {calculatePrice('plus').toFixed(0)},-
                                        <span className="text-lg"> per {isMonthly ? 'måned' : 'år'}</span>
                                    </p>
                                    {isMonthly && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {calculatePrice('plus').toFixed(0)},- per år
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                    <p className="text-sm font-medium">Velg antall ansatte:</p>
                                    <select 
                                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-900"
                                        value={selectedEmployees.plus}
                                        onChange={(e) => setSelectedEmployees({...selectedEmployees, plus: e.target.value as EmployeeRange})}
                                    >
                                        <option value="1-5">1-5 ansatte</option>
                                        <option value="5-10">5-10 ansatte (+299,- /mnd)</option>
                                        <option value="10-30">10-30 ansatte (+599,- /mnd)</option>
                                    </select>
                                    
                                    <p className="text-sm font-medium mt-4">Velg lagringskapasitet:</p>
                                    <select 
                                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-900"
                                        value={selectedStorage.plus}
                                        onChange={(e) => setSelectedStorage({...selectedStorage, plus: e.target.value as StorageSize})}
                                    >
                                        <option value="1GB">1GB (inkludert)</option>
                                        <option value="5GB">5GB (+199,- /mnd)</option>
                                        <option value="10GB">10GB (+399,- /mnd)</option>
                                        <option value="20GB">20GB (+699,- /mnd)</option>
                                    </select>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <label className="text-sm text-gray-600">Vernerunde-modul (+416 kr/mnd)</label>
                                    <Select 
                                        onValueChange={(value) => setIncludeVernerunde(prev => ({...prev, plus: value as "yes" | "no"}))} 
                                        defaultValue="no"
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Velg alternativ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no">Nei</SelectItem>
                                            <SelectItem value="yes">Ja (+5000 kr/år)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                                    <li>• Alt i Standard-pakken</li>
                                    <li>• HMS Rådgivning</li>
                                    <li>• Implementeringsstøtte</li>
                                    <li>• Oppfølging av HMS-arbeid</li>
                                    <li>• 1GB Sky Lagring</li>
                                </ul>
                                <div className="flex relative py-3 before:absolute before:top-1/2 before:inset-0 before:h-px before:bg-gray-200 dark:before:bg-gray-800" />
                                <div className="flex justify-center">
                                    <Button className="outline-none w-max mx-auto flex items-center h-11 px-5 rounded-md bg-[#2C435F] dark:bg-[#2C435F] text-white hover:bg-[#3F546E]" asChild>
                                        <Link href="/register">Velg Standard+</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 p-6 sm:p-10 space-y-6">
                            <div className="text-center space-y-3 relative">
                                <PackageInfoModal />
                                <h2 className="font-semibold text-2xl text-gray-900 dark:text-white">
                                    Premium
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Komplett HMS-løsning med vernerunder
                                </p>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {calculatePrice('premium').toFixed(0)},-
                                    <span className="text-lg"> per {isMonthly ? 'måned' : 'år'}</span>
                                </p>
                                {isMonthly && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {calculatePrice('premium').toFixed(0)},- per år
                                    </p>
                                )}
                            </div>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                <p className="text-sm font-medium">Velg antall ansatte:</p>
                                <select 
                                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-900"
                                    value={selectedEmployees.premium}
                                    onChange={(e) => setSelectedEmployees({...selectedEmployees, premium: e.target.value as EmployeeRange})}
                                >
                                    <option value="1-5">1-5 ansatte</option>
                                    <option value="5-10">5-10 ansatte (+299,- /mnd)</option>
                                    <option value="10-30">10-30 ansatte (+599,- /mnd)</option>
                                </select>
                                
                                <p className="text-sm font-medium mt-4">Velg lagringskapasitet:</p>
                                <select 
                                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-900"
                                    value={selectedStorage.premium}
                                    onChange={(e) => setSelectedStorage({...selectedStorage, premium: e.target.value as StorageSize})}
                                >
                                    <option value="1GB">1GB (inkludert)</option>
                                    <option value="5GB">5GB (+199,- /mnd)</option>
                                    <option value="10GB">10GB (+399,- /mnd)</option>
                                    <option value="20GB">20GB (+699,- /mnd)</option>
                                </select>
                            </div>
                            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                                <li>• Alt i Standard + HMS Rådgivning</li>
                                <li>• Årlig vernerunde</li>
                                <li>• Forbedringsrapport</li>
                                <li>• Oppfølging av tiltak</li>
                                <li>• 1GB Sky Lagring</li>
                            </ul>
                            <div className="flex relative py-3 before:absolute before:top-1/2 before:inset-0 before:h-px before:bg-gray-100 dark:before:bg-gray-900" />
                            <div className="flex justify-center">
                                <Button className="outline-none w-max mx-auto flex items-center h-11 px-5 rounded-md bg-gray-100 dark:bg-gray-900 text-[#2C435F] hover:text-[#3F546E] dark:text-gray-300" asChild>
                                    <Link href="/register">Velg Premium</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

const PackageInfoModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Info className="h-4 w-4 text-gray-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] w-full sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-[#2C435F]">
            HMS Nova Pakkedetaljer
          </DialogTitle>
          <DialogDescription className="text-sm">
            Detaljert informasjon om våre HMS-pakker og tilleggstjenester
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {/* Standard Software */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#2C435F]">Standard Software</h3>
            <p className="text-sm text-gray-600">Vår grunnpakke inkluderer:</p>
            <ul className="text-sm list-disc pl-4 space-y-1 text-gray-600">
              <li>Digital HMS-håndbok</li>
              <li>Avvikshåndtering</li>
              <li>Risikovurderingsverktøy</li>
              <li>Dokumenthåndtering</li>
              <li>Ansatthåndtering</li>
            </ul>
          </div>

          {/* Vernerunde */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#2C435F]">Vernerunde</h3>
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <h4 className="font-medium text-[#2C435F]">Inkludert i tilleggspakken:</h4>
              <ul className="list-disc pl-4 space-y-1 mt-2 text-gray-600">
                <li>1 årlig vernerunde med sertifisert HMS-rådgiver</li>
                <li>Grundig gjennomgang av arbeidsmiljø og sikkerhet</li>
                <li>Detaljert rapport med tiltaksplan</li>
                <li>Oppfølging av identifiserte tiltak</li>
              </ul>
              <div className="mt-3 p-2 bg-gray-100 rounded">
                <p className="font-medium text-[#2C435F] mb-1">Priser:</p>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>• Vernerunde: 5000,- + mva</li>
                  <li>• Reise og kost kommer i tillegg</li>
                  <li>• Ekstra vernerunder kan bestilles til samme pris</li>
                </ul>
              </div>
            </div>
          </div>

          {/* HMS Rådgivning */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#2C435F]">HMS Rådgivning</h3>
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <h4 className="font-medium text-[#2C435F]">I Standard+ og Premium:</h4>
              <ul className="list-disc pl-4 space-y-1 mt-2 text-gray-600">
                <li>12 timer årlig HMS-rådgivning</li>
                <li>Dedikert HMS-rådgiver</li>
                <li>Støtte ved myndighetsinspeksjoner</li>
                <li>Månedlige oppfølgingsmøter</li>
              </ul>
            </div>
          </div>

          {/* Premium */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#2C435F]">Premium-pakke</h3>
            <ul className="text-sm list-disc pl-4 space-y-1 text-gray-600">
              <li>Alt fra Standard software</li>
              <li>12 timer årlig HMS-rådgivning</li>
              <li>1 årlig vernerunde inkludert</li>
              <li>Prioritert support og oppfølging</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PricingSection