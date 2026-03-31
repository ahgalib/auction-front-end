<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useAuctionStore } from '../stores/auctionStore';
import { useAuthStore } from '../stores/auth';
import { useAuctionSubscription } from '../composables/useAuctionSubscription';
import AuctionCountdown from '../components/auction/AuctionCountdown.vue';
import BidActionPad from '../components/auction/BidActionPad.vue';
import LivePriceDisplay from '../components/auction/LivePriceDisplay.vue';
import ParticipationBadge from '../components/auction/ParticipationBadge.vue';
import BidFeed from '../components/auction/BidFeed.vue';
import ConnectionOverlay from '../components/shared/ConnectionOverlay.vue';
import ToastMessage from '../components/shared/ToastMessage.vue';

const props = defineProps({
    auctionId: {
        type: Number,
        required: true,
    },
});

const auction = useAuctionStore();
const auth = useAuthStore();
const toast = ref('');
const toastKind = ref('info');
const ariaStatus = ref('');
const closingAuction = ref(false);
let auctionEndTimer = null;
let handledEndTime = null;

const loginForm = ref({
    email: '',
    password: '',
});

const registerForm = ref({
    name: '',
    email: '',
    password: '',
});

const oauthForm = ref({
    grantType: 'password',
    clientId: 1,
    clientSecret: 'dev-client-secret-change-me',
    username: '',
    password: '',
    scope: 'bid:write auction:read',
});

const showToast = (message, kind = 'info') => {
    toast.value = message;
    toastKind.value = kind;
    window.setTimeout(() => {
        toast.value = '';
    }, 2500);
};

const playTone = (kind) => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = kind === 'success' ? 'triangle' : 'sawtooth';
    osc.frequency.value = kind === 'success' ? 880 : 220;
    gain.gain.value = 0.03;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
};

const handleBid = async (amount) => {
    try {
        await auction.placeBid(amount);
        playTone('success');
        showToast('Bid submitted');
    } catch (error) {
        playTone('error');
        const code = error?.code;
        if (code === 'LOW_BID') {
            ariaStatus.value = 'You have been outbid';
            showToast('Bid too low. You were outbid.', 'error');
        } else if (code === 'UNAUTHENTICATED') {
            showToast('Please login first', 'error');
        } else {
            showToast(error?.message || 'Bid failed', 'error');
        }
    }
};

const handleRegister = async () => {
    const result = await auth.register(registerForm.value.name, registerForm.value.email, registerForm.value.password);
    if (result.success) {
        showToast('Registration successful');
    } else {
        showToast(auth.error || 'Registration failed', 'error');
    }
};

const handleCountdownEnded = async () => {
    const currentEndTime = auction.endTime;
    if (!auction.isActive || !currentEndTime || closingAuction.value || handledEndTime === currentEndTime) return;

    closingAuction.value = true;
    handledEndTime = currentEndTime;

    try {
        auction.isActive = false;
        await auction.fetchAuction(true);

        if (auction.winnerName) {
            showToast(`${auction.winnerName} won the auction!`, 'success');
        } else {
            showToast('Auction closed.', 'info');
        }
    } finally {
        closingAuction.value = false;
    }
};

const handleIncomingBidEvent = (payload) => {
    const bidderName = payload?.bidderName;
    const amount = Number(payload?.amount ?? 0);

    if (!bidderName || bidderName === auth.user?.name) {
        return;
    }

    showToast(`${bidderName} just bid $${amount.toFixed(2)}`, 'info');
};

const handleLogin = async () => {
    const result = await auth.login(loginForm.value.email, loginForm.value.password, false);
    if (result.success) {
        showToast('Logged in');
    } else {
        showToast(auth.error || 'Login failed', 'error');
    }
};

const handleOAuth = async () => {
    const result = await auth.oauthPasswordGrant(oauthForm.value);
    if (result.success) {
        showToast('OAuth token issued');
    } else {
        showToast(auth.error || 'OAuth login failed', 'error');
    }
};

const connectionLost = computed(() => auction.connectionState === 'disconnected');
const liveBidderCount = computed(() => Math.max(Number(auction.watcherCount ?? 0), Number(auction.participantCount ?? 0)));

const clearAuctionEndTimer = () => {
    if (auctionEndTimer) {
        window.clearTimeout(auctionEndTimer);
        auctionEndTimer = null;
    }
};

const scheduleAuctionEndWatcher = () => {
    clearAuctionEndTimer();

    if (!auction.isActive || !auction.endTime) {
        return;
    }

    const endAt = new Date(auction.endTime).getTime();
    if (!Number.isFinite(endAt)) {
        return;
    }

    const delay = Math.max(0, endAt - Date.now());
    auctionEndTimer = window.setTimeout(() => {
        void handleCountdownEnded();
    }, delay);
};

onMounted(async () => {
    await auction.bootstrap(props.auctionId);
    try {
        await auth.checkAuth();
    } catch {
        // No token session.
    }
});

useAuctionSubscription(auction, {
    onBidEvent: handleIncomingBidEvent,
});

