"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { connectLink } from "@/lib/connect";

type Props = {
  lang: string;
  strings: { email: string; subscribe: string; errorEmail: string; opens: string };
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm({ lang, strings }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);

  return (
    <form
      noValidate
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (!EMAIL.test(email.trim())) return setError(true);
        const url = connectLink("newsletterSignup", lang, { email: email.trim() });
        if (url) window.open(url, "_blank", "noopener");
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        {strings.email}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          dir="ltr"
          placeholder="name@example.org"
          value={email}
          aria-invalid={error || undefined}
          aria-describedby={error ? "newsletter-error" : "newsletter-hint"}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(false);
          }}
          className="h-12 flex-1 rounded-full border-white/20 bg-white/10 px-5 text-base text-white placeholder:text-white/45 focus-visible:border-gold rtl:text-end"
        />
        <Button type="submit" className="h-12 rounded-full bg-gold px-6 text-base font-semibold text-gold-ink hover:bg-gold/90">
          {strings.subscribe}
          <ArrowRight className="rtl:-scale-x-100" />
        </Button>
      </div>
      <p id={error ? "newsletter-error" : "newsletter-hint"} className={error ? "mt-2 text-sm text-gold-soft" : "mt-2 text-xs text-white/55"}>
        {error ? strings.errorEmail : strings.opens}
      </p>
    </form>
  );
}
