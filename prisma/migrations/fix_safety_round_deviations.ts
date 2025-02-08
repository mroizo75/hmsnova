// Kjør dette som et script eller via Prisma Studio
await prisma.deviation.updateMany({
  where: {
    category: "VERNERUNDE",
    source: null
  },
  data: {
    source: "SAFETY_ROUND"
  }
}) 