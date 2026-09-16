"use client";

import React from "react";
import { Gavel, Settings, History, RotateCcw, Activity, Users, Zap } from "lucide-react";

interface NavbarProps {
  status: string;
  summary: {
    total: number;
    sold: number;
    unsold: number;
    remaining: number;
    totalPurseSpent: number;
  };
  autoAdvance: boolean;
  onToggleAutoAdvance: () => void;
  onOpenBudgetModal: () => void;
  onOpenHistoryModal: () => void;
  onResetAuction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  status,
  summary,
  autoAdvance,
  onToggleAutoAdvance,
  onOpenBudgetModal,
  onOpenHistoryModal,
  onResetAuction,
}) => {
  const formatINR = (val: number) => {
    return "₹" + (val || 0).toLocaleString("en-IN");
  };

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "12px 28px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {/* Logo & Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)",
            }}
          >
            <Gavel size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1
                className="font-display"
                style={{ fontSize: "1.3rem", fontWeight: "900", color: "var(--text-primary)" }}
              >
                CRICKET AUCTION CONSOLE
              </h1>
              <span
                className={`badge ${
                  status === "LIVE"
                    ? "badge-live"
                    : status === "COMPLETED"
                    ? "badge-sold"
                    : "badge-not-started"
                }`}
              >
                <Activity size={12} />
                {status || "SETUP"}
              </span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Official Franchise Player Bidding Panel
            </p>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              borderRadius: "10px",
              padding: "6px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "0.68rem", color: "#059669", textTransform: "uppercase", fontWeight: 700 }}>
              Sold
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#047857" }}>
              {summary.sold} / {summary.total}
            </div>
          </div>

          <div
            style={{
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              borderRadius: "10px",
              padding: "6px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "0.68rem", color: "#e11d48", textTransform: "uppercase", fontWeight: 700 }}>
              Unsold
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#be123c" }}>
              {summary.unsold}
            </div>
          </div>

          <div
            style={{
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: "10px",
              padding: "6px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "0.68rem", color: "#0284c7", textTransform: "uppercase", fontWeight: 700 }}>
              Remaining
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0369a1" }}>
              {summary.remaining}
            </div>
          </div>

          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "10px",
              padding: "6px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "0.68rem", color: "#d97706", textTransform: "uppercase", fontWeight: 700 }}>
              Purse Spent
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#b45309" }}>
              {formatINR(summary.totalPurseSpent)}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Auto-Advance Toggle */}
          <button
            onClick={onToggleAutoAdvance}
            title={autoAdvance ? "Auto-Advance is ON — next player loads automatically" : "Auto-Advance is OFF — select players manually"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              background: autoAdvance ? "#ecfdf5" : "#f8fafc",
              border: `1px solid ${autoAdvance ? "#a7f3d0" : "#e2e8f0"}`,
              color: autoAdvance ? "#059669" : "#94a3b8",
              padding: "8px 14px",
              borderRadius: "10px",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Zap size={15} fill={autoAdvance ? "#059669" : "none"} />
            Auto {autoAdvance ? "ON" : "OFF"}
          </button>

          {/* View Roster */}
          <a
            href="/players"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              background: "#ffffff",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              padding: "8px 14px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
          >
            <Users size={16} />
            Roster
          </a>

          <button
            onClick={onOpenBudgetModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#ffffff",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              padding: "8px 14px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)",
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-cyan)";
              e.currentTarget.style.color = "var(--accent-cyan)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <Settings size={16} />
            Set Budgets
          </button>

          <button
            onClick={onOpenHistoryModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#ffffff",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              padding: "8px 14px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)",
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-gold)";
              e.currentTarget.style.color = "var(--accent-gold)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <History size={16} />
            History
          </button>

          <button
            onClick={onResetAuction}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#fef2f2",
              border: "1px solid #fecdd3",
              color: "#dc2626",
              padding: "8px 14px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#fee2e2";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#fef2f2";
            }}
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>
    </header>
  );
};
