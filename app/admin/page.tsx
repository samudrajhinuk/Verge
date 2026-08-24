import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Enquiries",
  robots: { index: false, follow: false },
};

// Always read fresh: an admin looking at a lead list must never be shown a
// cached copy that is missing the enquiry that just arrived.
export const dynamic = "force-dynamic";

// Deliberately plain. This page exists to prove the pipeline is real, so it
// is built to be read, not admired. It is not linked from anywhere on the
// site — you reach it by typing the URL.
export default async function AdminPage() {
  const enquiries = await prisma.enquiry.findMany({
    include: { property: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-12">
      <h1 className="font-display text-heading md:text-heading-lg">Enquiries</h1>
      <p className="mt-2 text-meta text-muted">Demo view — no authentication.</p>

      {enquiries.length === 0 ? (
        <p className="mt-10 text-body text-muted">No enquiries yet.</p>
      ) : (
        <table className="mt-10 w-full text-left">
          <thead>
            <tr className="border-b border-hairline">
              <th className="py-3 pr-6 text-caption text-muted uppercase">Date</th>
              <th className="py-3 pr-6 text-caption text-muted uppercase">Name</th>
              <th className="py-3 pr-6 text-caption text-muted uppercase">Email</th>
              <th className="py-3 pr-6 text-caption text-muted uppercase">Phone</th>
              <th className="py-3 pr-6 text-caption text-muted uppercase">Property</th>
              <th className="py-3 text-caption text-muted uppercase">Message</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enquiry) => (
              <tr key={enquiry.id} className="border-b border-hairline align-top">
                <td className="py-3 pr-6 text-meta text-muted tabular-nums whitespace-nowrap">
                  {enquiry.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                </td>
                <td className="py-3 pr-6 text-meta text-ink">{enquiry.name}</td>
                <td className="py-3 pr-6 text-meta text-ink">{enquiry.email}</td>
                <td className="py-3 pr-6 text-meta text-ink tabular-nums whitespace-nowrap">
                  {enquiry.phone}
                </td>
                <td className="py-3 pr-6 text-meta text-ink">{enquiry.property.name}</td>
                <td className="py-3 text-meta text-muted">{enquiry.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
