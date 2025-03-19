import React from "react";
import Image from "next/image";
import { PageHeader } from "@/components/front/page-header";
import Footer from "@/components/front/footer";
import { ContactModal } from "@/components/contact-modal";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Download, 
  FileText, 
  CheckCircle2, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Snowflake,
  Info
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Typer for værdata
type WeatherCondition = 
  | "SUNNY" 
  | "PARTLY_CLOUDY" 
  | "CLOUDY" 
  | "RAIN" 
  | "HEAVY_RAIN" 
  | "SNOW" 
  | "WIND" 
  | "STORM";

type WeatherImpact = 
  | "LOW" 
  | "MEDIUM" 
  | "HIGH" 
  | "EXTREME";

// Værdata konfigurasjon
const weatherConditionConfig: Record<WeatherCondition, { icon: React.ElementType; label: string; color: string }> = {
  SUNNY: { 
    icon: CloudSun, 
    label: "Sol", 
    color: "text-yellow-500" 
  },
  PARTLY_CLOUDY: { 
    icon: CloudSun, 
    label: "Delvis skyet", 
    color: "text-blue-400" 
  },
  CLOUDY: { 
    icon: Cloud, 
    label: "Overskyet", 
    color: "text-gray-500" 
  },
  RAIN: { 
    icon: CloudRain, 
    label: "Regn", 
    color: "text-blue-600" 
  },
  HEAVY_RAIN: { 
    icon: CloudRain, 
    label: "Kraftig regn", 
    color: "text-blue-700" 
  },
  SNOW: { 
    icon: Snowflake, 
    label: "Snø", 
    color: "text-blue-300" 
  },
  WIND: { 
    icon: Wind, 
    label: "Vind", 
    color: "text-teal-500" 
  },
  STORM: { 
    icon: Wind, 
    label: "Storm", 
    color: "text-purple-600" 
  }
};

// Konfigurasjon for påvirkningsgrad
const impactConfig: Record<WeatherImpact, { color: string; label: string }> = {
  LOW: { 
    color: "bg-green-100 text-green-800", 
    label: "Lav" 
  },
  MEDIUM: { 
    color: "bg-yellow-100 text-yellow-800", 
    label: "Middels" 
  },
  HIGH: { 
    color: "bg-orange-100 text-orange-800", 
    label: "Høy" 
  },
  EXTREME: { 
    color: "bg-red-100 text-red-800", 
    label: "Ekstrem" 
  }
};

// Eksempeldata for værforhold
const weatherData = [
  {
    id: "today",
    day: "I dag",
    date: "14. mars",
    temperature: 6,
    condition: "PARTLY_CLOUDY" as WeatherCondition,
    wind: 4,
    precipitation: 10,
    impacts: {
      "utendørs": "LOW" as WeatherImpact,
      "høydearbeid": "MEDIUM" as WeatherImpact,
      "tunge løft": "LOW" as WeatherImpact
    }
  },
  {
    id: "tomorrow",
    day: "I morgen",
    date: "15. mars",
    temperature: 4,
    condition: "RAIN" as WeatherCondition,
    wind: 8,
    precipitation: 65,
    impacts: {
      "utendørs": "MEDIUM" as WeatherImpact,
      "høydearbeid": "HIGH" as WeatherImpact,
      "tunge løft": "MEDIUM" as WeatherImpact
    }
  },
  {
    id: "after",
    day: "Overmorgen",
    date: "16. mars",
    temperature: 3,
    condition: "WIND" as WeatherCondition,
    wind: 12,
    precipitation: 30,
    impacts: {
      "utendørs": "MEDIUM" as WeatherImpact,
      "høydearbeid": "HIGH" as WeatherImpact,
      "tunge løft": "MEDIUM" as WeatherImpact
    }
  }
];

// Eksempeldata for sikkerjobbanalyse
const sjaExamples = [
  {
    id: "1",
    title: "Arbeid i høyden (stillas)",
    jobType: "Konstruksjon",
    weatherSensitive: true,
    riskLevel: "Høy",
    requiredMeasures: [
      "Sikring av stillasje",
      "Fallsikring for alle involverte",
      "Værforholdssjekk",
      "Inspeksjon før bruk"
    ]
  },
  {
    id: "2",
    title: "Kjemikaliehåndtering",
    jobType: "Produksjon",
    weatherSensitive: false,
    riskLevel: "Middels",
    requiredMeasures: [
      "Verneutstyr (hansker, briller)",
      "Ventilasjon",
      "Avfallshåndtering",
      "Beredskapsutstyr"
    ]
  },
  {
    id: "3",
    title: "Gravearbeid utendørs",
    jobType: "Anlegg",
    weatherSensitive: true,
    riskLevel: "Middels",
    requiredMeasures: [
      "Sikring av grøft",
      "Dreneringstiltak",
      "Værforholdssjekk",
      "Sikker adkomst"
    ]
  }
];

