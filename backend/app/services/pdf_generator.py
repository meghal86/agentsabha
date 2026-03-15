from __future__ import annotations


class PDFGeneratorService:
    async def render_brief(self, payload: dict) -> bytes:
        header = payload.get("header", {})
        issues = payload.get("top_issues", [])
        questions = payload.get("draft_questions", [])
        tatkal_alert = payload.get("tatkal_alert")
        empty_issue_row = '<tr><td colspan="5">No issues available</td></tr>'
        empty_question_row = "<li>No draft questions available</li>"
        issue_rows = "".join(
            f"<tr><td>{item.get('label') or 'Issue'}</td><td>{item.get('category') or 'other'}</td><td>{item.get('reports_this_week', 0)}</td><td>{item.get('severity', '—')}</td><td>{item.get('badge') or 'stable'}</td></tr>"
            for item in issues
        )
        question_rows = "".join(
            f"<li><strong>{item.get('ministry') or 'Concerned Ministry'}</strong> — {item.get('content') or ''}</li>"
            for item in questions
        )
        html = f"""
        <html>
          <body style="font-family: sans-serif; color: #1B2A4A; padding: 24px;">
            <h1 style="margin: 0 0 8px;">AgentSabha Co-Pilot</h1>
            <p style="margin: 0 0 16px;">{header.get('constituency', 'Constituency')} · Week of {header.get('week_date', '')}</p>
            <h2>Top 5 Issues This Week</h2>
            <table style="width: 100%; border-collapse: collapse;" border="1" cellspacing="0" cellpadding="6">
              <thead><tr><th>Issue</th><th>Category</th><th>Reports</th><th>Severity</th><th>Badge</th></tr></thead>
              <tbody>{issue_rows or empty_issue_row}</tbody>
            </table>
            <h2>Draft Parliamentary Questions</h2>
            <ol>{question_rows or empty_question_row}</ol>
            <h2>Tatkal Alert</h2>
            <p>{tatkal_alert or 'No tatkal alert this week.'}</p>
          </body>
        </html>
        """
        try:
            from weasyprint import HTML

            return HTML(string=html).write_pdf()
        except Exception:
            return html.encode("utf-8")
