import React from "react";
import Image from "next/image";
import { PageHeader } from "@/components/front/page-header";
import Footer from "@/components/front/footer";
import { ContactModal } from "@/components/contact-modal";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Download, FileText, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

// Typer for faremerker og personlig verneutstyr (PPE)
type FareSymbol = 
  | "BRANNFARLIG" 
  | "ETSENDE" 
  | "GIFTIG" 
  | "HELSEFARE" 
  | "MILJØFARE" 
  | "EKSPLOSJONSFARLIG" 
  | "OKSIDERENDE" 
  | "GASS_UNDER_TRYKK" 
  | "AKUTT_GIFTIG";

type PPESymbol = 
  | "M001_GENERAL_MANDATORY"
  | "M002_READ_INSTRUCTIONS"
  | "M003_WEAR_EAR_PROTECTION"
  | "M004_WEAR_EYE_PROTECTION"
  | "M007_WEAR_OPAQUE_EYE_PROTECTION"
  | "M008_WEAR_FOOT_PROTECTION"
  | "M009_WEAR_PROTECTIVE_GLOVES"
  | "M010_WEAR_PROTECTIVE_CLOTHING"
  | "M014_WEAR_HEAD_PROTECTION"
  | "M017_WEAR_RESPIRATORY_PROTECTION";

// Konfigurering av faremerker
const fareSymbolConfig: Record<FareSymbol, { image: string; label: string }> = {
  BRANNFARLIG: { 
    image: "/faremerker/brannfarlig.webp", 
    label: "Brannfarlig" 
  },
  ETSENDE: { 
    image: "/faremerker/etsende.webp", 
    label: "Etsende" 
  },
  GIFTIG: { 
    image: "/faremerker/giftig.webp", 
    label: "Giftig" 
  },
  HELSEFARE: { 
    image: "/faremerker/helserisiko.webp", 
    label: "Helsefare" 
  },
  MILJØFARE: { 
    image: "/faremerker/miljofare.webp", 
    label: "Miljøfare" 
  },
  EKSPLOSJONSFARLIG: { 
    image: "/faremerker/explosive.webp", 
    label: "Eksplosjonsfarlig" 
  },
  OKSIDERENDE: { 
    image: "/faremerker/oksiderende.webp", 
    label: "Oksiderende" 
  },
  GASS_UNDER_TRYKK: { 
    image: "/faremerker/gass_under_trykk.webp", 
    label: "Gass under trykk" 
  },
  AKUTT_GIFTIG: { 
    image: "/faremerker/kronisk_helsefarlig.webp", 
    label: "Kronisk helsefare" 
  },
};

// Konfigurering av PPE-symboler
const ppeSymbolConfig: Record<PPESymbol, { image: string; label: string }> = {
  M001_GENERAL_MANDATORY: {
    label: "Generelt påbud",
    image: "/ppe/ISO_7010_M001.svg.png"
  },
  M002_READ_INSTRUCTIONS: {
    label: "Les instruksjoner",
    image: "/ppe/ISO_7010_M002.svg.png"
  },
  M003_WEAR_EAR_PROTECTION: {
    label: "Bruk hørselvern",
    image: "/ppe/ISO_7010_M003.svg.png"
  },
  M004_WEAR_EYE_PROTECTION: {
    label: "Bruk vernebriller",
    image: "/ppe/ISO_7010_M004.svg.png"
  },
  M007_WEAR_OPAQUE_EYE_PROTECTION: {
    label: "Bruk lystett øyebeskyttelse",
    image: "/ppe/ISO_7010_M007.svg.png"
  },
  M008_WEAR_FOOT_PROTECTION: {
    label: "Bruk vernesko",
    image: "/ppe/ISO_7010_M008.svg.png"
  },
  M009_WEAR_PROTECTIVE_GLOVES: {
    label: "Bruk vernehansker",
    image: "/ppe/ISO_7010_M009.svg.png"
  },
  M010_WEAR_PROTECTIVE_CLOTHING: {
    label: "Bruk verneklær",
    image: "/ppe/ISO_7010_M010.svg.png"
  },
  M014_WEAR_HEAD_PROTECTION: {
    label: "Bruk hjelm",
    image: "/ppe/ISO_7010_M014.svg.png"
  },
  M017_WEAR_RESPIRATORY_PROTECTION: {
    label: "Bruk åndedrettsvern",
    image: "/ppe/ISO_7010_M017.svg.png"
  }
};

// Komponent for faremerke-badges
function FareSymbolBadge({ symbol }: { symbol: FareSymbol }) {
  const config = fareSymbolConfig[symbol];
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8">
        <Image
          src={config.image}
          alt={config.label}
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
}

// Komponent for PPE-badges
function PPESymbolBadge({ symbol }: { symbol: PPESymbol }) {
  const config = ppeSymbolConfig[symbol];
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8">
        <Image
          src={config.image}
          alt={config.label}
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
}

