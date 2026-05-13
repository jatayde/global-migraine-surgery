import { useState, useMemo, useRef } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLog } from "d3-scale";
import { NAME_MAP } from "./countryIso";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const DISPLAY_NAME = { "C√¥te d'Ivoire": "Côte d'Ivoire" };
const cleanName = (n) => (DISPLAY_NAME[n] ?? n)?.trim();

export default function WorldMap({ data, valueKey, displayKey }) {
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const lookup = useMemo(() => {
    const map = {};
    for (const row of data) {
      const topoName = NAME_MAP[row.Country] ?? row.Country;
      map[topoName] = row;
    }
    return map;
  }, [data]);

  const maxVal = useMemo(
    () => Math.max(...data.map((r) => r[valueKey] ?? 0).filter(isFinite)),
    [data, valueKey]
  );

  const colorScale = useMemo(() => {
    const m = Math.max(maxVal, 2);
    return scaleLog()
      .domain([1, m ** 0.25, m ** 0.5, m ** 0.75, m])
      .range(["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"])
      .clamp(true);
  }, [maxVal]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <ComposableMap projectionConfig={{ scale: 175 }}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const row = lookup[geo.properties.name];
              const val = row?.[valueKey];
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={val != null ? colorScale(val) : "#e5e7eb"}
                  stroke="#fff"
                  strokeWidth={0.4}
                  onMouseMove={
                    row
                      ? (e) => {
                          const rect =
                            containerRef.current.getBoundingClientRect();
                          setTooltip({
                            x: e.clientX - rect.left + 14,
                            y: e.clientY - rect.top - 10,
                            country: cleanName(row.Country),
                            display: row[displayKey],
                          });
                        }
                      : undefined
                  }
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", opacity: 0.75 },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            background: "#fff",
            border: "1px solid #d1d5db",
            padding: "6px 10px",
            borderRadius: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            fontSize: 13,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{tooltip.country}</div>
          <div style={{ color: "#374151" }}>{tooltip.display ?? "No data"}</div>
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 16px 8px",
          fontSize: 12,
          color: "#6b7280",
        }}
      >
        <span>Low</span>
        <div
          style={{
            flex: 1,
            maxWidth: 200,
            height: 10,
            borderRadius: 4,
            background: "linear-gradient(to right, #ffffcc, #a1dab4, #41b6c4, #2c7fb8, #253494)",
          }}
        />
        <span>High</span>
        <span style={{ marginLeft: 12, color: "#9ca3af" }}>
          ■ No data
        </span>
      </div>
    </div>
  );
}
