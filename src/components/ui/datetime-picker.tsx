"use client"

import * as React from "react"
import { format, isValid } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DateTimePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  displayFormat?: string
}

export function DateTimePicker({
  date,
  setDate,
  disabled = false,
  placeholder = "Pick a date and time",
  className,
  displayFormat = "MM/dd/yyyy hh:mm aa",
}: DateTimePickerProps) {
  const [selectedDateTime, setSelectedDateTime] = React.useState<Date | undefined>(date)
  const [isOpen, setIsOpen] = React.useState(false)

  const formatTime = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setSelectedDateTime(undefined)
      setDate(undefined)
      return
    }

    let updatedDateTime: Date
    
    if (selectedDateTime) {
      // Preserve existing time
      updatedDateTime = new Date(newDate)
      updatedDateTime.setHours(selectedDateTime.getHours(), selectedDateTime.getMinutes(), 0, 0)
    } else {
      // Default to current time or noon
      updatedDateTime = new Date(newDate)
      const now = new Date()
      updatedDateTime.setHours(now.getHours(), now.getMinutes(), 0, 0)
    }
    
    setSelectedDateTime(updatedDateTime)
    setDate(updatedDateTime)
  }

  const handleTimeChange = (hours: number, minutes: number, ampm: "AM" | "PM") => {
    let adjustedHours = hours
    if (ampm === "PM" && hours !== 12) adjustedHours += 12
    if (ampm === "AM" && hours === 12) adjustedHours = 0

    const newDate = selectedDateTime ? new Date(selectedDateTime) : new Date()
    newDate.setHours(adjustedHours, minutes, 0, 0)
    
    setSelectedDateTime(newDate)
    setDate(newDate)
  }

  const generateTimeOptions = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1)
    const minutes = [0, 15, 30, 45]
    const periods = ["AM", "PM"]
    
    return { hours, minutes, periods }
  }

  React.useEffect(() => {
    if (date && isValid(date)) {
      setSelectedDateTime(date)
    }
  }, [date])

  const { hours, minutes, periods } = generateTimeOptions()

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDateTime && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDateTime && isValid(selectedDateTime) ? (
            format(selectedDateTime, displayFormat)
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <Calendar
            mode="single"
            selected={selectedDateTime}
            onSelect={handleDateSelect}
            initialFocus
            className="rounded-l-md border-r"
          />
          <div className="flex flex-col divide-y">
            <div className="p-3">
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>Hour</div>
                <div>Minute</div>
                <div>Period</div>
              </div>
            </div>
            <div className="flex">
              {/* Hours */}
              <ScrollArea className="h-48 w-16">
                <div className="p-1">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      className={cn(
                        "w-full px-2 py-1 text-sm rounded hover:bg-accent",
                        selectedDateTime &&
                          (selectedDateTime.getHours() % 12 || 12) === hour &&
                          "bg-accent font-medium"
                      )}
                      onClick={() => {
                        const currentMinutes = selectedDateTime?.getMinutes() || 0
                        const currentPeriod = selectedDateTime && selectedDateTime.getHours() >= 12 ? "PM" : "AM"
                        handleTimeChange(hour, currentMinutes, currentPeriod)
                      }}
                    >
                      {hour.toString().padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Minutes */}
              <ScrollArea className="h-48 w-16 border-x">
                <div className="p-1">
                  {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                    <button
                      key={minute}
                      className={cn(
                        "w-full px-2 py-1 text-sm rounded hover:bg-accent",
                        selectedDateTime &&
                          selectedDateTime.getMinutes() === minute &&
                          "bg-accent font-medium"
                      )}
                      onClick={() => {
                        const currentHour = selectedDateTime ? (selectedDateTime.getHours() % 12 || 12) : 12
                        const currentPeriod = selectedDateTime && selectedDateTime.getHours() >= 12 ? "PM" : "AM"
                        handleTimeChange(currentHour, minute, currentPeriod)
                      }}
                    >
                      {minute.toString().padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </ScrollArea>

              {/* AM/PM */}
              <ScrollArea className="h-48 w-16">
                <div className="p-1">
                  {periods.map((period) => (
                    <button
                      key={period}
                      className={cn(
                        "w-full px-2 py-1 text-sm rounded hover:bg-accent",
                        selectedDateTime &&
                          ((selectedDateTime.getHours() >= 12 ? "PM" : "AM") === period) &&
                          "bg-accent font-medium"
                      )}
                      onClick={() => {
                        const currentHour = selectedDateTime ? (selectedDateTime.getHours() % 12 || 12) : 12
                        const currentMinutes = selectedDateTime?.getMinutes() || 0
                        handleTimeChange(currentHour, currentMinutes, period as "AM" | "PM")
                      }}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            {selectedDateTime && (
              <div className="p-3 text-center">
                <div className="text-sm font-medium">
                  {format(selectedDateTime, "EEEE, MMMM do")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(selectedDateTime)}
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}