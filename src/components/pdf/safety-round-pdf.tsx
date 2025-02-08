import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { SafetyRound } from "@/types/safety-rounds"

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: "#000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableCell: {
    padding: 5,
    fontSize: 12,
  },
  findings: {
    marginTop: 20,
  },
  finding: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  }
})

interface SafetyRoundPDFProps {
  data: SafetyRound
}

export function SafetyRoundPDF({ data }: SafetyRoundPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.subtitle}>Bedrift: {data.company.name}</Text>
          <Text style={styles.subtitle}>Status: {data.status}</Text>
          <Text style={styles.subtitle}>
            Dato: {data.createdAt.toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sjekkpunkter</Text>
          <View style={styles.table}>
            {data.checklistItems.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCell, { flex: 2 }]}>
                  <Text>{item.question}</Text>
                </View>
                <View style={[styles.tableCell, { flex: 1 }]}>
                  <Text>{item.response || "Ikke besvart"}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.findings}>
          <Text style={styles.sectionTitle}>Funn og tiltak</Text>
          {data.findings.map((finding, index) => (
            <View key={index} style={styles.finding}>
              <Text style={{ fontWeight: "bold" }}>
                Funn {index + 1}: {finding.description}
              </Text>
              <Text>Alvorlighetsgrad: {finding.severity}</Text>
              <Text>Status: {finding.status}</Text>
              
              {finding.measures.length > 0 && (
                <View style={{ marginTop: 5 }}>
                  <Text style={{ fontWeight: "bold" }}>Tiltak:</Text>
                  {finding.measures.map((measure, mIndex) => (
                    <View key={mIndex} style={{ marginLeft: 10 }}>
                      <Text>- {measure.description}</Text>
                      <Text style={{ fontSize: 10 }}>
                        Status: {measure.status}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
} 