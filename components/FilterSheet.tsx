"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { countProperties } from "@/app/properties/actions";
import { FilterControls } from "@/components/FilterControls";
import {
  countActiveFilters,
  describeFilters,
  EMPTY_FILTER_VALUES,
  formValuesToParams,
  type FilterFormValues,
} from "@/lib/filters";

const HEADING_ID = "filter-sheet-heading";
const FOCUSABLE_SELECTOR = 'button, [href], select, input, textarea, [tabindex]:not([tabindex="-1"])';

type FilterSheetProps = {
  currentFilters: FilterFormValues;
  resultCount: number;
};

// Below 1280px only (see app/properties/page.tsx). Unlike FilterBar, changes
// here are TEMPORARY: they live in `tempValues`, a piece of state local to
// this component, and never touch the URL until Apply is pressed. Closing
// without Apply — Escape, the backdrop, or the Close button — just discards
// `tempValues` and leaves the real filters (and the URL) untouched.
export function FilterSheet({ currentFilters, resultCount }: FilterSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [tempValues, setTempValues] = useState<FilterFormValues>(currentFilters);
  const [liveCount, setLiveCount] = useState(resultCount);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  function open() {
    setTempValues(currentFilters);
    setLiveCount(resultCount);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function apply() {
    const query = new URLSearchParams(formValuesToParams(tempValues)).toString();
    router.push(query ? `/properties?${query}` : "/properties");
    close();
  }

  function reset() {
    setTempValues(EMPTY_FILTER_VALUES);
  }

  // The live count: every change to the (not-yet-applied) selections re-runs
  // the exact same parseFilters/buildWhere query the real page uses, via a
  // Server Action, and asks Postgres for a count. Debounced by 200ms so
  // flicking through several controls doesn't fire a query per click. The
  // alternative — fetching all ten properties once and running the same
  // filter logic again in the browser — was rejected: it is a second
  // implementation of buildWhere that could quietly drift from the first,
  // which is exactly what this phase exists to avoid, and it stops being
  // truthful the moment the catalogue is too large to ship to the browser
  // in full. The trade-off accepted instead is a small amount of latency
  // (one query per settled change) in exchange for the count always being
  // exactly what the server would return.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const params = formValuesToParams(tempValues);
    const timeout = setTimeout(() => {
      countProperties(params).then((count) => {
        if (!cancelled) setLiveCount(count);
      });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [isOpen, tempValues]);

  // Focus management: move focus into the sheet on open, trap Tab inside it,
  // close on Escape, and stop the page behind from scrolling.
  useEffect(() => {
    if (!isOpen) return;
    const sheet = sheetRef.current;
    if (!sheet) return;

    const focusable = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    focusable[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const activeCount = countActiveFilters(currentFilters);
  const tempActiveLabels = describeFilters(tempValues);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        className="focus-ring fixed inset-x-6 bottom-6 z-40 flex min-h-[44px] items-center justify-center bg-accent text-caption text-paper uppercase"
      >
        {activeCount > 0 ? `Filter (${activeCount})` : "Filter"}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close filters"
            onClick={close}
            className="absolute inset-0 bg-ink/40"
          />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={HEADING_ID}
            className="absolute inset-x-0 bottom-0 max-h-[80vh] animate-[slide-up_240ms_ease-out] overflow-y-auto bg-ink p-6 text-paper"
          >
            <div className="flex items-center justify-between">
              <h2 id={HEADING_ID} className="font-display text-heading">
                Filter properties
              </h2>
              <button
                type="button"
                onClick={close}
                className="focus-ring text-meta text-paper/70 uppercase underline underline-offset-4"
              >
                Close
              </button>
            </div>

            <FilterControls
              values={tempValues}
              onChange={setTempValues}
              idPrefix="sheet"
              className="mt-8 space-y-6"
            />

            <p aria-live="polite" className="mt-8 text-meta text-paper/70 tabular-nums">
              {liveCount} {liveCount === 1 ? "property" : "properties"}
              {tempActiveLabels.length > 0 ? ` · ${tempActiveLabels.join(" · ")}` : ""}
            </p>

            <div className="mt-6 flex items-center gap-6">
              <button
                type="button"
                onClick={reset}
                className="focus-ring text-meta text-paper/70 uppercase underline underline-offset-4"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={apply}
                className="focus-ring min-h-[44px] flex-1 bg-accent text-caption text-paper uppercase"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
