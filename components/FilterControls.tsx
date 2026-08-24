"use client";

import { BEDROOM_OPTIONS, CITIES, PRICE_BANDS, PROPERTY_TYPES, type FilterFormValues } from "@/lib/filters";

type FilterControlsProps = {
  values: FilterFormValues;
  onChange: (values: FilterFormValues) => void;
  idPrefix: string;
  className?: string;
  selectClassName?: string;
};

const FIELD_CLASS =
  "focus-ring w-full appearance-none border-b bg-transparent bg-none py-2 pr-6 text-body";

export function FilterControls({
  values,
  onChange,
  idPrefix,
  className,
  selectClassName,
}: FilterControlsProps) {
  function set(key: keyof FilterFormValues, value: string) {
    onChange({ ...values, [key]: value });
  }

  const fieldClass = (active: boolean) =>
    `${FIELD_CLASS} ${active ? "border-accent text-accent" : "border-edge"} ${selectClassName ?? ""}`;

  return (
    <div className={className}>
      <div>
        <label htmlFor={`${idPrefix}-city`} className="block text-caption text-muted uppercase">
          Location
        </label>
        <select
          id={`${idPrefix}-city`}
          value={values.city}
          onChange={(event) => set("city", event.target.value)}
          className={fieldClass(values.city !== "")}
        >
          <option value="">Any location</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-price`} className="block text-caption text-muted uppercase">
          Price
        </label>
        <select
          id={`${idPrefix}-price`}
          value={values.priceBand}
          onChange={(event) => set("priceBand", event.target.value)}
          className={fieldClass(values.priceBand !== "")}
        >
          <option value="">Any price</option>
          {PRICE_BANDS.map((band, index) => (
            <option key={band.label} value={String(index)}>
              {band.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-beds`} className="block text-caption text-muted uppercase">
          Bedrooms
        </label>
        <select
          id={`${idPrefix}-beds`}
          value={values.bedrooms}
          onChange={(event) => set("bedrooms", event.target.value)}
          className={fieldClass(values.bedrooms !== "")}
        >
          <option value="">Any bedrooms</option>
          {BEDROOM_OPTIONS.map((count) => (
            <option key={count} value={String(count)}>
              {count}+ bed
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-type`} className="block text-caption text-muted uppercase">
          Type
        </label>
        <select
          id={`${idPrefix}-type`}
          value={values.propertyType}
          onChange={(event) => set("propertyType", event.target.value)}
          className={fieldClass(values.propertyType !== "")}
        >
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
