"use client";

import React from "react";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  type: "SOLD" | "UNSOLD" | "RESET";
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  type,
  title,
  message,
  confirmLabel,
  confirmColor = "#059669",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "SOLD":
        return <CheckCircle size={38} color="#059669" />;
      case "UNSOLD":
        return <XCircle size={38} color="#e11d48" />;
      case "RESET":
        return <RotateCcw size={38} color="#d97706" />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "28px",
          borderRadius: "18px",
          background: "#ffffff",
          textAlign: "center",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background:
              type === "SOLD"
                ? "#ecfdf5"
                : type === "UNSOLD"
                ? "#fff1f2"
                : "#fffbeb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
          }}
        >
          {getIcon()}
        </div>

        <h3
          className="font-display"
          style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px" }}
        >
          {title}
        </h3>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "24px", lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "12px",
              borderRadius: "10px",
              background: "#f1f5f9",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "12px",
              borderRadius: "10px",
              background: confirmColor,
              border: "none",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "0.9rem",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