// Eksempeldata for kjemikalier
const exampleProducts = [
  {
    id: "1",
    produktnavn: "Aceton",
    produsent: "Sigma-Aldrich",
    fareSymboler: ["BRANNFARLIG", "HELSEFARE"],
    ppeSymboler: ["M004_WEAR_EYE_PROTECTION", "M009_WEAR_PROTECTIVE_GLOVES"],
    databladUrl: "#",
    bruksomrade: "Rengjøring, avfetting"
  },
  {
    id: "2",
    produktnavn: "Natriumhydroksid",
    produsent: "VWR Chemicals",
    fareSymboler: ["ETSENDE"],
    ppeSymboler: ["M004_WEAR_EYE_PROTECTION", "M009_WEAR_PROTECTIVE_GLOVES", "M010_WEAR_PROTECTIVE_CLOTHING"],
    databladUrl: "#",
    bruksomrade: "Rengjøring, pH-justering"
  },
  {
    id: "3",
    produktnavn: "Epoksyharpiks",
    produsent: "Mapei",
    fareSymboler: ["HELSEFARE", "MILJØFARE"],
    ppeSymboler: ["M004_WEAR_EYE_PROTECTION", "M009_WEAR_PROTECTIVE_GLOVES", "M017_WEAR_RESPIRATORY_PROTECTION"],
    databladUrl: "#",
    bruksomrade: "Gulvbelegg, lim"
  },
  {
    id: "4",
    produktnavn: "Salpetersyre",
    produsent: "Merck",
    fareSymboler: ["ETSENDE", "OKSIDERENDE"],
    ppeSymboler: ["M004_WEAR_EYE_PROTECTION", "M009_WEAR_PROTECTIVE_GLOVES", "M010_WEAR_PROTECTIVE_CLOTHING"],
    databladUrl: "#",
    bruksomrade: "Metallbehandling, laboratoriearbeid"
  },
  {
    id: "5",
    produktnavn: "Isopropylalkohol",
    produsent: "Kemetyl",
    fareSymboler: ["BRANNFARLIG", "HELSEFARE"],
    ppeSymboler: ["M004_WEAR_EYE_PROTECTION", "M009_WEAR_PROTECTIVE_GLOVES"],
    databladUrl: "#",
    bruksomrade: "Rengjøring, desinfeksjon"
  }
];

export default function StoffkartotekPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Stoffkartotek" 
        description="Oversikt over kjemikalier og farlige stoffer med sikkerhetsinfo" 
      />
      
      <main className="flex-grow">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          {/* Intro */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-[#17304F]">Kjemikalieinformasjon</h2>
            <p className="text-lg text-gray-700 mb-6">
              Stoffkartoteket gir en oversikt over kjemikalier som brukes i virksomheten, med informasjon om faremerking og nødvendig verneutstyr. Dette er et viktig verktøy for å ivareta sikkerheten til alle som håndterer kjemikalier.
            </p>
            
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Viktig informasjon</AlertTitle>
              <AlertDescription>
                Dette er en offentlig versjon av stoffkartoteket. For detaljert informasjon om håndteringsrutiner, tilgang til sikkerhetsdatablader og risikovurderinger, vennligst logg inn på HMS-systemet.
              </AlertDescription>
            </Alert>
          </div>
          
          {/* Søk */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Søk etter kjemikalier..."
                className="pl-9 w-full max-w-sm"
              />
            </div>
          </div>
          
          {/* Tabell */}
          <div className="rounded-lg border shadow-sm mb-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Produktnavn</TableHead>
                  <TableHead>Produsent</TableHead>
                  <TableHead>Faresymboler</TableHead>
                  <TableHead>Verneutstyr</TableHead>
                  <TableHead>Bruksområde</TableHead>
                  <TableHead>Datablad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exampleProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.produktnavn}</TableCell>
                    <TableCell>{product.produsent}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.fareSymboler.map((symbol) => (
                          <FareSymbolBadge key={symbol} symbol={symbol as FareSymbol} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.ppeSymboler.map((symbol) => (
                          <PPESymbolBadge key={symbol} symbol={symbol as PPESymbol} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{product.bruksomrade}</TableCell>
                    <TableCell>
                      <a 
                        href={product.databladUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Åpne</span>
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* CTA */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-[#17304F]">Trenger du hjelp med kjemikaliehåndtering?</h3>
            <p className="text-gray-700 mb-6">
              Vårt stoffkartotek-modul hjelper din bedrift med å holde full oversikt over kjemikalier, risikovurderinger og sikkerhetsdatablader i henhold til gjeldende lovkrav.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-[#17304F] hover:bg-[#2C435F]">
                <Download className="mr-2 h-4 w-4" />
                Last ned veiledning
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
  )
}
