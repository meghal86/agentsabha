"use client";

import { useEffect, useState, useTransition } from "react";

type DebugStatus = {
  ok: boolean;
  methodologyVersion: string | null;
  liveMpCount: number;
  sampleNames: string[];
  health?: { status?: string; db?: string; redis?: string } | null;
  sourceMode?: "live" | "fallback";
  backendUrl?: string | null;
  syncEnabled?: boolean;
  error?: string;
};

type DebugResponse = {
  ok: boolean;
  error?: string;
  status?: DebugStatus;
  result?: {
    status?: string;
    records_seen?: number;
    records_written?: number;
  };
};

async function fetchStatus(): Promise<DebugStatus> {
  const response = await fetch("/api/sansaddarpan/debug-sync", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Debug status failed: ${response.status}`);
  }
  return response.json();
}

type SansadDarpanDebugPanelProps = {
  slug?: string;
};

export function SansadDarpanDebugPanel({ slug }: SansadDarpanDebugPanelProps) {
  const [status, setStatus] = useState<DebugStatus | null>(null);
  const [message, setMessage] = useState<string>("Loading live status…");
  const [isPending, startTransition] = useTransition();

  async function refreshStatus() {
    const value = await fetchStatus();
    setStatus(value);
    return value;
  }

  useEffect(() => {
    let cancelled = false;
    refreshStatus()
      .then((value) => {
        if (!cancelled) {
          setMessage("Ready");
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setMessage(error.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function runAction(action: "mp-identity" | "mp-participation", maxMembers?: number, targetSlug?: string) {
    startTransition(async () => {
      setMessage(
        action === "mp-identity"
          ? "Syncing MP roster…"
          : targetSlug
            ? `Syncing ${targetSlug}…`
            : `Syncing participation batch${maxMembers ? ` (${maxMembers})` : ""}…`,
      );
      const response = await fetch("/api/sansaddarpan/debug-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, maxMembers, slug: targetSlug }),
      });
      const payload = (await response.json()) as DebugResponse;
      if (!response.ok || !payload.ok) {
        setMessage(payload.error ?? "Debug sync failed");
        return;
      }
      if (payload.status) {
        setStatus(payload.status);
      }
      if (payload.result?.status === "queued") {
        setMessage(
          action === "mp-identity"
            ? "Roster sync queued. Use Refresh status after a few seconds."
            : targetSlug
              ? "Profile sync queued. Use Refresh status after a few seconds."
              : "Participation sync queued. Use Refresh status after a few seconds.",
        );
        return;
      }
      const recordsWritten = payload.result?.records_written;
      setMessage(
        action === "mp-identity"
          ? `Roster sync finished${typeof recordsWritten === "number" ? ` · ${recordsWritten} written` : ""}`
          : targetSlug
            ? `Profile sync finished${typeof recordsWritten === "number" ? ` · ${recordsWritten} written` : ""}`
            : `Participation sync finished${typeof recordsWritten === "number" ? ` · ${recordsWritten} written` : ""}`,
      );
    });
  }

  return (
    <section className="frame-panel full-width-panel sansaddarpan-debug-panel">
      <div className="section-heading compact-heading">
        <div>
          <p>Data status</p>
          <h2>Validate live SansadDarpan data from the UI</h2>
        </div>
      </div>
      <div className="sansaddarpan-debug-grid">
        <div className="sansaddarpan-debug-status">
          <strong>{status?.liveMpCount ?? 0}</strong>
          <span>MP scorecards currently visible</span>
          <small>{status?.methodologyVersion ?? "No methodology yet"}</small>
        </div>
        <div className="sansaddarpan-debug-status">
          <strong>{status?.sourceMode === "live" ? "live" : "fallback"}</strong>
          <span>Current data mode</span>
          <small>{status?.backendUrl?.replace(/^https?:\/\//, "") ?? "No backend configured"}</small>
        </div>
        <div className="sansaddarpan-debug-status">
          <strong>{status?.health?.status ?? "unknown"}</strong>
          <span>Backend health</span>
          <small>
            DB {status?.health?.db ?? "?"} · Redis {status?.health?.redis ?? "?"}
          </small>
        </div>
      </div>
      <p className="frame-note">{message}</p>
      <p className="frame-note">
        {status?.sourceMode === "live"
          ? "This page is reading the live backend response."
          : "This page is using fallback content because the backend response is unavailable or incomplete."}
      </p>
      <div className="hero-actions sansaddarpan-debug-actions">
        <button
          className="secondary-button button-link"
          type="button"
          onClick={() => runAction("mp-identity")}
          disabled={isPending || !status?.syncEnabled}
        >
          Sync MP roster
        </button>
        <button
          className="outline-button button-link"
          type="button"
          onClick={() => runAction("mp-participation", 120)}
          disabled={isPending || !status?.syncEnabled}
        >
          Sync participation batch
        </button>
        <button
          className="outline-button button-link"
          type="button"
          onClick={() => runAction("mp-participation", 300)}
          disabled={isPending || !status?.syncEnabled}
        >
          Sync larger batch
        </button>
        <button
          className="outline-button button-link"
          type="button"
          onClick={() =>
            startTransition(async () => {
              setMessage("Refreshing status…");
              try {
                await refreshStatus();
                setMessage("Status refreshed");
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Refresh failed");
              }
            })
          }
          disabled={isPending}
        >
          Refresh status
        </button>
        {slug ? (
          <button
            className="outline-button button-link"
            type="button"
            onClick={() => runAction("mp-participation", undefined, slug)}
            disabled={isPending || !status?.syncEnabled}
          >
            Sync this MP
          </button>
        ) : null}
      </div>
      {!status?.syncEnabled ? (
        <p className="frame-note">Manual sync is disabled until `SYNC_SHARED_SECRET` is configured in both Vercel and Render.</p>
      ) : null}
      {status?.sampleNames?.length ? (
        <ul className="sansaddarpan-debug-list">
          {status.sampleNames.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
