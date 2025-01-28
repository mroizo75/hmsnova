import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Combobox } from "@/components/ui/combobox"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import Image from "next/image"

interface SJAFormProps {
  onSubmit: (data: any) => void
  isSubmitting: boolean
  onCancel: () => void
  produkter: Array<{ id: string; produktnavn: string }>
  valgteProdukter: Array<{ produktId: string; mengde: string }>
  setValgteProdukter: (produkter: Array<{ produktId: string; mengde: string }>) => void
  bilder: File[]
  setBilder: (bilder: File[]) => void
  getRootProps: any
  getInputProps: any
  isDragActive: boolean
}

const formSchema = z.object({
  tittel: z.string().min(1, "Tittel er påkrevd"),
  arbeidssted: z.string().min(1, "Arbeidssted er påkrevd"),
  beskrivelse: z.string().min(1, "Beskrivelse er påkrevd"),
  startDato: z.string().min(1, "Startdato er påkrevd"),
  sluttDato: z.string().optional(),
  deltakere: z.string().min(1, "Deltakere er påkrevd"),
  identifiedRisks: z.string().min(1, "Identifiserte risikoer er påkrevd"),
  riskMitigation: z.string().min(1, "Tiltak er påkrevd"),
  responsiblePerson: z.string().min(1, "Ansvarlig person er påkrevd"),
  comments: z.string().optional(),
  produkter: z.array(z.object({
    produktId: z.string(),
    mengde: z.string().optional()
  })).default([])
})

export function SJAForm({ 
  onSubmit, 
  isSubmitting, 
  onCancel,
  produkter,
  valgteProdukter,
  setValgteProdukter,
  bilder,
  setBilder,
  getRootProps,
  getInputProps,
  isDragActive
}: SJAFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tittel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tittel</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="arbeidssted"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Arbeidssted</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="beskrivelse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beskrivelse</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDato"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Startdato</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sluttDato"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sluttdato</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="deltakere"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deltakere</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="identifiedRisks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifiserte risikoer</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Skriv hver risiko på ny linje" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="riskMitigation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiltak</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Skriv hvert tiltak på ny linje" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responsiblePerson"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ansvarlig person</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kommentarer</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Bilder</FormLabel>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer 
              ${isDragActive ? 'border-primary' : 'border-gray-300'}`}
          >
            <input {...getInputProps()} />
            <p>Dra og slipp bilder her, eller klikk for å velge</p>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {bilder.map((bilde, index) => (
              <div key={index} className="relative">
                <Image
                  src={URL.createObjectURL(bilde)}
                  alt={`Bilde ${index + 1}`}
                  width={100}
                  height={100}
                  className="rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2"
                  onClick={() => setBilder(bilder.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <FormLabel>Produkter fra stoffkartotek</FormLabel>
          <div className="flex gap-2">
            <Combobox
              options={produkter.map(p => ({
                id: p.id,
                label: p.produktnavn
              }))}
              placeholder="Velg produkt"
              onSelect={(value) => {
                if (value && !valgteProdukter.find(p => p.produktId === value)) {
                  setValgteProdukter([...valgteProdukter, { produktId: value, mengde: '' }])
                }
              }}
            />
          </div>
          <div className="space-y-2">
            {valgteProdukter.map((produkt, index) => {
              const produktInfo = produkter.find(p => p.id === produkt.produktId)
              return (
                <div key={index} className="flex items-center gap-2">
                  <Badge>{produktInfo?.produktnavn}</Badge>
                  <Input
                    placeholder="Mengde"
                    value={produkt.mengde}
                    onChange={(e) => {
                      const nyeProdukter = [...valgteProdukter]
                      nyeProdukter[index].mengde = e.target.value
                      setValgteProdukter(nyeProdukter)
                    }}
                    className="w-24"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setValgteProdukter(valgteProdukter.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Avbryt
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Lagrer..." : "Lagre"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 