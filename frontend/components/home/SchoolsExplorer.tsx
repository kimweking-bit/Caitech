"use client";

import Image from "next/image";
import { useState } from "react";
import { disciplines } from "@/lib/content/institute";
import { schools } from "@/lib/content/stub-copy";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils/cn";

/**
 * Editorial discipline explorer — one featured visual + numbered list.
 * Lightweight client state only for selection; no global store.
 */
export function SchoolsExplorer() {
  const [activeId, setActiveId] = useState(disciplines[0].id);
  const active = disciplines.find((d) => d.id === activeId) ?? disciplines[0];

  return (
    <Section
      eyebrow={schools.eyebrow}
      title={schools.title}
      lede={schools.lede}
      id="learning-areas"
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Featured panel */}
        <div className="lg:col-span-6">
          <div className="relative aspect-[4/3] overflow-hidden border border-line bg-petrol/5">
            <Image
              src={active.image}
              alt={active.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-opacity duration-300"
              key={active.id}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-petrol/70 via-petrol/10 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-lime">
                {active.number} / {active.shortName}
              </p>
              <h3 className="mt-2 font-display text-2xl text-ground md:text-3xl text-balance">
                {active.name}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ground/80">
                {active.summary}
              </p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-ground/65">
                {active.tools.join(" · ")}
              </p>
            </div>
          </div>
        </div>

        {/* Numbered list */}
        <div className="lg:col-span-6">
          <ul className="divide-y divide-line border border-line bg-surface" role="listbox" aria-label="Learning areas">
            {disciplines.map((d) => {
              const selected = d.id === activeId;
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => setActiveId(d.id)}
                    onMouseEnter={() => setActiveId(d.id)}
                    className={cn(
                      "flex w-full items-start gap-4 px-4 py-3.5 text-left transition-colors md:px-5",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-petrol",
                      selected ? "bg-ground" : "hover:bg-ground/70",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 font-mono text-[11px] tracking-[0.08em]",
                        selected ? "text-petrol" : "text-ink-muted",
                      )}
                    >
                      {d.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-sm font-medium leading-snug md:text-[0.95rem]",
                          selected ? "text-petrol" : "text-ink",
                        )}
                      >
                        {d.shortName}
                      </span>
                      {selected ? (
                        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                          {d.tools.slice(0, 4).join(" · ")}
                        </span>
                      ) : null}
                    </span>
                    {selected ? (
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Section>
  );
}
