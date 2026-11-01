import { outcomes } from "@/lib/content/institute";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * What you walk away with — four competence outcomes in a 2×2 editorial grid.
 * Theme white band; one shared design (brand-blue accent on every card).
 * Progression: Design → Coordinate → Deliver → Lead.
 */
export function Outcomes() {
  return (
    <Section
      tone="ground"
      className="outcomes-section"
      id="outcomes"
      aria-labelledby="outcomes-heading"
    >
      <header className="outcomes-header">
        <div className="outcomes-header__meta">
          <span className="outcomes-header__marker" aria-hidden="true" />
          <Eyebrow>What you walk away with</Eyebrow>
        </div>
        <div className="outcomes-header__copy">
          <h2 id="outcomes-heading" className="outcomes-header__title">
            Competence you can take into live project work
          </h2>
          <p className="outcomes-header__lede">
            Four outcomes that map to how technical work actually runs —
            design, coordinate, deliver, and lead with confidence.
          </p>
        </div>
      </header>

      <ol className="outcomes-grid" aria-label="Learning outcomes">
        {outcomes.map((item, index) => {
          const n = String(index + 1).padStart(2, "0");
          return (
            <li key={item.verb} className="outcomes-card">
              <div className="outcomes-card__head">
                <span className="outcomes-card__num" aria-hidden="true">
                  {n}
                </span>
                <h3 className="outcomes-card__verb">{item.verb}</h3>
              </div>
              <p className="outcomes-card__line">{item.line}</p>
              <p className="outcomes-card__practice">
                <span className="outcomes-card__practice-label">In practice</span>
                <span className="outcomes-card__practice-items">
                  {item.practice}
                </span>
              </p>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
