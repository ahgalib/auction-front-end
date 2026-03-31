import { defineStore } from 'pinia';
import { graphqlMutation, graphqlQuery } from '../api/graphql';
import { TOKEN_KEY } from '../api/http';
import { PLACE_BID_MUTATION } from '../api/mutations/placeBid';
import { AUCTION_STATE_QUERY } from '../api/queries/auctionState';
import { useServerTime } from '../composables/useServerTime';

export const useAuctionStore = defineStore('auction', {
    state: () => ({
        auctionId: null,
        currentPrice: 0,
        endTime: null,
        bids: [],
        watcherCount: 0,
        isActive: false,
        bidPending: false,
        connectionState: 'connecting',
        loading: true,
    }),
    actions: {
        async bootstrap(auctionId) {
            this.auctionId = auctionId;
            await Promise.all([this.fetchAuction(), useServerTime().sync()]);
            this.loading = false;
        },
        async fetchAuction() {
            if (!this.auctionId) return;
            const data = await graphqlQuery(AUCTION_STATE_QUERY, { id: this.auctionId });
            this.currentPrice = Number(data?.auction?.currentPrice ?? 0);
            this.endTime = data?.auction?.endTime ?? null;
            this.isActive = data?.auction?.status === 'active';
        },
        async placeBid(amount) {
            if (this.bidPending) return null;
            this.bidPending = true;

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
                    { auctionId: this.auctionId, amount },
                    token,
                );

                const result = data?.placeBid;
                this.currentPrice = Number(result?.currentPrice ?? this.currentPrice);
                this.endTime = result?.endTime ?? this.endTime;

                if (!result?.accepted) {
                    const error = new Error(result?.errorCode || 'Bid rejected');
                    error.code = result?.errorCode || 'BAD_USER_INPUT';
                    throw error;
                }

                this.bids = this.bids.map((bid) => (bid.id === tempId ? { ...bid, loading: false, status: 'accepted' } : bid));

                return result;
            } catch (error) {
                this.bids = this.bids.filter((bid) => bid.id !== tempId);
                throw error;
            } finally {
                this.bidPending = false;
            }
        },
        flushBufferedBids(incomingBids) {
            const normalized = incomingBids.map((bid) => ({
                id: bid.id ?? `evt-${Date.now()}-${Math.random()}`,
                amount: Number(bid.amount ?? this.currentPrice),
                createdAt: bid.createdAt ?? new Date().toISOString(),
                status: bid.status ?? 'accepted',
                loading: false,
            }));

            this.bids.unshift(...normalized);
            this.bids = this.bids.slice(0, 100);
        },
        async hardResync() {
            await Promise.all([this.fetchAuction(), useServerTime().sync()]);
        },
    },
});
