"use client";

import { useRouter } from "next/navigation";

import { FilterControls } from "@/components/FilterControls";
import { EMPTY_FILTER_VALUES, formValuesToParams, type FilterFormValues } from "@/lib/filters";

// Desktop only (≥1280px, see app/properties/page.tsx). No staging here: every
// change is a real navigation, so the URL and the visible results never
// disagree — unlike the mobile sheet, there is no "not applied yet" state to
// manage.
export function FilterBar({ currentFilters }: { currentFilters: FilterFormValues }) {
  const router = useRouter();

  function navigate(values: FilterFormValues) {
    const query = new URLSearchParams(formValuesToParams(values)).toString();
    router.push(query ? `/properties?${query}` : "/properties");
  }

  return (
    <div className="flex flex-wrap items-end gap-8 border-b border-hairline pb-6">
      <FilterControls
        values={currentFilters}
        onChange={navigate}
        idPrefix="bar"
        className="flex flex-1 flex-wrap gap-8"
        selectClassName="w-auto min-w-[10rem]"
      />
      <button
        type="button"
        onClick={() => navigate(EMPTY_FILTER_VALUES)}
        className="focus-ring pb-2 text-meta text-muted underline underline-offset-4 hover:text-ink"
      >
        Reset
      </button>
    </div>
  );
}
