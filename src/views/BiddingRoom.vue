<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { auctionService } from '../services/authService';
import FormInput from '../components/common/FormInput.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const auctionId = computed(() => parseInt(route.params.auctionId) || 1);
const auction = ref(null);
const bidAmount = ref('');
const isLoading = ref(false);
const error = ref('');
const successMessage = ref('');
const timeRemaining = ref('');
const timerInterval = ref(null);

const userHighestBid = computed(() => {
    if (!auction.value?.bids) return null;
    return auction.value.bids.find((bid) => bid.user_id === authStore.user?.id);
});

const isOutbid = computed(() => {
    return (
        auction.value?.current_highest_bid &&
        authStore.user?.id !== auction.value.current_highest_bid.user_id &&
        userHighestBid.value
    );
});

const formatTime = (date) => {
    return new Date(date).toLocaleString();
};

const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
};

const updateCountdown = () => {
    if (!auction.value) return;

    const endTime = new Date(auction.value.ends_at).getTime();
    const now = Date.now();
    const diff = endTime - now;

    if (diff <= 0) {
        timeRemaining.value = 'Auction Ended';
        if (timerInterval.value) clearInterval(timerInterval.value);
        return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    timeRemaining.value = `${hours}h ${minutes}m ${seconds}s`;
};

const loadAuction = async () => {
    try {
        auction.value = await auctionService.getAuction(auctionId.value);
        updateCountdown();
    } catch (err) {
        error.value = 'Failed to load auction';
    }
};

const validateBidAmount = () => {
    error.value = '';

    const amount = parseFloat(bidAmount.value);

    if (!bidAmount.value || isNaN(amount) || amount <= 0) {
        error.value = 'Please enter a valid bid amount';
        return false;
    }

    if (auction.value?.current_highest_bid && amount <= auction.value.current_highest_bid.amount) {
        error.value = `Bid must be higher than current bid of ${formatCurrency(auction.value.current_highest_bid.amount)}`;
        return false;
    }

    if (amount > authStore.user.wallet_balance) {
        error.value = 'Insufficient wallet balance';
        return false;
    }

    return true;
};

const placeBid = async () => {
    if (!validateBidAmount()) return;

    isLoading.value = true;
    error.value = '';
    successMessage.value = '';

    try {
        const result = await auctionService.placeBid(auctionId.value, parseFloat(bidAmount.value));

        successMessage.value = 'Bid placed successfully!';
        bidAmount.value = '';

        // Update local state
        if (result.user) {
            authStore.user.wallet_balance = result.user.wallet_balance;
        }

        // Reload auction data
        await loadAuction();

        setTimeout(() => {
            successMessage.value = '';
        }, 3000);
    } catch (err) {
        if (err.response?.status === 402) {
            error.value = 'Insufficient wallet balance';
        } else if (err.response?.data?.errors?.amount) {
            error.value = err.response.data.errors.amount[0];
        } else {
            error.value = err.response?.data?.message || 'Failed to place bid';
        }
    }

    isLoading.value = false;
};

const handleLogout = async () => {
    authStore.logout();
    router.push('/');
};

onMounted(() => {
    loadAuction();
    timerInterval.value = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
    if (timerInterval.value) clearInterval(timerInterval.value);
});
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-indigo-50">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex items-center justify-between">
                    <!-- Logo -->
                    <router-link to="/" class="flex items-center space-x-2 group">
                        <h1 class="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:opacity-80 transition">
                            🏆 Velocity
                        </h1>
                    </router-link>

                    <!-- User Info -->
                    <div class="flex items-center space-x-6">
                        <div class="hidden sm:flex flex-col items-end">
                            <p class="text-sm font-bold text-gray-900">{{ authStore.user?.name }}</p>
                            <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
                        </div>
                        <button
                            @click="handleLogout"
                            class="px-4 py-2 rounded-lg bg-red-100 text-red-600 font-bold hover:bg-red-200 transition text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <!-- Loading State -->
            <div v-if="!auction" class="text-center py-20">
                <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600 mb-4"></div>
                <p class="text-gray-600 text-lg font-medium">Loading auction...</p>
            </div>

            <!-- Content Grid -->
            <div v-else class="grid lg:grid-cols-3 gap-8">
                <!-- Main Column -->
                <div class="lg:col-span-2 space-y-8">
                    <!-- Auction Header Card -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 sm:p-10 border border-gray-100">
                        <h2 class="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
                            {{ auction.name }}
                        </h2>
                        <p class="text-gray-600 text-lg leading-relaxed mb-8">
                            {{ auction.description }}
                        </p>

                        <!-- Stats Grid -->
                        <div class="grid sm:grid-cols-3 gap-6">
                            <!-- Current Price -->
                            <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                                <p class="text-sm font-semibold text-indigo-700 mb-2">💰 Current Highest Bid</p>
                                <p class="text-4xl font-black text-indigo-600">
                                    {{ auction.current_highest_bid ? formatCurrency(auction.current_highest_bid.amount) : formatCurrency(auction.starting_price) }}
                                </p>
                                <p v-if="auction.current_highest_bid" class="text-xs text-indigo-700 mt-3 font-semibold">
                                    by {{ auction.current_highest_bid.user?.name }}
                                </p>
                                <p v-else class="text-xs text-indigo-700 mt-3">No bids yet</p>
                            </div>

                            <!-- Time Remaining -->
                            <div :class="[
                                'rounded-xl p-6 border transition-all',
                                timeRemaining === 'Auction Ended' 
                                    ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' 
                                    : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
                            ]">
                                <p :class="[
                                    'text-sm font-semibold mb-2',
                                    timeRemaining === 'Auction Ended' ? 'text-red-700' : 'text-amber-700'
                                ]">
                                    ⏱️ Time Remaining
                                </p>
                                <p :class="[
                                    'text-4xl font-black',
                                    timeRemaining === 'Auction Ended' ? 'text-red-600' : 'text-amber-600'
                                ]">
                                    {{ timeRemaining }}
                                </p>
                            </div>

                            <!-- Wallet Balance -->
                            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                                <p class="text-sm font-semibold text-green-700 mb-2">💳 Your Wallet</p>
                                <p class="text-4xl font-black text-green-600">
                                    {{ formatCurrency(authStore.user.wallet_balance) }}
                                </p>
                                <p class="text-xs text-green-700 mt-3">Available to bid</p>
                            </div>
                        </div>
                    </div>

                    <!-- Your Bid Status -->
                    <div v-if="userHighestBid || isOutbid" :class="[
                        'rounded-2xl p-6 border-l-4 border-b-4',
                        isOutbid 
                            ? 'bg-gradient-to-r from-red-50 to-rose-50 border-l-red-500 border-b-red-500' 
                            : 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-green-500 border-b-green-500',
                    ]">
                        <p :class="[
                            'text-lg font-black mb-2',
                            isOutbid ? 'text-red-700' : 'text-green-700'
                        ]">
                            {{ isOutbid ? '⚠️ You have been outbid!' : '✅ You are the highest bidder!' }}
                        </p>
                        <p :class="[
                            'text-sm',
                            isOutbid ? 'text-red-600' : 'text-green-600'
                        ]">
                            Your highest bid: <span class="font-bold">{{ formatCurrency(userHighestBid.amount) }}</span> at {{ formatTime(userHighestBid.bid_at) }}
                        </p>
                    </div>

                    <!-- Bid History -->
                    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div class="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <h3 class="text-2xl font-black text-gray-900">📊 Bid History</h3>
                        </div>

                        <div v-if="!auction.bids || auction.bids.length === 0" class="px-8 py-16 text-center">
                            <p class="text-gray-500 text-lg">🎯 No bids yet. Be the first to bid!</p>
                        </div>

                        <div v-else class="divide-y divide-gray-200">
                            <div
                                v-for="(bid, idx) in auction.bids.slice(0, 10)"
                                :key="bid.id"
                                :class="[
                                    'px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors',
                                    bid.user_id === authStore.user.id && 'bg-indigo-50 border-l-4 border-indigo-500',
                                ]"
                            >
                                <div>
                                    <div class="flex items-center space-x-3">
                                        <p class="text-lg font-bold text-gray-900">
                                            {{ bid.user?.name }}
                                        </p>
                                        <span v-if="bid.user_id === authStore.user.id" class="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                                            You
                                        </span>
                                        <span v-if="idx === 0" class="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                            🏆 Highest
                                        </span>
                                    </div>
                                    <p class="text-sm text-gray-500 mt-2">{{ formatTime(bid.bid_at) }}</p>
                                </div>
                                <p class="text-3xl font-black text-indigo-600">{{ formatCurrency(bid.amount) }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <div>
                    <!-- Bid Placement Card -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 sticky top-24">
                        <h3 class="text-2xl font-black text-gray-900 mb-8">🎯 Place Your Bid</h3>

                        <!-- Error Message -->
                        <div v-if="error" class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                            <p class="text-red-700 text-sm font-semibold">{{ error }}</p>
                        </div>

                        <!-- Success Message -->
                        <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                            <p class="text-green-700 text-sm font-semibold">✅ {{ successMessage }}</p>
                        </div>

                        <!-- Bid Form -->
                        <div v-if="timeRemaining !== 'Auction Ended'" class="space-y-6">
                            <FormInput
                                v-model="bidAmount"
                                label="Bid Amount (USD)"
                                type="number"
                                placeholder="Enter bid amount"
                                :step="0.01"
                                :disabled="isLoading"
                            />

                            <!-- Increment Buttons -->
                            <div>
                                <p class="text-xs font-bold text-gray-600 mb-3">Quick Add</p>
                                <div class="grid grid-cols-4 gap-2">
                                    <button
                                        @click="bidAmount = (parseFloat(bidAmount) || (auction.current_highest_bid?.amount || auction.starting_price)) + 10"
                                        type="button"
                                        class="py-2 px-2 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 rounded-lg font-bold text-sm transition-colors"
                                    >
                                        +$10
                                    </button>
                                    <button
                                        @click="bidAmount = (parseFloat(bidAmount) || (auction.current_highest_bid?.amount || auction.starting_price)) + 25"
                                        type="button"
                                        class="py-2 px-2 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 rounded-lg font-bold text-sm transition-colors"
                                    >
                                        +$25
                                    </button>
                                    <button
                                        @click="bidAmount = (parseFloat(bidAmount) || (auction.current_highest_bid?.amount || auction.starting_price)) + 50"
                                        type="button"
                                        class="py-2 px-2 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 rounded-lg font-bold text-sm transition-colors"
                                    >
                                        +$50
                                    </button>
                                    <button
                                        @click="bidAmount = (parseFloat(bidAmount) || (auction.current_highest_bid?.amount || auction.starting_price)) + 100"
                                        type="button"
                                        class="py-2 px-2 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 text-pink-700 rounded-lg font-bold text-sm transition-colors"
                                    >
                                        +$100
                                    </button>
                                </div>
                            </div>

                            <!-- Place Bid Button -->
                            <button
                                @click="placeBid"
                                :disabled="isLoading"
                                class="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 text-lg"
                            >
                                {{ isLoading ? 'Placing Bid...' : 'Place Bid' }}
                            </button>
                        </div>

                        <!-- Auction Ended State -->
                        <div v-else class="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-center border border-gray-200">
                            <p class="text-gray-900 font-black text-lg mb-3">⏸️ Auction Ended</p>
                            <p class="text-gray-600 text-sm mb-2">
                                Winner: <span class="font-bold text-gray-900">{{
                                    auction.current_highest_bid?.user?.name || 'No bids'
                                }}</span>
                            </p>
                            <p v-if="auction.current_highest_bid" class="text-sm text-gray-600 font-semibold text-indigo-600">
                                Final Price: {{ formatCurrency(auction.current_highest_bid.amount) }}
                            </p>
                        </div>

                        <!-- Auction Details -->
                        <div class="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 space-y-4">
                            <h4 class="font-bold text-gray-900 text-sm">📋 Auction Details</h4>
                            <div class="space-y-3 text-sm">
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-600 font-semibold">Starting Price:</span>
                                    <span class="font-bold text-gray-900">{{ formatCurrency(auction.starting_price) }}</span>
                                </div>
                                <div class="border-t border-gray-200 pt-3">
                                    <span class="text-gray-600 font-semibold">Starts:</span>
                                    <p class="text-gray-500 text-xs mt-1">{{ formatTime(auction.starts_at) }}</p>
                                </div>
                                <div class="border-t border-gray-200 pt-3">
                                    <span class="text-gray-600 font-semibold">Ends:</span>
                                    <p class="text-gray-500 text-xs mt-1">{{ formatTime(auction.ends_at) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>
