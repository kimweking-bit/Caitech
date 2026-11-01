"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { testimonials } from "@/lib/content/institute";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils/cn";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Manual reviews carousel — authentic testimonials only.
 * No autoplay. Keyboard + pointer swipe. Respects reduced motion.
 */
export function Testimonials() {
  // Widen length so empty-guard stays valid if content is later emptied.
  const total: number = testimonials.length;
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const regionId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerStartX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (total <= 0) return;
      const wrapped = ((next % total) + total) % total;
      setIndex(wrapped);
    },
    [total],
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(total - 1);
    }
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointerStartX.current = e.clientX;
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (pointerStartX.current == null) return;
    const dx = e.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(dx) < 48) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  if (total === 0) return null;

  const current = testimonials[index];

  return (
    <Section
      tone="ground"
      eyebrow="Student voices"
      title="What learners say"
      lede="Real feedback from people who trained with CAITECH."
      className="reviews-section"
    >
      <div
        className="reviews-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label="Student reviews"
        aria-labelledby={regionId}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <p id={regionId} className="sr-only">
          Review {index + 1} of {total}
        </p>

        <div className="reviews-carousel__toolbar">
          <p className="reviews-carousel__status" aria-live="polite">
            {index + 1} / {total}
          </p>
          <div className="reviews-carousel__controls">
            <button
              type="button"
              className="reviews-carousel__btn"
              onClick={goPrev}
              aria-label="Previous review"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              className="reviews-carousel__btn"
              onClick={goNext}
              aria-label="Next review"
            >
              <Chevron dir="right" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="reviews-carousel__viewport"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            pointerStartX.current = null;
          }}
        >
          <div
            className={cn(
              "reviews-carousel__track",
              reduceMotion && "reviews-carousel__track--instant",
            )}
            style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
          >
            {testimonials.map((t, i) => (
              <figure
                key={t.name}
                className="reviews-carousel__slide"
                aria-hidden={i !== index}
                {...(i === index ? {} : { inert: true })}
              >
                <div className="reviews-carousel__card">
                  <div className="reviews-carousel__avatar" aria-hidden="true">
                    {initials(t.name)}
                  </div>
                  <blockquote className="reviews-carousel__quote">
                    <p>“{t.quote}”</p>
                  </blockquote>
                  <figcaption className="reviews-carousel__name">{t.name}</figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>

        <div className="reviews-carousel__dots" role="tablist" aria-label="Choose review">
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show review from ${t.name}`}
              className={cn(
                "reviews-carousel__dot",
                i === index && "reviews-carousel__dot--active",
              )}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* Keep a stable reference for current slide text for AT without noisy live regions */}
        <span className="sr-only">{current.quote}</span>
      </div>
    </Section>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-current"
    >
      {dir === "left" ? (
        <path
          d="M15 6 9 12l6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="m9 6 6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
