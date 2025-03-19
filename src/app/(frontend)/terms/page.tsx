import React from "react";
import { PageHeader } from "@/components/front/page-header";
import Footer from "@/components/front/footer";
import { ContactModal } from "@/components/contact-modal";
import { Button } from "@/components/ui/button";
import { FileText, HelpCircle, Info } from "lucide-react";

export default function TermsPage() {
  const lastUpdated = "01.06.2023";

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Brukervilkår" 
        description="Vilkår og betingelser for bruk av HMSNova sine tjenester" 
      />
      
      <main className="flex-grow bg-white">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          {/* Introduksjon */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
              <p className="text-sm text-gray-500">
                Sist oppdatert: {lastUpdated}
              </p>
            </div>
            
            <p className="text-lg text-gray-700 mb-6">
              Disse brukervilkårene utgjør en juridisk bindende avtale ("Avtalen") mellom deg ("Brukeren") og HMSNova AS ("HMSNova", "vi", "oss", "vår") om bruk av vår programvare, tjenester og nettplattform, samlet kalt "Tjenesten".
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-gray-700">
                <strong>Viktig:</strong> Ved å bruke våre tjenester eller opprette en konto hos oss, bekrefter du at du har lest, forstått og godtatt disse brukervilkårene. Hvis du ikke aksepterer vilkårene, ber vi deg om ikke å bruke våre tjenester.
              </p>
            </div>
          </div>
          
          {/* Innholdsoversikt */}
          <div className="mb-12 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-[#17304F]">Innhold</h2>
            <ul className="space-y-2">
              {[
                "1. Tjenestebeskrivelse",
                "2. Brukerkontoer og ansvar",
                "3. Abonnement og betaling",
                "4. Immaterielle rettigheter",
                "5. Brukergenerert innhold",
                "6. Bruksbegrensninger",
                "7. Personvern og data",
                "8. Ansvarsfraskrivelse og begrensning",
                "9. Oppsigelse",
                "10. Endringer i vilkårene",
                "11. Lovvalg og tvister",
                "12. Kontaktinformasjon"
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
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">1. Tjenestebeskrivelse</h2>
              <p className="mb-4 text-gray-700">
                HMSNova leverer en nettbasert programvare for helse, miljø og sikkerhet (HMS) som hjelper virksomheter med å oppfylle lovpålagte HMS-krav og systematisere HMS-arbeidet.
              </p>
              <p className="mb-4 text-gray-700">
                Tjenesten inkluderer, men er ikke begrenset til, moduler for HMS-håndbok, avvikshåndtering, risikovurdering, vernerunder, dokumentbibliotek og rapportering. HMSNova forbeholder seg retten til når som helst å endre, oppdatere eller fjerne funksjonalitet i Tjenesten uten forvarsel.
              </p>
              <p className="text-gray-700">
                HMSNova gir ingen garantier for at Tjenesten vil være tilgjengelig uavbrutt eller feilfri, men vil gjøre rimelige anstrengelser for å rette feil og mangler som oppdages.
              </p>
            </section>
            
            <section id="section-2">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">2. Brukerkontoer og ansvar</h2>
              <p className="mb-4 text-gray-700">
                For å bruke Tjenesten må du registrere en brukerkonto. Du er ansvarlig for å:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Oppgi nøyaktig og fullstendig informasjon ved registrering</li>
                <li>Holde påloggingsinformasjonen din konfidensiell</li>
                <li>Varsle oss umiddelbart ved mistanke om uautorisert bruk</li>
                <li>Sikre at all bruk av Tjenesten under din konto overholder disse vilkårene</li>
              </ul>
              <p className="text-gray-700">
                Du er fullt ut ansvarlig for all aktivitet som skjer under din brukerkonto, uavhengig av om aktiviteten er autorisert av deg eller ikke.
              </p>
            </section>
            
            <section id="section-3">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">3. Abonnement og betaling</h2>
              <p className="mb-4 text-gray-700">
                Bruk av HMSNova krever et aktivt abonnement. Det finnes flere abonnementstyper med ulik funksjonalitet og priser.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Abonnement faktureres i henhold til gjeldende prisliste og valgt faktureringsfrekvens</li>
                <li>Alle priser er oppgitt eksklusiv merverdiavgift</li>
                <li>HMSNova forbeholder seg retten til å endre priser med 30 dagers varsel før en ny faktureringsperiode</li>
                <li>Ved manglende betaling kan HMSNova begrense eller stenge tilgangen til Tjenesten</li>
                <li>Oppsigelse må skje senest 30 dager før neste faktureringsperiode</li>
              </ul>
              <p className="text-gray-700">
                Ved avslutning av abonnementet vil du miste tilgang til Tjenesten, men vi vil oppbevare dine data i henhold til vår personvernerklæring og gjeldende lovgivning.
              </p>
            </section>
            
            <section id="section-4">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">4. Immaterielle rettigheter</h2>
              <p className="mb-4 text-gray-700">
                HMSNova og dets lisensgivere eier alle immaterielle rettigheter til Tjenesten, inkludert, men ikke begrenset til, opphavsrett, varemerker, patenter, forretningshemmeligheter og annen eiendomsrett.
              </p>
              <p className="mb-4 text-gray-700">
                Ved å bruke Tjenesten får du en begrenset, ikke-eksklusiv, ikke-overførbar lisens til å bruke Tjenesten i henhold til disse vilkårene. Du har ikke rett til å:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Kopiere, modifisere eller skape avledede verk basert på Tjenesten</li>
                <li>Omvendt utvikle, dekompilere eller på annen måte forsøke å utlede kildekode</li>
                <li>Fjerne eller endre varemerker, opphavsrettsmerker eller andre eiendomsrettslige merker</li>
                <li>Selge, lisensiere, distribuere eller på annen måte overføre Tjenesten til tredjeparter</li>
              </ul>
            </section>
            
            <section id="section-5">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">5. Brukergenerert innhold</h2>
              <p className="mb-4 text-gray-700">
                Tjenesten tillater at du laster opp, lagrer og deler innhold som dokumenter, bilder, kommentarer og annen informasjon ("Brukergenerert innhold").
              </p>
              <p className="mb-4 text-gray-700">
                Du beholder alle rettigheter til ditt Brukergenererte innhold, men gir HMSNova en verdensomspennende, ikke-eksklusiv, royalty-fri lisens til å bruke, kopiere, modifisere, distribuere og vise innholdet for å levere og forbedre Tjenesten.
              </p>
              <p className="mb-4 text-gray-700">
                Du er fullt ut ansvarlig for alt Brukergenerert innhold du laster opp eller deler gjennom Tjenesten, og du bekrefter at du har alle nødvendige rettigheter til å dele dette innholdet.
              </p>
              <p className="text-gray-700">
                HMSNova forbeholder seg retten til å fjerne eller nekte å vise innhold som bryter med disse vilkårene eller gjeldende lovgivning.
              </p>
            </section>
            
            <section id="section-6">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">6. Bruksbegrensninger</h2>
              <p className="mb-4 text-gray-700">
                Ved bruk av Tjenesten må du overholde alle gjeldende lover og forskrifter. Du forplikter deg til ikke å:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Bruke Tjenesten til ulovlige formål eller for å fremme ulovlige aktiviteter</li>
                <li>Laste opp eller dele støtende, krenkende, diskriminerende eller ærekrenkende innhold</li>
                <li>Forsøke å omgå sikkerhetstiltak eller få uautorisert tilgang til systemer eller data</li>
                <li>Introdusere skadelig kode, virus eller annen ondsinnet programvare</li>
                <li>Forstyrre eller skade Tjenestens infrastruktur eller ytelse</li>
                <li>Høste eller samle inn data om andre brukere uten samtykke</li>
              </ul>
              <p className="text-gray-700">
                HMSNova forbeholder seg retten til å suspendere eller avslutte tilgangen til Tjenesten for brukere som bryter disse begrensningene.
              </p>
            </section>
            
            <section id="section-7">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">7. Personvern og data</h2>
              <p className="mb-4 text-gray-700">
                HMSNova behandler personopplysninger i samsvar med vår <a href="/personvern" className="text-blue-600 hover:underline">Personvernerklæring</a> og gjeldende personvernlovgivning.
              </p>
              <p className="mb-4 text-gray-700">
                HMSNova fungerer som databehandler for data du laster opp eller genererer i Tjenesten. Du er ansvarlig for å sikre at du har nødvendig rettslig grunnlag for å behandle personopplysninger i Tjenesten.
              </p>
              <p className="text-gray-700">
                Ved bruk av Tjenesten samtykker du til at HMSNova kan samle inn og bruke anonymiserte og aggregerte data for å forbedre Tjenesten, utvikle nye funksjoner og for statistiske formål.
              </p>
            </section>
            
            <section id="section-8">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">8. Ansvarsfraskrivelse og begrensning</h2>
              <p className="mb-4 text-gray-700">
                Tjenesten leveres "som den er" og "som tilgjengelig" uten noen form for garanti, verken uttrykt eller underforstått.
              </p>
              <p className="mb-4 text-gray-700">
                HMSNova fraskriver seg, i den grad det er tillatt etter gjeldende lov, alle garantier, inkludert, men ikke begrenset til, garantier om salgbarhet, egnethet for et bestemt formål og ikke-krenkelse.
              </p>
              <p className="mb-4 text-gray-700">
                HMSNova er ikke ansvarlig for noen indirekte, tilfeldige, spesielle, følge- eller straffeskader, inkludert tapt fortjeneste, data eller brukstid som følge av din bruk av Tjenesten.
              </p>
              <p className="text-gray-700">
                HMSNovas totale ansvar for eventuelle krav som oppstår under disse vilkårene er begrenset til det beløpet du har betalt for Tjenesten i de 12 månedene før kravet oppsto.
              </p>
            </section>
            
            <section id="section-9">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">9. Oppsigelse</h2>
              <p className="mb-4 text-gray-700">
                Du kan når som helst si opp din brukerkonto og avslutte denne Avtalen ved å kontakte oss skriftlig. Oppsigelse trer i kraft ved utløpet av gjeldende faktureringsperiode.
              </p>
              <p className="mb-4 text-gray-700">
                HMSNova kan suspendere eller avslutte din tilgang til Tjenesten med umiddelbar virkning hvis:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Du bryter noen av disse vilkårene</li>
                <li>Du ikke betaler for Tjenesten innen forfallsdato</li>
                <li>HMSNova har grunn til å tro at din bruk av Tjenesten utgjør en risiko for systemet eller andre brukere</li>
              </ul>
              <p className="text-gray-700">
                Ved oppsigelse vil din tilgang til Tjenesten opphøre. Bestemmelser som etter sin natur skal fortsette å gjelde etter oppsigelse, vil overleve oppsigelsen av denne Avtalen.
              </p>
            </section>
            
            <section id="section-10">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">10. Endringer i vilkårene</h2>
              <p className="mb-4 text-gray-700">
                HMSNova forbeholder seg retten til å endre disse vilkårene når som helst. Vi vil varsle deg om vesentlige endringer via e-post eller ved en tydelig melding i Tjenesten minst 30 dager før endringene trer i kraft.
              </p>
              <p className="text-gray-700">
                Din fortsatte bruk av Tjenesten etter at endringene trer i kraft, utgjør ditt samtykke til de reviderte vilkårene. Hvis du ikke aksepterer endringene, må du avslutte din bruk av Tjenesten.
              </p>
            </section>
            
            <section id="section-11">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">11. Lovvalg og tvister</h2>
              <p className="mb-4 text-gray-700">
                Disse vilkårene reguleres av norsk lov uten hensyn til konfliktregler.
              </p>
              <p className="mb-4 text-gray-700">
                Enhver tvist som oppstår i forbindelse med disse vilkårene skal først forsøkes løst gjennom forhandlinger. Hvis forhandlingene ikke fører til en løsning innen 30 dager, skal tvisten avgjøres av Oslo tingrett som første instans.
              </p>
              <p className="text-gray-700">
                Ingenting i disse vilkårene skal begrense dine rettigheter som forbruker i henhold til ufravikelig forbrukerlovgivning.
              </p>
            </section>
            
            <section id="section-12">
              <h2 className="text-2xl font-bold mb-6 text-[#17304F]">12. Kontaktinformasjon</h2>
              <p className="mb-4 text-gray-700">
                Hvis du har spørsmål om disse vilkårene eller Tjenesten, vennligst kontakt oss:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="font-semibold mb-1">HMSNova AS</p>
                <p className="mb-1">Storgata 10, 0155 Oslo</p>
                <p className="mb-1">E-post: <a href="mailto:post@hmsnova.no" className="text-blue-600 hover:underline">post@hmsnova.no</a></p>
                <p>Telefon: +47 99 11 29 16</p>
              </div>
            </section>
          </div>
        </div>
        
        {/* CTA */}
        <section className="bg-gray-50 py-12 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold mb-4 text-[#17304F]">Har du spørsmål om våre brukervilkår?</h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Vi er her for å hjelpe deg med å forstå dine rettigheter og forpliktelser som bruker av våre tjenester.
            </p>
            <ContactModal>
              <Button className="bg-[#17304F] hover:bg-[#2C435F]">
                <Info className="mr-2 h-4 w-4" />
                Kontakt oss for avklaring
              </Button>
            </ContactModal>
          </div>
        </section>
      </main>
      
    </div>
  );
}
