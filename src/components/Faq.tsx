import type { Dictionary } from "@/lib/types";

export function Faq({ dictionary, title, items = dictionary.faq }: { dictionary: Dictionary; title: string; items?: { question: string; answer: string }[] }) {
  return (
    <section className="panel p-5 sm:p-7" aria-labelledby="faq-title">
      <h2 id="faq-title" className="text-2xl font-extrabold tracking-tight">{title}</h2>
      <div className="mt-5 divide-y divide-border">
        {items.map((item) => (
          <details key={item.question} className="group py-4">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-bold">
              <span>{item.question}</span>
              <span className="text-xl text-accent transition-transform group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p className="mt-3 max-w-4xl text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
