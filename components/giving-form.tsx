"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Loader2, Lock } from "lucide-react";
import { OrthodoxCross } from "@/components/orthodox-cross";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitDonation, type DonationResult, type Tribute } from "@/lib/giving/payments";
import { formatMoney, tr, type UiKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useClientValue } from "@/lib/use-client";

type Fund = { fundId: string; name: string };

type Props = {
  lang: string;
  orgName: string;
  currency: string;
  funds: Fund[];
  presets: number[];
  monthlyPresets: number[];
};

type Frequency = "one-time" | "monthly";
type Dedication = "none" | Tribute["kind"];
type Card = Tribute["card"];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN = 5;

export function GivingForm({ lang, orgName, currency, funds, presets, monthlyPresets }: Props) {
  const s = (k: UiKey, v?: Record<string, string | number>) => tr(k, lang, v);
  const money = (n: number) => formatMoney(n, lang, currency);

  const [frequency, setFrequency] = useState<Frequency>("one-time");
  const amounts = frequency === "monthly" ? monthlyPresets : presets;
  const [preset, setPreset] = useState<number | null>(presets[1] ?? presets[0]);
  const [custom, setCustom] = useState("");
  const [fundId, setFundId] = useState(funds[0]?.fundId ?? "general-fund");
  const [dedication, setDedication] = useState<Dedication>("none");
  const [honoree, setHonoree] = useState("");
  const [card, setCard] = useState<Card>("none");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DonationResult | null>(null);

  const search = useClientValue(() => window.location.search, "");
  const [appliedSearch, setAppliedSearch] = useState("");
  if (search !== appliedSearch) {
    setAppliedSearch(search);
    const q = new URLSearchParams(search);
    const fund = q.get("fund");
    if (fund && funds.some((f) => f.fundId === fund)) setFundId(fund);
    if (q.get("frequency") === "monthly") setFrequency("monthly");
    const d = q.get("dedication");
    if (d === "honor" || d === "memory") setDedication(d);
  }

  const amount = useMemo(() => {
    if (custom.trim()) {
      const n = Number(custom.replace(/[^\d.]/g, ""));
      return Number.isFinite(n) ? n : 0;
    }
    return preset ?? 0;
  }, [custom, preset]);

  function validate() {
    const e: Record<string, string> = {};
    if (amount < MIN) e.amount = s("errorAmount", { min: money(MIN) });
    if (!name.trim()) e.name = s("errorName");
    if (!EMAIL.test(email.trim())) e.email = s("errorEmail");
    if (dedication !== "none" && !honoree.trim()) e.honoree = s("errorHonoree");
    if (dedication !== "none" && card === "ecard" && !EMAIL.test(recipientEmail.trim())) e.recipient = s("errorRecipient");
    if (dedication !== "none" && card === "printed" && !recipientAddress.trim()) e.recipient = s("errorRecipient");
    setErrors(e);
    if (Object.keys(e).length) {
      const first = document.querySelector<HTMLElement>(`[data-field="${Object.keys(e)[0]}"]`);
      first?.focus();
    }
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const res = await submitDonation({
        amount,
        currency,
        frequency,
        fundId,
        language: lang,
        donor: { name: name.trim(), email: email.trim() },
        tribute:
          dedication === "none"
            ? undefined
            : { kind: dedication, honoreeName: honoree.trim(), card, recipientName, recipientEmail, recipientAddress, message },
      });
      if (res.status === "redirect") window.location.assign(res.url);
      else setResult(res);
    } catch {
      setResult({ status: "error", message: s("paymentError") });
    } finally {
      setBusy(false);
    }
  }

  const submitLabel = amount >= MIN
    ? frequency === "monthly"
      ? s("giveAmountMonthly", { amount: money(amount) })
      : s("giveAmount", { amount: money(amount) })
    : s("giveNow");

  return (
    <>
      <form noValidate onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.25fr_0.9fr] lg:items-start">
        <div className="space-y-9 rounded-2xl border bg-surface p-5 shadow-[0_30px_60px_-40px_rgba(9,62,75,0.45)] sm:p-8">
          <Fieldset legend={s("frequency")}>
            <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
              {(["one-time", "monthly"] as Frequency[]).map((f) => (
                <Choice key={f} name="frequency" checked={frequency === f} onChange={() => { setFrequency(f); setPreset((f === "monthly" ? monthlyPresets : presets)[1] ?? null); setCustom(""); }} pill>
                  {f === "monthly" ? s("monthly") : s("oneTime")}
                </Choice>
              ))}
            </div>
          </Fieldset>

          <Fieldset legend={s("amount")} error={errors.amount}>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {amounts.map((a) => (
                <Choice key={a} name="amount" checked={!custom && preset === a} onChange={() => { setPreset(a); setCustom(""); }} big>
                  <span className="num">{money(a)}</span>
                  {frequency === "monthly" ? <span className="text-xs font-normal opacity-70">{s("perMonth")}</span> : null}
                </Choice>
              ))}
            </div>
            <div className="mt-3">
              <Label htmlFor="custom-amount" className="sr-only">{s("otherAmount")}</Label>
              <Input
                id="custom-amount"
                data-field="amount"
                inputMode="decimal"
                placeholder={s("otherAmount")}
                value={custom}
                aria-invalid={!!errors.amount || undefined}
                onChange={(e) => setCustom(e.target.value)}
                className="h-12 rounded-xl text-base num"
              />
            </div>
          </Fieldset>

          <Fieldset legend={s("designation")}>
            <Select value={fundId} onValueChange={setFundId}>
              <SelectTrigger className="h-12 w-full rounded-xl text-base" aria-label={s("designation")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-72">
                {funds.map((f) => (
                  <SelectItem key={f.fundId} value={f.fundId} className="py-2.5 text-[0.95rem]">
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Fieldset>

          <Fieldset legend={s("dedication")}>
            <div className="flex flex-wrap gap-2">
              {(["none", "honor", "memory"] as Dedication[]).map((d) => (
                <Choice key={d} name="dedication" checked={dedication === d} onChange={() => setDedication(d)}>
                  {d === "none" ? s("noDedication") : d === "honor" ? s("inHonor") : s("inMemory")}
                </Choice>
              ))}
            </div>
            {dedication !== "none" ? (
              <div className="mt-5 space-y-5 rounded-xl border border-dashed border-gold/60 bg-gold-soft/30 p-4 sm:p-5">
                <Field id="honoree" label={s("honoreeName")} error={errors.honoree}>
                  <Input id="honoree" data-field="honoree" value={honoree} onChange={(e) => setHonoree(e.target.value)} aria-invalid={!!errors.honoree || undefined} className="h-11 rounded-lg bg-surface" />
                </Field>
                <div>
                  <p className="mb-2 text-sm font-medium">{s("tributeCard")}</p>
                  <div className="flex flex-wrap gap-2">
                    {(["none", "ecard", "printed"] as Card[]).map((c) => (
                      <Choice key={c} name="card" checked={card === c} onChange={() => setCard(c)} small>
                        {c === "none" ? s("noCard") : c === "ecard" ? s("eCard") : s("printedCard")}
                      </Choice>
                    ))}
                  </div>
                </div>
                {card !== "none" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="recipient-name" label={s("recipientName")}>
                      <Input id="recipient-name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="h-11 rounded-lg bg-surface" />
                    </Field>
                    {card === "ecard" ? (
                      <Field id="recipient-email" label={s("recipientEmail")} error={errors.recipient}>
                        <Input id="recipient-email" data-field="recipient" type="email" dir="ltr" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} aria-invalid={!!errors.recipient || undefined} className="h-11 rounded-lg bg-surface rtl:text-end" />
                      </Field>
                    ) : (
                      <Field id="recipient-address" label={s("recipientAddress")} error={errors.recipient} className="sm:col-span-2">
                        <Textarea id="recipient-address" data-field="recipient" rows={2} value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} aria-invalid={!!errors.recipient || undefined} className="rounded-lg bg-surface" />
                      </Field>
                    )}
                    <Field id="card-message" label={s("cardMessage")} className="sm:col-span-2">
                      <Textarea id="card-message" rows={2} maxLength={240} value={message} onChange={(e) => setMessage(e.target.value)} className="rounded-lg bg-surface" />
                    </Field>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Fieldset>

          <Fieldset legend={s("yourDetails")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="donor-name" label={s("fullName")} error={errors.name}>
                <Input id="donor-name" data-field="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name || undefined} className="h-11 rounded-lg" />
              </Field>
              <Field id="donor-email" label={s("email")} error={errors.email}>
                <Input id="donor-email" data-field="email" type="email" dir="ltr" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email || undefined} className="h-11 rounded-lg rtl:text-end" />
              </Field>
            </div>
          </Fieldset>

          <div>
            <Button type="submit" disabled={busy} className="h-14 w-full rounded-full bg-gold text-lg font-semibold text-gold-ink shadow-[0_14px_30px_-14px_rgba(143,101,20,0.9)] hover:bg-gold/90">
              {busy ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  {s("processing")}
                </>
              ) : (
                submitLabel
              )}
            </Button>
            <p className="mt-3 flex items-start justify-center gap-2 text-center text-xs text-muted-foreground">
              <Lock className="mt-0.5 size-3.5 shrink-0" />
              {s("secureNote")}
            </p>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-[calc(var(--token-layout-headerHeightCondensed)+1.5rem)]">
          <TributeCardPreview
            lang={lang}
            orgName={orgName}
            dedication={dedication === "none" ? "honor" : dedication}
            honoree={honoree}
            donor={name}
            message={message}
            muted={dedication === "none"}
          />
        </aside>
      </form>

      <Dialog open={!!result} onOpenChange={(o) => !o && setResult(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
              <OrthodoxCross className="h-7" />
            </div>
            <DialogTitle className="font-heading text-2xl">
              {result?.status === "error" ? s("paymentError") : s("demoThanksTitle")}
            </DialogTitle>
            <DialogDescription className="text-base">
              {result?.status === "error" ? result.message : s("demoThanksBody")}
            </DialogDescription>
          </DialogHeader>
          {result?.status === "demo" ? (
            <p className="rounded-lg bg-muted px-3 py-2 text-sm">
              {s("reference")}: <span className="font-mono" dir="ltr">{result.reference}</span>
            </p>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setResult(null)} className="rounded-full px-6">
              {s("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Fieldset({ legend, error, children }: { legend: string; error?: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 font-heading text-lg font-semibold text-ink">{legend}</legend>
      {children}
      {error ? <p role="alert" className="mt-2 text-sm font-medium text-destructive">{error}</p> : null}
    </fieldset>
  );
}

function Field({ id, label, error, className, children }: { id: string; label: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</Label>
      {children}
      {error ? <p role="alert" className="mt-1.5 text-sm font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

function Choice({
  name,
  checked,
  onChange,
  children,
  pill,
  big,
  small,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  pill?: boolean;
  big?: boolean;
  small?: boolean;
}) {
  return (
    <label className="relative block cursor-pointer">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cn(
          "flex items-center justify-center gap-1 border text-center font-semibold transition-all peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
          pill && "rounded-full border-transparent py-2.5 text-[0.95rem] text-ink-soft",
          pill && checked && "bg-surface text-teal-deep shadow-sm",
          !pill && "rounded-xl bg-surface",
          big && "h-14 flex-col gap-0 text-lg",
          !pill && !big && (small ? "rounded-full px-3.5 py-1.5 text-sm" : "rounded-full px-4 py-2 text-[0.95rem]"),
          !pill && (checked ? "border-teal bg-teal text-white shadow-[0_8px_20px_-12px_rgba(13,92,110,0.9)]" : "border-border text-ink hover:border-teal/50"),
        )}
      >
        {children}
      </span>
    </label>
  );
}

export function TributeCardPreview({
  lang,
  orgName,
  dedication,
  honoree,
  donor,
  message,
  muted,
}: {
  lang: string;
  orgName: string;
  dedication: Tribute["kind"];
  honoree: string;
  donor: string;
  message: string;
  muted?: boolean;
}) {
  const s = (k: UiKey, v?: Record<string, string | number>) => tr(k, lang, v);
  return (
    <figure className={cn("transition-opacity", muted && "opacity-75")}>
      <figcaption className="mb-3 text-sm font-semibold text-muted-foreground">{s("cardPreview")}</figcaption>
      <div className="relative overflow-hidden rounded-2xl bg-[#fffaf0] p-2 shadow-[0_30px_60px_-30px_rgba(19,36,43,0.45)]">
        <div className="rounded-xl border-2 border-gold/70 p-1.5">
          <div className="flex min-h-80 flex-col items-center rounded-lg border border-gold/40 px-6 py-8 text-center">
            <OrthodoxCross className="h-10 text-gold" />
            <p className="mt-5 text-sm tracking-wide text-ink-soft">
              {dedication === "memory" ? s("cardGiftMadeMemory") : s("cardGiftMadeHonor")}
            </p>
            <p className="mt-3 font-heading text-3xl leading-tight font-semibold break-words text-teal-deep">
              {honoree.trim() || s("honoreeName")}
            </p>
            {message.trim() ? <p className="mt-4 max-w-xs text-[0.95rem] break-words text-ink-soft italic">{message}</p> : null}
            {dedication === "memory" ? <p className="eyebrow mt-4 text-gold-deep">{s("cardMemoryLine")}</p> : null}
            <div className="mt-auto pt-6">
              <div className="mx-auto mb-3 h-px w-16 bg-gold/60" />
              {donor.trim() ? <p className="text-sm text-ink-soft">{s("cardFrom", { name: donor.trim() })}</p> : null}
              <p className="mt-1 text-xs text-muted-foreground">{orgName}</p>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
