import React from "react";
import { PageHeader } from "@/components/front/page-header";
import Footer from "@/components/front/footer";
import { ContactModal } from "@/components/contact-modal";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, ShieldAlert, ShieldCheck } from "lucide-react";

export default function PersonvernPage() {
  const lastUpdated = "01.06.2023";

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Personvernerklæring" 
        description="Vår forpliktelse til å beskytte dine personopplysninger" 
      />
      
      <main className="flex-grow bg-white">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          {/* Introduksjon */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-6 w-6 text-green-600" />
              <p className="text-sm text-gray-500">
                Sist oppdatert: {lastUpdated}
              </p>
            </div>
            
            <p className="text-lg text-gray-700 mb-6">
              HMSNova respekterer ditt personvern og er forpliktet til å beskytte dine personopplysninger. Denne personvernerklæringen informerer deg om hvordan vi håndterer og beskytter dine data når du bruker vår tjeneste, og om dine personvernrettigheter.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-gray-700">
                <strong>I korthet:</strong> Vi samler kun inn personopplysninger som er nødvendige for å levere våre tjenester, og vi deler aldri dine data med tredjeparter uten ditt samtykke. Du har full kontroll over dine personopplysninger og kan når som helst be om innsyn, retting eller sletting.
              </p>
            </div>
          </div>
          
          {/* Innholdsoversikt */}
          <div className="mb-12 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-[#17304F]">Innhold</h2>
            <ul className="space-y-2">
              {[
                "1. Hvilke personopplysninger vi samler inn",
                "2. Hvordan vi bruker dine personopplysninger",
                "3. Hvordan vi lagrer og beskytter data",
                "4. Tredjeparter og dataoverføringer",
                "5. Dine personvernrettigheter",
                "6. Bruk av informasjonskapsler (cookies)",
                "7. Endringer i personvernerklæringen",
                "8. Kontaktinformasjon"
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
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">1. Hvilke personopplysninger vi samler inn</h2>
              <p className="mb-4 text-gray-700">
                Vi kan samle inn, bruke og lagre følgende typer personopplysninger:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Identifikasjonsinformasjon (navn, e-postadresse, telefonnummer)</li>
                <li>Påloggingsinformasjon (brukernavn, passord i kryptert form)</li>
                <li>Teknisk informasjon (IP-adresse, nettleserinformasjon, enhetstype)</li>
                <li>Bruksmønsterinformasjon (hvordan du interagerer med tjenesten)</li>
                <li>Lokaliseringsinformasjon (hvis du eksplisitt gir tillatelse til dette)</li>
              </ul>
              <p className="text-gray-700">
                Vi samler kun inn personopplysninger som er nødvendige for å levere og forbedre våre tjenester.
              </p>
            </section>
            
            <section id="section-2">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">2. Hvordan vi bruker dine personopplysninger</h2>
              <p className="mb-4 text-gray-700">
                Vi bruker dine personopplysninger for følgende formål:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>For å levere og administrere våre tjenester</li>
                <li>For å kommunisere med deg om tjenesten</li>
                <li>For å forbedre og tilpasse våre tjenester</li>
                <li>For å oppfylle våre juridiske forpliktelser</li>
                <li>For å beskytte våre og dine interesser</li>
              </ul>
              <p className="text-gray-700">
                Vi vil alltid ha et gyldig rettslig grunnlag for å behandle dine personopplysninger, enten samtykke, kontraktsoppfyllelse, rettslig forpliktelse eller legitime interesser.
              </p>
            </section>
            
            <section id="section-3">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">3. Hvordan vi lagrer og beskytter data</h2>
              <p className="mb-4 text-gray-700">
                Vi implementerer strenge sikkerhetstiltak for å beskytte dine personopplysninger:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>All data krypteres både ved overføring og lagring</li>
                <li>Vi bruker sikre servere plassert i EU/EØS</li>
                <li>Tilgang til data er begrenset til autorisert personell</li>
                <li>Regelmessige sikkerhetsgjennomganger og oppdateringer</li>
                <li>Automatisk backup for å forhindre datatap</li>
              </ul>
              <p className="text-gray-700">
                Vi oppbevarer dine personopplysninger kun så lenge det er nødvendig for formålene vi samlet dem inn for, inkludert for å oppfylle juridiske krav.
              </p>
            </section>
            
            <section id="section-4">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">4. Tredjeparter og dataoverføringer</h2>
              <p className="mb-4 text-gray-700">
                Vi deler kun dine personopplysninger med følgende tredjeparter:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Tjenesteleverandører som hjelper oss med å levere våre tjenester</li>
                <li>Profesjonelle rådgivere som revisorer, advokater og forsikringsselskaper</li>
                <li>Offentlige myndigheter når loven krever det</li>
              </ul>
              <p className="text-gray-700">
                Alle tredjeparter er pålagt å respektere sikkerheten til dine personopplysninger og behandle dem i samsvar med loven. Vi tillater ikke at våre tredjepartsleverandører bruker dine personopplysninger til egne formål.
              </p>
            </section>
            
            <section id="section-5">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">5. Dine personvernrettigheter</h2>
              <p className="mb-4 text-gray-700">
                I henhold til personvernlovgivningen har du følgende rettigheter:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li><strong>Rett til innsyn:</strong> Du kan be om innsyn i dine personopplysninger.</li>
                <li><strong>Rett til retting:</strong> Du kan be om at vi retter unøyaktige opplysninger om deg.</li>
                <li><strong>Rett til sletting:</strong> Du kan be om at vi sletter dine personopplysninger.</li>
                <li><strong>Rett til begrensning:</strong> Du kan be om at vi begrenser behandlingen av dine personopplysninger.</li>
                <li><strong>Rett til dataportabilitet:</strong> Du kan be om å få utlevert dine personopplysninger i et strukturert format.</li>
                <li><strong>Rett til å protestere:</strong> Du kan protestere mot behandling basert på legitime interesser.</li>
              </ul>
              <p className="text-gray-700">
                For å utøve dine rettigheter, vennligst kontakt oss via e-post: <a href="mailto:personvern@hmsnova.no" className="text-blue-600 hover:underline">personvern@hmsnova.no</a>
              </p>
            </section>
            
            <section id="section-6">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">6. Bruk av informasjonskapsler (cookies)</h2>
              <p className="mb-4 text-gray-700">
                Vi bruker informasjonskapsler for å forbedre din brukeropplevelse og samle inn informasjon om hvordan vår tjeneste brukes. Du kan når som helst endre dine preferanser for informasjonskapsler.
              </p>
              <p className="text-gray-700">
                For mer informasjon om hvordan vi bruker informasjonskapsler, vennligst se vår separate <a href="/cookies" className="text-blue-600 hover:underline">Cookies-policy</a>.
              </p>
            </section>
            
            <section id="section-7">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">7. Endringer i personvernerklæringen</h2>
              <p className="mb-4 text-gray-700">
                Vi kan oppdatere denne personvernerklæringen fra tid til annen for å gjenspeile endringer i våre tjenester eller juridiske krav. Vi vil informere deg om vesentlige endringer ved å vise en tydelig melding på vår nettside eller sende deg en e-post.
              </p>
              <p className="text-gray-700">
                Vi oppfordrer deg til å gjennomgå denne personvernerklæringen regelmessig for å holde deg informert om hvordan vi beskytter dine personopplysninger.
              </p>
            </section>
            
            <section id="section-8">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">8. Kontaktinformasjon</h2>
              <p className="mb-4 text-gray-700">
                Hvis du har spørsmål om denne personvernerklæringen eller hvordan vi behandler dine personopplysninger, vennligst kontakt oss:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="font-semibold mb-1">HMSNova AS</p>
                <p className="mb-1">Storgata 10, 0155 Oslo</p>
                <p className="mb-1">E-post: <a href="mailto:personvern@hmsnova.no" className="text-blue-600 hover:underline">personvern@hmsnova.no</a></p>
                <p>Telefon: +47 99 11 29 16</p>
              </div>
              <p className="mt-4 text-gray-700">
                Du har også rett til å klage til Datatilsynet hvis du mener at vår behandling av dine personopplysninger ikke overholder personvernlovgivningen.
              </p>
            </section>
          </div>
          
          {/* FAQ */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-[#17304F] flex items-center gap-2">
              <HelpCircle className="h-6 w-6" />
              Ofte stilte spørsmål om personvern
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Hvordan kan jeg få tilgang til eller slette mine data?</AccordionTrigger>
                <AccordionContent>
                  Du kan få tilgang til, endre eller slette dine personopplysninger ved å logge inn på din konto og bruke innstillingene der. Alternativt kan du sende en forespørsel til vår personvernansvarlig på personvern@hmsnova.no, og vi vil svare på din forespørsel innen 30 dager.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>Selger dere mine data til tredjeparter?</AccordionTrigger>
                <AccordionContent>
                  Nei, vi selger aldri dine personopplysninger til tredjeparter. Vi deler kun dine data med tredjeparter som hjelper oss med å levere våre tjenester, og alltid i samsvar med vår personvernerklæring og gjeldende lovgivning.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Hvor lenge lagrer dere mine personopplysninger?</AccordionTrigger>
                <AccordionContent>
                  Vi lagrer dine personopplysninger så lenge du har en aktiv konto hos oss. Etter at du avslutter din konto, vil vi lagre visse data i en begrenset periode for å oppfylle våre juridiske forpliktelser, løse tvister, og håndheve våre avtaler. Deretter vil alle personopplysninger bli slettet eller anonymisert.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>Hvordan sikrer dere mine personopplysninger?</AccordionTrigger>
                <AccordionContent>
                  Vi implementerer en rekke sikkerhetstiltak, inkludert kryptering, brannmurer, sikker serverinfrastruktur og regelmessige sikkerhetsgjennomganger. Kun autorisert personell har tilgang til personopplysninger, og all tilgang logges og overvåkes.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Hva skjer med mine data hvis jeg avslutter min konto?</AccordionTrigger>
                <AccordionContent>
                  Når du avslutter din konto, vil vi markere dine data for sletting og fjerne dem fra våre aktive systemer innen 30 dager. Visse data kan beholdes i en begrenset periode for å oppfylle lovkrav eller kontraktsmessige forpliktelser, men vil deretter bli permanent slettet.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
        
        {/* CTA */}
        <section className="bg-gray-50 py-12 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold mb-4 text-[#17304F]">Har du flere spørsmål om personvern?</h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Vi er her for å hjelpe deg med alle spørsmål relatert til ditt personvern og dine data.
            </p>
            <ContactModal>
              <Button className="bg-[#17304F] hover:bg-[#2C435F]">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Kontakt vår personvernansvarlig
              </Button>
            </ContactModal>
          </div>
        </section>
      </main>
      
    </div>
  );
}
