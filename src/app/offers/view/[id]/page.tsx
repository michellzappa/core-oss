import { redirect } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicOfferByIdPage({ params }: PageProps) {
  const { id } = await params;
  // Redirect to WWW site for offer viewing
  redirect(`https://www.envisioning.com/private/offer/${id}`);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // Metadata will be handled by the WWW site after redirect
  return { title: "Envisioning Offer" };
}