watch(
    () => [auction.endTime, auction.isActive, auction.auctionId],
    () => {
        if (!auction.isActive) {
            handledEndTime = null;
        } else if (handledEndTime && handledEndTime !== auction.endTime) {
            handledEndTime = null;
        }
        scheduleAuctionEndWatcher();
    },
    { immediate: true }
);

onUnmounted(() => {
    clearAuctionEndTimer();
});
</script>

<template>
    <main class="auction-shell">
        <ConnectionOverlay :visible="connectionLost" />

        <div class="mx-auto max-w-6xl p-4 md:p-8">
            <header class="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p class="text-xs uppercase tracking-[0.25em] text-cyan-200/70">Velocity War Room</p>
                    <h1 class="text-3xl font-semibold text-white">{{ auction.title || `Auction #${auction.auctionId}` }}</h1>
                    <p class="mt-1 text-sm text-cyan-100/80">{{ auction.description || 'Live competitive auction room.' }}</p>
                    <p class="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-200/70">
                        {{ auction.category || 'General' }} | Participants: {{ auction.participantCount }}
                    </p>
                </div>
                <ParticipationBadge :watcher-count="liveBidderCount" :connection-state="auction.connectionState" />
            </header>

            <div class="grid gap-4 lg:grid-cols-[2fr_1fr]">
                <section class="space-y-4">
                    <LivePriceDisplay :price="auction.currentPrice" />
                    <AuctionCountdown :end-time="auction.endTime" :is-active="auction.isActive" @ended="handleCountdownEnded" />
                    <BidActionPad :current-price="auction.currentPrice" :disabled="auction.bidPending || !auth.isAuthenticated || !auction.isActive" @submit="handleBid" />
                    <div v-if="!auction.isActive" class="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-4 text-sm">
                        <div class="celebration-wrap">
                            <div class="confetti-strip"></div>
                            <p class="text-xs uppercase tracking-[0.2em] text-emerald-200/90">Auction Closed</p>
                            <p class="mt-2 text-2xl font-bold text-emerald-50 celebration-pop">Winner: {{ auction.winnerName || 'No winner' }}</p>
                            <p class="mt-1 text-emerald-100/90">
                                Final Price: ${{ Number(auction.currentPrice).toFixed(2) }}
                            </p>
                            <p class="mt-2 text-xs text-emerald-100/80">Congratulations to the winner. Bidding is now locked.</p>
                        </div>
                    </div>
                    <p class="sr-only" aria-live="assertive">{{ ariaStatus }}</p>
                </section>

                <aside class="space-y-4">
                    <BidFeed :bids="auction.bids" />
                    <section class="rounded-xl border border-white/20 bg-white/5 p-4">
                        <h2 class="text-sm uppercase tracking-[0.2em] text-white/70">User Access</h2>
                        <div v-if="auth.isAuthenticated" class="mt-3 text-sm">
                            <p class="text-green-300">Logged in as {{ auth.user?.email }}</p>
                            <button class="mt-2 rounded-md bg-white/10 px-3 py-2" @click="auth.logout">Logout</button>
                        </div>
                        <div v-else class="mt-3 space-y-3">
                            <div class="grid gap-2">
                                <input v-model="registerForm.name" class="auth-input" placeholder="Name" />
                                <input v-model="registerForm.email" class="auth-input" placeholder="Email" />
                                <input v-model="registerForm.password" class="auth-input" type="password" placeholder="Password" />
                                <button class="auth-btn" @click="handleRegister">Register</button>
                            </div>
                            <div class="grid gap-2">
                                <input v-model="loginForm.email" class="auth-input" placeholder="Email" />
                                <input v-model="loginForm.password" class="auth-input" type="password" placeholder="Password" />
                                <button class="auth-btn" @click="handleLogin">Login</button>
                            </div>
                            <div class="grid gap-2">
                                <input v-model="oauthForm.username" class="auth-input" placeholder="OAuth Username" />
                                <input v-model="oauthForm.password" class="auth-input" type="password" placeholder="OAuth Password" />
                                <button class="auth-btn" @click="handleOAuth">OAuth2 Password Grant</button>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>

        <ToastMessage :message="toast" :kind="toastKind" />
    </main>
</template>

<style scoped>
.celebration-wrap {
    position: relative;
    overflow: hidden;
    border-radius: 0.75rem;
    padding: 0.5rem 0.25rem;
}

.confetti-strip {
    position: absolute;
    inset: 0 0 auto 0;
    height: 4px;
    background: linear-gradient(90deg, #f59e0b, #10b981, #06b6d4, #f43f5e, #f59e0b);
    background-size: 200% 100%;
    animation: confettiShift 2s linear infinite;
}

.celebration-pop {
    animation: winnerPop 900ms ease-out;
}

@keyframes confettiShift {
    0% {
        background-position: 0% 50%;
    }
    100% {
        background-position: 200% 50%;
    }
}

@keyframes winnerPop {
    0% {
        transform: scale(0.92);
        opacity: 0.5;
    }
    60% {
        transform: scale(1.04);
        opacity: 1;
    }
    100% {
        transform: scale(1);
    }
}
</style>
