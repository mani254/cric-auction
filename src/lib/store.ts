import { create } from "zustand";
import confetti from "canvas-confetti";
import { IPlayer, ITeam, IAuctionState } from "@/types";

export interface ConfirmModalState {
  isOpen: boolean;
  type: "SOLD" | "UNSOLD" | "RESET";
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor?: string;
  action: () => Promise<void>;
}

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

interface SummaryState {
  total: number;
  sold: number;
  unsold: number;
  remaining: number;
  totalPurseSpent: number;
}

interface AuctionStore {
  // Core Data State
  auctionState: IAuctionState;
  currentPlayer: IPlayer | null;
  teams: ITeam[];
  players: IPlayer[];
  summary: SummaryState;

  // UI Status
  initialLoading: boolean;
  actionLoading: boolean;
  toast: ToastState | null;

  // Modals
  isBudgetModalOpen: boolean;
  isHistoryModalOpen: boolean;
  confirmModal: ConfirmModalState;

  // Setters & UI Handlers
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  clearToast: () => void;
  setIsBudgetModalOpen: (open: boolean) => void;
  setIsHistoryModalOpen: (open: boolean) => void;
  setConfirmModal: (modal: Partial<ConfirmModalState> | ((prev: ConfirmModalState) => ConfirmModalState)) => void;
  closeConfirmModal: () => void;

  // Data Fetching & Sync
  fetchInitialState: () => Promise<void>;
  refreshState: (quiet?: boolean) => Promise<void>;

  // UI-First Optimistic Actions
  selectTeam: (teamId: string) => Promise<void>;
  placeBid: (params: {
    teamId: string;
    increment?: number;
    customAmount?: number;
    isOpeningBid?: boolean;
  }) => Promise<void>;
  selectPlayer: (playerId: number, forceReauction?: boolean) => Promise<void>;
  markSold: () => Promise<void>;
  markUnsold: () => Promise<void>;
  resetPlayer: (playerId: number, forceReauction?: boolean) => Promise<void>;
  resetEntireAuction: () => Promise<void>;
  updateBudgets: (newBudgets: Record<string, number>) => Promise<void>;
}