// Værrapport-komponent
function WeatherReport() {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <CloudSun className="h-6 w-6 mr-2 text-blue-600" />
        <h3 className="text-xl font-semibold text-[#17304F]">Værdata og arbeidssikkerhet</h3>
      </div>
      
      <p className="text-gray-700 mb-4">
        Vær- og klimaforhold kan ha stor påvirkning på sikkerheten ved ulike arbeidsoppgaver. 
        Vår integrerte værdata-modul viser aktuelt vær og prognoser sammen med potensielle risikoer for forskjellige aktiviteter.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {weatherData.map((day) => {
          const WeatherIcon = weatherConditionConfig[day.condition].icon;
          return (
            <Card key={day.id} className="border-t-4" style={{ borderTopColor: day.condition === "PARTLY_CLOUDY" ? "#60a5fa" : day.condition === "RAIN" ? "#2563eb" : "#10b981" }}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{day.day}</CardTitle>
                    <CardDescription>{day.date}</CardDescription>
                  </div>
                  <div className="flex flex-col items-center">
                    <WeatherIcon className={`h-8 w-8 ${weatherConditionConfig[day.condition].color}`} />
                    <span className="text-sm font-medium mt-1">{weatherConditionConfig[day.condition].label}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="flex items-center">
                    <Thermometer className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{day.temperature}°C</span>
                  </div>
                  <div className="flex items-center">
                    <Wind className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{day.wind} m/s</span>
                  </div>
                  <div className="flex items-center col-span-2">
                    <CloudRain className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{day.precipitation}% nedbør</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Påvirkning på arbeid:</p>
                  {Object.entries(day.impacts).map(([activity, impact]) => (
                    <div key={activity} className="flex justify-between items-center mt-2">
                      <span className="text-sm">{activity}</span>
                      <Badge variant="outline" className={`text-xs ${impactConfig[impact].color}`}>
                        {impactConfig[impact].label}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <div className="flex">
          <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <AlertDescription className="text-blue-800">
            Værdata oppdateres automatisk hver time fra meteorologiske tjenester og kan brukes i sikkerjobbanalyser for å planlegge trygt arbeid.
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}

export default function SikkerJobbAnalysePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Sikker Jobb Analyse (SJA)" 
        description="Planlegging og risikovurdering for trygt arbeid" 
      />
      
      <main className="flex-grow">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          {/* Intro */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Hva er Sikker Jobb Analyse?</h2>
            <p className="text-lg text-gray-700 mb-6">
              En Sikker Jobb Analyse (SJA) er et systematisk verktøy for å identifisere farer, vurdere risiko og implementere sikkerhetstiltak for spesifikke arbeidsoppgaver. SJA gjennomføres før potensielt risikofylte aktiviteter for å sikre at arbeidet utføres på en trygg måte.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                    Identifiser farer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Kartlegging av potensielle farer og risikomomenter forbundet med arbeidsoppgaven.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                    Vurder risiko
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Evaluering av sannsynlighet og konsekvens for hver identifisert fare.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                    Implementer tiltak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Utvikling av forebyggende og skadereduserende tiltak for å sikre trygt arbeid.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Alert className="mb-6">
              <div className="flex">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <AlertTitle>Viktig å vite</AlertTitle>
                  <AlertDescription>
                    SJA er påkrevd ved høyrisiko-aktiviteter og bør gjennomføres før arbeidet starter, med deltakelse fra alle involverte arbeidstakere.
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          </div>
          
          {/* Værdata modul */}
          <WeatherReport />
          
          {/* SJA Eksempler */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4 text-[#17304F]">Eksempler på Sikker Jobb Analyser</h3>
            
            <Tabs defaultValue="1" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {sjaExamples.map(example => (
                  <TabsTrigger key={example.id} value={example.id}>
                    {example.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {sjaExamples.map(example => (
                <TabsContent key={example.id} value={example.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{example.title}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge>{example.jobType}</Badge>
                          <Badge variant={example.weatherSensitive ? "destructive" : "outline"}>
                            {example.weatherSensitive ? "Værsensitiv" : "Ikke værsensitiv"}
                          </Badge>
                          <span className="text-sm">Risikonivå: <strong>{example.riskLevel}</strong></span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">Nødvendige sikkerhetstiltak:</div>
                      <ul className="space-y-2">
                        {example.requiredMeasures.map((measure, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{measure}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {example.weatherSensitive && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-md">
                          <h4 className="font-medium flex items-center text-blue-800 mb-2">
                            <CloudSun className="h-5 w-5 mr-2 text-blue-600" />
                            Væravhengige hensyn
                          </h4>
                          <div className="text-blue-800 text-sm">
                            Denne aktiviteten påvirkes av værforhold. Sjekk værdata før og under arbeidet. 
                            Ved {example.id === "1" ? "sterk vind (over 8 m/s) eller nedbør" : "kraftig regn eller tordenvær"} 
                            bør arbeidet vurderes utsatt eller ekstra sikkerhetstiltak implementeres.
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Last ned komplett SJA-mal
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
          
          {/* CTA */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-[#17304F]">Forbedre sikkerheten på arbeidsplassen</h3>
            <div className="text-gray-700 mb-6">
              Vårt SJA-verktøy hjelper din bedrift med å gjennomføre systematiske sikkerhetsvurderinger, inkludert værdata-integrasjon for værsensitive operasjoner. Øk sikkerheten og reduser risikoen for skader og ulykker.
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-[#17304F] hover:bg-[#2C435F]">
                <Download className="mr-2 h-4 w-4" />
                Last ned SJA-veiledning
              </Button>
              <ContactModal>
                <Button variant="outline">
                  Kontakt oss for demo
                </Button>
              </ContactModal>
            </div>
          </div>
        </div>
      </main>
      
    </div>
  );
}
