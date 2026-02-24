import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — buildarc",
};

const sections = [
  {
    label: "01",
    title: "About buildarc",
    content:
      "buildarc is a free, open-source CLI tool distributed under the MIT license. It reads Claude Code conversation transcripts from your local filesystem and generates build journals and social content. There are no accounts, subscriptions, or payments.",
  },
  {
    label: "02",
    title: "License",
    content:
      "buildarc is released under the MIT license. You are free to use, modify, and distribute the software. See the LICENSE file in the GitHub repository for full terms.",
  },
  {
    label: "03",
    title: "Acceptable Use",
    content:
      "You may use buildarc for any lawful purpose. The generated output (build journals, social posts) is yours to use, publish, and share as you wish.",
  },
  {
    label: "04",
    title: "No Warranty",
    content:
      'buildarc is provided "as is" without warranties of any kind, express or implied. We do not guarantee the accuracy or completeness of generated build journals. Use your judgement when publishing generated content.',
  },
  {
    label: "05",
    title: "Limitation of Liability",
    content:
      "In no event shall the authors or maintainers of buildarc be liable for any claim, damages, or other liability arising from the use of the software.",
  },
  {
    label: "06",
    title: "Changes to Terms",
    content:
      "We may update these terms from time to time. Changes will be reflected on this page with an updated date.",
  },
];

export default function TermsPage() {
  return (
    <article>
      <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">Legal</p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text mb-2">
        Terms of Service
      </h1>
      <p className="font-mono text-xs text-text-dim mb-12">Last updated: February 2026</p>

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.label}>
            <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">
              {section.label}
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-text mb-4">
              {section.title}
            </h2>
            <p className="font-[family-name:var(--font-serif)] text-sm text-text-muted leading-relaxed">
              {section.content}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
