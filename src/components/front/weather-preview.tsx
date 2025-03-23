import React from "react";
import { 
  CloudSun, 
  Cloud, 
  CloudRain, 
  Wind, 
  Thermometer, 
  ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Typer for værdata
type WeatherCondition = 
  | "PARTLY_CLOUDY" 
  | "CLOUDY" 
  | "RAIN" 
  | "WIND";

type WeatherImpact = 
  | "LOW" 
  | "MEDIUM" 
  | "HIGH";

// Værdata konfigurasjon
const weatherConditionConfig: Record<WeatherCondition, { icon: React.ElementType; label: string; color: string }> = {
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
  WIND: { 
    icon: Wind, 
    label: "Vind", 
    color: "text-teal-500" 
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
  }
};

// Forenklet værdata
const previewWeatherData = [
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
      "høydearbeid": "MEDIUM" as WeatherImpact
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
      "høydearbeid": "HIGH" as WeatherImpact
    }
  }
];

export default function WeatherPreview() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mobile-optimized">
      <div className="p-6 bg-gradient-to-r from-[#2C435F] to-[#3A5474] text-white">
        <h3 className="text-2xl font-bold mb-2">Værdata og sikkerhet</h3>
        <p className="text-white/80">
          Ta hensyn til værmeldingen i risikoanlyser og planlegging av arbeid
        </p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {previewWeatherData.map((day) => {
            const WeatherIcon = weatherConditionConfig[day.condition].icon;
            return (
              <Card key={day.id} className="border-t-4" style={{ borderTopColor: day.condition === "PARTLY_CLOUDY" ? "#60a5fa" : day.condition === "RAIN" ? "#2563eb" : "#10b981" }}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{day.day}</h4>
                      <p className="text-sm text-gray-500">{day.date}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <WeatherIcon className={`h-8 w-8 ${weatherConditionConfig[day.condition].color}`} />
                      <span className="text-sm font-medium mt-1">{weatherConditionConfig[day.condition].label}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div className="flex items-center">
                      <Thermometer className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{day.temperature}°C</span>
                    </div>
                    <div className="flex items-center">
                      <Wind className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{day.wind} m/s</span>
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
        
        <div className="flex justify-end">
          <Link href="/sikkerjobbanalyse">
            <Button variant="outline" className="flex items-center gap-2 text-[#17304F]">
              <span className="sm:inline hidden">Les mer om SJA med værdata</span>
              <span className="sm:hidden inline">Les mer</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 