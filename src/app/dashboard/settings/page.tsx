import AccentColorPicker from "@/components/features/settings/accent-color-picker";
import CorporateEntitiesList from "@/components/features/settings/corporate-entities-list";
import UsersList from "@/components/features/settings/users-list";
import PaymentTermsList from "@/components/features/settings/payment-terms-list";
import DeliveryConditionsList from "@/components/features/settings/delivery-conditions-list";
import OfferLinksList from "@/components/features/settings/offer-links-list";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="page-title mb-6">Settings</h1>
      </div>

      <section>
        <AccentColorPicker />
      </section>

      <hr className="border-[var(--border)]" />

      <section>
        <UsersList />
      </section>

      <hr className="border-[var(--border)]" />

      <section>
        <CorporateEntitiesList />
      </section>

      <hr className="border-[var(--border)]" />

      <section>
        <PaymentTermsList />
      </section>

      <hr className="border-[var(--border)]" />

      <section>
        <DeliveryConditionsList />
      </section>

      <hr className="border-[var(--border)]" />

      <section>
        <OfferLinksList />
      </section>
    </div>
  );
}
