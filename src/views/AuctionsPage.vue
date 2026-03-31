<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { graphqlQuery } from '../api/graphql';
import { AUCTIONS_QUERY } from '../api/queries/auctions';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const loading = ref(true);
const auctions = ref([]);
const error = ref('');

const loadAuctions = async () => {
    loading.value = true;
    error.value = '';
    try {
        const data = await graphqlQuery(AUCTIONS_QUERY);
        auctions.value = data?.auctions || [];
    } catch (err) {
        error.value = err?.message || 'Failed to load auctions.';
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    if (!auth.isAuthenticated) {
        router.push('/login');
        return;
    }

    if (!auth.user && auth.token) {
        await auth.checkAuth();
    }

    await loadAuctions();
});

const goRoom = (auctionId) => {
    router.push(`/bid/${auctionId}`);
};
</script>

<template>
    <main class="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 md:px-8">
        <section class="mx-auto max-w-7xl">
            <header class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-900/30 to-blue-900/20 p-6">
                <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Auction Discovery</p>
                    <h1 class="mt-1 text-3xl font-black">Active Auctions</h1>
                    <p class="mt-1 text-sm text-cyan-100/80">Pick any running auction room and join instantly.</p>
                </div>
                <div class="flex items-center gap-2">
                    <button
                        v-if="auth.user?.is_admin"
                        class="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
                        @click="router.push('/admin/auctions')"
                    >
                        Admin Panel
                    </button>
                    <button class="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20" @click="auth.logout">Logout</button>
                </div>
            </header>

            <p v-if="error" class="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{{ error }}</p>
            <p v-if="loading" class="text-sm text-cyan-100/80">Loading auctions...</p>

            <section v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <article
                    v-for="auction in auctions"
                    :key="auction.id"
                    class="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg shadow-cyan-900/10"
                >
                    <p class="text-xs uppercase tracking-[0.2em] text-cyan-300/70">{{ auction.category }}</p>
                    <h2 class="mt-2 text-xl font-bold">{{ auction.title }}</h2>
                    <p class="mt-2 min-h-[48px] text-sm text-slate-300">{{ auction.description || 'No description provided.' }}</p>

                    <div class="mt-4 space-y-1 text-sm">
                        <p>Current Price: <span class="font-semibold text-cyan-200">${{ Number(auction.currentPrice).toFixed(2) }}</span></p>
                        <p>Min Increment: <span class="font-semibold">${{ Number(auction.minIncrement).toFixed(2) }}</span></p>
                        <p>Participants: <span class="font-semibold">{{ auction.participantCount }}</span></p>
                        <p>Ends: <span class="font-semibold">{{ auction.endTime }}</span></p>
                    </div>

                    <button class="mt-5 w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400" @click="goRoom(auction.id)">
                        Enter Auction Room
                    </button>
                </article>
            </section>
        </section>
    </main>
</template>
