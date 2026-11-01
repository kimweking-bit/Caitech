import Image from "next/image";
import { why } from "@/lib/content/stub-copy";
import { homeImages } from "@/lib/content/institute";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Why CAITECH — dark contrast band with three editorial benefit cards
 * and an integrated engineering studio photograph.
 */
export function WhyCaitech() {
  return (
    <Section
      tone="navy"
      className="why-section"
      id="why-caitech"
      aria-labelledby="why-heading"
    >
      <div className="why-intro">
        <div className="why-intro__meta">
          <span className="why-intro__marker" aria-hidden="true" />
          <Eyebrow className="why-intro__eyebrow">{why.eyebrow}</Eyebrow>
        </div>
        <div className="why-intro__copy">
          <h2 id="why-heading" className="why-intro__title">
            {why.title}
          </h2>
          <p className="why-intro__lede">{why.lede}</p>
        </div>
      </div>

      <ol className="why-claims" aria-label="Why CAITECH">
        {why.items.map((item, index) => (
          <li key={item.id} className={`why-claim why-claim--${item.id}`}>
            <div className="why-claim__top">
              <span className="why-claim__index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="why-claim__title">{item.title}</h3>
            </div>
            <p className="why-claim__body">{item.body}</p>
            <ClaimProof item={item} />
          </li>
        ))}
      </ol>

      <figure className="why-studio">
        <div className="why-studio__frame">
          <Image
            src={homeImages.outcomes.src}
            alt={homeImages.outcomes.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1120px"
            className="why-studio__img"
          />
        </div>
        <figcaption className="why-studio__caption">
          <span className="why-studio__caption-kicker">In the room</span>
          <span className="why-studio__caption-line">
            Real tools, real files — work that leaves the desk ready
          </span>
        </figcaption>
      </figure>
    </Section>
  );
}

function ClaimProof({ item }: { item: (typeof why.items)[number] }) {
  if (item.proof.kind === "tools") {
    return (
      <ul className="why-tags" aria-label="Named software">
        {item.proof.labels.map((label) => (
          <li key={label} className="why-tag">
            {label}
          </li>
        ))}
      </ul>
    );
  }

  if (item.proof.kind === "deliverables") {
    return (
      <ul className="why-tags" aria-label="Deliverables">
        {item.proof.labels.map((label) => (
          <li key={label} className="why-tag why-tag--soft">
            {label}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="why-tags" aria-label="Local payments">
      <li className="why-tag why-tag--accent">{item.proof.primary}</li>
      <li className="why-tag why-tag--muted">{item.proof.secondary}</li>
    </ul>
  );
}
