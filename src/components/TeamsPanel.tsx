"use client";

import React, { useState } from "react";
import { ITeam, IAuctionState } from "@/types";
import { Users, ChevronDown, ChevronUp, Check, Shield } from "lucide-react";

interface TeamsPanelProps {
  teams: ITeam[];
  auctionState: IAuctionState;
  onSelectTeam: (teamId: string) => void;
}

export const TeamsPanel: React.FC<TeamsPanelProps> = ({
  teams,
  auctionState,
  onSelectTeam,
}) => {
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const formatINR = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "—";
    return "₹" + val.toLocaleString("en-IN");
  };

  const toggleExpand = (teamId: string) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "4px 2px",
        }}
      >
        <h3
          className="font-display"
          style={{
            fontSize: "1.1rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--text-secondary)",
          }}
        >
          FRANCHISE DASHBOARD
        </h3>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
          3 Active Franchises
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {teams.map((team) => {
          const isSelected = auctionState.currentTeamId === team.id;
          const isExpanded = expandedTeamId === team.id;
          const percentageUsed =
            team.initialBudget > 0
              ? Math.min(100, Math.round((team.totalSpent / team.initialBudget) * 100))
              : 0;

          return (
            <div
              key={team.id}
              className="glass-panel"
              style={{
                padding: "20px",
                border: isSelected
                  ? `2px solid ${team.color}`
                  : "1px solid var(--border-subtle)",
                borderRadius: "16px",
                background: isSelected ? "#ffffff" : "#ffffff",
                boxShadow: isSelected
                  ? `0 8px 24px -4px ${team.color}25, 0 4px 8px -2px rgba(0,0,0,0.04)`
                  : "var(--shadow-md)",
                transition: "all 0.2s",
              }}
            >
              {/* Team Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "4px",
                      background: team.color,
                    }}
                  />
                  <h4
                    className="font-display"
                    style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--text-primary)" }}
                  >
                    {team.name}
                  </h4>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: "#f1f5f9",
                      color: "var(--text-muted)",
                      fontWeight: 700,
                    }}
                  >
                    {team.shortName}
                  </span>
                </div>

                <button
                  onClick={() => onSelectTeam(team.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    border: isSelected
                      ? `1px solid ${team.color}`
                      : "1px solid var(--border-subtle)",
                    background: isSelected ? team.color : "#f8fafc",
                    color: isSelected ? "#ffffff" : "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    boxShadow: isSelected ? "var(--shadow-sm)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {isSelected && <Check size={14} />}
                  {isSelected ? "BIDDER" : "SELECT"}
                </button>
              </div>

              {/* Budget Breakdown */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                  marginBottom: "14px",
                  background: "#f8fafc",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-subtle)",
                  textAlign: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Purse
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {formatINR(team.initialBudget)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Remaining
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 900,
                      color: team.remainingBudget > 0 ? team.color : "#dc2626",
                    }}
                  >
                    {formatINR(team.remainingBudget)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Spent ({percentageUsed}%)
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-secondary)" }}>
                    {formatINR(team.totalSpent)}
                  </div>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  background: "#e2e8f0",
                  borderRadius: "3px",
                  overflow: "hidden",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    width: `${percentageUsed}%`,
                    height: "100%",
                    background: team.color,
                    borderRadius: "3px",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>

              {/* Squad Accordion Header */}
              <div
                onClick={() => toggleExpand(team.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  paddingTop: "6px",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Users size={16} color="var(--text-muted)" />
                  <span>
                    Squad: <strong style={{ color: "var(--text-primary)" }}>{team.players?.length || 0} players</strong>
                  </span>
                </div>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {/* Expandable Squad Items */}
              {isExpanded && (
                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    maxHeight: "180px",
                    overflowY: "auto",
                  }}
                >
                  {team.players && team.players.length > 0 ? (
                    team.players.map((tp, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          background: "#f8fafc",
                          border: "1px solid var(--border-subtle)",
                          fontSize: "0.82rem",
                        }}
                      >
                        <div>
                          <strong style={{ color: "var(--text-primary)" }}>{tp.name}</strong>{" "}
                          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                            ({tp.role})
                          </span>
                        </div>
                        <span style={{ color: "#d97706", fontWeight: 800 }}>
                          {formatINR(tp.soldPrice)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
                      No players acquired yet
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
