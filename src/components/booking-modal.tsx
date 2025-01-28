"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Clock } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DatePicker, { registerLocale } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const formSchema = z.object({
  name: z.string().min(2, "Navn må være minst 2 tegn"),
  email: z.string().email("Ugyldig e-postadresse"),
  company: z.string().min(2, "Bedriftsnavn må være minst 2 tegn"),
  phone: z.string().min(8, "Telefonnummer må være minst 8 siffer"),
  date: z.date({
    required_error: "Vennligst velg en dato",
  }),
  time: z.string({
    required_error: "Vennligst velg et tidspunkt",
  }),
  meetingType: z.enum(["online", "physical"], {
    required_error: "Vennligst velg møtetype",
  }),
  participants: z.string().min(1, "Vennligst velg antall deltakere"),
})

interface BookingModalProps {
  children: React.ReactNode
}

// Registrer norsk lokalisering
registerLocale('nb', nb)

export function BookingModal({ children }: BookingModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      meetingType: "online",
      participants: "1",
    },
  })

  // Hent tilgjengelige tider når dato velges
  const fetchAvailableTimes = async (date: Date) => {
    try {
      const response = await fetch(`/api/booking/available-times?date=${format(date, 'yyyy-MM-dd')}`)
      const data = await response.json()
      setAvailableTimes(data.availableTimes)
    } catch (error) {
      console.error("Kunne ikke hente tilgjengelige tider:", error)
      toast.error("Kunne ikke hente tilgjengelige tider")
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          date: format(values.date, "yyyy-MM-dd"),
        }),
      })

      if (!response.ok) throw new Error("Kunne ikke booke møte")
      
      toast.success("Møteforespørsel sendt! Vi sender deg en bekreftelse på e-post.")
      setOpen(false)
      form.reset()
    } catch (error) {
      toast.error("Kunne ikke booke møte. Prøv igjen senere.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[#2C435F]">Book et møte</DialogTitle>
          <DialogDescription>
            Velg ønsket dato og tidspunkt for møtet
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Navn</FormLabel>
                    <FormControl>
                      <Input placeholder="Ditt navn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-post</FormLabel>
                    <FormControl>
                      <Input placeholder="din@epost.no" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrift</FormLabel>
                    <FormControl>
                      <Input placeholder="Din bedrift" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="Ditt telefonnummer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="meetingType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Møtetype</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="online" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Online møte
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="physical" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Fysisk møte
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem >
                  <FormLabel className="mx-3">Dato</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => {
                        field.onChange(date)
                        if (date) fetchAvailableTimes(date)
                      }}
                      dateFormat="dd.MM.yyyy"
                      locale="nb"
                      minDate={new Date()}
                      placeholderText="Velg dato"
                      calendarClassName="bg-white dark:bg-gray-800 border border-input border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
                      filterDate={(date) => {
                        const day = date.getDay()
                        return day !== 0 && day !== 6 // Ekskluder helger
                      }}
                      showPopperArrow={false}
                      customInput={
                        <div className="flex items-center">
                          <input
                            type="text"
                            className="flex h-10 w-full rounded-md bg-background px-3 py-2 text-sm border-input border ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={field.value ? format(field.value, 'dd.MM.yyyy') : ''}
                            readOnly
                            placeholder="Velg dato"
                          />
                          <CalendarIcon className="ml-2 h-4 w-4 text-gray-500" />
                        </div>
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tidspunkt</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg tidspunkt" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTimes.length > 0 ? (
                        availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                          Ingen ledige tider denne dagen
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Antall deltakere</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg antall" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'person' : 'personer'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-[#2C435F] hover:bg-[#3F546E] text-white"
              >
                {loading ? "Sender..." : "Book møte"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 