import { useState } from "react";

const endpoints = [
  {
    method: "GET",
    path: "/api/seedling/history",
    desc: "Paginated raw rows for the table view.",
    params: [
      "from (ISO)",
      "to (ISO)",
      "page (default 1)",
      "pageSize (default 50, max 200)",
      "sortBy (default receivedAt)",
      "order (asc|desc)",
    ],
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    response: `{ data: Row[], total: number, page: number, pageSize: number, totalPages: number }`,
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    sql: `SELECT * FROM seedling_data\nWHERE receivedAt BETWEEN ? AND ?\nORDER BY receivedAt DESC\nLIMIT ? OFFSET ?\n\n-- count:\nSELECT COUNT(*) as total FROM seedling_data\nWHERE receivedAt BETWEEN ? AND ?`,
  },
  {
    method: "GET",
    path: "/api/seedling/chart",
    desc: "Hourly-averaged sensor + actuator data for charts. Always returns aggregated data regardless of range size.",
    params: ["from (ISO)", "to (ISO)"],
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    response: `{ data: [{ hour, avgTemp, avgHumid, avgLux, lightOnPct, fanOnPct, mistOnPct }] }`,
    sql: `SELECT\n  strftime('%Y-%m-%dT%H:00:00Z', receivedAt) AS hour,\n  AVG(tempLvl)       AS avgTemp,\n  AVG(moistureLvl)   AS avgHumid,\n  AVG(luxLvl)        AS avgLux,\n  AVG(CASE WHEN isLightOn  = 1 THEN 1.0 ELSE 0.0 END) AS lightOnPct,\n  AVG(CASE WHEN isFanOn    = 1 THEN 1.0 ELSE 0.0 END) AS fanOnPct,\n  AVG(CASE WHEN isMistingOn= 1 THEN 1.0 ELSE 0.0 END) AS mistOnPct\nFROM seedling_data\nWHERE receivedAt BETWEEN ? AND ?\n  AND shtError = 0 AND luxError = 0\nGROUP BY hour\nORDER BY hour ASC`,
  },
  {
    method: "GET",
    path: "/api/seedling/export",
    desc: "All rows for a given range — no pagination. Used for CSV export. For 100k+ rows, stream the response as newline-delimited JSON or generate CSV server-side with a ReadableStream.",
    params: ["from (ISO)", "to (ISO)"],
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    response: `Row[]  (all fields, no pagination wrapper)`,
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    sql: `SELECT * FROM seedling_data\nWHERE receivedAt BETWEEN ? AND ?\nORDER BY receivedAt DESC\n-- No LIMIT — returns full range\n-- Add index: CREATE INDEX idx_ts ON seedling_data(receivedAt)`,
  },
];

function ApiDocs() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {endpoints.map((ep, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={i}
          style={{
            background: "var(--surf)",
            border: "1px solid var(--bdr)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%",
              padding: "14px 20px",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              textAlign: "left",
            }}
          >
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 5,
                fontSize: "0.66rem",
                fontWeight: 800,
                letterSpacing: "0.1em",
                background: "rgba(61,220,122,0.15)",
                color: "var(--accent)",
                border: "1px solid rgba(61,220,122,0.3)",
              }}
            >
              {ep.method}
            </span>
            <span
              style={{
                fontFamily: "'Courier Prime',monospace",
                fontSize: "0.82rem",
                color: "var(--text)",
              }}
            >
              {ep.path}
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.72rem",
                color: "var(--text-s)",
              }}
            >
              {ep.desc.slice(0, 55)}
              {ep.desc.length > 55 ? "…" : ""}
            </span>
            <span style={{ color: "var(--text-m)", fontSize: "0.8rem" }}>
              {open === i ? "▲" : "▼"}
            </span>
          </button>

          {open === i && (
            <div
              style={{
                padding: "0 20px 18px",
                borderTop: "1px solid var(--bdr)",
              }}
            >
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-s)",
                  margin: "12px 0 10px",
                }}
              >
                {ep.desc}
              </p>

              <div
                style={{
                  fontSize: "0.68rem",
                  color: "var(--text-m)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  marginTop: 12,
                }}
              >
                Parameters
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                {ep.params.map((p) => (
                  <code
                    key={p}
                    style={{
                      fontFamily: "'Courier Prime',monospace",
                      fontSize: "0.72rem",
                      background: "var(--surf2)",
                      border: "1px solid var(--bdr)",
                      borderRadius: 5,
                      padding: "2px 8px",
                      color: "var(--blue)",
                    }}
                  >
                    {p}
                  </code>
                ))}
              </div>

              <div
                style={{
                  fontSize: "0.68rem",
                  color: "var(--text-m)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Response
              </div>
              <pre
                style={{
                  fontFamily: "'Courier Prime',monospace",
                  fontSize: "0.72rem",
                  background: "var(--surf2)",
                  border: "1px solid var(--bdr)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "var(--text-s)",
                  margin: "0 0 12px",
                  overflowX: "auto",
                  lineHeight: 1.6,
                }}
              >
                {ep.response}
              </pre>

              <div
                style={{
                  fontSize: "0.68rem",
                  color: "var(--text-m)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                D1 SQL
              </div>
              <pre
                style={{
                  fontFamily: "'Courier Prime',monospace",
                  fontSize: "0.72rem",
                  background: "var(--surf2)",
                  border: "1px solid var(--bdr)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "var(--accent)",
                  margin: 0,
                  overflowX: "auto",
                  lineHeight: 1.6,
                }}
              >
                {ep.sql}
              </pre>
            </div>
          )}
        </div>
      ))}

      <div
        style={{
          background: "var(--amb-a)",
          border: "1px solid rgba(245,166,35,0.3)",
          borderRadius: 12,
          padding: "12px 16px",
          fontSize: "0.75rem",
          color: "var(--amber)",
          lineHeight: 1.7,
        }}
      >
        <strong>⚠ Backend considerations for 100k+ rows</strong>
        <br />• Add{" "}
        <code style={{ fontFamily: "monospace" }}>
          CREATE INDEX idx_ts ON seedling_data(receivedAt)
        </code>{" "}
        — all three queries filter on receivedAt.
        <br />• The <strong>chart endpoint</strong> is safe at any scale — it aggregates server-side
        (100k rows → ~720 hourly averages).
        <br />• The <strong>export endpoint</strong> can return large payloads. Use a Cloudflare
        Worker ReadableStream to avoid memory limits.
        <br />• D1 free tier: 5M reads/day. A full 100k-row export costs 100k reads — budget ~50
        exports/day before hitting the limit.
      </div>
    </div>
  );
}

export default ApiDocs;
