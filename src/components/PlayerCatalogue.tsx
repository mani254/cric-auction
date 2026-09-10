"use client";

import React, { useState } from "react";
import { IPlayer } from "@/types";
import { Search, ChevronLeft, ChevronRight, Play, Eye, CheckCircle, XCircle } from "lucide-react";

interface PlayerCatalogueProps {
  players: IPlayer[];
  currentPlayerId: number | null;
  onSelectPlayer: (playerId: number) => void;
  loading: boolean;
}

export const PlayerCatalogue: React.FC<PlayerCatalogueProps> = ({
  players,
  currentPlayerId,
  onSelectPlayer,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const formatINR = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "—";
    return "₹" + val.toLocaleString("en-IN");
  };

  const filteredPlayers = players.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || p.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || p.auctionStatus === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const currentIndex = players.findIndex((p) => p.id === currentPlayerId);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectPlayer(players[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < players.length - 1) {
      onSelectPlayer(players[currentIndex + 1].id);
    } else if (currentIndex === -1 && players.length > 0) {
      onSelectPlayer(players[0].id);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: "28px", background: "#ffffff" }}>
      {/* Top Header & Navigation Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h3
            className="font-display"
            style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--text-primary)" }}
          >
            PLAYER ROSTER ({filteredPlayers.length} / {players.length})
          </h3>

          {/* Quick Nav Prev/Next Buttons */}
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={handlePrev}
              disabled={loading || currentIndex <= 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "8px",
                background: "#ffffff",
                border: "1px solid var(--border-subtle)",
                color: currentIndex <= 0 ? "var(--text-light)" : "var(--text-primary)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: currentIndex <= 0 ? "not-allowed" : "pointer",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              onClick={handleNext}
              disabled={loading || currentIndex >= players.length - 1}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "8px",
                background: "#ffffff",
                border: "1px solid var(--border-subtle)",
                color: currentIndex >= players.length - 1 ? "var(--text-light)" : "var(--text-primary)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: currentIndex >= players.length - 1 ? "not-allowed" : "pointer",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div
          style={{
            position: "relative",
            width: "300px",
          }}
        >
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search player by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 14px 9px 36px",
              background: "#f8fafc",
              border: "1px solid var(--border-subtle)",
              borderRadius: "10px",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Filters (Roles and Status) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {/* Role Filters */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["ALL", "All Rounder", "Batsman", "Bowler", "Wicket Keeper"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                border:
                  roleFilter === role
                    ? "1px solid #0284c7"
                    : "1px solid var(--border-subtle)",
                background: roleFilter === role ? "#e0f2fe" : "#ffffff",
                color: roleFilter === role ? "#0369a1" : "var(--text-secondary)",
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.15s",
              }}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { label: "ALL", val: "ALL" },
            { label: "NOT AUCTIONED", val: "NOT_STARTED" },
            { label: "CURRENT", val: "CURRENT" },
            { label: "SOLD", val: "SOLD" },
            { label: "UNSOLD", val: "UNSOLD" },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setStatusFilter(item.val)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                border:
                  statusFilter === item.val
                    ? "1px solid #0f172a"
                    : "1px solid var(--border-subtle)",
                background: statusFilter === item.val ? "#0f172a" : "#ffffff",
                color: statusFilter === item.val ? "#ffffff" : "var(--text-muted)",
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.15s",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
          <thead>
            <tr
              style={{
                borderBottom: "2px solid #e2e8f0",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                fontSize: "0.7rem",
                fontWeight: 800,
                letterSpacing: "0.06em",
              }}
            >
              <th style={{ padding: "12px 14px" }}>#</th>
              <th style={{ padding: "12px 14px" }}>Player</th>
              <th style={{ padding: "12px 14px" }}>Role & Style</th>
              <th style={{ padding: "12px 14px" }}>Base Price</th>
              <th style={{ padding: "12px 14px" }}>Auction Status</th>
              <th style={{ padding: "12px 14px" }}>Owner Team</th>
              <th style={{ padding: "12px 14px" }}>Sold Price</th>
              <th style={{ padding: "12px 14px", textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((p) => {
                const isCurrent = p.id === currentPlayerId;
                const isSold = p.auctionStatus === "SOLD";
                const isUnsold = p.auctionStatus === "UNSOLD";

                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      background: isCurrent ? "#f0f9ff" : "transparent",
                      transition: "background 0.15s",
                    }}
                    onMouseOver={(e) => {
                      if (!isCurrent) e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseOut={(e) => {
                      if (!isCurrent) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <td style={{ padding: "12px 14px", color: "var(--text-muted)", fontWeight: 700 }}>
                      {p.id}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>{p.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {p.statistics?.runs} runs • {p.statistics?.wickets} wkts
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ color: "#d97706", fontWeight: 700 }}>{p.role}</span>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {p.battingStyle} | {p.bowlingStyle || "None"}
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {formatINR(p.basePrice)}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {p.auctionStatus === "CURRENT" && (
                        <span className="badge badge-current">CURRENT</span>
                      )}
                      {p.auctionStatus === "SOLD" && (
                        <span className="badge badge-sold">SOLD</span>
                      )}
                      {p.auctionStatus === "UNSOLD" && (
                        <span className="badge badge-unsold">UNSOLD</span>
                      )}
                      {p.auctionStatus === "NOT_STARTED" && (
                        <span className="badge badge-not-started">UPCOMING</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {p.teamName ? (
                        <span
                          style={{
                            fontWeight: 800,
                            color:
                              p.teamId === "team-a"
                                ? "var(--team-a)"
                                : p.teamId === "team-b"
                                ? "var(--team-b)"
                                : "var(--team-c)",
                          }}
                        >
                          {p.teamName}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontWeight: 800,
                        color: p.soldPrice ? "#059669" : "var(--text-muted)",
                      }}
                    >
                      {formatINR(p.soldPrice)}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <button
                        onClick={() => onSelectPlayer(p.id)}
                        disabled={loading || isCurrent}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "0.78rem",
                          fontWeight: 800,
                          cursor: isCurrent || loading ? "not-allowed" : "pointer",
                          border: isCurrent
                            ? "1px solid #0284c7"
                            : isSold || isUnsold
                            ? "1px solid #cbd5e1"
                            : "1px solid #0284c7",
                          background: isCurrent
                            ? "#0284c7"
                            : isSold || isUnsold
                            ? "#ffffff"
                            : "#f0f9ff",
                          color: isCurrent
                            ? "#ffffff"
                            : isSold || isUnsold
                            ? "var(--text-secondary)"
                            : "#0369a1",
                          boxShadow: "var(--shadow-sm)",
                          transition: "all 0.15s",
                        }}
                      >
                        {isSold || isUnsold ? (
                          <>
                            <Eye size={13} />
                            VIEW DETAILS
                          </>
                        ) : isCurrent ? (
                          <>
                            <Play size={12} fill="#ffffff" />
                            ON STAGE
                          </>
                        ) : (
                          <>
                            <Play size={12} fill="currentColor" />
                            AUCTION
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
                  No players match the current search or filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
