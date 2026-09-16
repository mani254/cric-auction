"use client";

import React, { useState } from "react";
import { IPlayer, ITeam, IAuctionState } from "@/types";
import {
  Award,
  Zap,
  CheckCircle,
  XCircle,
  RotateCcw,
  Play,
  TrendingUp,
  Shield,
  Clock,
  ArrowRight,
} from "lucide-react";

interface CurrentPlayerCardProps {
  player: IPlayer | null;
  auctionState: IAuctionState;
  teams: ITeam[];
  onSelectTeam: (teamId: string) => void;
  onPlaceBid: (
    teamId: string,
    increment?: number,
    customAmount?: number,
    isOpeningBid?: boolean
  ) => void;
  onSold: () => void;
  onUnsold: () => void;
  onResetPlayer: (playerId: number, forceReauction?: boolean) => void;
  loading: boolean;
}

export const CurrentPlayerCard: React.FC<CurrentPlayerCardProps> = ({
  player,
  auctionState,
  teams,
  onSelectTeam,
  onPlaceBid,
  onSold,
  onUnsold,
  onResetPlayer,
  loading,
}) => {
  const [customBidInput, setCustomBidInput] = useState<string>("");

  const formatINR = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "—";
    return "₹" + val.toLocaleString("en-IN");
  };

  const selectedTeam = teams.find((t) => t.id === auctionState.currentTeamId);

  const handleCustomBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(customBidInput.replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) return;
    if (!auctionState.currentTeamId) {
      alert("Please select a bidding team first!");
      return;
    }
    onPlaceBid(auctionState.currentTeamId, undefined, amount);
    setCustomBidInput("");
  };

  if (!player) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: "56px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "460px",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "#f0f9ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
            border: "1px solid #bae6fd",
          }}
        >
          <Zap size={38} color="#0284c7" />
        </div>
        <h2
          className="font-display"
          style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}
        >
          Podium Empty
        </h2>
        <p style={{ color: "var(--text-muted)", maxWidth: "460px", fontSize: "0.95rem", lineHeight: 1.5 }}>
          Open the <a href="/players" target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7", fontWeight: 700 }}>Player Roster</a> to view all players and select one to start live franchise bidding. If Auto-Advance is ON, the next player will be selected automatically after each hammer.
        </p>
      </div>
    );
  }

  const s = player.statistics;
  const isCompleted = player.auctionStatus === "SOLD" || player.auctionStatus === "UNSOLD";
  const ownerTeam = teams.find((t) => t.id === player.teamId);

  return (
    <div
      className="glass-panel"
      style={{
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        background: "#ffffff",
      }}
    >
      {/* Player Top Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "22px",
        }}
      >
          <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
          {/* Avatar / Player Photo */}
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "16px",
              overflow: "hidden",
              border: `3px solid ${
                isCompleted
                  ? player.auctionStatus === "SOLD"
                    ? "#a7f3d0"
                    : "#fecdd3"
                  : "#0284c7"
              }`,
              boxShadow: isCompleted ? "none" : "0 6px 20px rgba(2, 132, 199, 0.25)",
              flexShrink: 0,
              position: "relative",
            }}
          >
            {player.imageUrl ? (
              <img
                src={player.imageUrl}
                alt={player.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: isCompleted
                    ? player.auctionStatus === "SOLD"
                      ? "#ecfdf5"
                      : "#fff1f2"
                    : "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: isCompleted ? (player.auctionStatus === "SOLD" ? "#059669" : "#e11d48") : "#e0f2fe",
                    fontWeight: 800,
                  }}
                >
                  #{player.id}
                </span>
                <span
                  className="font-display"
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 900,
                    color: isCompleted ? (player.auctionStatus === "SOLD" ? "#047857" : "#be123c") : "#ffffff",
                  }}
                >
                  {player.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <h2
                className="font-display"
                style={{ fontSize: "1.9rem", fontWeight: 900, color: "var(--text-primary)" }}
              >
                {player.name}
              </h2>
              {player.auctionStatus === "CURRENT" && (
                <span className="badge badge-live">LIVE ON STAGE</span>
              )}
              {player.auctionStatus === "SOLD" && (
                <span className="badge badge-sold">SOLD</span>
              )}
              {player.auctionStatus === "UNSOLD" && (
                <span className="badge badge-unsold">UNSOLD</span>
              )}
              {player.auctionStatus === "NOT_STARTED" && (
                <span className="badge badge-not-started">UPCOMING</span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#d97706",
                  fontWeight: 700,
                  background: "#fffbeb",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  border: "1px solid #fde68a",
                }}
              >
                🏏 {player.role}
              </span>
              <span>•</span>
              <span>
                Batting: <strong style={{ color: "var(--text-primary)" }}>{player.battingStyle}</strong>
              </span>
              <span>•</span>
              <span>
                Bowling:{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  {player.bowlingStyle || "None"}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Base Price Card */}
        <div
          style={{
            background: "#f8fafc",
            padding: "12px 20px",
            borderRadius: "12px",
            border: "1px solid var(--border-subtle)",
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            BASE PRICE
          </div>
          <div
            className="font-display"
            style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)" }}
          >
            {formatINR(player.basePrice)}
          </div>
        </div>
      </div>

      {/* Comprehensive Statistics Grid */}
      <div>
        <div
          style={{
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            fontWeight: 800,
            letterSpacing: "0.08em",
            marginBottom: "12px",
          }}
        >
          CAREER & TOURNAMENT STATISTICS
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))",
            gap: "8px",
          }}
        >
          <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>Matches</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>{s.matches ?? "—"}</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>Runs</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#d97706" }}>{s.runs?.toLocaleString("en-IN") ?? "—"}</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>High Score</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>{s.hs ?? "—"}</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>Average</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>{s.avg ?? "—"}</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>Strike Rate</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0284c7" }}>{s.sr ?? "—"}</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>50s / 100s</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>{s.s50 ?? 0} / {s.s100 ?? 0}</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>4s / 6s</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>{s.s4 ?? 0} / {s.s6 ?? 0}</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>Wickets</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#059669" }}>{s.wickets ?? 0}</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>Best Bowling</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>{s.bestBowling ?? "—"}</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>Economy</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>{s.economy ?? "—"}</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>3w / 5w</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>{s.w3 ?? 0} / {s.w5 ?? 0}</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>POTM Awards</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#b45309" }}>{s.playerOfTheMatch ?? 0}</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONDITIONAL SECTION: IF ALREADY SOLD OR UNSOLD (COMPLETED BIDDING)       */}
      {/* ========================================================================= */}
      {isCompleted ? (
        <div
          style={{
            borderRadius: "16px",
            padding: "24px",
            background:
              player.auctionStatus === "SOLD"
                ? "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)"
                : "linear-gradient(135deg, #fff1f2 0%, #fff7ed 100%)",
            border: `2px solid ${
              player.auctionStatus === "SOLD" ? "#a7f3d0" : "#fecdd3"
            }`,
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: player.auctionStatus === "SOLD" ? "#059669" : "#e11d48",
                  letterSpacing: "0.08em",
                }}
              >
                {player.auctionStatus === "SOLD" ? (
                  <CheckCircle size={18} />
                ) : (
                  <XCircle size={18} />
                )}
                AUCTION COMPLETED • {player.auctionStatus}
              </div>
              <h3
                className="font-display"
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 900,
                  color: "var(--text-primary)",
                  marginTop: "4px",
                }}
              >
                {player.auctionStatus === "SOLD"
                  ? formatINR(player.soldPrice)
                  : "UNSOLD AT AUCTION"}
              </h3>
            </div>

            {player.auctionStatus === "SOLD" && (
              <div
                style={{
                  background: "#ffffff",
                  padding: "12px 20px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: ownerTeam?.color || "#059669",
                  }}
                />
                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>
                    ACQUIRED BY
                  </div>
                  <div
                    className="font-display"
                    style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--text-primary)" }}
                  >
                    {player.teamName || ownerTeam?.name}
                  </div>
                </div>
              </div>
            )}
          </div>

          <p
            style={{
              fontSize: "0.9rem",
              color: player.auctionStatus === "SOLD" ? "#065f46" : "#9f1239",
              lineHeight: 1.5,
            }}
          >
            {player.auctionStatus === "SOLD"
              ? `This player was successfully sold to ${player.teamName} for ${formatINR(
                  player.soldPrice
                )}. The amount was deducted from ${player.teamName}'s purse.`
              : `This player went unsold with no franchise placing a valid bid at the base price of ${formatINR(
                  player.basePrice
                )}.`}
          </p>

          {/* Reset / Undo and Re-auction Actions */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              paddingTop: "10px",
              borderTop: `1px solid ${
                player.auctionStatus === "SOLD" ? "#a7f3d0" : "#fecdd3"
              }`,
            }}
          >
            <button
              onClick={() => onResetPlayer(player.id, false)}
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "10px",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                color: "#b91c1c",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.15s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#fee2e2";
                e.currentTarget.style.borderColor = "#fca5a5";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
              title="Reset player status to Upcoming and refund purse if sold"
            >
              <RotateCcw size={18} />
              Undo / Reset Player
            </button>

            <button
              onClick={() => onResetPlayer(player.id, true)}
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 22px",
                borderRadius: "10px",
                background: "#0284c7",
                border: "none",
                color: "#ffffff",
                fontSize: "0.9rem",
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
                transition: "all 0.15s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#0369a1";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#0284c7";
              }}
              title="Reset player and immediately start live bidding"
            >
              <Play size={18} fill="#ffffff" />
              Re-open Live Bidding
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Main Stadium Bid Display */}
          <div
            style={{
              background: "linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)",
              border: "2px solid #99f6e4",
              borderRadius: "16px",
              padding: "24px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "20px",
              boxShadow: "0 4px 20px -2px rgba(13, 148, 136, 0.1)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#0f766e",
                  textTransform: "uppercase",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                }}
              >
                CURRENT LEADING BID
              </div>
              <div
                className="font-display"
                style={{
                  fontSize: "3.4rem",
                  fontWeight: 900,
                  color: "#0f172a",
                  lineHeight: 1.1,
                  marginTop: "4px",
                }}
              >
                {formatINR(auctionState.currentBid)}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  marginBottom: "6px",
                }}
              >
                BID PLACED BY
              </div>
              {selectedTeam ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#ffffff",
                    border: `2px solid ${selectedTeam.color}`,
                    padding: "8px 18px",
                    borderRadius: "12px",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: selectedTeam.color,
                    }}
                  />
                  <span
                    className="font-display"
                    style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--text-primary)" }}
                  >
                    {selectedTeam.name}
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    background: "#f1f5f9",
                    border: "1px dashed #cbd5e1",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "var(--text-muted)",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                  }}
                >
                  No Bids Placed Yet
                </div>
              )}
            </div>
          </div>

          {/* Bidding Controls Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Step 1: Select Active Team */}
            <div>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  fontWeight: 800,
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                STEP 1: SELECT BIDDING FRANCHISE
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {teams.map((t) => {
                  const isSelected = auctionState.currentTeamId === t.id;
                  const hasBudget = t.remainingBudget >= auctionState.currentBid;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onSelectTeam(t.id)}
                      disabled={loading}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        padding: "12px 8px",
                        borderRadius: "12px",
                        border: isSelected
                          ? `2px solid ${t.color}`
                          : "1px solid var(--border-subtle)",
                        background: isSelected
                          ? t.id === "team-a"
                            ? "#fffbeb"
                            : t.id === "team-b"
                            ? "#f0f9ff"
                            : "#ecfdf5"
                          : "#ffffff",
                        cursor: loading ? "not-allowed" : "pointer",
                        boxShadow: isSelected ? "var(--shadow-md)" : "var(--shadow-sm)",
                        transition: "all 0.15s",
                      }}
                    >
                      <span
                        className="font-display"
                        style={{ fontSize: "1.15rem", fontWeight: 900, color: isSelected ? t.color : "var(--text-primary)" }}
                      >
                        {t.name}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: hasBudget ? "var(--text-muted)" : "#dc2626",
                        }}
                      >
                        Purse: {formatINR(t.remainingBudget)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Bidding Increments & Custom Bid */}
            <div>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  fontWeight: 800,
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                STEP 2: INCREASE BID AMOUNT
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                {[10000, 25000, 50000, 100000, 500000].map((inc) => {
                  const targetAmount = auctionState.currentBid + inc;
                  const currentTeam = teams.find((t) => t.id === auctionState.currentTeamId);
                  const disabled =
                    loading ||
                    !auctionState.currentTeamId ||
                    (currentTeam && currentTeam.remainingBudget < targetAmount);

                  return (
                    <button
                      key={inc}
                      onClick={() => onPlaceBid(auctionState.currentTeamId!, inc)}
                      disabled={disabled}
                      style={{
                        flex: "1 1 100px",
                        padding: "12px 14px",
                        background: disabled ? "#f8fafc" : "#ffffff",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "10px",
                        color: disabled ? "var(--text-light)" : "var(--text-primary)",
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        cursor: disabled ? "not-allowed" : "pointer",
                        boxShadow: disabled ? "none" : "var(--shadow-sm)",
                        transition: "all 0.15s",
                      }}
                      onMouseOver={(e) => {
                        if (!disabled) {
                          e.currentTarget.style.borderColor = "var(--accent-cyan)";
                          e.currentTarget.style.color = "var(--accent-cyan)";
                          e.currentTarget.style.background = "#f0f9ff";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!disabled) {
                          e.currentTarget.style.borderColor = "var(--border-subtle)";
                          e.currentTarget.style.color = "var(--text-primary)";
                          e.currentTarget.style.background = "#ffffff";
                        }
                      }}
                    >
                      +{formatINR(inc)}
                    </button>
                  );
                })}
              </div>

              {/* Custom Bid Input */}
              <form onSubmit={handleCustomBidSubmit} style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="Custom Bid Amount (e.g. 7,50,000)"
                  value={customBidInput}
                  onChange={(e) => setCustomBidInput(e.target.value)}
                  disabled={loading || !auctionState.currentTeamId}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    background: "#ffffff",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "10px",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxShadow: "var(--shadow-sm)",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !auctionState.currentTeamId || !customBidInput}
                  style={{
                    padding: "10px 22px",
                    background: "#0284c7",
                    border: "none",
                    borderRadius: "10px",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(2, 132, 199, 0.25)",
                  }}
                >
                  Set Custom Bid
                </button>
              </form>
            </div>

            {/* Step 3: Finalize Decision (SOLD / UNSOLD) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "14px",
                marginTop: "10px",
              }}
            >
              <button
                onClick={onSold}
                disabled={loading || !auctionState.currentTeamId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "16px 24px",
                  borderRadius: "14px",
                  background: !auctionState.currentTeamId
                    ? "#e2e8f0"
                    : "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  color: !auctionState.currentTeamId ? "#94a3b8" : "#ffffff",
                  border: "none",
                  cursor: !auctionState.currentTeamId || loading ? "not-allowed" : "pointer",
                  fontSize: "1.2rem",
                  fontWeight: 900,
                  letterSpacing: "0.04em",
                  boxShadow: !auctionState.currentTeamId
                    ? "none"
                    : "0 6px 18px rgba(5, 150, 105, 0.35)",
                  transition: "all 0.15s",
                }}
              >
                <CheckCircle size={24} />
                SOLD TO {selectedTeam?.shortName || "..."}
              </button>

              <button
                onClick={onUnsold}
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "16px 20px",
                  borderRadius: "14px",
                  background: "#fff1f2",
                  border: "2px solid #fecdd3",
                  color: "#e11d48",
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#ffe4e6";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#fff1f2";
                }}
              >
                <XCircle size={22} />
                UNSOLD
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
