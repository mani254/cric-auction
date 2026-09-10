"use client";

import React, { useState } from "react";
import { ITeam } from "@/types";
import { X, Check } from "lucide-react";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: ITeam[];
  onSaveBudgets: (budgets: Record<string, number>) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  teams,
  onSaveBudgets,
}) => {
  const [budgets, setBudgets] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    teams.forEach((t) => {
      initial[t.id] = t.initialBudget;
    });
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (teamId: string, valStr: string) => {
    const numeric = Number(valStr.replace(/,/g, ""));
    if (!isNaN(numeric)) {
      setBudgets((prev) => ({ ...prev, [teamId]: numeric }));
    }
  };

  const setAllPreset = (amount: number) => {
    const next: Record<string, number> = {};
    teams.forEach((t) => {
      next[t.id] = amount;
    });
    setBudgets(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSaveBudgets(budgets);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update budgets");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "520px",
          padding: "28px",
          borderRadius: "18px",
          background: "#ffffff",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 className="font-display" style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text-primary)" }}>
              Configure Franchise Budgets
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Set starting purse values for each franchise before the auction
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Presets */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>
            QUICK PRESETS (APPLY TO ALL)
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { label: "₹50 Lakhs", val: 5000000 },
              { label: "₹1.0 Crore", val: 10000000 },
              { label: "₹1.5 Crore", val: 15000000 },
              { label: "₹2.0 Crore", val: 20000000 },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setAllPreset(p.val)}
                style={{
                  flex: 1,
                  padding: "8px 6px",
                  borderRadius: "8px",
                  background: "#f8fafc",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "#fef2f2",
              border: "1px solid #fecdd3",
              color: "#dc2626",
              fontSize: "0.85rem",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {teams.map((team) => (
            <div key={team.id}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  marginBottom: "6px",
                  color: team.color,
                }}
              >
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: team.color }} />
                {team.name} Starting Purse:
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    fontWeight: 800,
                  }}
                >
                  ₹
                </span>
                <input
                  type="text"
                  value={budgets[team.id]?.toLocaleString("en-IN") || ""}
                  onChange={(e) => handleInputChange(team.id, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 32px",
                    background: "#ffffff",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "10px",
                    color: "var(--text-primary)",
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    outline: "none",
                  }}
                />
              </div>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                background: "transparent",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "10px 24px",
                borderRadius: "10px",
                background: "#0284c7",
                border: "none",
                color: "#ffffff",
                fontWeight: 800,
                cursor: saving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)",
              }}
            >
              <Check size={18} />
              {saving ? "Saving..." : "Save Budgets"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
