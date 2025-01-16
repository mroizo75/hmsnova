"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { nb } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-full p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "mt-4 items-center",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium mx-auto text-center",
        nav: "flex absolute top-2 left-0 right-0 justify-between items-center w-full",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        table: "w-full border-collapse mt-4",
        head_row: "text-center text-muted-foreground",
        head_cell: cn(
          "text-muted-foreground text-[0.8rem] font-medium pb-2"
        ),
        row: "text-center",
        cell: "p-0",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal text-sm inline-flex items-center justify-center"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      formatters={{
        formatCaption: (date, options) => {
          return (
            <div className="text-sm font-medium">
              {date.toLocaleString(options?.locale || 'nb', { 
                month: 'long',
                year: 'numeric'
              }).replace(/^\w/, c => c.toUpperCase())}
            </div>
          )
        },
        formatWeekdayName: (date) => {
          return date.toLocaleString('nb', { weekday: 'short' }).slice(0, 2)
        }
      }}
      locale={nb}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
