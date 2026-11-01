"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  toolClusters,
  toolsBehindWork,
  type ToolClusterId,
} from "@/lib/content/institute";
import { coursesCategoryHref } from "@/lib/content/nav";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils/cn";

type FilterId = "all" | ToolClusterId;

function padIndex(n: number) {
  return String(n).padStart(2, "0");
}

export function ToolsStrip() {
  const [filter, setFilter] = useState<FilterId>("all");

  const visibleClusters = useMemo(
    () =>
      filter === "all"
        ? toolClusters
        : toolClusters.filter((c) => c.id === filter),
    [filter],
  );

  const filters: { id: FilterId; label: string }[] = [
    { id: "all", label: "All" },
    ...toolClusters.map((c) => ({ id: c.id as FilterId, label: c.title })),
  ];

  return (
    <section
      className="stack-section"
      aria-labelledby="stack-heading"
      id="stack"
    >
      <Container>
        <header className="stack-intro">
          <div className="stack-intro__main">
            <p className="stack-eyebrow">
              <span className="stack-eyebrow__rule" aria-hidden="true" />
              THE CAITECH STACK
            </p>
            <h2 id="stack-heading" className="stack-title">
              The tools behind{" "}
              <span className="stack-title__accent">the work.</span>
            </h2>
          </div>
          <div className="stack-intro__rule" aria-hidden="true" />
          <p className="stack-intro__aside">
            Production software, grouped the way the work is grouped.
          </p>
        </header>

        <div
          className="stack-filters"
          role="group"
          aria-label="Filter tool clusters"
        >
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={cn("stack-filter")}
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="stack-grid">
          {visibleClusters.map((cluster) => {
            const tools = toolsBehindWork.filter(
              (t) => t.cluster === cluster.id,
            );
            const order =
              toolClusters.findIndex((c) => c.id === cluster.id) + 1;
            const meta = `${padIndex(order)} / ${padIndex(tools.length)} TOOLS`;
            const isLinked = Boolean(cluster.categoryId);
            const surfaceClass = cn(
              "stack-card",
              cluster.surface === "dark"
                ? "stack-card--dark"
                : "stack-card--light",
            );

            const body = (
              <>
                <div className="stack-card__media">
                  <Image
                    src={cluster.image.src}
                    alt={cluster.image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 28vw"
                    className="stack-card__img"
                  />
                </div>
                <div className="stack-card__body">
                  <div className="stack-card__meta">
                    <span className="stack-card__index">{meta}</span>
                    {isLinked ? (
                      <span className="stack-card__arrow" aria-hidden="true">
                        →
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <h3 className="stack-card__title">{cluster.title}</h3>
                    <p className="stack-card__blurb">{cluster.blurb}</p>
                  </div>
                  <div className="stack-card__divider" aria-hidden="true" />
                  <ul className="stack-tools">
                    {tools.map((tool) => (
                      <li key={tool.name} className="stack-tool">
                        <span className="stack-tool__mark" aria-hidden="true">
                          {tool.name.charAt(0)}
                        </span>
                        <span className="stack-tool__text">
                          <span className="stack-tool__name">{tool.name}</span>
                          <span className="stack-tool__role">{tool.label}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            );

            if (cluster.categoryId) {
              return (
                <Link
                  key={cluster.id}
                  href={coursesCategoryHref(cluster.categoryId)}
                  className={surfaceClass}
                  data-cluster={cluster.id}
                >
                  {body}
                </Link>
              );
            }

            return (
              <article
                key={cluster.id}
                className={surfaceClass}
                data-cluster={cluster.id}
              >
                {body}
              </article>
            );
          })}
        </div>

        <div className="stack-footer">
          <Link href="/courses" className="stack-cta">
            <span className="stack-cta__rule" aria-hidden="true" />
            Explore all courses
            <span className="stack-cta__arrow" aria-hidden="true">
              →
            </span>
          </Link>
          <div className="stack-dots" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </Container>
    </section>
  );
}
