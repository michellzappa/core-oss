import Link from "next/link";
import type { Metadata } from "next";
import {
  Building2,
  Users,
  FileText,
  FolderOpen,
  Plus,
} from "lucide-react";
import DashboardPageWrapper from "@/components/layouts/pages/dashboard-page-wrapper";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import MyProjectsSidebar from "@/components/dashboard/my-projects-sidebar";
import { generatePageTitle } from "@/lib/metadata-utils";
import {
  type OfferHistoryPoint,
  OfferHistoryBarChart,
} from "@/components/features/analytics/offer-history-bar-chart";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: generatePageTitle("Dashboard", "/dashboard"),
  };
}

interface DashboardStats {
  organizations: number;
  contacts: number;
  projects: number;
  offers: number;
}

interface RawOfferRow {
  id: string;
  total_amount: number | null;
  is_accepted: boolean | null;
  created_at: string | null;
  valid_until: string | null;
  currency: string | null;
}

function buildOfferHistory(
  offers: RawOfferRow[],
  monthsBack: number = 12,
): { points: OfferHistoryPoint[]; currencyCode: string } {
  if (!offers.length || monthsBack <= 0) {
    return { points: [], currencyCode: "EUR" };
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthKeys: { key: string; label: string }[] = [];
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const date = new Date(currentYear, currentMonth - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString(undefined, {
      month: "short",
      year: "2-digit",
    });
    monthKeys.push({ key, label });
  }

  const buckets = new Map<
    string,
    { totalAmount: number; acceptedAmount: number; expiredAmount: number }
  >();
  for (const { key } of monthKeys) {
    buckets.set(key, { totalAmount: 0, acceptedAmount: 0, expiredAmount: 0 });
  }

  const currencyCode =
    offers.find((o) => o.currency)?.currency?.toUpperCase() || "EUR";

  for (const offer of offers) {
    if (!offer.created_at) continue;
    const created = new Date(offer.created_at);
    if (Number.isNaN(created.getTime())) continue;

    const year = created.getFullYear();
    const month = created.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, "0")}`;

    if (!buckets.has(key)) continue;

    const amount = Number(offer.total_amount ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) continue;

    const bucket = buckets.get(key);
    if (!bucket) continue;

    bucket.totalAmount += amount;
    const isAccepted = Boolean(offer.is_accepted);
    const isExpired =
      !isAccepted &&
      Boolean(offer.valid_until) &&
      new Date(offer.valid_until as string) < now;

    if (isAccepted) {
      bucket.acceptedAmount += amount;
    } else if (isExpired) {
      bucket.expiredAmount += amount;
    }
  }

  const points: OfferHistoryPoint[] = monthKeys.map(({ key, label }) => {
    const bucket =
      buckets.get(key) ?? { totalAmount: 0, acceptedAmount: 0, expiredAmount: 0 };
    return {
      monthKey: key,
      label,
      totalAmount: bucket.totalAmount,
      acceptedAmount: bucket.acceptedAmount,
      expiredAmount: bucket.expiredAmount,
    };
  });

  return { points, currencyCode };
}

async function getDashboardStats(supabase: any): Promise<DashboardStats> {
  const [orgs, contacts, projects, offers] = await Promise.all([
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("offers").select("*", { count: "exact", head: true }),
  ]);

  return {
    organizations: orgs.count ?? 0,
    contacts: contacts.count ?? 0,
    projects: projects.count ?? 0,
    offers: offers.count ?? 0,
  };
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  let stats: DashboardStats;

  try {
    stats = await getDashboardStats(supabase);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return (
      <DashboardPageWrapper>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          Error loading dashboard data. Please try refreshing the page.
        </div>
      </DashboardPageWrapper>
    );
  }

  const [
    { data: activeProjects },
    { data: offersForHistory },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select(`
        *,
        organization:organizations(id, name)
      `)
      .eq("status", "Active")
      .order("created_at", { ascending: false }),
    supabase
      .from("offers")
      .select("id, total_amount, is_accepted, created_at, valid_until, currency"),
  ]);

  const offerRows = (offersForHistory || []) as RawOfferRow[];
  const offerHistory = buildOfferHistory(offerRows, 36);

  const cards = [
    {
      title: "Organizations",
      value: stats.organizations,
      icon: Building2,
      href: "/dashboard/organizations",
      createHref: "/dashboard/organizations/new",
    },
    {
      title: "Contacts",
      value: stats.contacts,
      icon: Users,
      href: "/dashboard/contacts",
      createHref: "/dashboard/contacts/new",
    },
    {
      title: "Projects",
      value: stats.projects,
      icon: FolderOpen,
      href: "/dashboard/projects",
      createHref: "/dashboard/projects/new",
    },
    {
      title: "Offers",
      value: stats.offers,
      icon: FileText,
      href: "/dashboard/offers",
      createHref: "/dashboard/offers/new",
    },
  ];

  return (
    <DashboardPageWrapper>
      <div className="space-y-4 sm:space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="relative group bg-[var(--card)] rounded-md sm:rounded-lg minimal-shadow minimal-border p-3 sm:p-4 hover:bg-[var(--card)]/95 transition-colors"
            >
              <Link
                href={card.href}
                aria-label={`${card.title} overview`}
                className="absolute inset-0 z-0"
              />
              <div className="pointer-events-none">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[var(--text-primary)] text-[var(--background)] flex items-center justify-center">
                    <card.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  {card.createHref && (
                    <Link
                      href={card.createHref}
                      className="pointer-events-auto relative z-10 p-1.5 sm:p-2 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-colors"
                      title={`Create new ${card.title.toLowerCase()}`}
                      aria-label={`Create ${card.title}`}
                    >
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Link>
                  )}
                </div>
                <h2 className="text-[10px] sm:text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                  {card.title}
                </h2>
                <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Offer history chart */}
        <div>
          <OfferHistoryBarChart
            data={offerHistory.points}
            currencyCode={offerHistory.currencyCode}
          />
        </div>

        {/* Active projects */}
        <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4">
          <MyProjectsSidebar projects={activeProjects || []} />
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
