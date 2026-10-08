"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import type { Category } from "@/types/api";
import { cn } from "@/lib/utils/cn";

export function CatalogueControls({
  categories,
  activeCategory,
  activeSearch,
  activeOrdering,
}: {
  categories: Category[];
  activeCategory: string;
  activeSearch: string;
  activeOrdering: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const push = useCallback(
    (mutate: (sp: URLSearchParams) => void) => {
      const sp = new URLSearchParams(searchParams.toString());
      mutate(sp);
      sp.delete("page");
      const q = sp.toString();
      startTransition(() => {
        router.push(q ? `${pathname}?${q}` : pathname);
      });
    },
    [pathname, router, searchParams],
  );

  return (
    <div
      className={cn("flex flex-col gap-5", pending && "opacity-70")}
      aria-busy={pending}
    >
      <form
        role="search"
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const q = String(fd.get("q") || "").trim();
          push((sp) => {
            if (q) sp.set("search", q);
            else sp.delete("search");
          });
        }}
      >
        <label className="sr-only" htmlFor="course-search">
          Search programmes
        </label>
        <input
          id="course-search"
          name="q"
          type="search"
          defaultValue={activeSearch}
          placeholder="Search programmes"
          className="w-full max-w-md border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus-visible:border-petrol focus-visible:ring-2 focus-visible:ring-lime/40"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center border border-petrol bg-petrol px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ground hover:bg-petrol-deep"
        >
          Search
        </button>
      </form>

      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2" role="list" aria-label="Categories">
          <CategoryChip
            label="All"
            active={!activeCategory || activeCategory === "all"}
            onClick={() =>
              push((sp) => {
                sp.delete("category");
              })
            }
          />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              label={c.name}
              active={
                activeCategory === c.slug || activeCategory === String(c.id)
              }
              onClick={() =>
                push((sp) => {
                  sp.set("category", c.slug);
                })
              }
            />
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor="course-sort"
          className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted"
        >
          Sort
        </label>
        <select
          id="course-sort"
          className="border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-petrol"
          value={activeOrdering || "-created_at"}
          onChange={(e) =>
            push((sp) => {
              const v = e.target.value;
              if (!v || v === "-created_at") sp.delete("ordering");
              else sp.set("ordering", v);
            })
          }
        >
          <option value="-created_at">Newest</option>
          <option value="title">A–Z</option>
          <option value="-title">Z–A</option>
          <option value="price">Price · low–high</option>
          <option value="-price">Price · high–low</option>
        </select>
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="listitem"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors",
        active
          ? "border-petrol bg-petrol text-ground"
          : "border-line bg-surface text-ink-muted hover:border-petrol/40 hover:text-petrol",
      )}
    >
      {label}
    </button>
  );
}
