import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { CaseRegisterPage } from "@/components/cases/case-register";
import { fetchCourtById, toCourtDefinition } from "@/lib/api/courts";
import { CASE_CATEGORY_LABELS } from "@/lib/cases/courts";
import type { CaseCategory } from "@/lib/cases/types";

export const Route = createFileRoute("/_shell/external/$courtId/$category")({
  loader: async ({ params }) => {
    try {
      const court = toCourtDefinition(await fetchCourtById(params.courtId));
      const category = params.category as CaseCategory;
      if (court.layer !== "external" || !court.categories.includes(category)) {
        throw notFound();
      }
      return { court, category };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${CASE_CATEGORY_LABELS[loaderData.category]} — ${loaderData.court.name} | IPS`
          : "External Court Cases — IPS",
      },
    ],
  }),
  component: ExternalCourtCategoryPage,
  notFoundComponent: () => (
    <div className="space-y-2 p-6 text-sm text-muted-foreground">
      <p>External court or category not found.</p>
      <Link to="/external" className="font-semibold text-primary-deep hover:underline">
        Back to External Courts
      </Link>
    </div>
  ),
});

function ExternalCourtCategoryPage() {
  const { court, category } = Route.useLoaderData();
  return <CaseRegisterPage court={court} category={category} layer="external" />;
}
