import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  pdf,
} from '@react-pdf/renderer'
import { SJAWithRelations } from './types'
import { formatDate } from '@/lib/utils/date'

// Registrer fonter
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.cdnfonts.com/s/29107/Helvetica.woff', fontWeight: 400 },
    { src: 'https://fonts.cdnfonts.com/s/29107/Helvetica-Bold.woff', fontWeight: 700 }
  ]
})

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica',
    fontWeight: 700,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica',
    fontWeight: 700,
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 150,
    fontFamily: 'Helvetica',
    fontWeight: 700,
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 5,
    fontFamily: 'Helvetica',
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 5,
  },
  tableCell: {
    flex: 1,
  },
  image: {
    marginVertical: 10,
    width: 200,
    height: 200,
    objectFit: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
  statusBadge: {
    padding: 4,
    borderRadius: 4,
    fontSize: 12,
    textAlign: 'center',
    width: 100,
  },
})

export function SJAPDFDocument({ sja }: { sja: SJAWithRelations }) {
  // Sikre at arrays alltid eksisterer
  const risikoer = sja.risikoer ?? []
  const tiltak = sja.tiltak ?? []
  const produkter = sja.produkter ?? []
  const vedlegg = sja.vedlegg ?? []
  const godkjenninger = sja.godkjenninger ?? []

  return (
    <Document>
      <Page style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sikker Jobb Analyse (SJA)</Text>
          <Text style={styles.subtitle}>#{sja.id || 'N/A'}</Text>
        </View>

        {/* Bedriftsinformasjon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bedriftsinformasjon</Text>
          <Text>{sja.company?.name || 'N/A'}</Text>
          <Text>Org.nr: {sja.company?.orgNumber || 'N/A'}</Text>
        </View>

        {/* Generell informasjon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generell informasjon</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tittel:</Text>
            <Text style={styles.value}>{sja.tittel || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Arbeidssted:</Text>
            <Text style={styles.value}>{sja.arbeidssted || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Beskrivelse:</Text>
            <Text style={styles.value}>{sja.beskrivelse || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Startdato:</Text>
            <Text style={styles.value}>{sja.startDato ? formatDate(sja.startDato) : 'N/A'}</Text>
          </View>
          {sja.sluttDato && (
            <View style={styles.row}>
              <Text style={styles.label}>Sluttdato:</Text>
              <Text style={styles.value}>{formatDate(sja.sluttDato)}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{sja.status || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Opprettet av:</Text>
            <Text style={styles.value}>{sja.opprettetAv?.name || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Opprettet dato:</Text>
            <Text style={styles.value}>{sja.opprettetDato ? formatDate(sja.opprettetDato) : 'N/A'}</Text>
          </View>
        </View>

        {/* Produkter */}
        {produkter.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Produkter fra stoffkartotek</Text>
            {produkter.map((p: any, index: number) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{p.produkt.produktnavn}</Text>
                <Text style={styles.value}>Mengde: {p.mengde || '-'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Risikoer */}
        {risikoer.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Identifiserte risikoer</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCell}>Aktivitet</Text>
                <Text style={styles.tableCell}>Fare</Text>
                <Text style={styles.tableCell}>Sannsynlighet</Text>
                <Text style={styles.tableCell}>Alvorlighet</Text>
                <Text style={styles.tableCell}>Risikoverdi</Text>
              </View>
              {risikoer.map((risiko: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{risiko.aktivitet}</Text>
                  <Text style={styles.tableCell}>{risiko.fare}</Text>
                  <Text style={styles.tableCell}>{risiko.sannsynlighet}</Text>
                  <Text style={styles.tableCell}>{risiko.alvorlighet}</Text>
                  <Text style={styles.tableCell}>{risiko.risikoVerdi}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tiltak */}
        {tiltak.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiltak for å redusere risiko</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCell}>Beskrivelse</Text>
                <Text style={styles.tableCell}>Ansvarlig</Text>
                <Text style={styles.tableCell}>Status</Text>
                <Text style={styles.tableCell}>Frist</Text>
              </View>
              {tiltak.map((t: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{t.beskrivelse}</Text>
                  <Text style={styles.tableCell}>{t.ansvarlig}</Text>
                  <Text style={styles.tableCell}>{t.status}</Text>
                  <Text style={styles.tableCell}>{t.frist ? formatDate(t.frist) : '-'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Godkjenninger */}
        {godkjenninger.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Godkjenninger</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCell}>Godkjent av</Text>
                <Text style={styles.tableCell}>Status</Text>
                <Text style={styles.tableCell}>Dato</Text>
              </View>
              {godkjenninger.map((g: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{g.godkjentAv.name}</Text>
                  <Text style={styles.tableCell}>{g.status}</Text>
                  <Text style={styles.tableCell}>{formatDate(g.opprettetDato)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer med sidenummerering */}
        <Text 
          style={styles.footer}
          render={({ pageNumber, totalPages }) => (
            `Generert ${formatDate(new Date())} • Side ${pageNumber} av ${totalPages}`
          )}
          fixed
        />
      </Page>
    </Document>
  )
} 