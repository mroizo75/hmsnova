import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Document as PDFDocument } from '@react-pdf/renderer'
import { InternalAuditData } from '@/app/(dashboard)/dashboard/reports/internal-audit-report'
import React from 'react'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#111827'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5
  },
  label: {
    width: '50%',
    color: '#4b5563'
  },
  value: {
    width: '50%',
    color: '#111827'
  },
  subTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#1f2937',
    fontWeight: 'bold'
  }
})

interface Props {
  data: InternalAuditData
}

export const AnnualReportDocument = ({ data }: { data: InternalAuditData }) => (
  <Document
    title="HMS Årsrapport"
    author="Innutio"
    creator="Innutio HMS-system"
    producer="Innutio"
  >
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>HMS Årsrapport {new Date().getFullYear()}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>HMS-håndbok</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Versjon:</Text>
          <Text style={styles.value}>{data.handbook.version}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Sist oppdatert:</Text>
          <Text style={styles.value}>
            {new Date(data.handbook.lastUpdated).toLocaleDateString('nb-NO')}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avvik og Hendelser</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Totalt antall:</Text>
          <Text style={styles.value}>{data.deviations.total}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Gjennomførte tiltak:</Text>
          <Text style={styles.value}>{data.deviations.implementedMeasures}</Text>
        </View>
        {data.deviations.bySeverity.length > 0 && (
          <>
            <Text style={styles.subTitle}>Fordeling etter alvorlighetsgrad:</Text>
            {data.deviations.bySeverity.map((item, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{item.severity}:</Text>
                <Text style={styles.value}>{item.count}</Text>
              </View>
            ))}
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Risikovurderinger</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Totalt gjennomført:</Text>
          <Text style={styles.value}>{data.riskAssessments.total}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fullførte:</Text>
          <Text style={styles.value}>{data.riskAssessments.completed}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Høyrisiko funn:</Text>
          <Text style={styles.value}>{data.riskAssessments.highRiskCount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Implementerte tiltak:</Text>
          <Text style={styles.value}>{data.riskAssessments.implementedMeasures}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vernerunder og HMS-aktiviteter</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Gjennomførte vernerunder:</Text>
          <Text style={styles.value}>{data.safetyRounds.total}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Registrerte funn:</Text>
          <Text style={styles.value}>{data.safetyRounds.findings}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Lukkede funn:</Text>
          <Text style={styles.value}>{data.safetyRounds.completedMeasures}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>HMS-opplæring og aktiviteter</Text>
        {data.activities.training.length > 0 && (
          <>
            <Text style={styles.subTitle}>Gjennomført opplæring:</Text>
            {data.activities.training.map((item, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{item.name}:</Text>
                <Text style={styles.value}>{item.participants} deltakere</Text>
              </View>
            ))}
          </>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Andre inspeksjoner:</Text>
          <Text style={styles.value}>{data.activities.inspections}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Måloppnåelse og fremtidige mål</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Oppnådde mål:</Text>
          <Text style={styles.value}>{data.goals.achieved} av {data.goals.total}</Text>
        </View>
        {data.goals.nextYearGoals.length > 0 && (
          <>
            <Text style={styles.subTitle}>Mål for neste år:</Text>
            {data.goals.nextYearGoals.map((goal, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.value}>{goal}</Text>
              </View>
            ))}
          </>
        )}
      </View>
    </Page>
  </Document>
)

AnnualReportDocument.displayName = 'AnnualReportDocument' 