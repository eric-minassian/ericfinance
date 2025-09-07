import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateString } from "@/lib/date";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: DateString | undefined;
  onChange: (date: DateString | undefined) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal w-full",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {value ? value.toMDYString() : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          defaultMonth={value ? new Date(value.toMDYString()) : undefined}
          mode="single"
          selected={value ? new Date(value.toMDYString()) : undefined}
          onSelect={(date: Date | undefined) => {
            onChange(
              date ? DateString.fromString(date.toISOString()) : undefined
            );
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