export const useAuctionStore = create<AuctionStore>((set, get) => ({
  auctionState: {
    sessionKey: "primary",
    status: "SETUP",
    currentPlayerId: null,
    currentBid: 0,
    currentTeamId: null,
    currentTeamName: null,
    bidHistory: [],
  },
  currentPlayer: null,
  teams: [],
  players: [],
  summary: {
    total: 43,
    sold: 0,
    unsold: 0,
    remaining: 43,
    totalPurseSpent: 0,
  },

  initialLoading: true,
  actionLoading: false,
  toast: null,

  isBudgetModalOpen: false,
  isHistoryModalOpen: false,
  confirmModal: {
    isOpen: false,
    type: "SOLD",
    title: "",
    message: "",
    confirmLabel: "",
    action: async () => {},
  },

  showToast: (message: string, type: "success" | "error" | "info" = "info") => {
    set({ toast: { message, type } });
    setTimeout(() => {
      const currentToast = get().toast;
      if (currentToast && currentToast.message === message) {
        set({ toast: null });
      }
    }, 4000);
  },

  clearToast: () => set({ toast: null }),
  setIsBudgetModalOpen: (open) => set({ isBudgetModalOpen: open }),
  setIsHistoryModalOpen: (open) => set({ isHistoryModalOpen: open }),

  setConfirmModal: (update) =>
    set((state) => ({
      confirmModal: typeof update === "function" ? update(state.confirmModal) : { ...state.confirmModal, ...update },
    })),

  closeConfirmModal: () =>
    set((state) => ({
      confirmModal: { ...state.confirmModal, isOpen: false },
    })),

  // Single Consolidated Initial State Fetch (Zero dual-lambda cold start overhead)
  fetchInitialState: async () => {
    try {
      const res = await fetch("/api/auction?includePlayers=true");
      const data = await res.json();

      if (data.success) {
        set({
          auctionState: data.auctionState,
          currentPlayer: data.currentPlayer,
          teams: data.teams || [],
          players: data.players || [],
          summary: data.summary || get().summary,
          initialLoading: false,
        });
      } else {
        get().showToast(data.error || "Failed to load auction data", "error");
        set({ initialLoading: false });
      }
    } catch (err: any) {
      console.error("fetchInitialState error:", err);
      get().showToast(err.message || "Network error loading auction", "error");
      set({ initialLoading: false });
    }
  },

  refreshState: async (quiet = false) => {
    try {
      const res = await fetch("/api/auction?includePlayers=true");
      const data = await res.json();
      if (data.success) {
        set({
          auctionState: data.auctionState,
          currentPlayer: data.currentPlayer,
          teams: data.teams || [],
          players: data.players || [],
          summary: data.summary || get().summary,
        });
      }
    } catch (err) {
      if (!quiet) {
        console.error("refreshState error:", err);
      }
    }
  },

  // 1. SELECT TEAM (Instant UI Switch, background sync)
  selectTeam: async (teamId: string) => {
    const { teams, auctionState } = get();
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    // Snapshot for rollback
    const prevTeamId = auctionState.currentTeamId;
    const prevTeamName = auctionState.currentTeamName;

    // Instant UI update (0ms)
    set((state) => ({
      auctionState: {
        ...state.auctionState,
        currentTeamId: team.id,
        currentTeamName: team.name,
      },
    }));

    // Background sync
    try {
      const res = await fetch("/api/auction/select-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback on server error
        set((state) => ({
          auctionState: {
            ...state.auctionState,
            currentTeamId: prevTeamId,
            currentTeamName: prevTeamName,
          },
        }));
        get().showToast(data.error || "Failed to select team", "error");
      }
    } catch (err: any) {
      // Rollback
      set((state) => ({
        auctionState: {
          ...state.auctionState,
          currentTeamId: prevTeamId,
          currentTeamName: prevTeamName,
        },
      }));
      get().showToast(err.message || "Network error selecting team", "error");
    }
  },

  // 2. PLACE BID (Instant UI update, budget check, background sync)
  placeBid: async ({ teamId, increment, customAmount, isOpeningBid }) => {
    const { auctionState, teams, currentPlayer } = get();
    if (!currentPlayer) {
      get().showToast("No active player currently under auction", "error");
      return;
    }

    const targetTeamId = teamId || auctionState.currentTeamId;
    if (!targetTeamId) {
      get().showToast("Please select a bidding team first!", "error");
      return;
    }

    const team = teams.find((t) => t.id === targetTeamId);
    if (!team) {
      get().showToast("Selected team not found", "error");
      return;
    }

    let newBid = auctionState.currentBid;
    if (customAmount !== undefined && customAmount !== null) {
      newBid = Number(customAmount);
    } else if (increment !== undefined && increment !== null) {
      newBid = Number(auctionState.currentBid) + Number(increment);
    } else if (isOpeningBid) {
      newBid = auctionState.currentBid;
    }

    if (isNaN(newBid) || newBid <= 0) {
      get().showToast("Bid amount must be a positive number", "error");
      return;
    }

    if (!isOpeningBid && auctionState.currentTeamId !== null && newBid <= auctionState.currentBid) {
      get().showToast(
        `New bid (₹${newBid.toLocaleString("en-IN")}) must be higher than current bid (₹${auctionState.currentBid.toLocaleString("en-IN")})`,
        "error"
      );
      return;
    }

    // Instant local validation
    if (newBid > team.remainingBudget) {
      get().showToast(
        `${team.name} cannot bid ₹${newBid.toLocaleString("en-IN")}. Remaining purse is only ₹${team.remainingBudget.toLocaleString("en-IN")}.`,
        "error"
      );
      return;
    }

    // Snapshot for rollback
    const snapshotState = { ...auctionState, bidHistory: [...auctionState.bidHistory] };

    // Instant UI update (0ms!)
    const optimisticBidItem = {
      teamId: team.id,
      teamName: team.name,
      amount: newBid,
      timestamp: new Date(),
    };

    set((state) => ({
      auctionState: {
        ...state.auctionState,
        currentBid: newBid,
        currentTeamId: team.id,
        currentTeamName: team.name,
        bidHistory: [...state.auctionState.bidHistory, optimisticBidItem],
      },
    }));

    get().showToast(`Bid of ₹${newBid.toLocaleString("en-IN")} placed by ${team.name}`, "success");

    // Background sync
    try {
      const res = await fetch("/api/auction/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: targetTeamId, increment, customAmount, isOpeningBid }),
      });
      const data = await res.json();

      if (!data.success) {
        // Rollback
        set({ auctionState: snapshotState });
        get().showToast(data.error || "Bid could not be placed", "error");
      } else if (data.auctionState) {
        // Smoothly synchronize server version of auctionState
        set((state) => ({
          auctionState: {
            ...state.auctionState,
            ...data.auctionState,
          },
        }));
      }
    } catch (err: any) {
      // Rollback
      set({ auctionState: snapshotState });
      get().showToast(err.message || "Network error placing bid", "error");
    }
  },

  // 3. SELECT PLAYER (Instant UI switch, background sync)
  selectPlayer: async (playerId: number, forceReauction = false) => {
    const { players, auctionState } = get();
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    // Snapshot for rollback
    const prevAuctionState = { ...auctionState };
    const prevCurrentPlayer = get().currentPlayer;
    const prevPlayers = [...players];

    const isCompleted = (player.auctionStatus === "SOLD" || player.auctionStatus === "UNSOLD") && !forceReauction;

    // Instant UI update
    if (isCompleted) {
      set((state) => ({
        currentPlayer: player,
        auctionState: {
          ...state.auctionState,
          currentPlayerId: player.id,
          currentBid: player.soldPrice || player.basePrice,
          currentTeamId: player.teamId || null,
          currentTeamName: player.teamName || null,
        },
      }));
    } else {
      // Live bidding transition
      const updatedPlayers = players.map((p) => {
        if (p.id === playerId) {
          return { ...p, auctionStatus: "CURRENT" as const, soldPrice: null, teamId: null, teamName: null };
        }
        if (p.id === auctionState.currentPlayerId && p.auctionStatus === "CURRENT") {
          return { ...p, auctionStatus: "NOT_STARTED" as const };
        }
        return p;
      });

      const targetPlayerUpdated = updatedPlayers.find((p) => p.id === playerId) || player;

      set({
        players: updatedPlayers,
        currentPlayer: targetPlayerUpdated,
        auctionState: {
          ...auctionState,
          status: "LIVE",
          currentPlayerId: player.id,
          currentBid: player.basePrice || 200000,
          currentTeamId: null,
          currentTeamName: null,
          bidHistory: [],
        },
      });
    }

    // Background sync
    try {
      const res = await fetch("/api/auction/select-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, forceReauction }),
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback
        set({
          auctionState: prevAuctionState,
          currentPlayer: prevCurrentPlayer,
          players: prevPlayers,
        });
        get().showToast(data.error || "Failed to select player", "error");
      } else {
        if (data.message) {
          get().showToast(data.message, "info");
        }
      }
    } catch (err: any) {
      set({
        auctionState: prevAuctionState,
        currentPlayer: prevCurrentPlayer,
        players: prevPlayers,
      });
      get().showToast(err.message || "Network error selecting player", "error");
    }
  },

  // 4. HAMMER DOWN: SOLD (Instant confetti, instant purse deduction, instant status update)
  markSold: async () => {
    const { currentPlayer, auctionState, teams, players, summary } = get();
    if (!currentPlayer || !auctionState.currentTeamId) return;

    const team = teams.find((t) => t.id === auctionState.currentTeamId);
    if (!team) return;

    const finalAmount = auctionState.currentBid;

    // Snapshot for rollback
    const prevTeams = [...teams];
    const prevPlayers = [...players];
    const prevAuctionState = { ...auctionState };
    const prevSummary = { ...summary };

    // Instant Confetti!
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#059669", "#d97706", "#0284c7", "#ffffff"],
    });

    // Instant UI Update:
    // Update team budget & squad
    const updatedTeams = teams.map((t) => {
      if (t.id === team.id) {
        return {
          ...t,
          remainingBudget: t.remainingBudget - finalAmount,
          totalSpent: t.totalSpent + finalAmount,
          playerCount: t.playerCount + 1,
          players: [
            ...t.players,
            {
              playerId: currentPlayer.id,
              name: currentPlayer.name,
              role: currentPlayer.role,
              soldPrice: finalAmount,
            },
          ],
        };
      }
      return t;
    });

    // Update player status
    const updatedPlayers = players.map((p) => {
      if (p.id === currentPlayer.id) {
        return {
          ...p,
          auctionStatus: "SOLD" as const,
          soldPrice: finalAmount,
          teamId: team.id,
          teamName: team.name,
        };
      }
      return p;
    });

    // Update summary
    const updatedSummary = {
      ...summary,
      sold: summary.sold + 1,
      remaining: Math.max(0, summary.remaining - 1),
      totalPurseSpent: summary.totalPurseSpent + finalAmount,
    };

    set({
      teams: updatedTeams,
      players: updatedPlayers,
      summary: updatedSummary,
      currentPlayer: null,
      auctionState: {
        ...auctionState,
        currentPlayerId: null,
        currentBid: 0,
        currentTeamId: null,
        currentTeamName: null,
        bidHistory: [],
      },
    });

    get().showToast(`SOLD! ${currentPlayer.name} sold to ${team.name} for ₹${finalAmount.toLocaleString("en-IN")}`, "success");

    // Background sync
    try {
      const res = await fetch("/api/auction/sold", { method: "POST" });
      const data = await res.json();
      if (!data.success) {
        // Rollback
        set({
          teams: prevTeams,
          players: prevPlayers,
          auctionState: prevAuctionState,
          summary: prevSummary,
          currentPlayer,
        });
        get().showToast(data.error || "Failed to finalize SOLD on server", "error");
      } else {
        if (data.teams) {
          set({ teams: data.teams });
        }
      }
    } catch (err: any) {
      set({
        teams: prevTeams,
        players: prevPlayers,
        auctionState: prevAuctionState,
        summary: prevSummary,
        currentPlayer,
      });
      get().showToast(err.message || "Network error finalizing SOLD", "error");
    }
  },

  // 5. HAMMER DOWN: UNSOLD (Instant UI update, zero budget impact)
  markUnsold: async () => {
    const { currentPlayer, auctionState, players, summary } = get();
    if (!currentPlayer) return;

    // Snapshot
    const prevPlayers = [...players];
    const prevAuctionState = { ...auctionState };
    const prevSummary = { ...summary };

    // Instant UI update
    const updatedPlayers = players.map((p) => {
      if (p.id === currentPlayer.id) {
        return {
          ...p,
          auctionStatus: "UNSOLD" as const,
          soldPrice: null,
          teamId: null,
          teamName: null,
        };
      }
      return p;
    });

    const updatedSummary = {
      ...summary,
      unsold: summary.unsold + 1,
      remaining: Math.max(0, summary.remaining - 1),
    };

    set({
      players: updatedPlayers,
      summary: updatedSummary,
      currentPlayer: null,
      auctionState: {
        ...auctionState,
        currentPlayerId: null,
        currentBid: 0,
        currentTeamId: null,
        currentTeamName: null,
        bidHistory: [],
      },
    });

    get().showToast(`${currentPlayer.name} marked as UNSOLD`, "info");

    // Background sync
    try {
      const res = await fetch("/api/auction/unsold", { method: "POST" });
      const data = await res.json();
      if (!data.success) {
        set({
          players: prevPlayers,
          auctionState: prevAuctionState,
          summary: prevSummary,
          currentPlayer,
        });
        get().showToast(data.error || "Failed to mark UNSOLD on server", "error");
      }
    } catch (err: any) {
      set({
        players: prevPlayers,
        auctionState: prevAuctionState,
        summary: prevSummary,
        currentPlayer,
      });
      get().showToast(err.message || "Network error marking UNSOLD", "error");
    }
  },

  // 6. RESET SINGLE PLAYER (Instant refund, squad restore, status reset)
  resetPlayer: async (playerId: number, forceReauction = false) => {
    const { players, teams, summary } = get();
    const targetPlayer = players.find((p) => p.id === playerId);
    if (!targetPlayer) return;

    const isSold = targetPlayer.auctionStatus === "SOLD";
    const soldPrice = targetPlayer.soldPrice || 0;
    const teamId = targetPlayer.teamId;

    // Snapshot
    const prevTeams = [...teams];
    const prevPlayers = [...players];
    const prevSummary = { ...summary };

    // Instant UI refund and reset
    let updatedTeams = [...teams];
    if (isSold && teamId) {
      updatedTeams = teams.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            remainingBudget: t.remainingBudget + soldPrice,
            totalSpent: Math.max(0, t.totalSpent - soldPrice),
            playerCount: Math.max(0, t.playerCount - 1),
            players: t.players.filter((p) => p.playerId !== playerId),
          };
        }
        return t;
      });
    }

    const updatedPlayers = players.map((p) => {
      if (p.id === playerId) {
        return {
          ...p,
          auctionStatus: "NOT_STARTED" as const,
          soldPrice: null,
          teamId: null,
          teamName: null,
        };
      }
      return p;
    });

    const updatedSummary = {
      ...summary,
      sold: isSold ? Math.max(0, summary.sold - 1) : summary.sold,
      unsold: targetPlayer.auctionStatus === "UNSOLD" ? Math.max(0, summary.unsold - 1) : summary.unsold,
      remaining: summary.remaining + 1,
      totalPurseSpent: Math.max(0, summary.totalPurseSpent - soldPrice),
    };

    set({
      teams: updatedTeams,
      players: updatedPlayers,
      summary: updatedSummary,
    });

    get().showToast(
      `Auction for ${targetPlayer.name} reset.${soldPrice > 0 ? ` ₹${soldPrice.toLocaleString("en-IN")} refunded to purse.` : ""}`,
      "success"
    );

    // Background sync
    try {
      const res = await fetch("/api/auction/reset-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (!data.success) {
        set({
          teams: prevTeams,
          players: prevPlayers,
          summary: prevSummary,
        });
        get().showToast(data.error || "Failed to reset player on server", "error");
        return;
      }

      if (data.teams) {
        set({ teams: data.teams });
      }

      if (forceReauction) {
        await get().selectPlayer(playerId, true);
      }
    } catch (err: any) {
      set({
        teams: prevTeams,
        players: prevPlayers,
        summary: prevSummary,
      });
      get().showToast(err.message || "Network error resetting player", "error");
    }
  },

  // 7. FULL AUCTION RESET
  resetEntireAuction: async () => {
    set({ actionLoading: true });
    try {
      const res = await fetch("/api/auction/reset", { method: "POST" });
      const data = await res.json();
      if (!data.success) {
        get().showToast(data.error || "Failed to reset auction", "error");
      } else {
        await get().fetchInitialState();
        get().showToast("Auction session reset successfully!", "info");
      }
    } catch (err: any) {
      get().showToast(err.message || "Network error resetting auction", "error");
    } finally {
      set({ actionLoading: false });
    }
  },

  // 8. UPDATE TEAM BUDGETS
  updateBudgets: async (newBudgets: Record<string, number>) => {
    // Instant UI update
    set((state) => ({
      teams: state.teams.map((t) => {
        if (newBudgets[t.id] !== undefined) {
          const newInitial = Number(newBudgets[t.id]);
          const newRemaining = Math.max(0, newInitial - (t.totalSpent || 0));
          return {
            ...t,
            initialBudget: newInitial,
            remainingBudget: newRemaining,
          };
        }
        return t;
      }),
    }));

    get().showToast("Franchise budgets updated successfully!", "success");

    // Background sync
    try {
      const res = await fetch("/api/teams/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budgets: newBudgets }),
      });
      const data = await res.json();
      if (!data.success) {
        get().showToast(data.error || "Failed to update budgets on server", "error");
        await get().refreshState(true);
      } else if (data.teams) {
        set({ teams: data.teams });
      }
    } catch (err: any) {
      get().showToast(err.message || "Network error updating budgets", "error");
      await get().refreshState(true);
    }
  },
}));
