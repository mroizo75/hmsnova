export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const changes = await prisma.hMSChange.findMany({
      where: {
        deviations: {
          some: {
            deviationId: params.id
          }
        }
      }
    })

    return NextResponse.json(changes)
  } catch (error) {
    return NextResponse.json(
      { error: "Kunne ikke hente HMS-endringer" },
      { status: 500 }
    )
  }
} 