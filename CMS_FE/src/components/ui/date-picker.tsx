"use client";

import { useState } from "react";
import { CalendarDays, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function parseDateOnly(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}

function toDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayDate(value: string) {
  const date = parseDateOnly(value);
  if (!date) return value.trim() && value !== "—" ? value : "Select date";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

type DatePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Select date",
  disabled,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseDateOnly(value);
  const today = new Date();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-start rounded-lg border-emerald-950/15 bg-white px-3 text-left font-normal text-foreground shadow-sm hover:border-primary/40 hover:bg-primary-soft/30 focus-visible:border-primary focus-visible:ring-primary/25 dark:border-emerald-100/15 dark:bg-[#17211b] dark:hover:bg-primary/10",
            !selected && (!value || value === "—") && "text-muted-foreground",
            className,
          )}
        >
          <CalendarDays className="mr-2 size-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate">
            {value ? displayDate(value) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto overflow-hidden rounded-2xl border-primary/20 bg-card p-0 shadow-xl"
      >
        <div className="border-b border-primary/10 bg-gradient-to-r from-primary to-primary-deep px-4 py-3 text-primary-foreground">
          <p className="text-xs font-bold uppercase tracking-wide">Choose date</p>
          <p className="mt-0.5 text-[11px] text-primary-foreground/75">
            {selected ? displayDate(value) : placeholder}
          </p>
        </div>
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? today}
          onSelect={(date) => {
            if (date) {
              onChange(toDateOnly(date));
              setOpen(false);
            }
          }}
          captionLayout="dropdown"
          startMonth={new Date(1950, 0)}
          endMonth={new Date(today.getFullYear() + 10, 11)}
          className="bg-card p-3 text-card-foreground"
          classNames={{
            dropdown_root:
              "relative rounded-lg border border-primary/20 bg-primary-soft/30 shadow-none has-focus:border-primary has-focus:ring-primary/20 has-focus:ring-2",
            caption_label:
              "flex h-8 select-none items-center gap-1 rounded-md pl-2 pr-1 text-sm font-bold text-primary-deep dark:text-primary-foreground [&>svg]:size-3.5 [&>svg]:text-primary",
            button_previous:
              "flex h-(--cell-size) w-(--cell-size) select-none items-center justify-center rounded-md border border-primary/15 bg-primary-soft/40 p-0 text-primary-deep transition-colors hover:bg-primary hover:text-primary-foreground aria-disabled:opacity-50",
            button_next:
              "flex h-(--cell-size) w-(--cell-size) select-none items-center justify-center rounded-md border border-primary/15 bg-primary-soft/40 p-0 text-primary-deep transition-colors hover:bg-primary hover:text-primary-foreground aria-disabled:opacity-50",
            weekday:
              "flex-1 select-none rounded-md text-[0.8rem] font-semibold text-primary-deep/70 dark:text-primary-foreground/70",
            today:
              "rounded-md border border-primary/40 bg-primary-soft text-primary-deep data-[selected=true]:border-transparent",
          }}
          initialFocus
        />
        <div className="flex items-center justify-between border-t border-primary/10 bg-primary-soft/20 px-3 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            disabled={!value}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            <X className="size-3.5" />
            Clear
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full text-xs font-semibold text-primary-deep hover:bg-primary-soft"
            onClick={() => {
              onChange(toDateOnly(today));
              setOpen(false);
            }}
          >
            Today
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
