"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { Section } from "@/components/ui/Section";
import { disciplines } from "@/lib/content/institute";
import { schools as copy } from "@/lib/content/stub-copy";
import { cn } from "@/lib/utils/cn";

const TOTAL = disciplines.length;

/** Second rail: reversed order so the pair never looks duplicated. */
const reverseDisciplines = [...disciplines].reverse();

type PlateProps = {
  discipline: (typeof disciplines)[number];
  selected: boolean;
  onSelect: (id: string) => void;
  tabIndex: number;
  /** Hidden duplicate set for seamless loop — not in tab order / a11y tree. */
  inert?: boolean;
};

function DisciplinePlate({
  discipline: d,
  selected,
  onSelect,
  tabIndex,
  inert = false,
}: PlateProps) {
  return (
    <button
      type="button"
      className={cn("schools-plate", selected && "is-selected")}
      onClick={() => onSelect(d.id)}
      aria-pressed={selected}
      aria-label={`${d.number}. ${d.name}`}
      tabIndex={inert ? -1 : tabIndex}
      {...(inert ? { "aria-hidden": true } : {})}
    >
      <span className="schools-plate__num" aria-hidden="true">
        {d.number}
      </span>
      <span className="schools-plate__name">{d.shortName}</span>
      <span className="schools-plate__rule" aria-hidden="true" />
      <span className="schools-plate__tools">
        {d.tools.map((t) => t.toUpperCase()).join(" · ")}
      </span>
    </button>
  );
}

type RailProps = {
  items: typeof disciplines;
  direction: "fwd" | "rev";
  activeId: string;
  onSelect: (id: string) => void;
  labelId: string;
};

function DisciplineRail({
  items,
  direction,
  activeId,
  onSelect,
  labelId,
}: RailProps) {
  /** Reverse rail is a visual counter-scroll only — not in the a11y tree. */
  const decorative = direction === "rev";

  return (
    <div
      className={cn(
        "schools-rail",
        direction === "fwd" ? "schools-rail--fwd" : "schools-rail--rev",
      )}
      role={decorative ? undefined : "group"}
      aria-labelledby={decorative ? undefined : labelId}
      aria-hidden={decorative || undefined}
    >
      <div className="schools-rail__viewport">
        <div className="schools-rail__track">
          <div className="schools-rail__set">
            {items.map((d) => (
              <DisciplinePlate
                key={`${direction}-a-${d.id}`}
                discipline={d}
                selected={d.id === activeId}
                onSelect={onSelect}
                tabIndex={decorative ? -1 : 0}
                inert={decorative}
              />
            ))}
          </div>
          <div className="schools-rail__set" aria-hidden="true">
            {items.map((d) => (
              <DisciplinePlate
                key={`${direction}-b-${d.id}`}
                discipline={d}
                selected={d.id === activeId}
                onSelect={onSelect}
                tabIndex={-1}
                inert
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SchoolsExplorer() {
  const baseId = useId();
  const railsLabelId = `${baseId}-rails-label`;
  const panelId = `${baseId}-panel`;
  const [activeId, setActiveId] = useState(disciplines[0]?.id ?? "cad");

  const active = useMemo(
    () => disciplines.find((d) => d.id === activeId) ?? disciplines[0],
    [activeId],
  );

  const activeIndex = useMemo(
    () => Math.max(0, disciplines.findIndex((d) => d.id === active.id)),
    [active.id],
  );

  const selectById = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const onStaticKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const ids = disciplines.map((d) => d.id);
      const i = ids.indexOf(activeId);
      if (i < 0) return;

      let next = i;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        next = (i + 1) % ids.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        next = (i - 1 + ids.length) % ids.length;
      } else if (event.key === "Home") {
        event.preventDefault();
        next = 0;
      } else if (event.key === "End") {
        event.preventDefault();
        next = ids.length - 1;
      } else {
        return;
      }

      setActiveId(ids[next]!);
      const btn = event.currentTarget.querySelector<HTMLButtonElement>(
        `[data-school-id="${ids[next]}"]`,
      );
      btn?.focus();
    },
    [activeId],
  );

  if (!active) return null;

  return (
    <Section
      id="schools"
      eyebrow={copy.eyebrow}
      title={copy.title}
      lede={copy.lede}
      tone="surface"
      className="schools-explorer"
      headerClassName="schools-explorer__header"
    >
      <p id={railsLabelId} className="sr-only">
        Continuous index of CAITECH schools and disciplines. Select a school to
        view details.
      </p>

      {/* Dual continuous rails — desktop; single forward rail on small screens via CSS */}
      <div className="schools-rails" aria-live="off">
        <DisciplineRail
          items={disciplines}
          direction="fwd"
          activeId={active.id}
          onSelect={selectById}
          labelId={railsLabelId}
        />
        <DisciplineRail
          items={reverseDisciplines}
          direction="rev"
          activeId={active.id}
          onSelect={selectById}
          labelId={railsLabelId}
        />
      </div>

      {/* Reduced-motion / no-JS-friendly static index */}
      <div
        className="schools-static"
        role="listbox"
        aria-label="Schools and disciplines"
        aria-activedescendant={`${baseId}-static-${active.id}`}
        tabIndex={0}
        onKeyDown={onStaticKeyDown}
      >
        {disciplines.map((d) => {
          const selected = d.id === active.id;
          return (
            <button
              key={d.id}
              id={`${baseId}-static-${d.id}`}
              type="button"
              role="option"
              data-school-id={d.id}
              aria-selected={selected}
              className={cn("schools-static__item", selected && "is-selected")}
              onClick={() => selectById(d.id)}
            >
              <span className="schools-static__num" aria-hidden="true">
                {d.number}
              </span>
              <span className="schools-static__name">{d.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Active discipline panel */}
      <div
        className="schools-active"
        id={panelId}
        role="region"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Selected school: ${active.name}`}
      >
        <div className="schools-active__visual">
          <div className="schools-active__frame">
            <div className="schools-active__chrome">
              <span>CAITECH / LEARNING AREAS</span>
              <span>
                {active.number} / {String(TOTAL).padStart(2, "0")}
              </span>
            </div>
            <div className="schools-active__media">
              <Image
                key={active.id}
                src={active.image}
                alt={active.imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 56vw"
                className="schools-active__img"
                priority={activeIndex === 0}
              />
            </div>
            <div className="schools-active__corners" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>

        <div className="schools-active__body">
          <p className="schools-active__index">
            <span className="schools-active__index-num">{active.number}</span>
            <span className="schools-active__index-sep" aria-hidden="true">
              /
            </span>
            <span className="schools-active__index-total">
              {String(TOTAL).padStart(2, "0")}
            </span>
          </p>

          <h3 className="schools-active__title">{active.name}</h3>

          <p className="schools-active__summary">{active.summary}</p>

          <p className="schools-active__tools">
            {active.tools.map((t) => t.toUpperCase()).join(" · ")}
          </p>

          <Link
            href={`/courses?school=${encodeURIComponent(active.id)}`}
            className="schools-active__cta group inline-flex items-center gap-2"
          >
            <span>{copy.exploreCta}</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </Section>
  );
}
