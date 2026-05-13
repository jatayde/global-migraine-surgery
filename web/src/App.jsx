import { useEffect, useState } from "react";
import WorldMap from "./WorldMap";

const TABS = [
  {
    key: "surgery",
    label: "Surgery Eligible Cases",
    valueKey: "Surgery Eligible Cases Raw",
    displayKey: "Surgery Eligible Cases",
  },
  {
    key: "dalys",
    label: "DALYs",
    valueKey: "DALYs Surgery Eligible Cases Raw",
    displayKey: "DALYs Surgery Eligible Cases",
  },
  {
    key: "cost",
    label: "Total Cost (USD)",
    valueKey: "Total Cost USD",
    displayKey: "Total Cost Display",
  },
];

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("surgery");

  useEffect(() => {
    fetch("data.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p style={{ padding: "2rem", color: "red" }}>Error loading data: {error}</p>;
  if (!data) return <p style={{ padding: "2rem" }}>Loading…</p>;

  const tab = TABS.find((t) => t.key === activeTab);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 1200, margin: "0 auto", padding: "2rem 2rem" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "#111827", lineHeight: 1.4 }}>
        Migraine Surgery Demand Worldwide: A Global Burden of Disease Modeling Study
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: "1rem", borderBottom: "2px solid #e5e7eb" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "8px 16px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: activeTab === t.key ? 600 : 400,
              color: activeTab === t.key ? "#1e3a8a" : "#6b7280",
              borderBottom: activeTab === t.key ? "2px solid #1e3a8a" : "2px solid transparent",
              marginBottom: -2,
              transition: "color 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <WorldMap data={data} valueKey={tab.valueKey} displayKey={tab.displayKey} />

      <footer style={{ marginTop: "1rem", textAlign: "right", fontSize: 11, color: "#9ca3af" }}>
        Department of Plastic and Reconstructive Surgery, College of Medicine,<br />
        The Ohio State University Wexner Medical Center
      </footer>
    </div>
  );
}
