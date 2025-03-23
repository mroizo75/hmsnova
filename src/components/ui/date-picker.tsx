"use client"

import * as React from "react"
import { format, Locale } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { nb } from "date-fns/locale"

interface DatePickerProps {
  date?: Date
  onSelect: (date: Date | undefined) => void
  disabled?: boolean
  placeholder?: string
  disabledDates?: (date: Date) => boolean
  locale?: Locale
  className?: string
}

export function DatePicker({ 
  date, 
  onSelect, 
  disabled = false,
  placeholder = "Velg dato",
  disabledDates,
  locale = nb,
  className
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          disabled={disabledDates}
          initialFocus
          locale={locale}
        />
      </PopoverContent>
    </Popover>
  )
} 