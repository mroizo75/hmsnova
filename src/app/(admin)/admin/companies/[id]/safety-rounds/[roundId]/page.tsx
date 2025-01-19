import SafetyRoundDetails from "./safety-round-details"

interface Props {
  params: Promise<{
    id: string
    roundId: string
  }>
}

export default async function SafetyRoundPage({ params }: Props) {
  const resolvedParams = await params
  
  return <SafetyRoundDetails params={resolvedParams} />
} 