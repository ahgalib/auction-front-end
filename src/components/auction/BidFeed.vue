<script setup>
defineProps({
    bids: {
        type: Array,
        default: () => [],
    },
});
</script>

<template>
    <section class="rounded-xl border border-white/20 bg-black/20 p-4">
        <p class="mb-3 text-xs uppercase tracking-[0.2em] text-white/70">Live Bid Feed</p>
        <ul class="max-h-[28rem] space-y-2 overflow-y-auto pr-1 text-sm bid-scroll">
            <li v-for="bid in bids" :key="bid.id" class="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
                <div>
                    <span>${{ Number(bid.amount).toFixed(2) }}</span>
                    <p v-if="bid.bidderName" class="text-xs text-cyan-200/90">{{ bid.bidderName }}</p>
                </div>
                <span class="text-xs uppercase" :class="bid.loading ? 'text-amber-300' : 'text-cyan-300'">
                    {{ bid.loading ? 'pending' : bid.status }}
                </span>
            </li>
        </ul>
    </section>
</template>

<style scoped>
.bid-scroll {
    scrollbar-width: thin;
}
</style>
