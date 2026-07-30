"use client";

import { useMemo, useState } from "react";
import type { Pet, Vaccination } from "@/lib/types";
import { getReminderStatus } from "@/lib/reminders";
import { toISODate } from "@/lib/dates";
import { formatDate } from "@/lib/format";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface DueItem {
  vaccination: Vaccination;
  color: string;
  petName: string;
}

interface CalendarProps {
  pets: Pet[];
  vaccinations: Vaccination[];
}

export function Calendar({ pets, vaccinations }: CalendarProps) {
  const petsById = useMemo(
    () => new Map(pets.map((pet) => [pet.id, pet])),
    [pets],
  );

  const byDate = useMemo(() => {
    const map = new Map<string, DueItem[]>();
    for (const vaccination of vaccinations) {
      const due = getReminderStatus(vaccination).dueDate;
      if (!due) continue;
      const pet = petsById.get(vaccination.petId);
      const list = map.get(due) ?? [];
      list.push({
        vaccination,
        color: pet?.color ?? "#64748b",
        petName: pet?.name ?? "",
      });
      map.set(due, list);
    }
    return map;
  }, [vaccinations, petsById]);

  const today = new Date();
  const todayISO = toISODate(today);
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selected, setSelected] = useState<string | null>(null);

  function shiftMonth(delta: number) {
    setView((prev) => {
      const total = prev.year * 12 + prev.month + delta;
      return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
    });
    setSelected(null);
  }

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  const cells: ({ day: number; iso: string; items: DueItem[] } | null)[] = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = `${view.year}-${String(view.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, iso, items: byDate.get(iso) ?? [] });
  }

  const selectedItems = selected ? (byDate.get(selected) ?? []) : [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
          className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          ‹
        </button>
        <p className="font-semibold text-slate-900 dark:text-slate-100">
          {MONTHS[view.month]} {view.year}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
          className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="py-1">
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          if (!cell) return <div key={`blank-${index}`} />;
          const isToday = cell.iso === todayISO;
          const isSelected = cell.iso === selected;
          const hasItems = cell.items.length > 0;
          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => setSelected(hasItems ? cell.iso : null)}
              className={`flex aspect-square flex-col items-center justify-start rounded-lg p-1 text-sm ${
                isSelected
                  ? "bg-emerald-100 dark:bg-emerald-950"
                  : hasItems
                    ? "hover:bg-slate-100 dark:hover:bg-slate-800"
                    : ""
              } ${isToday ? "font-bold text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-200"}`}
            >
              <span>{cell.day}</span>
              {hasItems && (
                <span className="mt-1 flex flex-wrap justify-center gap-0.5">
                  {cell.items.slice(0, 3).map((item, i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected && selectedItems.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            Due {formatDate(selected)}
          </p>
          <ul className="space-y-1">
            {selectedItems.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.vaccination.name}
                <span className="text-slate-400 dark:text-slate-500">· {item.petName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
