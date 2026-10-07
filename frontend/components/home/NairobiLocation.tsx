import Image from "next/image";
import { homeImages, instituteContact } from "@/lib/content/institute";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function NairobiLocation() {
  return (
    <section
      id="location"
      aria-labelledby="location-heading"
      className="border-y border-line bg-petrol-deep text-ground"
    >
      <div className="grid lg:grid-cols-12">
        <div className="relative min-h-[16rem] lg:col-span-7 lg:min-h-[28rem]">
          <Image
            src={homeImages.nairobi.src}
            alt={homeImages.nairobi.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover opacity-90 grayscale-[30%]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-petrol-deep/80 via-petrol-deep/30 to-transparent"
          />
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-lime">
              Nairobi CBD
            </p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ground/70">
              KTDA Plaza · 10th Floor
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center lg:col-span-5">
          <Container className="py-12 md:py-16 lg:px-10">
            <Eyebrow className="text-lime">Campus</Eyebrow>
            <h2
              id="location-heading"
              className="mt-3 font-display text-3xl text-ground text-balance md:text-4xl"
            >
              Train in the centre of Nairobi.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ground/75 md:text-base">
              A physical institute in the CBD — not only an online catalogue.
              Visit for intakes, programme guidance and practical training
              environments.
            </p>

            <address className="mt-8 space-y-1 not-italic text-sm text-ground/90">
              {instituteContact.addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </address>

            <ul className="mt-5 space-y-1 text-sm">
              {instituteContact.phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="text-ground/90 underline-offset-2 hover:text-lime hover:underline"
                  >
                    {phone}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${instituteContact.email}`}
                  className="text-ground/90 underline-offset-2 hover:text-lime hover:underline"
                >
                  {instituteContact.email}
                </a>
              </li>
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                href={instituteContact.mapsUrl}
                external
                variant="lime"
                size="md"
              >
                Get directions →
              </Button>
              <Button
                href="/contact"
                variant="secondary"
                size="md"
                className="border-ground/30 text-ground hover:border-lime hover:text-lime"
              >
                Contact CAITECH →
              </Button>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
