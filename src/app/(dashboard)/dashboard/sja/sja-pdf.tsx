import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  pdf
} from '@react-pdf/renderer'
import { SJAWithRelations } from './types'
import { formatDate } from '@/lib/utils/date'

// Registrer fonter
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2',
      fontWeight: 700,
    }
  ]
})

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Inter',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
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
    fontFamily: 'InterBold',
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

interface SJAPDFProps {
  sja: SJAWithRelations
}

export const SJAPDFDocument = ({ sja }: SJAPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Sikker Jobb Analyse (SJA)</Text>
        <Text style={styles.subtitle}>#{sja.id}</Text>
      </View>

      {/* Generell informasjon */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generell informasjon</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tittel:</Text>
          <Text style={styles.value}>{sja.tittel}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Arbeidssted:</Text>
          <Text style={styles.value}>{sja.arbeidssted}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Startdato:</Text>
          <Text style={styles.value}>{formatDate(sja.startDato)}</Text>
        </View>
        {sja.sluttDato && (
          <View style={styles.row}>
            <Text style={styles.label}>Sluttdato:</Text>
            <Text style={styles.value}>{formatDate(sja.sluttDato)}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={{
            ...styles.statusBadge,
            backgroundColor: sja.status === 'GODKJENT' ? '#dcfce7' : 
                           sja.status === 'AVVIST' ? '#fee2e2' : '#f3f4f6',
            color: sja.status === 'GODKJENT' ? '#166534' :
                   sja.status === 'AVVIST' ? '#991b1b' : '#374151',
          }}>
            {sja.status}
          </Text>
        </View>
      </View>

      {/* Beskrivelse */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Beskrivelse</Text>
        <Text>{sja.beskrivelse}</Text>
      </View>

      {/* Produkter */}
      {sja.produkter.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produkter</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Produkt</Text>
              <Text style={styles.tableCell}>Mengde</Text>
            </View>
            {sja.produkter.map((produkt, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{produkt.produkt.navn}</Text>
                <Text style={styles.tableCell}>{produkt.mengde || '-'}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Godkjenninger */}
      {sja.godkjenninger.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Godkjenninger</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Godkjent av</Text>
              <Text style={styles.tableCell}>Status</Text>
              <Text style={styles.tableCell}>Dato</Text>
            </View>
            {sja.godkjenninger.map((godkjenning, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{godkjenning.godkjentAv.name}</Text>
                <Text style={styles.tableCell}>{godkjenning.status}</Text>
                <Text style={styles.tableCell}>{formatDate(godkjenning.opprettetDato)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer}>
        Generert {formatDate(new Date())} • Side 1
      </Text>
    </Page>
  </Document>
) 