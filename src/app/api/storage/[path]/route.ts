import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import { getSignedUrl, deleteFromStorage } from "@/lib/storage"

export async function GET(
  request: Request,
  { params }: { params: { path: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const url = await getSignedUrl(params.path)
    return NextResponse.json({ url })
  } catch (error) {
    return NextResponse.json(
      { error: "Kunne ikke hente bilde" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { path: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    await deleteFromStorage(params.path)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Kunne ikke slette bilde" },
      { status: 500 }
    )
  }
} 