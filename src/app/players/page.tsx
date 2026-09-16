"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IPlayer, ITeam } from "@/types";
import { Search, ArrowLeft, Filter } from "lucide-react";

export default function PlayersPage() {
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [teamFilter, setTeamFilter] = useState("ALL");
  const [selectedPlayer, setSelectedPlayer] = useState<IPlayer | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, tRes] = await Promise.all([
          fetch("/api/auction?includePlayers=true"),
          fetch("/api/teams"),
        ]);
        const aData = await aRes.json();
        const tData = await tRes.json();
        if (aData.success) setPlayers(aData.players || []);
        if (tData.success) setTeams(tData.teams || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredPlayers = players.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || p.role === roleFilter;
    const matchStatus = statusFilter === "ALL" || p.auctionStatus === statusFilter;
    const matchTeam = teamFilter === "ALL" || p.teamId === teamFilter || (teamFilter === "UNSOLD_OR_NOT_STARTED" && !p.teamId);
    return matchSearch && matchRole && matchStatus && matchTeam;
  });

  const statusColors: Record<string, string> = { NOT_STARTED: "#64748b", CURRENT: "#0284c7", SOLD: "#059669", UNSOLD: "#dc2626" };
  const statusLabels: Record<string, string> = { NOT_STARTED: "Not Auctioned", CURRENT: "Live", SOLD: "Sold", UNSOLD: "Unsold" };

  const filterBtnStyle = (active: boolean, color = "#0284c7"): React.CSSProperties => ({
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "0.78rem",
    fontWeight: 700,
    cursor: "pointer",
    border: active ? `1px solid ${color}` : "1px solid #e2e8f0",
    background: active ? `${color}15` : "#ffffff",
    color: active ? color : "#64748b",
    transition: "all 0.15s",
  });

  const formatINR = (v: number | null | undefined) => v != null ? `₹${v.toLocaleString("en-IN")}` : "—";

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Navbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "12px 28px", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 3px 0 rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
              <ArrowLeft size={16} /> Back to Auction
            </Link>
            <div style={{ width: "1px", height: "20px", background: "#e2e8f0" }} />
            <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#0f172a" }}>
              Player Roster
            </h1>
            <span style={{ background: "#e0f2fe", color: "#0284c7", borderRadius: "20px", padding: "2px 10px", fontSize: "0.78rem", fontWeight: 700 }}>
              {filteredPlayers.length} / {players.length}
            </span>
          </div>
          <div style={{ position: "relative" }}>
            <Search size={15} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search player..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "9px 14px 9px 34px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "0.85rem", outline: "none", width: "220px", background: "#f8fafc" }}
            />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 28px" }}>
        {/* Filters */}
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "16px 20px", marginBottom: "20px", boxShadow: "0 1px 4px 0 rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Filter size={14} color="#64748b" />
            <span style={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase" }}>Filters</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
            {/* Status filter */}
            <div>
              <div style={{ color: "#94a3b8", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>Status</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[{ v: "ALL", l: "All" }, { v: "NOT_STARTED", l: "Not Auctioned" }, { v: "CURRENT", l: "Live" }, { v: "SOLD", l: "Sold" }, { v: "UNSOLD", l: "Unsold" }].map((s) => (
                  <button key={s.v} onClick={() => setStatusFilter(s.v)} style={filterBtnStyle(statusFilter === s.v, statusColors[s.v] || "#0284c7")}>{s.l}</button>
                ))}
              </div>
            </div>

            {/* Role filter */}
            <div>
              <div style={{ color: "#94a3b8", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>Role</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["ALL", "Batsman", "Bowler", "All Rounder", "Wicket Keeper"].map((r) => (
                  <button key={r} onClick={() => setRoleFilter(r)} style={filterBtnStyle(roleFilter === r)}>{r === "ALL" ? "All Roles" : r}</button>
                ))}
              </div>
            </div>

            {/* Team filter */}
            <div>
              <div style={{ color: "#94a3b8", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>Team</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button onClick={() => setTeamFilter("ALL")} style={filterBtnStyle(teamFilter === "ALL")}>All Teams</button>
                {teams.map((t) => (
                  <button key={t.id} onClick={() => setTeamFilter(t.id)} style={filterBtnStyle(teamFilter === t.id, t.color)}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team Summary Cards */}
        {teamFilter !== "ALL" && (() => {
          const t = teams.find((t) => t.id === teamFilter);
          if (!t) return null;
          return (
            <div style={{ background: "#fff", borderRadius: "14px", border: `2px solid ${t.color}44`, padding: "20px", marginBottom: "20px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: "0 0 auto" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: t.color }} />
                <span style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a" }}>{t.name}</span>
              </div>
              {[["Budget", `₹${t.initialBudget.toLocaleString("en-IN")}`], ["Spent", `₹${t.totalSpent.toLocaleString("en-IN")}`], ["Remaining", `₹${t.remainingBudget.toLocaleString("en-IN")}`], ["Players", t.playerCount]].map(([l, v]) => (
                <div key={l as string} style={{ padding: "8px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ color: "#94a3b8", fontSize: "0.7rem", fontWeight: 700 }}>{l}</div>
                  <div style={{ color: "#0f172a", fontWeight: 800, fontSize: "0.95rem" }}>{v}</div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "80px" }}>Loading roster...</div>
        ) : (
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 4px 0 rgba(0,0,0,0.04)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#94a3b8", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>#</th>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>Player</th>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>Role</th>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>Batting</th>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>Base Price</th>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>Team / Sold For</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>Stats</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>No players match the selected filters</td>
                  </tr>
                ) : (
                  filteredPlayers.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.1s" }}
                      onClick={() => setSelectedPlayer(p)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                      <td style={{ padding: "10px 16px", color: "#94a3b8", fontWeight: 600 }}>{p.id}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden", background: "#e2e8f0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <span style={{ color: "#64748b", fontWeight: 800, fontSize: "0.9rem" }}>{p.name.charAt(0)}</span>
                            )}
                          </div>
                          <span style={{ fontWeight: 700, color: "#0f172a" }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 16px", color: "#475569" }}>{p.role}</td>
                      <td style={{ padding: "10px 16px", color: "#64748b" }}>{p.battingStyle === "RHB" ? "Right Hand" : "Left Hand"}</td>
                      <td style={{ padding: "10px 16px", color: "#475569", fontWeight: 600 }}>{formatINR(p.basePrice)}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, background: `${statusColors[p.auctionStatus]}15`, color: statusColors[p.auctionStatus] }}>
                          {statusLabels[p.auctionStatus]}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        {p.auctionStatus === "SOLD" ? (
                          <div>
                            <div style={{ fontWeight: 700, color: "#059669" }}>{p.teamName}</div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{formatINR(p.soldPrice)}</div>
                          </div>
                        ) : <span style={{ color: "#94a3b8" }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 16px", textAlign: "right" }}>
                        <span style={{ color: "#0284c7", fontSize: "0.8rem", fontWeight: 600 }}>View →</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={() => setSelectedPlayer(null)}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "680px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", background: "#e2e8f0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {selectedPlayer.imageUrl ? (
                  <img src={selectedPlayer.imageUrl} alt={selectedPlayer.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "2rem", fontWeight: 900, color: "#64748b" }}>{selectedPlayer.name.charAt(0)}</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: "0 0 4px", fontSize: "1.4rem", fontWeight: 900 }}>{selectedPlayer.name}</h2>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ background: "#e0f2fe", color: "#0284c7", borderRadius: "6px", padding: "2px 10px", fontSize: "0.78rem", fontWeight: 700 }}>{selectedPlayer.role}</span>
                  <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: "6px", padding: "2px 10px", fontSize: "0.78rem", fontWeight: 700 }}>{selectedPlayer.battingStyle}</span>
                  {selectedPlayer.bowlingStyle && <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: "6px", padding: "2px 10px", fontSize: "0.78rem", fontWeight: 700 }}>{selectedPlayer.bowlingStyle}</span>}
                  <span style={{ background: `${statusColors[selectedPlayer.auctionStatus]}15`, color: statusColors[selectedPlayer.auctionStatus], borderRadius: "6px", padding: "2px 10px", fontSize: "0.78rem", fontWeight: 700 }}>
                    {statusLabels[selectedPlayer.auctionStatus]}{selectedPlayer.teamName ? ` · ${selectedPlayer.teamName}` : ""}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedPlayer(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}>✕</button>
            </div>

            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                {[["Base Price", formatINR(selectedPlayer.basePrice)], ["Sold Price", selectedPlayer.soldPrice ? formatINR(selectedPlayer.soldPrice) : "—"], ["Team", selectedPlayer.teamName || "—"]].map(([l, v]) => (
                  <div key={l as string} style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <div style={{ color: "#94a3b8", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "2px" }}>{l}</div>
                    <div style={{ color: "#0f172a", fontWeight: 800, fontSize: "1rem" }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Batting Stats */}
              <h3 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Batting</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "20px" }}>
                {[["Matches", selectedPlayer.statistics.matches], ["Innings", selectedPlayer.statistics.battingInnings], ["Runs", selectedPlayer.statistics.runs], ["HS", selectedPlayer.statistics.hs || "—"], ["Avg", selectedPlayer.statistics.avg ?? "—"], ["SR", selectedPlayer.statistics.sr ?? "—"], ["50s", selectedPlayer.statistics.s50], ["100s", selectedPlayer.statistics.s100], ["30s", selectedPlayer.statistics.s30], ["4s", selectedPlayer.statistics.s4], ["6s", selectedPlayer.statistics.s6], ["Ducks", selectedPlayer.statistics.ducks]].map(([l, v]) => (
                  <div key={l as string} style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ color: "#94a3b8", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>{l}</div>
                    <div style={{ color: "#0f172a", fontWeight: 800, fontSize: "0.9rem" }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Bowling Stats */}
              <h3 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Bowling</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {[["Innings", selectedPlayer.statistics.bowlingInnings], ["Overs", selectedPlayer.statistics.overs ?? "—"], ["Wickets", selectedPlayer.statistics.wickets], ["Best", selectedPlayer.statistics.bestBowling || "—"], ["Econ", selectedPlayer.statistics.economy ?? "—"], ["3W", selectedPlayer.statistics.w3], ["5W", selectedPlayer.statistics.w5], ["Maidens", selectedPlayer.statistics.maidens]].map(([l, v]) => (
                  <div key={l as string} style={{ padding: "8px 10px", background: "#f0fdf4", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ color: "#6b7280", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>{l}</div>
                    <div style={{ color: "#0f172a", fontWeight: 800, fontSize: "0.9rem" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
