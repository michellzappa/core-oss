"use client";

import EntityIndexClient from "./entity-index-client";

interface EntityIndexWithToggleProps {
  entity: Parameters<typeof EntityIndexClient>[0]["entity"];
  items: Parameters<typeof EntityIndexClient>[0]["items"];
  initial?: Parameters<typeof EntityIndexClient>[0]["initial"];
}

export default function EntityIndexWithToggle({
  entity,
  items,
  initial,
}: EntityIndexWithToggleProps) {
  return (
    <EntityIndexClient
      entity={entity}
      items={items}
      initial={initial}
    />
  );
}
