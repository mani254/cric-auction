"use client";

import React, { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { CurrentPlayerCard } from "@/components/CurrentPlayerCard";
import { TeamsPanel } from "@/components/TeamsPanel";
import { BudgetModal } from "@/components/BudgetModal";
import { HistoryModal } from "@/components/HistoryModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useAuctionStore } from "@/lib/store";

export default function AuctionPage() {
  const {
    auctionState,
    currentPlayer,
    teams,
    players,
    summary,
    initialLoading,
    actionLoading,
    toast,
    autoAdvance,
    toggleAutoAdvance,
    isBudgetModalOpen,
    isHistoryModalOpen,
    confirmModal,
    setIsBudgetModalOpen,
    setIsHistoryModalOpen,
    setConfirmModal,
    closeConfirmModal,
    fetchInitialState,
    selectTeam,
    placeBid,
    selectPlayer,
    markSold,
    markUnsold,
    resetPlayer,
    resetEntireAuction,
    updateBudgets,
  } = useAuctionStore();

  useEffect(() => {
    fetchInitialState();
  }, [fetchInitialState]);

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
        closeConfirmModal();
        await markSold();
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
        closeConfirmModal();
        await markUnsold();
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
        closeConfirmModal();
        await resetPlayer(playerId, forceReauction);
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
        closeConfirmModal();
        await resetEntireAuction();
      },
    });
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
        autoAdvance={autoAdvance}
        onToggleAutoAdvance={toggleAutoAdvance}
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
            onSelectTeam={selectTeam}
            onPlaceBid={(teamId, increment, customAmount, isOpeningBid) =>
              placeBid({ teamId, increment, customAmount, isOpeningBid })
            }
            onSold={promptSold}
            onUnsold={promptUnsold}
            onResetPlayer={handleResetPlayer}
            loading={false}
          />

          {/* Right Stage: Franchises Panel */}
          <TeamsPanel
            teams={teams}
            auctionState={auctionState}
            onSelectTeam={selectTeam}
          />
        </div>

        {/* Player Catalogue moved to /players route */}
      </main>

      {/* Modals */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        teams={teams}
        onSaveBudgets={updateBudgets}
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
        loading={actionLoading}
        onConfirm={confirmModal.action}
        onCancel={closeConfirmModal}
      />
    </div>
  );
}
