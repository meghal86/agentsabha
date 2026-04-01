import { createHmac } from "node:crypto";

import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const SECRET_KEY = process.env.SECRET_KEY ?? "development-secret";

type SyncAction = "status" | "mp-identity" | "mp-participation";

function base64Url(value: string) {
  return Buffer.from(value, "utf-8").toString("base64url");
}

function signAdminToken(ttlMinutes: number) {
  const payload = JSON.stringify(
    {
      purpose: "admin_auth",
      exp: Math.floor(Date.now() / 1000) + ttlMinutes * 60,
    },
    Object.keys({ purpose: "admin_auth", exp: 0 }).sort(),
  );
  const signature = createHmac("sha256", SECRET_KEY).update(payload).digest("base64url");
  return `${base64Url(payload)}.${signature}`;
}

async function getStatus() {
  const [healthResponse, mpsResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/health`, { cache: "no-store" }),
    fetch(`${API_BASE_URL}/api/sansaddarpan/mps`, { cache: "no-store" }),
  ]);

  const health = healthResponse.ok ? await healthResponse.json() : null;
  const mps = mpsResponse.ok ? await mpsResponse.json() : null;

  return {
    ok: healthResponse.ok && mpsResponse.ok,
    health,
    methodologyVersion: mps?.methodology_version ?? null,
    liveMpCount: Array.isArray(mps?.mps) ? mps.mps.length : 0,
    sampleNames: Array.isArray(mps?.mps) ? mps.mps.slice(0, 5).map((item: { name: string }) => item.name) : [],
  };
}

export async function GET() {
  try {
    const status = await getStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Debug status failed",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { action?: SyncAction; maxMembers?: number; slug?: string };
    const action = body.action;
    if (!action || action === "status") {
      return NextResponse.json(await getStatus());
    }

    const token = signAdminToken(30);
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    let response: Response;
    if (action === "mp-identity") {
      response = await fetch(`${API_BASE_URL}/api/sansaddarpan/admin/sync/mp-identity?async_mode=true`, {
        method: "POST",
        headers,
        cache: "no-store",
      });
    } else {
      const maxMembers = typeof body.maxMembers === "number" ? body.maxMembers : 120;
      const slugParam = body.slug ? `&slug=${encodeURIComponent(body.slug)}` : "";
      response = await fetch(
        `${API_BASE_URL}/api/sansaddarpan/admin/sync/mp-participation?async_mode=true&max_members=${encodeURIComponent(String(maxMembers))}${slugParam}`,
        {
          method: "POST",
          headers,
          cache: "no-store",
        },
      );
    }

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: payload?.detail ?? `Sync failed with ${response.status}`,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      ok: true,
      action,
      result: payload,
      status: await getStatus(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Debug sync failed",
      },
      { status: 500 },
    );
  }
}
