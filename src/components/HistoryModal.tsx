"use client";

import React, { useEffect, useState } from "react";
import { IAuctionEvent } from "@/types";
import { X, Clock, CheckCircle, XCircle } from "lucide-react";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState<IAuctionEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/auction/events?limit=100")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setEvents(data.events || []);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatINR = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "";
    return "₹" + val.toLocaleString("en-IN");
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case "SOLD":
        return <span className="badge badge-sold">SOLD</span>;
      case "UNSOLD":
        return <span className="badge badge-unsold">UNSOLD</span>;
      case "BID":
        return <span className="badge badge-current">BID</span>;
      case "PLAYER_STARTED":
        return <span className="badge badge-not-started">STARTED</span>;
      case "BUDGET_UPDATED":
        return <span className="badge badge-current">BUDGET</span>;
      default:
        return <span className="badge badge-not-started">{type}</span>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "650px",
          padding: "28px",
          borderRadius: "18px",
          background: "#ffffff",
          boxShadow: "var(--shadow-xl)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 className="font-display" style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text-primary)" }}>
              Live Auction Audit Log
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Chronological log of all bids, player statuses, and transactions
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

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "4px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>Loading events...</div>
          ) : events.length > 0 ? (
            events.map((ev, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "#f8fafc",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {getEventBadge(ev.eventType)}
                  <div>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>
                      {ev.playerName ? `${ev.playerName} (${ev.teamName || "General"})` : ev.teamName || "Auction System"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {new Date(ev.timestamp).toLocaleTimeString()} • {new Date(ev.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {ev.amount !== null && (
                  <div className="font-display" style={{ fontSize: "1.1rem", fontWeight: 800, color: "#d97706" }}>
                    {formatINR(ev.amount)}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>No events recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
