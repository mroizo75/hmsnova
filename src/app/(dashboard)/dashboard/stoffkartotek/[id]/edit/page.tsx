import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { EditProductForm } from "./edit-product-form"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const { id } = await params

  const product = await prisma.stoffkartotek.findUnique({
    where: {
      id: id
    },
    include: {
      fareSymboler: true
    }
  })

  if (!product) return notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Rediger produkt</h1>
      <EditProductForm product={product} />
    </div>
  )
} 