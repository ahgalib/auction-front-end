import { defineStore } from 'pinia';
import { graphqlMutation, graphqlQuery } from '../api/graphql';
import { TOKEN_KEY } from '../api/http';
import { PLACE_BID_MUTATION } from '../api/mutations/placeBid';
import { AUCTION_STATE_QUERY } from '../api/queries/auctionState';

export const useAuctionStore = defineStore('auction', {
    state: () => ({
        auctionId: null,
        title: '',
        description: '',
        category: '',
        currentPrice: 0,
        startingPrice: 0,
        participantCount: 0,
        winnerName: null,
        endTime: null,
        bids: [],
        watcherCount: 0,
        isActive: false,
        bidPending: false,
        connectionState: 'connecting',
        loading: true,
        lastAuctionFetchAt: 0,
        auctionFetchInFlight: null,
    }),
    actions: {
        normalizeBid(bid) {
            return {
                id: bid.id ?? `evt-${Date.now()}-${Math.random()}`,
                amount: Number(bid.amount ?? this.currentPrice),
                createdAt: bid.createdAt ?? new Date().toISOString(),
                status: bid.status ?? 'accepted',
                bidderName: bid.bidderName ?? bid.userName ?? null,
                loading: Boolean(bid.loading),
            };
        },
        async bootstrap(auctionId) {
            this.auctionId = auctionId;
            await this.fetchAuction(true);
            this.loading = false;
        },
        async fetchAuction(force = false) {
            if (!this.auctionId) return;
            const now = Date.now();
            const FETCH_COOLDOWN_MS = 2500;

            if (!force && this.auctionFetchInFlight) {
                return this.auctionFetchInFlight;
            }

            if (!force && now - this.lastAuctionFetchAt < FETCH_COOLDOWN_MS) {
                return;
            }

            const run = async () => {
            const data = await graphqlQuery(
                AUCTION_STATE_QUERY,
                { id: this.auctionId },
                null,
                { forceNetwork: force }
            );
            this.title = data?.auction?.title ?? '';
            this.description = data?.auction?.description ?? '';
            this.category = data?.auction?.category ?? '';
            this.currentPrice = Number(data?.auction?.currentPrice ?? 0);
            this.startingPrice = Number(data?.auction?.startingPrice ?? 0);
            this.participantCount = Number(data?.auction?.participantCount ?? 0);
            this.watcherCount = this.participantCount;
            this.winnerName = data?.auction?.winnerName ?? null;
            this.endTime = data?.auction?.endTime ?? null;
            this.isActive = data?.auction?.status === 'active';
            this.bids = Array.isArray(data?.auction?.bids)
                ? data.auction.bids.map((bid) => this.normalizeBid(bid))
                : [];
                this.lastAuctionFetchAt = Date.now();
            };

            this.auctionFetchInFlight = run();
            try {
                await this.auctionFetchInFlight;
            } finally {
                this.auctionFetchInFlight = null;
            }
        },
        async placeBid(amount) {
            if (this.bidPending) return null;
            this.bidPending = true;
            const requestId = `bid-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

            const tempId = `tmp-${Date.now()}`;
            this.bids.unshift({
                id: tempId,
                amount,
                createdAt: new Date().toISOString(),
                status: 'pending',
                loading: true,
            });

            try {
                const token = localStorage.getItem(TOKEN_KEY);
                const data = await graphqlMutation(
                    PLACE_BID_MUTATION,
                    { auctionId: this.auctionId, amount, requestId },
                    token,
                );

                const result = data?.placeBid;
                this.currentPrice = Number(result?.currentPrice ?? this.currentPrice);
                // Auction end time is admin-controlled; avoid client-side timer jitter from bid mutation payload races.
                // Canonical end time is refreshed from AuctionState query.

                if (!result?.accepted) {
                    const error = new Error(result?.errorCode || 'Bid rejected');
                    error.code = result?.errorCode || 'BAD_USER_INPUT';
                    throw error;
                }

                // Remove temporary entry and rehydrate canonical feed once after a successful bid.
                this.bids = this.bids.filter((bid) => bid.id !== tempId);
                await this.fetchAuction(true);

                return result;
            } catch (error) {
                this.bids = this.bids.filter((bid) => bid.id !== tempId);
                throw error;
            } finally {
                this.bidPending = false;
            }
        },
        flushBufferedBids(incomingBids) {
            const normalized = incomingBids.map((bid) => this.normalizeBid(bid));
            const seen = new Set();

            const dedupedIncoming = normalized.filter((bid) => {
                const key = `${bid.id}|${bid.amount}|${bid.createdAt}|${bid.bidderName}|${bid.status}`;
                if (seen.has(key)) {
                    return false;
                }
                seen.add(key);
                return true;
            });

            const existing = new Set(
                this.bids.map((bid) => `${bid.id}|${Number(bid.amount)}|${bid.createdAt}|${bid.bidderName ?? ''}|${bid.status}`),
            );

            const newItems = dedupedIncoming.filter((bid) => {
                const key = `${bid.id}|${bid.amount}|${bid.createdAt}|${bid.bidderName ?? ''}|${bid.status}`;
                if (existing.has(key)) {
                    return false;
                }

                // Cross-source dedupe: realtime event item and fetched DB item can differ in id
                // but represent the same bid.
                return !this.bids.some((existingBid) => {
                    const sameAmount = Number(existingBid.amount) === Number(bid.amount);
                    const sameBidder = (existingBid.bidderName ?? '') === (bid.bidderName ?? '');
                    const sameStatus = existingBid.status === bid.status;
                    const a = new Date(existingBid.createdAt).getTime();
                    const b = new Date(bid.createdAt).getTime();
                    const closeInTime = Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 2000;
                    return sameAmount && sameBidder && sameStatus && closeInTime;
                });
            });

            this.bids.unshift(...newItems);
            this.bids = this.bids.slice(0, 100);
        },
        async hardResync({ syncTime = false } = {}) {
            await this.fetchAuction(true);
        },
    },
});
