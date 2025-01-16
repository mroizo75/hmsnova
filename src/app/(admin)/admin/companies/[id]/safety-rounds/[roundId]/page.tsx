import { SafetyRoundDetails } from "./safety-round-details"

interface Props {
  params: Promise<{
    id: string
    roundId: string
  }>
}

export default async function SafetyRoundPage({ params }: Props) {
  // Await params siden det er en Promise i Next.js 15
  const resolvedParams = await params
  
  console.log('Page component params:', resolvedParams)
  
  return <SafetyRoundDetails params={resolvedParams} />
} 