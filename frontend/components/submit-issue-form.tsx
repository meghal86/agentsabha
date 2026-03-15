"use client";

import { FormEvent, useState } from "react";
import { defaultPilotConstituency, phaseOnePilotConstituencies } from "@/lib/pilot";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type SubmitState =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success"; issueId: string; processingStatus: string }
  | { type: "error"; message: string };

export function SubmitIssueForm() {
  const [mobile, setMobile] = useState("+919999999999");
  const [constituencyId, setConstituencyId] = useState(String(defaultPilotConstituency.id));
  const [otp, setOtp] = useState("123456");
  const [language, setLanguage] = useState("en");
  const [issueText, setIssueText] = useState("");
  const [location, setLocation] = useState("Ward 14");
  const [state, setState] = useState<SubmitState>({ type: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ type: "submitting" });

    try {
      const verifyResponse = await fetch(`${API_BASE_URL}/api/citizen/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_e164: mobile, constituency_id: Number(constituencyId) }),
      });
      if (!verifyResponse.ok) throw new Error("Verification start failed");
      const verifyPayload = await verifyResponse.json();

      const confirmResponse = await fetch(`${API_BASE_URL}/api/citizen/verify/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_token: verifyPayload.session_token,
          otp,
          age_verified: true,
          consent_flags: {
            issue_storage: true,
            mapping: true,
            aggregation: true,
            mp_brief: false,
          },
        }),
      });
      if (!confirmResponse.ok) throw new Error("Verification confirm failed");
      const confirmPayload = await confirmResponse.json();

      const submitResponse = await fetch(`${API_BASE_URL}/api/citizen/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${confirmPayload.jwt}`,
        },
        body: JSON.stringify({
          text: issueText,
          constituency_id: Number(constituencyId),
          language,
          location,
        }),
      });
      if (!submitResponse.ok) {
        const errorBody = await submitResponse.text();
        throw new Error(errorBody || "Issue submission failed");
      }
      const submitPayload = await submitResponse.json();
      setState({ type: "success", issueId: submitPayload.issue_id, processingStatus: submitPayload.processing_status });
      setIssueText("");
    } catch (error) {
      setState({ type: "error", message: error instanceof Error ? error.message : "Unknown submission error" });
    }
  }

  return (
    <form className="issue-form" onSubmit={handleSubmit}>
      <label>
        <span>Step 0 — Mobile verification</span>
        <input type="text" value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="+91..." />
        <small>Development flow uses the live citizen verify endpoints.</small>
      </label>

      <label>
        <span>Step 1 — Constituency</span>
        <input type="text" value={constituencyId} onChange={(event) => setConstituencyId(event.target.value)} placeholder="PIN code ya constituency ka naam..." />
        <small>
          Use constituency id for now. Phase 1 pilot desks are{" "}
          {phaseOnePilotConstituencies.map((item) => `${item.id} (${item.name})`).join(", ")}.
        </small>
      </label>

      <label>
        <span>OTP</span>
        <input type="text" value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="123456" />
        <small>Sandbox-friendly for the current build.</small>
      </label>

      <label>
        <span>Step 2 — Issue</span>
        <textarea rows={6} value={issueText} onChange={(event) => setIssueText(event.target.value)} placeholder="Hindi, English, ya apni bhasha mein likhein... (any language)" required></textarea>
        <div className="field-tools">
          <button type="button">🎙 Voice input / आवाज़</button>
          <button type="button">📷 Photo upload / फोटो</button>
          <small>{issueText.length} / 500 • अक्षर / characters</small>
        </div>
      </label>

      <label>
        <span>Language</span>
        <input type="text" value={language} onChange={(event) => setLanguage(event.target.value)} placeholder="en / hi / bn ..." />
      </label>

      <label>
        <span>Location note</span>
        <input type="text" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Ward / mohalla / area" />
      </label>

      <fieldset>
        <legend>Step 3 — Category (optional)</legend>
        <div className="category-stamps">
          <button className="stamp-badge road selected" type="button">🛣️ सड़क</button>
          <button className="stamp-badge water" type="button">💧 पानी</button>
          <button className="stamp-badge electricity" type="button">⚡ बिजली</button>
          <button className="stamp-badge health" type="button">🏥 स्वास्थ्य</button>
          <button className="stamp-badge education" type="button">📚 शिक्षा</button>
          <button className="stamp-badge sanitation" type="button">🗑️ सफाई</button>
          <button className="stamp-badge neutral" type="button">Ya AI detect karne do</button>
        </div>
      </fieldset>

      <button className="submit-button" type="submit" disabled={state.type === "submitting"}>
        {state.type === "submitting" ? "Submitting..." : "Submit / दर्ज करें →"}
      </button>

      {state.type === "success" ? (
        <div className="quote-strip" style={{ marginTop: 18 }}>
          <span className="quote-mark">✓</span>
          <div>
            <p>Issue recorded successfully.</p>
            <span>
              Issue ID: {state.issueId} • Processing: {state.processingStatus}
            </span>
          </div>
        </div>
      ) : null}

      {state.type === "error" ? (
        <div className="quote-strip" style={{ marginTop: 18 }}>
          <span className="quote-mark">!</span>
          <div>
            <p>Submission failed.</p>
            <span>{state.message}</span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
