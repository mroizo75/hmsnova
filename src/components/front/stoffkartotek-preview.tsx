import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Typer for faremerker
type FareSymbol = 
  | "BRANNFARLIG" 
  | "ETSENDE" 
  | "HELSEFARE" 
  | "MILJØFARE";

// Konfigurasjon for faremerker
const fareSymbolConfig: Record<FareSymbol, { image: string; label: string }> = {
  BRANNFARLIG: { 
    image: "/faremerker/brannfarlig.webp", 
    label: "Brannfarlig" 
  },
  ETSENDE: { 
    image: "/faremerker/etsende.webp", 
    label: "Etsende" 
  },
  HELSEFARE: { 
    image: "/faremerker/helserisiko.webp", 
    label: "Helsefare" 
  },
  MILJØFARE: { 
    image: "/faremerker/miljofare.webp", 
    label: "Miljøfare" 
  }
};

// Komponent for faremerke-badges
function FareSymbolBadge({ symbol }: { symbol: FareSymbol }) {
  const config = fareSymbolConfig[symbol];
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-6 h-6">
        <Image
          src={config.image}
          alt={config.label}
          fill
          className="object-contain"
          sizes="24px"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
      </div>
    </div>
  );
}

// Forenklet eksempeldata
const previewProducts = [
  {
    id: "1",
    produktnavn: "Aceton",
    fareSymboler: ["BRANNFARLIG", "HELSEFARE"],
    bruksomrade: "Rengjøring"
  },
  {
    id: "2",
    produktnavn: "Natriumhydroksid",
    fareSymboler: ["ETSENDE"],
    bruksomrade: "Rengjøring"
  },
  {
    id: "3",
    produktnavn: "Epoksyharpiks",
    fareSymboler: ["HELSEFARE", "MILJØFARE"],
    bruksomrade: "Lim, tettemasse"
  }
];

export default function StoffkartotekPreview() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mobile-optimized">
      <div className="p-6 bg-gradient-to-r from-[#17304F] to-[#2C435F] text-white">
        <h3 className="text-2xl font-bold mb-2">Stoffkartotek</h3>
        <p className="text-white/80">
          Hold oversikt over kjemikalier og farlige stoffer med sikkerhetsinformasjon
        </p>
      </div>
      
      <div className="p-6">
        <div className="rounded-lg border shadow-sm mb-4 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Produkt</TableHead>
                <TableHead>Faresymboler</TableHead>
                <TableHead className="hidden sm:table-cell">Bruksområde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.produktnavn}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.fareSymboler.map((symbol) => (
                        <FareSymbolBadge key={symbol} symbol={symbol as FareSymbol} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{product.bruksomrade}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex justify-end">
          <Link href="/stoffkartotek">
            <Button variant="outline" className="flex items-center gap-2 text-[#17304F]">
              <span>Se full oversikt</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 