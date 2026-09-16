"use client";

import React, { useEffect, useState, useCallback } from "react";
import { IPlayer, ITeam } from "@/types";
import { Shield, LogOut, Users, Medal, Settings, Plus, Upload, Save, X, ChevronDown, ChevronUp, Edit3 } from "lucide-react";

// ─── Auth ─────────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("admin_token");
}

function setToken(token: string) {
  sessionStorage.setItem("admin_token", token);
}

function clearToken() {
  sessionStorage.removeItem("admin_token");
}

// ─── Login Page ───────────────────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        onLogin();
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1e293b", borderRadius: "20px", padding: "48px", width: "100%", maxWidth: "420px", border: "1px solid #334155", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "linear-gradient(135deg, #0284c7, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Shield size={32} color="#fff" />
          </div>
          <h1 style={{ color: "#f1f5f9", fontSize: "1.6rem", fontWeight: 800, margin: 0 }}>Admin Panel</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "6px" }}>Shyam Cricket Auction</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              style={{ width: "100%", padding: "12px 16px", background: "#0f172a", border: "1px solid #334155", borderRadius: "10px", color: "#f1f5f9", fontSize: "1rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          {error && (
            <div style={{ background: "#7f1d1d", border: "1px solid #991b1b", borderRadius: "8px", padding: "10px 14px", color: "#fca5a5", fontSize: "0.85rem", marginBottom: "16px" }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #0284c7, #0ea5e9)", border: "none", borderRadius: "10px", color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Player Edit Modal ────────────────────────────────────────────────────────

function PlayerEditModal({ player, token, onClose, onSaved }: { player: IPlayer; token: string; onClose: () => void; onSaved: (p: IPlayer) => void }) {
  const [form, setForm] = useState<any>({ ...player, statistics: { ...player.statistics } });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleStatChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, statistics: { ...prev.statistics, [field]: value === "" ? null : Number(value) } }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("playerId", String(player.id));
    try {
      const res = await fetch("/api/admin/upload-image", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (data.success) {
        setForm((prev: any) => ({ ...prev, imageUrl: data.imageUrl }));
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/players/${player.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        onSaved(data.player);
        onClose();
      } else {
        setError(data.error || "Save failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", color: "#94a3b8", fontSize: "0.72rem", fontWeight: 700, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" };

  const statFields: Array<[string, string]> = [
    ["matches", "Matches"], ["battingInnings", "Batting Innings"], ["runs", "Runs"],
    ["hs", "Highest Score"], ["hsRuns", "HS Runs"], ["avg", "Batting Avg"],
    ["sr", "Strike Rate"], ["s30", "30s"], ["s50", "50s"], ["s100", "100s"],
    ["s4", "Fours"], ["s6", "Sixes"], ["ducks", "Ducks"],
    ["bowlingInnings", "Bowling Innings"], ["overs", "Overs"], ["wickets", "Wickets"],
    ["bestBowling", "Best Bowling"], ["w3", "3W"], ["w5", "5W"],
    ["maidens", "Maidens"], ["economy", "Economy"],
    ["playerOfTheMatch", "POM"], ["bestBowler", "Best Bowler Awards"], ["bestBatter", "Best Batter Awards"],
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "#1e293b", borderRadius: "16px", width: "100%", maxWidth: "720px", maxHeight: "90vh", overflow: "hidden", border: "1px solid #334155", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: "#f1f5f9", fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>
            <Edit3 size={18} style={{ marginRight: "8px", verticalAlign: "middle", color: "#0ea5e9" }} />
            Edit Player: {player.name}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><X size={22} /></button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "24px", flex: 1 }}>
          {/* Image */}
          <div style={{ marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", border: "2px solid #334155", background: "#0f172a", flexShrink: 0 }}>
              {form.imageUrl ? (
                <img src={form.imageUrl} alt={form.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "1.5rem", fontWeight: 800 }}>
                  {form.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: "flex", gap: "8px", alignItems: "center", padding: "8px 16px", background: "#0284c7", borderRadius: "8px", cursor: "pointer", color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>
                <Upload size={16} />
                {uploading ? "Uploading..." : "Upload Photo"}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} disabled={uploading} />
              </label>
              <p style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "6px" }}>JPG, PNG — auto-cropped to 400×400</p>
            </div>
          </div>

          {/* Basic Info */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ color: "#0ea5e9", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Basic Info</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input style={inputStyle} value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Base Price (₹)</label>
                <input style={inputStyle} type="number" value={form.basePrice} onChange={(e) => handleChange("basePrice", Number(e.target.value))} />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select style={inputStyle} value={form.role} onChange={(e) => handleChange("role", e.target.value)}>
                  <option>All Rounder</option>
                  <option>Batsman</option>
                  <option>Bowler</option>
                  <option>Wicket Keeper</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Batting Style</label>
                <select style={inputStyle} value={form.battingStyle} onChange={(e) => handleChange("battingStyle", e.target.value)}>
                  <option value="RHB">Right Hand Bat</option>
                  <option value="LHB">Left Hand Bat</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Bowling Style</label>
                <input style={inputStyle} value={form.bowlingStyle || ""} onChange={(e) => handleChange("bowlingStyle", e.target.value || null)} placeholder="e.g. Right Arm Medium" />
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 style={{ color: "#0ea5e9", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Statistics</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              {statFields.map(([key, label]) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    style={inputStyle}
                    type={key === "bestBowling" || key === "hs" ? "text" : "number"}
                    value={form.statistics[key] ?? ""}
                    onChange={(e) =>
                      key === "bestBowling" || key === "hs"
                        ? setForm((prev: any) => ({ ...prev, statistics: { ...prev.statistics, [key]: e.target.value || null } }))
                        : handleStatChange(key, e.target.value)
                    }
                    step={key === "avg" || key === "sr" || key === "economy" || key === "overs" ? "0.01" : "1"}
                  />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ marginTop: "16px", background: "#7f1d1d", border: "1px solid #991b1b", borderRadius: "8px", padding: "10px 14px", color: "#fca5a5", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #334155", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", background: "#334155", border: "none", borderRadius: "8px", color: "#94a3b8", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "10px 20px", background: "#059669", border: "none", borderRadius: "8px", color: "#fff", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Team Edit Modal ──────────────────────────────────────────────────────────

function TeamEditModal({ team, token, onClose, onSaved }: { team: ITeam; token: string; onClose: () => void; onSaved: (t: ITeam) => void }) {
  const [form, setForm] = useState({ name: team.name, shortName: team.shortName, color: team.color, initialBudget: team.initialBudget });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", color: "#94a3b8", fontSize: "0.75rem", fontWeight: 700, marginBottom: "6px", textTransform: "uppercase" };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/teams/${team.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { onSaved(data.team); onClose(); }
      else setError(data.error || "Save failed");
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "#1e293b", borderRadius: "16px", width: "100%", maxWidth: "480px", border: "1px solid #334155" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: "#f1f5f9", margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Edit Team: {team.name}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><X size={22} /></button>
        </div>
        <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Team Name</label>
            <input style={inputStyle} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Short Name</label>
            <input style={inputStyle} value={form.shortName} onChange={(e) => setForm((p) => ({ ...p, shortName: e.target.value }))} maxLength={4} />
          </div>
          <div>
            <label style={labelStyle}>Team Color</label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input type="color" value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} style={{ width: "40px", height: "40px", border: "none", borderRadius: "6px", cursor: "pointer", background: "none" }} />
              <input style={{ ...inputStyle, flex: 1 }} value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} />
            </div>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Initial Budget (₹)</label>
            <input style={inputStyle} type="number" value={form.initialBudget} onChange={(e) => setForm((p) => ({ ...p, initialBudget: Number(e.target.value) }))} />
          </div>
        </div>
        {error && <div style={{ margin: "0 24px", background: "#7f1d1d", borderRadius: "8px", padding: "10px 14px", color: "#fca5a5", fontSize: "0.85rem" }}>{error}</div>}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #334155", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", background: "#334155", border: "none", borderRadius: "8px", color: "#94a3b8", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "10px 20px", background: "#059669", border: "none", borderRadius: "8px", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const [token, setTokenState] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"players" | "teams">("players");
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<IPlayer | null>(null);
  const [editingTeam, setEditingTeam] = useState<ITeam | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = getToken();
    setTokenState(t);
  }, []);

  const fetchData = useCallback(async (t: string) => {
    setLoading(true);
    try {
      const [pRes, teamsRes] = await Promise.all([
        fetch("/api/admin/players", { headers: { Authorization: `Bearer ${t}` } }),
        fetch("/api/teams"),
      ]);
      const pData = await pRes.json();
      const tData = await teamsRes.json();
      if (pData.success) setPlayers(pData.players);
      if (tData.success) setTeams(tData.teams);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchData(token);
  }, [token, fetchData]);

  if (!token) {
    return <LoginPage onLogin={() => { const t = getToken(); setTokenState(t); }} />;
  }

  const handleLogout = () => { clearToken(); setTokenState(null); };
  const filteredPlayers = players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const statusColors: Record<string, string> = { NOT_STARTED: "#64748b", CURRENT: "#0284c7", SOLD: "#059669", UNSOLD: "#dc2626" };
  const statusLabels: Record<string, string> = { NOT_STARTED: "Not Auctioned", CURRENT: "Live", SOLD: "Sold", UNSOLD: "Unsold" };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f1f5f9" }}>
      {/* Header */}
      <header style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Shield size={24} color="#0ea5e9" />
          <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Admin Panel</span>
          <span style={{ color: "#475569", fontSize: "0.8rem" }}>Shyam Cricket Auction</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <a href="/" style={{ color: "#64748b", fontSize: "0.85rem", textDecoration: "none" }}>← Back to Auction</a>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#334155", border: "none", borderRadius: "8px", color: "#94a3b8", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "0 28px", display: "flex", gap: "4px" }}>
        {[{ id: "players", label: "Players", icon: <Users size={16} /> }, { id: "teams", label: "Teams", icon: <Medal size={16} /> }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 20px", background: "none", border: "none", borderBottom: activeTab === tab.id ? "2px solid #0ea5e9" : "2px solid transparent", color: activeTab === tab.id ? "#0ea5e9" : "#64748b", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "28px" }}>
        {loading && <div style={{ textAlign: "center", color: "#64748b", padding: "60px" }}>Loading...</div>}

        {/* Players Tab */}
        {!loading && activeTab === "players" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>All Players ({filteredPlayers.length})</h2>
              <input
                placeholder="Search player..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: "9px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", color: "#f1f5f9", width: "260px", outline: "none" }}
              />
            </div>
            <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #334155", color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Photo</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Player</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Role</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Base Price</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Status</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Team</th>
                    <th style={{ padding: "12px 16px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #1e293b", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#0f172a")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.9rem" }}>{p.name.charAt(0)}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ fontWeight: 700, color: "#f1f5f9" }}>{p.name}</div>
                        <div style={{ color: "#64748b", fontSize: "0.75rem" }}>#{p.id} · {p.battingStyle}</div>
                      </td>
                      <td style={{ padding: "10px 16px", color: "#94a3b8" }}>{p.role}</td>
                      <td style={{ padding: "10px 16px", color: "#94a3b8" }}>₹{p.basePrice.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, background: `${statusColors[p.auctionStatus]}22`, color: statusColors[p.auctionStatus] }}>
                          {statusLabels[p.auctionStatus]}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px", color: "#64748b" }}>{p.teamName || "—"}</td>
                      <td style={{ padding: "10px 16px", textAlign: "right" }}>
                        <button onClick={() => setEditingPlayer(p)} style={{ padding: "6px 14px", background: "#0284c7", border: "none", borderRadius: "6px", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Teams Tab */}
        {!loading && activeTab === "teams" && (
          <div>
            <h2 style={{ margin: "0 0 20px", fontSize: "1.2rem", fontWeight: 800 }}>Teams</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {teams.map((t) => (
                <div key={t.id} style={{ background: "#1e293b", borderRadius: "14px", border: `1px solid ${t.color}44`, padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <div style={{ width: "14px", height: "14px", borderRadius: "4px", background: t.color }} />
                      <div>
                        <div style={{ fontWeight: 800, color: "#f1f5f9" }}>{t.name}</div>
                        <div style={{ color: "#64748b", fontSize: "0.8rem" }}>{t.shortName}</div>
                      </div>
                    </div>
                    <button onClick={() => setEditingTeam(t)} style={{ padding: "6px 14px", background: "#0284c7", border: "none", borderRadius: "6px", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}>Edit</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.8rem" }}>
                    {[
                      ["Initial Budget", `₹${t.initialBudget.toLocaleString("en-IN")}`],
                      ["Remaining", `₹${t.remainingBudget.toLocaleString("en-IN")}`],
                      ["Total Spent", `₹${t.totalSpent.toLocaleString("en-IN")}`],
                      ["Players", t.playerCount],
                    ].map(([label, val]) => (
                      <div key={label as string} style={{ background: "#0f172a", borderRadius: "8px", padding: "10px 12px" }}>
                        <div style={{ color: "#64748b", fontSize: "0.7rem", marginBottom: "2px" }}>{label}</div>
                        <div style={{ color: "#f1f5f9", fontWeight: 700 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ color: "#64748b", fontSize: "0.72rem", marginBottom: "6px", textTransform: "uppercase", fontWeight: 700 }}>Squad</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {t.players.length === 0 && <span style={{ color: "#475569", fontSize: "0.8rem" }}>No players yet</span>}
                      {t.players.map((player) => (
                        <span key={player.playerId} style={{ padding: "3px 10px", background: `${t.color}22`, color: t.color, borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600 }}>
                          {player.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {editingPlayer && token && (
        <PlayerEditModal
          player={editingPlayer}
          token={token}
          onClose={() => setEditingPlayer(null)}
          onSaved={(updated) => {
            setPlayers((prev) => prev.map((p) => p.id === updated.id ? updated : p));
            setEditingPlayer(null);
          }}
        />
      )}

      {editingTeam && token && (
        <TeamEditModal
          team={editingTeam}
          token={token}
          onClose={() => setEditingTeam(null)}
          onSaved={(updated) => {
          setTeams((prev) => prev.map((t) => t.id === updated.id ? updated : t));
            setEditingTeam(null);
          }}
        />
      )}
    </div>
  );
}
