export async function suggestHMSSections(riskAssessment: RiskAssessment) {
  // Analyser risikovurderingen og finn relevante HMS-seksjoner
  // Dette kan baseres på:
  // - Aktivitetstype
  // - Identifiserte farer
  // - Risikonivå
  // - Avdeling/område
  
  const suggestions = await prisma.hMSSection.findMany({
    where: {
      OR: [
        { title: { contains: riskAssessment.activity } },
        { content: { path: "$.keywords", array_contains: riskAssessment.department } }
      ]
    }
  })
  
  return suggestions
} 