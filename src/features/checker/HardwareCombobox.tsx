"use client";

import { useId, useMemo, useState } from "react";
import { searchHardware } from "@/lib/hardware-matcher";
import type { CPU, Dictionary, GPU } from "@/lib/types";

interface HardwareComboboxProps<T extends CPU | GPU> {
  id: string;
  label: string;
  placeholder: string;
  items: T[];
  value: string | null;
  onChange: (id: string | null) => void;
  dictionary: Dictionary;
}

export function HardwareCombobox<T extends CPU | GPU>({
  id,
  label,
  placeholder,
  items,
  value,
  onChange,
  dictionary,
}: HardwareComboboxProps<T>) {
  const listId = useId();
  const selected = items.find((item) => item.id === value) ?? null;
  const [draft, setDraft] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const query = draft ?? selected?.name ?? "";
  const results = useMemo(() => searchHardware(items, query).slice(0, 14), [items, query]);

  const select = (item: T | null) => {
    onChange(item?.id ?? null);
    setDraft(null);
    setOpen(false);
    setActiveIndex(0);
  };

  return (
    <div className="relative" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <label htmlFor={id} className="field-label">{label}</label>
      <input
        id={id}
        type="text"
        role="combobox"
        dir="ltr"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
        className="field"
        onChange={(event) => {
          setDraft(event.target.value);
          setOpen(true);
          setActiveIndex(0);
          if (selected && event.target.value !== selected.name) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
          } else if (event.key === "Enter" && open) {
            event.preventDefault();
            select(results[activeIndex] ?? null);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && (
        <ul id={listId} role="listbox" aria-label={label} className="absolute inset-x-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-xl border border-border bg-[#181824] p-1 shadow-2xl">
          {results.map((item, index) => {
            const deviceLabel = item.deviceType === "laptop" ? dictionary.checker.laptop : item.deviceType === "integrated" ? dictionary.checker.integrated : dictionary.checker.desktop;
            const detail = "vramGB" in item && item.vramGB !== null ? `${deviceLabel} · ${item.vramGB} GB` : deviceLabel;
            return (
              <li
                key={item.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={item.id === value}
                className={`min-h-11 cursor-pointer rounded-lg px-3 py-2 ${index === activeIndex ? "bg-secondary/20" : "hover:bg-white/5"}`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(item)}
              >
                <span className="block text-sm font-bold" dir="ltr">{item.name}</span>
                <span className="block text-xs text-muted">{detail}</span>
              </li>
            );
          })}
          {results.length === 0 && <li className="p-3 text-sm text-warning">{dictionary.checker.noMatch}</li>}
          <li
            id={`${listId}-unknown`}
            role="option"
            aria-selected={value === null}
            className="mt-1 min-h-11 cursor-pointer rounded-lg border-t border-border px-3 py-2 text-sm font-bold text-muted hover:bg-white/5"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => select(null)}
          >
            {dictionary.checker.chooseUnknown}
          </li>
        </ul>
      )}
    </div>
  );
}
