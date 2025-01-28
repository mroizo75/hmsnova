import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
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
  }
})

interface Props {
  data: {
    deviations: any[]
    risks: any[]
    startDate: Date
    endDate: Date
  }
}

export const CustomReportDocument = ({ data }: Props) => (
  <Document
    title="HMS Rapport"
    author="Innutio"
    creator="Innutio HMS-system"
    producer="Innutio"
  >
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>HMS Rapport</Text>
      <Text style={styles.sectionTitle}>
        {new Date(data.startDate).toLocaleDateString('nb-NO')} - {new Date(data.endDate).toLocaleDateString('nb-NO')}
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avvik</Text>
        {data.deviations.map((deviation, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{deviation.title}</Text>
            <Text style={styles.value}>{deviation.status}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Risikovurderinger</Text>
        {data.risks.map((risk, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{risk.title}</Text>
            <Text style={styles.value}>{risk.status}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
) 