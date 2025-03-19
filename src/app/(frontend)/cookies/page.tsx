import React from "react";
import { PageHeader } from "@/components/front/page-header";
import Footer from "@/components/front/footer";
import { ContactModal } from "@/components/contact-modal";
import { Button } from "@/components/ui/button";
import { Cookie, ExternalLink, HelpCircle, Info, Settings, ShieldCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CookiesPage() {
  const lastUpdated = "01.06.2023";

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Cookies policy" 
        description="Hvordan vi bruker informasjonskapsler på våre nettsider" 
      />
      
      <main className="flex-grow bg-white">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          {/* Introduksjon */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="h-6 w-6 text-blue-600" />
              <p className="text-sm text-gray-500">
                Sist oppdatert: {lastUpdated}
              </p>
            </div>
            
            <p className="text-lg text-gray-700 mb-6">
              Denne cookies policy forklarer hva informasjonskapsler (cookies) er, hvordan HMSNova bruker dem på våre nettsider, og hvilke valg du har når det gjelder disse informasjonskapslene.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-gray-700">
                <strong>I korthet:</strong> Vi bruker informasjonskapsler for å forbedre din brukeropplevelse, huske dine preferanser, og gi deg personlig tilpasset innhold og tjenester. Du kan når som helst endre dine preferanser for informasjonskapsler ved å klikke på "Cookie-innstillinger" nederst på nettsiden.
              </p>
            </div>
          </div>
          
          {/* Innholdsoversikt */}
          <div className="mb-12 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-[#17304F]">Innhold</h2>
            <ul className="space-y-2">
              {[
                "1. Hva er informasjonskapsler?",
                "2. Hvilke typer informasjonskapsler bruker vi?",
                "3. Hvordan bruker vi informasjonskapsler?",
                "4. Tredjeparters informasjonskapsler",
                "5. Dine valg og rettigheter",
                "6. Endringer i cookie policy",
                "7. Kontaktinformasjon"
              ].map((item, index) => (
                <li key={index} className="text-[#17304F]">
                  <a href={`#section-${index + 1}`} className="hover:underline">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Seksjoner */}
          <div className="space-y-12">
            <section id="section-1">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">1. Hva er informasjonskapsler?</h2>
              <p className="mb-4 text-gray-700">
                Informasjonskapsler (cookies) er små tekstfiler som lagres på din enhet (datamaskin, mobiltelefon eller nettbrett) når du besøker en nettside. De brukes for å gjøre nettsiden mer brukervennlig, effektiv og sikker.
              </p>
              <p className="mb-4 text-gray-700">
                Informasjonskapsler inneholder vanligvis ikke personopplysninger, men personopplysninger vi lagrer om deg kan knyttes til informasjonen som er lagret i og hentet fra informasjonskapslene.
              </p>
              <p className="text-gray-700">
                Det finnes forskjellige typer informasjonskapsler med ulike funksjoner og formål:
              </p>
              <ul className="list-disc pl-6 mt-4 mb-4 space-y-2 text-gray-700">
                <li><strong>Nødvendige:</strong> Essensielle for at nettsiden skal fungere korrekt.</li>
                <li><strong>Preferanser:</strong> Husker dine innstillinger og preferanser.</li>
                <li><strong>Statistikk:</strong> Samler anonyme data for å forbedre nettstedet.</li>
                <li><strong>Markedsføring:</strong> Brukes for målrettet annonsering.</li>
              </ul>
            </section>
            
            <section id="section-2">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">2. Hvilke typer informasjonskapsler bruker vi?</h2>
              <p className="mb-6 text-gray-700">
                Vi bruker følgende typer informasjonskapsler på våre nettsider:
              </p>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Type</TableHead>
                    <TableHead>Beskrivelse</TableHead>
                    <TableHead className="text-right w-[150px]">Varighet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Nødvendige cookies</TableCell>
                    <TableCell>Disse er nødvendige for at nettsiden skal fungere og kan ikke slås av i våre systemer. De settes vanligvis kun som svar på handlinger du gjør som utgjør en tjenesteanmodning, som å angi personvernpreferanser, logge inn eller fylle ut skjemaer.</TableCell>
                    <TableCell className="text-right">Økt / Permanent</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Preferansecookies</TableCell>
                    <TableCell>Disse gjør det mulig for nettsiden å huske valg du har gjort og gi forbedret, mer personlig funksjonalitet. De kan settes av oss eller av tredjepartsleverandører hvis tjenester vi har lagt til på våre sider.</TableCell>
                    <TableCell className="text-right">1 år</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Statistikk cookies</TableCell>
                    <TableCell>Disse hjelper oss å forstå hvordan besøkende samhandler med nettsiden ved å samle inn og rapportere informasjon anonymt. De hjelper oss å forbedre nettsiden.</TableCell>
                    <TableCell className="text-right">2 år</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Markedsføringcookies</TableCell>
                    <TableCell>Disse brukes for å spore besøkende på tvers av nettsider. Hensikten er å vise annonser som er relevante og engasjerende for den enkelte bruker.</TableCell>
                    <TableCell className="text-right">90 dager</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </section>
            
            <section id="section-3">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">3. Hvordan bruker vi informasjonskapsler?</h2>
              <p className="mb-4 text-gray-700">
                Vi bruker informasjonskapsler til følgende formål:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>For å gjenkjenne din nettleser eller enhet når du besøker nettsiden igjen</li>
                <li>For å huske dine preferanser og innstillinger, som språk og skriftstørrelse</li>
                <li>For å holde deg pålogget på tjenesten vår</li>
                <li>For å analysere hvordan du bruker tjenesten, og forbedre dens funksjonalitet</li>
                <li>For å tilpasse innholdet du ser basert på dine tidligere handlinger på nettsiden</li>
                <li>For sikkerhet og for å forhindre svindel</li>
              </ul>
              <p className="text-gray-700">
                Noen av informasjonskapslene settes av oss, mens andre settes av tredjeparter som leverer tjenester til oss.
              </p>
            </section>
            
            <section id="section-4">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">4. Tredjeparters informasjonskapsler</h2>
              <p className="mb-4 text-gray-700">
                Vi bruker tjenester fra følgende tredjeparter som kan sette informasjonskapsler på din enhet når du besøker våre nettsider:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li><strong>Google Analytics:</strong> For å analysere bruken av nettsiden vår</li>
                <li><strong>Hotjar:</strong> For å forstå hvordan brukere navigerer på siden vår</li>
                <li><strong>LinkedIn/Facebook/Twitter:</strong> For å muliggjøre deling av innhold på sosiale medier</li>
                <li><strong>Stripe/PayPal:</strong> For betalingsbehandling</li>
              </ul>
              <p className="mb-4 text-gray-700">
                Hver av disse tredjepartene har sin egen personvern- og cookie policy som regulerer hvordan de bruker informasjonskapsler og informasjonen de samler inn:
              </p>
              <div className="space-y-2 mb-4 text-gray-700">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Google Analytics Personvernpolicy
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                  <a href="https://help.hotjar.com/hc/en-us/articles/115011789248-Hotjar-Cookie-Information" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Hotjar Cookie Information
                  </a>
                </div>
              </div>
            </section>
            
            <section id="section-5">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">5. Dine valg og rettigheter</h2>
              <p className="mb-4 text-gray-700">
                Du har flere alternativer for å administrere informasjonskapsler:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li><strong>Cookie banner:</strong> Når du først besøker vår nettside, får du mulighet til å akseptere eller avvise ikke-essensielle cookies.</li>
                <li><strong>Cookie innstillinger:</strong> Du kan når som helst endre dine preferanser via lenken "Cookie-innstillinger" nederst på nettsiden.</li>
                <li><strong>Nettleserinnstillinger:</strong> De fleste nettlesere lar deg administrere informasjonskapsler via innstillingene. Dette inkluderer å slette eller blokkere informasjonskapsler.</li>
              </ul>
              <p className="text-gray-700">
                Vær oppmerksom på at hvis du velger å blokkere alle informasjonskapsler (inkludert nødvendige cookies), kan det hende at du ikke får tilgang til deler av nettsiden vår eller at funksjonaliteten blir begrenset.
              </p>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#17304F]">
                  <Settings className="h-5 w-5" />
                  Slik administrerer du cookies i din nettleser
                </h3>
                <div className="space-y-3 text-gray-700 text-sm">
                  <p>Her er noen lenker som viser hvordan du kan kontrollere cookies i din nettleser:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Google Chrome
                    </a>
                    <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Mozilla Firefox
                    </a>
                    <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Safari
                    </a>
                    <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Microsoft Edge
                    </a>
                  </div>
                </div>
              </div>
            </section>
            
            <section id="section-6">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">6. Endringer i cookie policy</h2>
              <p className="mb-4 text-gray-700">
                Vi kan oppdatere denne cookie policy fra tid til annen for å gjenspeile endringer i vår praksis eller av andre operasjonelle, juridiske eller regulatoriske årsaker. Vi vil informere deg om vesentlige endringer ved å vise en tydelig melding på vår nettside.
              </p>
              <p className="text-gray-700">
                Vi oppfordrer deg til å gjennomgå denne cookie policy jevnlig for å holde deg informert om hvordan vi bruker informasjonskapsler.
              </p>
            </section>
            
            <section id="section-7">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">7. Kontaktinformasjon</h2>
              <p className="mb-4 text-gray-700">
                Hvis du har spørsmål om denne cookie policy eller hvordan vi bruker informasjonskapsler, vennligst kontakt oss:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="font-semibold mb-1">HMSNova AS</p>
                <p className="mb-1">Storgata 10, 0155 Oslo</p>
                <p className="mb-1">E-post: <a href="mailto:personvern@hmsnova.no" className="text-blue-600 hover:underline">personvern@hmsnova.no</a></p>
                <p>Telefon: +47 99 11 29 16</p>
              </div>
            </section>
          </div>
        </div>
        
        {/* CTA */}
        <section className="bg-gray-50 py-12 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold mb-4 text-[#17304F]">Administrer dine cookie-innstillinger</h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Du kan når som helst velge hvilke typer cookies du ønsker å akseptere når du bruker våre tjenester.
            </p>
            <Button className="bg-[#17304F] hover:bg-[#2C435F]">
              <Cookie className="mr-2 h-4 w-4" />
              Åpne cookie-innstillinger
            </Button>
          </div>
        </section>
      </main>
      
    </div>
  );
}
