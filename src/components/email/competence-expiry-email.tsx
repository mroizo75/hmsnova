import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface CompetenceExpiryEmailProps {
  userName: string
  competenceName: string
  expiryDate: string
  daysUntilExpiry: number
  companyName: string
}

export function CompetenceExpiryEmailTemplate({
  userName,
  competenceName,
  expiryDate,
  daysUntilExpiry,
  companyName,
}: CompetenceExpiryEmailProps) {
  const previewText = `Ditt kompetansebevis for ${competenceName} utløper snart`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto p-4 max-w-xl">
            <Section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Heading className="text-xl font-bold text-gray-800 mb-4">
                Kompetansebevis utløper snart
              </Heading>
              
              <Text className="text-gray-700 mb-4">
                Hei {userName},
              </Text>
              
              <Text className="text-gray-700 mb-4">
                Dette er en påminnelse om at ditt kompetansebevis for <strong>{competenceName}</strong> utløper om <strong>{daysUntilExpiry} dager</strong> ({expiryDate}).
              </Text>
              
              <Text className="text-gray-700 mb-4">
                For å sikre at du opprettholder gyldig kompetanse, ber vi deg om å fornye dette beviset før det utløper. Når du har fornyet kompetansebeviset, kan du laste opp dokumentasjonen i HMS Nova.
              </Text>
              
              <Section className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500 mb-4">
                <Text className="text-blue-800 font-medium">
                  Hva du bør gjøre:
                </Text>
                <Text className="text-blue-700 text-sm">
                  1. Kontakt din leder for å avtale fornyelse av kompetansebeviset<br />
                  2. Gjennomfør nødvendig opplæring eller kurs<br />
                  3. Last opp det nye kompetansebeviset i HMS Nova når du har mottatt det
                </Text>
              </Section>
              
              <Text className="text-gray-700 mb-6">
                Logg inn på HMS Nova for å se detaljer om ditt kompetansebevis og laste opp fornyelsen når den er klar.
              </Text>
              
              <Section className="text-center">
                <Link
                  href={process.env.NEXT_PUBLIC_APP_URL || "https://hms-nova.no"}
                  className="bg-blue-600 text-white py-3 px-6 rounded-md font-medium no-underline inline-block"
                >
                  Logg inn på HMS Nova
                </Link>
              </Section>
              
              <Text className="text-gray-500 text-sm mt-8 pt-4 border-t border-gray-200">
                Denne e-posten er sendt fra HMS Nova på vegne av {companyName}. Hvis du har spørsmål, vennligst kontakt din nærmeste leder.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
} 