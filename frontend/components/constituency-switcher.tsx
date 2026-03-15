"use client";

import { useRouter } from "next/navigation";

import type { ConstituencyDirectoryItem } from "@/lib/api";

type ConstituencySwitcherProps = {
  constituencies: ConstituencyDirectoryItem[];
  selectedId: number;
  label?: string;
  className?: string;
};

export function ConstituencySwitcher({
  constituencies,
  selectedId,
  label = "Constituency",
  className = "",
}: ConstituencySwitcherProps) {
  const router = useRouter();

  return (
    <label className={`constituency-switcher ${className}`.trim()}>
      <span>{label}</span>
      <select
        value={selectedId}
        onChange={(event) => {
          router.push(`/constituency/${event.target.value}`);
        }}
      >
        {constituencies.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.name} — {entry.state}
          </option>
        ))}
      </select>
    </label>
  );
}
