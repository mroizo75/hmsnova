import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { EditProductForm } from "./edit-product-form"
import { Suspense } from "react"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EditProductPage(props: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const { id } = await props.params
  const searchParamsResolved = await props.searchParams

  const product = await prisma.stoffkartotek.findFirst({
    where: {
      id,
      company: {
        users: {
          some: {
            id: session.user.id
          }
        }
      }
    },
    include: {
      fareSymboler: true,
    }
  })

  if (!product) return notFound()

  return (
    <Suspense fallback={<div>Laster...</div>}>
      <EditProductForm product={product} />
    </Suspense>
  )
}

// Behold metadata hvis den finnes
export const metadata = {
  title: 'Rediger produkt',
  description: 'Rediger produktinformasjon'
} 