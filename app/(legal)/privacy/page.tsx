import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — buildlog",
};

const sections = [
  {
    label: "01",
    title: "What buildlog Does",
    content:
      "buildlog is an open-source CLI tool that reads Claude Code conversation transcripts (.jsonl files) stored on your local machine and generates build journals and social content. All processing happens locally on your computer. No data is sent to any server.",
  },
  {
    label: "02",
    title: "Data We Collect",
    content:
      "buildlog does not collect, transmit, or store any personal data. There are no accounts, no analytics, no telemetry, and no network requests. Your transcript files never leave your machine.",
  },
  {
    label: "03",
    title: "Landing Page",
    content:
      "This website (buildlog.dev) may use privacy-friendly, cookieless analytics to measure page views. No personal information is collected or shared with third parties.",
  },
  {
    label: "04",
    title: "Open Source",
    content:
      "buildlog is open source under the MIT license. You can inspect the source code to verify that no data collection occurs. The repository is publicly available on GitHub.",
  },
  {
    label: "05",
    title: "Contact",
    content:
      "For privacy-related questions, open an issue on the GitHub repository at github.com/leonardomjq/buildlog.",
  },
];

export default function PrivacyPage() {
  return (
    <article>
      <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">
        Legal
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text mb-2">
        Privacy Policy
      </h1>
      <p className="font-mono text-xs text-text-dim mb-12">
        Last updated: February 2026
      </p>

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
