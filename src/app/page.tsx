"use client";

import React, { useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { IPlayer, ITeam, IAuctionState } from "@/types";
import { Navbar } from "@/components/Navbar";
import { CurrentPlayerCard } from "@/components/CurrentPlayerCard";
import { TeamsPanel } from "@/components/TeamsPanel";
import { PlayerCatalogue } from "@/components/PlayerCatalogue";
import { BudgetModal } from "@/components/BudgetModal";
import { HistoryModal } from "@/components/HistoryModal";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function AuctionPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [auctionState, setAuctionState] = useState<IAuctionState>({
    sessionKey: "primary",
    status: "SETUP",
    currentPlayerId: null,
    currentBid: 0,
    currentTeamId: null,
    currentTeamName: null,
    bidHistory: [],
  });

  const [currentPlayer, setCurrentPlayer] = useState<IPlayer | null>(null);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [summary, setSummary] = useState({
    total: 43,
    sold: 0,
    unsold: 0,
    remaining: 43,
    totalPurseSpent: 0,
  });

  // Modal states
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "SOLD" | "UNSOLD" | "RESET";
    title: string;
    message: string;
    confirmLabel: string;
    confirmColor?: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    type: "SOLD",
    title: "",
    message: "",
    confirmLabel: "",
    action: async () => {},
  });

  // Alert/Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch full state from backend
  const refreshState = useCallback(async () => {
    try {
      const [auctionRes, playersRes] = await Promise.all([
        fetch("/api/auction"),
        fetch("/api/players"),
      ]);

      const auctionData = await auctionRes.json();
      const playersData = await playersRes.json();

      if (auctionData.success) {
        setAuctionState(auctionData.auctionState);
        setCurrentPlayer(auctionData.currentPlayer);
        setTeams(auctionData.teams || []);
        if (auctionData.summary) {
          setSummary(auctionData.summary);
        }
      }

      if (playersData.success) {
        setPlayers(playersData.players || []);
      }
    } catch (err: any) {
      console.error("Error refreshing auction state:", err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Select Player Action
  const handleSelectPlayer = async (playerId: number, forceReauction: boolean = false) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auction/select-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, forceReauction }),
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.error || "Failed to select player", "error");
      } else {
        await refreshState();
        showToast(data.message, "info");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Select Team Action
  const handleSelectTeam = async (teamId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auction/select-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.error || "Failed to select team", "error");
      } else {
        await refreshState();
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Place Bid Action
  const handlePlaceBid = async (
    teamId: string,
    increment?: number,
    customAmount?: number,
    isOpeningBid?: boolean
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auction/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, increment, customAmount, isOpeningBid }),
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.error || "Bid could not be placed", "error");
      } else {
        await refreshState();
        showToast(data.message, "success");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Prompt Sold Confirmation
  const promptSold = () => {
    if (!currentPlayer || !auctionState.currentTeamId) return;
    const team = teams.find((t) => t.id === auctionState.currentTeamId);

    setConfirmModal({
      isOpen: true,
      type: "SOLD",
      title: `Hammer Down: SELL to ${team?.name}?`,
      message: `Finalize sale of ${currentPlayer.name} to ${team?.name} for ₹${auctionState.currentBid.toLocaleString(
        "en-IN"
      )}? This will deduct from ${team?.name}'s purse.`,
      confirmLabel: "Confirm SOLD",
      confirmColor: "#059669",
      action: async () => {
        const res = await fetch("/api/auction/sold", { method: "POST" });
        const data = await res.json();
        if (!data.success) {
          showToast(data.error || "Failed to finalize SOLD", "error");
        } else {
          // Confetti celebration!
          confetti({
            particleCount: 140,
            spread: 90,
            origin: { y: 0.6 },
            colors: ["#059669", "#d97706", "#0284c7", "#ffffff"],
          });
          await refreshState();
          showToast(data.message, "success");
        }
      },
    });
  };

  // Prompt Unsold Confirmation
  const promptUnsold = () => {
    if (!currentPlayer) return;
    setConfirmModal({
      isOpen: true,
      type: "UNSOLD",
      title: `Mark ${currentPlayer.name} as UNSOLD?`,
      message: `${currentPlayer.name} will go unsold with no purse deduction. You can re-auction this player later.`,
      confirmLabel: "Mark UNSOLD",
      confirmColor: "#e11d48",
      action: async () => {
        const res = await fetch("/api/auction/unsold", { method: "POST" });
        const data = await res.json();
        if (!data.success) {
          showToast(data.error || "Failed to mark UNSOLD", "error");
        } else {
          await refreshState();
          showToast(data.message, "info");
        }
      },
    });
  };

  // Reset / Undo Single Player Auction
  const handleResetPlayer = (playerId: number, forceReauction: boolean = false) => {
    const targetPlayer = players.find((p) => p.id === playerId);
    if (!targetPlayer) return;

    const isSold = targetPlayer.auctionStatus === "SOLD";
    const soldPriceStr = targetPlayer.soldPrice
      ? `₹${targetPlayer.soldPrice.toLocaleString("en-IN")}`
      : "";

    setConfirmModal({
      isOpen: true,
      type: "RESET",
      title: forceReauction
        ? `Re-auction ${targetPlayer.name}?`
        : `Undo / Reset Auction for ${targetPlayer.name}?`,
      message: isSold
        ? `This will reset ${targetPlayer.name}'s status, refund ${soldPriceStr} back to ${targetPlayer.teamName}'s purse, and remove them from the squad${
            forceReauction ? " before immediately starting live bidding." : "."
          }`
        : `This will reset ${targetPlayer.name}'s status back to Upcoming (Not Auctioned)${
            forceReauction ? " and open live bidding." : "."
          }`,
      confirmLabel: forceReauction ? "Re-auction Now" : "Reset Player",
      confirmColor: forceReauction ? "#0284c7" : "#d97706",
      action: async () => {
        const resetRes = await fetch("/api/auction/reset-player", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId }),
        });
        const resetData = await resetRes.json();
        if (!resetData.success) {
          showToast(resetData.error || "Failed to reset player", "error");
          return;
        }

        if (forceReauction) {
          // Immediately select and start live bidding
          await handleSelectPlayer(playerId, true);
        } else {
          await refreshState();
          showToast(resetData.message, "success");
        }
      },
    });
  };

  // Prompt Full Reset Confirmation
  const promptReset = () => {
    setConfirmModal({
      isOpen: true,
      type: "RESET",
      title: "Reset Entire Auction Session?",
      message:
        "WARNING: This will reset all sold and unsold player statuses back to Upcoming, clear all franchise squads, and restore all team purses.",
      confirmLabel: "Reset All",
      confirmColor: "#d97706",
      action: async () => {
        const res = await fetch("/api/auction/reset", { method: "POST" });
        const data = await res.json();
        if (!data.success) {
          showToast(data.error || "Failed to reset auction", "error");
        } else {
          await refreshState();
          showToast("Auction session reset successfully!", "info");
        }
      },
    });
  };

  // Save Team Budgets
  const handleSaveBudgets = async (newBudgets: Record<string, number>) => {
    const res = await fetch("/api/teams/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budgets: newBudgets }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to update budgets");
    }
    await refreshState();
    showToast("Franchise budgets updated successfully!", "success");
  };

  if (initialLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-primary)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #e2e8f0",
              borderTopColor: "#0284c7",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px auto",
            }}
          />
          <h2 className="font-display" style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-secondary)" }}>
            Loading Cricket Auction Command Center...
          </h2>
          <style jsx>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Toast Banner */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            right: "28px",
            zIndex: 1000,
            padding: "12px 22px",
            borderRadius: "12px",
            background:
              toast.type === "success"
                ? "#059669"
                : toast.type === "error"
                ? "#dc2626"
                : "#0f172a",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "0.9rem",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid rgba(255,255,255,0.2)",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Navbar */}
      <Navbar
        status={auctionState.status}
        summary={summary}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onResetAuction={promptReset}
      />

      {/* Main Auction Arena */}
      <main
        style={{
          flex: 1,
          maxWidth: "1600px",
          width: "100%",
          margin: "0 auto",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        {/* Arena Top Grid: Center Player & Right Teams */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Center Stage: Current Player & Bidding / Completed Console */}
          <CurrentPlayerCard
            player={currentPlayer}
            auctionState={auctionState}
            teams={teams}
            onSelectTeam={handleSelectTeam}
            onPlaceBid={handlePlaceBid}
            onSold={promptSold}
            onUnsold={promptUnsold}
            onResetPlayer={handleResetPlayer}
            loading={loading}
          />

          {/* Right Stage: Franchises Panel */}
          <TeamsPanel
            teams={teams}
            auctionState={auctionState}
            onSelectTeam={handleSelectTeam}
          />
        </div>

        {/* Arena Bottom: Player Catalogue & Roster */}
        <PlayerCatalogue
          players={players}
          currentPlayerId={auctionState.currentPlayerId}
          onSelectPlayer={(id) => handleSelectPlayer(id, false)}
          loading={loading}
        />
      </main>

      {/* Modals */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        teams={teams}
        onSaveBudgets={handleSaveBudgets}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        confirmColor={confirmModal.confirmColor}
        loading={loading}
        onConfirm={async () => {
          setLoading(true);
          try {
            await confirmModal.action();
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          } catch (err: any) {
            showToast(err.message, "error");
          } finally {
            setLoading(false);
          }
        }}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
