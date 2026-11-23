"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Loader2, Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="h-9 rounded-full px-3.5"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? done : label}
    </Button>
  );
}

export type ChapterView = {
  name: string;
  type: "chapter" | "partner-parish";
  typeLabel: string;
  city: string;
  country: string;
  region: string;
  regionLabel: string;
  email: string;
};

export function ChapterDirectory({
  chapters,
  regions,
  strings,
}: {
  chapters: ChapterView[];
  regions: { id: string; label: string }[];
  strings: { search: string; placeholder: string; region: string; allRegions: string; none: string; results: string; clear: string };
}) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const list = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return chapters.filter(
      (c) =>
        (region === "all" || c.region === region) &&
        (!q || `${c.name} ${c.city} ${c.country}`.toLocaleLowerCase().includes(q)),
    );
  }, [chapters, query, region]);

  return (
    <div>
      <div className="mb-6 grid gap-3 rounded-2xl border bg-surface p-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="chapter-search" className="mb-1.5 block text-sm font-medium">{strings.search}</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="chapter-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={strings.placeholder} className="h-11 rounded-full ps-10" />
          </div>
        </div>
        <div>
          <Label htmlFor="chapter-region" className="mb-1.5 block text-sm font-medium">{strings.region}</Label>
          <select
            id="chapter-region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="h-11 w-full rounded-full border bg-surface ps-4 pe-9 text-sm sm:w-56"
          >
            <option value="all">{strings.allRegions}</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">{strings.results.replace("{count}", String(list.length))}</p>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-surface p-10 text-center">
          <p className="text-muted-foreground">{strings.none}</p>
          <Button variant="outline" className="mt-4 rounded-full" onClick={() => { setQuery(""); setRegion("all"); }}>
            {strings.clear}
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <li key={c.email} className="flex flex-col rounded-2xl border bg-surface p-5">
              <span className={cn("w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold", c.type === "chapter" ? "bg-teal-tint text-teal-deep" : "bg-gold-soft text-gold-deep")}>
                {c.typeLabel}
              </span>
              <h3 className="mt-3 font-heading text-lg font-semibold text-ink">{c.name}</h3>
              <p className="text-sm text-ink-soft">{c.city}, {c.country}</p>
              <p className="text-xs text-muted-foreground">{c.regionLabel}</p>
              <a href={`mailto:${c.email}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline" dir="ltr">
                <Mail className="size-4" />
                {c.email}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm({
  strings,
}: {
  strings: { name: string; email: string; subject: string; message: string; send: string; sending: string; done: string; errorName: string; errorEmail: string; errorMessage: string };
}) {
  const [values, setValues] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [k]: e.target.value }));

  if (status === "done") {
    return <p role="status" className="rounded-2xl border border-success/30 bg-success/10 p-6 text-ink">{strings.done}</p>;
  }

  return (
    <form
      noValidate
      className="space-y-5 rounded-2xl border bg-surface p-5 sm:p-7"
      onSubmit={async (e) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (!values.name.trim()) errs.name = strings.errorName;
        if (!EMAIL.test(values.email.trim())) errs.email = strings.errorEmail;
        if (values.message.trim().length < 5) errs.message = strings.errorMessage;
        setErrors(errs);
        if (Object.keys(errs).length) return;
        setStatus("sending");
        // TODO(forms): post to your form handler or OrthodoxConnect inbox here.
        await new Promise((r) => setTimeout(r, 600));
        setStatus("done");
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="c-name" label={strings.name} error={errors.name}>
          <Input id="c-name" autoComplete="name" value={values.name} onChange={set("name")} aria-invalid={!!errors.name || undefined} className="h-11 rounded-lg" />
        </FormField>
        <FormField id="c-email" label={strings.email} error={errors.email}>
          <Input id="c-email" type="email" dir="ltr" autoComplete="email" value={values.email} onChange={set("email")} aria-invalid={!!errors.email || undefined} className="h-11 rounded-lg rtl:text-end" />
        </FormField>
      </div>
      <FormField id="c-subject" label={strings.subject}>
        <Input id="c-subject" value={values.subject} onChange={set("subject")} className="h-11 rounded-lg" />
      </FormField>
      <FormField id="c-message" label={strings.message} error={errors.message}>
        <Textarea id="c-message" rows={6} value={values.message} onChange={set("message")} aria-invalid={!!errors.message || undefined} className="rounded-lg" />
      </FormField>
      <Button type="submit" disabled={status === "sending"} className="h-12 rounded-full bg-teal px-7 text-base font-semibold text-white hover:bg-teal-deep">
        {status === "sending" ? <><Loader2 className="animate-spin" />{strings.sending}</> : strings.send}
      </Button>
    </form>
  );
}

function FormField({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</Label>
      {children}
      {error ? <p role="alert" className="mt-1.5 text-sm font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
