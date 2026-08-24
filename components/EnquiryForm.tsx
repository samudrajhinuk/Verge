"use client";

import { useActionState, useEffect, useRef } from "react";

import { submitEnquiry, type EnquiryState, type EnquiryValues } from "@/app/actions/enquiry";

type EnquiryFormProps = {
  propertyId: string;
  propertyName: string;
};

const INITIAL: EnquiryState = { status: "idle" };

const FIELD_BASE =
  "w-full min-h-[44px] bg-transparent border-b py-2 text-body text-ink disabled:opacity-50";

export function EnquiryForm({ propertyId, propertyName }: EnquiryFormProps) {
  const [state, formAction, isPending] = useActionState(submitEnquiry, INITIAL);

  // `isPending` only disables the button once React has re-rendered, so several
  // clicks landing in the same tick all get through it. This ref is checked
  // synchronously inside the submit event, which closes that gap. It is the
  // convenience half of the guard — the server does the half that actually
  // counts, since neither of these survives a second browser tab.
  const submitting = useRef(false);

  useEffect(() => {
    if (!isPending) submitting.current = false;
  }, [isPending]);

  const prefilled = `I would like to know more about ${propertyName}.`;

  // On a rejected submission the values come back from the server and are put
  // straight back into the fields, so nothing the visitor typed is lost.
  const values: EnquiryValues =
    state.status === "invalid" || state.status === "failed"
      ? state.values
      : { name: "", email: "", phone: "", message: prefilled };

  const errors = state.status === "invalid" ? state.errors : {};

  function fieldClass(hasError: boolean) {
    // The border change is a second signal alongside the message below the
    // field: colour is never the only thing carrying the error.
    return `${FIELD_BASE} ${hasError ? "border-b-2 border-accent" : "border-edge"}`;
  }

  return (
    <section className="max-w-[480px]">
      <h2 className="font-display text-heading md:text-heading-lg">
        Enquire about this residence
      </h2>

      {/* Always in the DOM, empty until there is something to say. A live
          region added at the same moment as its text is often missed by
          screen readers; one that already exists reliably announces. */}
      <div aria-live="polite">
        {state.status === "sent" ? (
          <p className="mt-6 text-body text-ink">
            Enquiry received. Someone from Verge will call you about{" "}
            {state.propertyName} within two working days.
          </p>
        ) : null}
      </div>

      {state.status === "sent" ? null : (
        <form
          action={formAction}
          onSubmit={(event) => {
            if (submitting.current) {
              event.preventDefault();
              return;
            }
            submitting.current = true;
          }}
          className="mt-8"
        >
          <input type="hidden" name="propertyId" value={propertyId} />

          {state.status === "failed" ? (
            <p className="mb-6 border-b-2 border-accent pb-3 text-meta text-accent">
              {state.error}
            </p>
          ) : null}

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-caption text-muted uppercase">
                Name (required)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                defaultValue={values.name}
                disabled={isPending}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "name-error" : undefined}
                className={fieldClass(Boolean(errors.name))}
              />
              {errors.name ? (
                <p id="name-error" className="mt-2 text-meta text-accent">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="email" className="block text-caption text-muted uppercase">
                Email (required)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={values.email}
                disabled={isPending}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={fieldClass(Boolean(errors.email))}
              />
              {errors.email ? (
                <p id="email-error" className="mt-2 text-meta text-accent">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="phone" className="block text-caption text-muted uppercase">
                Phone (required)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                defaultValue={values.phone}
                disabled={isPending}
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                className={`${fieldClass(Boolean(errors.phone))} tabular-nums`}
              />
              {errors.phone ? (
                <p id="phone-error" className="mt-2 text-meta text-accent">
                  {errors.phone}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="message" className="block text-caption text-muted uppercase">
                Message (required)
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                defaultValue={values.message}
                disabled={isPending}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? "message-error" : undefined}
                className={fieldClass(Boolean(errors.message))}
              />
              {errors.message ? (
                <p id="message-error" className="mt-2 text-meta text-accent">
                  {errors.message}
                </p>
              ) : null}
            </div>
          </div>

          {/* The one filled button on the site. Disabled while the action is
              in flight, which is what stops a second click creating a second
              enquiry. */}
          <button
            type="submit"
            disabled={isPending}
            className="focus-ring mt-10 min-h-[44px] bg-accent px-8 text-caption text-paper uppercase disabled:opacity-60"
          >
            {isPending ? "Sending…" : "Send enquiry"}
          </button>
        </form>
      )}
    </section>
  );
}
