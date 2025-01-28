"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { Dispatch, SetStateAction } from "react"

interface DatePickerWithRangeProps {
  date: DateRange
  setDate: Dispatch<SetStateAction<DateRange>>
}

export function DatePickerWithRange({
  date,
  setDate,
}: DatePickerWithRangeProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal w-[300px]",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "d. MMM yyyy", { locale: nb })} -{" "}
                {format(date.to, "d. MMM yyyy", { locale: nb })}
              </>
            ) : (
              format(date.from, "d. MMM yyyy", { locale: nb })
            )
          ) : (
            <span>Velg dato</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
          locale={nb}
          required
        />
      </PopoverContent>
    </Popover>
  )
} 