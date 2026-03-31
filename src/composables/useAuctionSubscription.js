import { onMounted, onUnmounted, watch } from 'vue';

export function useAuctionSubscription(store, options = {}) {
    let channel = null;
    let syncTimer = null;
    let flushTimer = null;
    let bidsBuffer = [];
    let boundConnection = null;
    let onConnected = null;
    let onDisconnected = null;

    const flush = () => {
        if (bidsBuffer.length) {
            store.flushBufferedBids(bidsBuffer);
            bidsBuffer = [];
        }
    };

    const onBidPlaced = (payload) => {
        const amount = Number(payload.amount ?? store.currentPrice);
        const updateType = payload?.updateType ?? 'bid_accepted';

        if (updateType === 'bid_withdrawn') {
            // Admin bid withdrawal can intentionally move price backward.
            store.currentPrice = amount;
        } else {
            // Guard against out-of-order realtime events that can otherwise cause price flicker.
            store.currentPrice = Math.max(Number(store.currentPrice ?? 0), amount);
        }

        store.participantCount = Number(payload.participantCount ?? store.participantCount ?? 0);
        store.watcherCount = Math.max(Number(store.watcherCount ?? 0), Number(store.participantCount ?? 0));

        if (payload.bid) {
            bidsBuffer.push(payload.bid);
        } else {
            const eventTimestampMs = Number(payload.eventTimestampMs ?? Date.now());
            bidsBuffer.push({
                id: payload.eventId ?? `evt-${payload.updateType ?? 'bid'}-${eventTimestampMs}-${payload.bidderName ?? 'unknown'}-${amount}`,
                amount: Number(payload.amount ?? store.currentPrice),
                createdAt: new Date(eventTimestampMs).toISOString(),
                status: payload.updateType === 'bid_withdrawn' ? 'withdrawn' : 'accepted',
                bidderName: payload.bidderName ?? null,
            });
        }

        if (typeof options.onBidEvent === 'function') {
            options.onBidEvent(payload);
        }
    };

    const subscribe = () => {
        if (channel || syncTimer) {
            return;
        }

        if (!store.isActive) {
            store.connectionState = 'idle';
            return;
        }

        if (window.Echo && store.auctionId) {
            channel = window.Echo.channel(`auction.${store.auctionId}`);
            channel.listen('.BidUpdated', onBidPlaced);

            boundConnection = window.Echo.connector?.pusher?.connection ?? null;
            onConnected = () => {
                store.connectionState = 'connected';
            };
            onDisconnected = () => {
                store.connectionState = 'disconnected';
            };

            boundConnection?.bind('connected', onConnected);
            boundConnection?.bind('disconnected', onDisconnected);
        } else {
            // Fallback polling mode when WebSocket is not available.
            store.connectionState = 'polling';
            syncTimer = window.setInterval(() => {
                store.fetchAuction();
            }, 15000); // Poll every 15 seconds
        }
    };

    const unsubscribe = () => {
        if (channel && window.Echo) {
            window.Echo.leave(`auction.${store.auctionId}`);
        }
        if (syncTimer) {
            window.clearInterval(syncTimer);
            syncTimer = null;
        }
        if (boundConnection) {
            if (onConnected) {
                boundConnection.unbind('connected', onConnected);
            }
            if (onDisconnected) {
                boundConnection.unbind('disconnected', onDisconnected);
            }
            boundConnection = null;
        }
        onConnected = null;
        onDisconnected = null;
        channel = null;
    };

    const onVisibilityChange = () => {
        if (document.visibilityState === 'visible' && store.isActive) {
            store.hardResync({ syncTime: true });
        }
    };

    onMounted(() => {
        subscribe();
        flushTimer = window.setInterval(flush, 200);
        document.addEventListener('visibilitychange', onVisibilityChange);
    });

    watch(
        () => store.isActive,
        (isActive) => {
            if (!isActive) {
                unsubscribe();
                store.connectionState = 'closed';
                return;
            }

            if (!channel) {
                subscribe();
            }
        }
    );

    onUnmounted(() => {
        if (flushTimer) {
            window.clearInterval(flushTimer);
        }
        unsubscribe();
        document.removeEventListener('visibilitychange', onVisibilityChange);
    });
}
