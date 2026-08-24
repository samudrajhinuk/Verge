"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export type EnquiryValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export type EnquiryErrors = Partial<Record<keyof EnquiryValues, string>>;

export type EnquiryState =
  | { status: "idle" }
  | { status: "invalid"; errors: EnquiryErrors; values: EnquiryValues }
  | { status: "failed"; error: string; values: EnquiryValues }
  | { status: "sent"; propertyName: string };

// Deliberately loose: the only thing worth rejecting is an address that
// cannot be one. Anything stricter starts refusing real addresses, and the
// only real proof an address works is sending to it.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Indian mobile numbers are ten digits starting 6-9. People type them with a
// +91, a leading 0, spaces or hyphens, and all of those are the same number —
// so the separators are stripped and the result stored in one shape. Storing
// what was typed would mean the same person looks like two different leads.
function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  let local = digits;
  if (local.length === 12 && local.startsWith("91")) local = local.slice(2);
  else if (local.length === 11 && local.startsWith("0")) local = local.slice(1);

  if (!/^[6-9]\d{9}$/.test(local)) return null;
  return `+91${local}`;
}

// The source of truth for whether an enquiry is valid. The browser also
// checks, but only to save the user a round trip: anything client-side can be
// bypassed by editing the page or posting directly to this endpoint, so
// nothing reaches the database without passing through here first.
export async function submitEnquiry(
  _previous: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const values: EnquiryValues = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  };
  const propertyId = String(formData.get("propertyId") ?? "");

  const errors: EnquiryErrors = {};

  if (values.name.length < 2) {
    errors.name = "Enter your name.";
  } else if (values.name.length > 100) {
    errors.name = "Name is too long.";
  }

  if (!values.email) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  const phone = normalisePhone(values.phone);
  if (!values.phone) {
    errors.phone = "Enter your phone number.";
  } else if (!phone) {
    errors.phone = "Enter a 10-digit Indian mobile number.";
  }

  if (!values.message) {
    errors.message = "Enter a message.";
  } else if (values.message.length > 2000) {
    errors.message = "Message is too long.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "invalid", errors, values };
  }

  try {
    // The property is read back rather than trusting a name posted from the
    // browser: propertyId arrives in a hidden field, so it is user input like
    // any other. This also turns a tampered id into a clean message instead of
    // a foreign-key error.
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, name: true },
    });

    if (!property) {
      return {
        status: "failed",
        error: "That property could not be found. Please reload the page and try again.",
        values,
      };
    }

    // Duplicate guard. The form disables its button while submitting, but that
    // only takes effect after React re-renders — several clicks inside one tick
    // all get through, and two tabs would bypass it entirely. The client cannot
    // be trusted to prevent this any more than it can be trusted to validate,
    // so the same enquiry arriving twice in a minute is treated as one.
    //
    // Returning success rather than an error is deliberate: the visitor asked
    // once and their enquiry exists, which is exactly what they wanted to
    // happen. Telling them off for a stray double-click would be inventing a
    // problem they do not have.
    const alreadySent = await prisma.enquiry.findFirst({
      where: {
        propertyId: property.id,
        email: values.email,
        message: values.message,
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
      select: { id: true },
    });

    if (!alreadySent) {
      await prisma.enquiry.create({
        data: {
          name: values.name,
          email: values.email,
          phone: phone!,
          message: values.message,
          propertyId: property.id,
        },
      });
    }

    revalidatePath("/admin");

    return { status: "sent", propertyName: property.name };
  } catch (error) {
    // The real error goes to the server log where it is useful. The visitor
    // gets a sentence they can act on — a database message would tell them
    // nothing and would leak the schema.
    console.error("Enquiry write failed:", error);
    return {
      status: "failed",
      error: "Something went wrong sending your enquiry. Please try again.",
      values,
    };
  }
}
