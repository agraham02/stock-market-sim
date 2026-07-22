"use client";

import { CalendarDays } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ExpirationDatePickerProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  expirations: string[];
}

export function ExpirationDatePicker({ value, onValueChange, expirations }: ExpirationDatePickerProps) {
  const [open, setOpen] = useState(false);
  const expirationSet = useMemo(() => new Set(expirations), [expirations]);

  const selectedDate = value ? parseISO(value) : undefined;
  const defaultMonth = selectedDate ?? (expirations[0] ? parseISO(expirations[0]) : undefined);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5">
            <CalendarDays className="size-3.5" />
            {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Select expiration"}
          </Button>
        }
      />
      <PopoverContent align="end">
        <Calendar
          mode="single"
          required
          selected={selectedDate}
          defaultMonth={defaultMonth}
          disabled={(date) => !expirationSet.has(format(date, "yyyy-MM-dd"))}
          modifiers={{ expiration: (date) => expirationSet.has(format(date, "yyyy-MM-dd")) }}
          modifiersClassNames={{
            expiration: "[&>button]:font-semibold [&>button]:underline [&>button]:decoration-primary/60",
          }}
          onSelect={(date) => {
            onValueChange(format(date, "yyyy-MM-dd"));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
