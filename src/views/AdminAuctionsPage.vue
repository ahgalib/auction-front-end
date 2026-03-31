<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { graphqlMutation, graphqlQuery } from '../api/graphql';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');
const auctions = ref([]);
const editingId = ref(null);

const form = reactive({
    title: '',
    description: '',
    startingPrice: '',
    minIncrement: '',
    endTime: '',
    category: '',
    status: 'draft',
});

const updateForm = reactive({
    title: '',
    description: '',
    startingPrice: '',
    minIncrement: '',
    currentPrice: '',
    endTime: '',
    category: '',
    status: '',
});

const ADMIN_AUCTIONS_QUERY = `
  query AdminAuctions {
    adminAuctions {
      id
      title
      description
      startingPrice
      currentPrice
      minIncrement
      endTime
      category
      status
      participantCount
    }
  }
`;

const CREATE_AUCTION_MUTATION = `
  mutation CreateAuction(
    $title: String!
    $description: String
    $startingPrice: Float!
    $minIncrement: Float!
    $endTime: String!
    $category: String!
    $status: String
  ) {
    createAuction(
      title: $title
      description: $description
      startingPrice: $startingPrice
      minIncrement: $minIncrement
      endTime: $endTime
      category: $category
      status: $status
    ) {
      id
    }
  }
`;

const UPDATE_AUCTION_MUTATION = `
  mutation UpdateAuction(
    $id: ID!
    $title: String
    $description: String
    $startingPrice: Float
    $minIncrement: Float
    $currentPrice: Float
    $endTime: String
    $category: String
    $status: String
  ) {
    updateAuction(
      id: $id
      title: $title
      description: $description
      startingPrice: $startingPrice
      minIncrement: $minIncrement
      currentPrice: $currentPrice
      endTime: $endTime
      category: $category
      status: $status
    ) {
      id
    }
  }
`;

const ADJUST_AUCTION_TIME_MUTATION = `
  mutation AdjustAuctionTime($id: ID!, $deltaMinutes: Int!) {
    adjustAuctionTime(id: $id, deltaMinutes: $deltaMinutes) {
      id
      endTime
      status
    }
  }
`;

const DELETE_AUCTION_MUTATION = `
  mutation DeleteAuction($id: ID!) {
    deleteAuction(id: $id)
  }
`;

const token = computed(() => auth.token || localStorage.getItem('auction_access_token'));

const resetMessages = () => {
    error.value = '';
    success.value = '';
};

const toIsoUtc = (localDateTime) => {
    if (!localDateTime) return null;
    return new Date(localDateTime).toISOString();
};

const toLocalDateTimeInput = (isoDateTime) => {
    if (!isoDateTime) return '';
    const date = new Date(isoDateTime);
    const pad = (n) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${y}-${m}-${d}T${h}:${min}`;
};

const loadAuctions = async () => {
    if (!token.value) return;
    loading.value = true;
    resetMessages();

    try {
        const data = await graphqlQuery(ADMIN_AUCTIONS_QUERY, {}, token.value);
        auctions.value = data?.adminAuctions || [];
    } catch (err) {
        error.value = err?.message || 'Failed to load auctions.';
    } finally {
        loading.value = false;
    }
};

const createAuction = async () => {
    if (!token.value) return;
    saving.value = true;
    resetMessages();

    try {
        await graphqlMutation(CREATE_AUCTION_MUTATION, {
            title: form.title.trim(),
            description: form.description.trim() || null,
            startingPrice: Number(form.startingPrice),
            minIncrement: Number(form.minIncrement),
            endTime: toIsoUtc(form.endTime),
            category: form.category.trim(),
            status: form.status || 'draft',
        }, token.value);

        success.value = 'Auction created successfully.';
        form.title = '';
        form.description = '';
        form.startingPrice = '';
        form.minIncrement = '';
        form.endTime = '';
        form.category = '';
        form.status = 'draft';
        await loadAuctions();
    } catch (err) {
        error.value = err?.message || 'Failed to create auction.';
    } finally {
        saving.value = false;
    }
};

const startEdit = (auction) => {
    editingId.value = auction.id;
    updateForm.title = auction.title;
    updateForm.description = auction.description || '';
    updateForm.startingPrice = String(auction.startingPrice);
    updateForm.minIncrement = String(auction.minIncrement);
    updateForm.currentPrice = String(auction.currentPrice);
    updateForm.endTime = toLocalDateTimeInput(auction.endTime);
    updateForm.category = auction.category;
    updateForm.status = auction.status;
};

const cancelEdit = () => {
    editingId.value = null;
};

const updateAuction = async (id) => {
    if (!token.value) return;
    saving.value = true;
    resetMessages();

    try {
        await graphqlMutation(UPDATE_AUCTION_MUTATION, {
            id: Number(id),
            title: updateForm.title.trim(),
            description: updateForm.description.trim() || null,
            startingPrice: Number(updateForm.startingPrice),
            minIncrement: Number(updateForm.minIncrement),
            currentPrice: Number(updateForm.currentPrice),
            endTime: toIsoUtc(updateForm.endTime),
            category: updateForm.category.trim(),
            status: updateForm.status,
        }, token.value);

        editingId.value = null;
        success.value = 'Auction updated successfully.';
        await loadAuctions();
    } catch (err) {
        error.value = err?.message || 'Failed to update auction.';
    } finally {
        saving.value = false;
    }
};

const deleteAuction = async (id) => {
    if (!token.value) return;
    const confirmed = window.confirm('Delete this auction permanently?');
    if (!confirmed) return;

    saving.value = true;
    resetMessages();

    try {
        await graphqlMutation(DELETE_AUCTION_MUTATION, { id: Number(id) }, token.value);
        success.value = 'Auction deleted successfully.';
        await loadAuctions();
    } catch (err) {
        error.value = err?.message || 'Failed to delete auction.';
    } finally {
        saving.value = false;
    }
};

const adjustTime = async (id, minutes) => {
    if (!token.value) return;
    saving.value = true;
    resetMessages();

    try {
        await graphqlMutation(ADJUST_AUCTION_TIME_MUTATION, {
            id: Number(id),
            deltaMinutes: Number(minutes),
        }, token.value);
        success.value = `Auction time adjusted by ${minutes} minutes.`;
        await loadAuctions();
    } catch (err) {
        error.value = err?.message || 'Failed to adjust auction time.';
    } finally {
        saving.value = false;
    }
};

const logout = async () => {
    await auth.logout();
    router.push('/login');
};

onMounted(async () => {
    if (!auth.isAuthenticated) {
        router.push('/login');
        return;
    }

    if (!auth.user && token.value) {
        await auth.checkAuth();
    }

    if (!auth.user?.is_admin) {
        router.push('/auctions');
        return;
    }

    await loadAuctions();
});
</script>

<template>
    <main class="min-h-screen bg-slate-950 text-slate-100">
        <section class="mx-auto max-w-7xl px-4 py-8 md:px-8">
            <header class="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-900/30 to-blue-900/20 p-6">
                <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Admin Control</p>
                    <h1 class="mt-1 text-3xl font-black">Auction Management</h1>
                    <p class="mt-1 text-sm text-slate-300">Create, update, and manage auctions from one panel.</p>
                </div>
                <div class="flex gap-2">
                    <button class="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10" @click="router.push('/auctions')">
                        Auction List
                    </button>
                    <button class="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold hover:bg-rose-400" @click="logout">
                        Logout
                    </button>
                </div>
            </header>

            <section class="mb-8 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
                <h2 class="text-xl font-bold">Create Auction</h2>
                <div class="mt-4 grid gap-3 md:grid-cols-3">
                    <input v-model="form.title" class="rounded-lg border border-white/15 bg-slate-950 px-3 py-2" placeholder="Title" />
                    <input v-model="form.description" class="rounded-lg border border-white/15 bg-slate-950 px-3 py-2" placeholder="Purpose / Description" />
                    <input v-model="form.category" class="rounded-lg border border-white/15 bg-slate-950 px-3 py-2" placeholder="Category" />
                    <select v-model="form.status" class="rounded-lg border border-white/15 bg-slate-950 px-3 py-2">
                        <option value="draft">draft</option>
                        <option value="active">active</option>
                        <option value="pending_payment">pending_payment</option>
                        <option value="closed">closed</option>
                    </select>
                    <input v-model="form.startingPrice" type="number" min="0" step="0.01" class="rounded-lg border border-white/15 bg-slate-950 px-3 py-2" placeholder="Starting Price" />
                    <input v-model="form.minIncrement" type="number" min="0" step="0.01" class="rounded-lg border border-white/15 bg-slate-950 px-3 py-2" placeholder="Min Increment" />
                    <input v-model="form.endTime" type="datetime-local" class="rounded-lg border border-white/15 bg-slate-950 px-3 py-2" />
                </div>
                <button class="mt-4 rounded-lg bg-cyan-500 px-5 py-2 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50" :disabled="saving" @click="createAuction">
                    {{ saving ? 'Saving...' : 'Create Auction' }}
                </button>
            </section>

            <p v-if="error" class="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{{ error }}</p>
            <p v-if="success" class="mb-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{{ success }}</p>

            <section class="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
                <div class="mb-4 flex items-center justify-between">
                    <h2 class="text-xl font-bold">Existing Auctions</h2>
                    <button class="rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10" @click="loadAuctions">
                        Refresh
                    </button>
                </div>

                <p v-if="loading" class="text-sm text-slate-300">Loading auctions...</p>
                <div v-else class="space-y-4">
                    <article v-for="item in auctions" :key="item.id" class="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <h3 class="text-lg font-semibold">{{ item.title }}</h3>
                            <span class="rounded bg-white/10 px-2 py-1 text-xs uppercase">{{ item.status }}</span>
                        </div>
                        <p class="mt-1 text-sm text-slate-300">
                            Category: {{ item.category }} | Current: ${{ Number(item.currentPrice).toFixed(2) }} | Ends: {{ item.endTime }}
                        </p>
                        <p class="mt-1 text-xs text-slate-400">{{ item.description || 'No description' }}</p>

                        <div class="mt-3 flex flex-wrap gap-2">
                            <button class="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs hover:bg-cyan-500/20" @click="adjustTime(item.id, 5)">+5m</button>
                            <button class="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs hover:bg-cyan-500/20" @click="adjustTime(item.id, 15)">+15m</button>
                            <button class="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs hover:bg-amber-500/20" @click="adjustTime(item.id, -5)">-5m</button>
                            <button class="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs hover:bg-amber-500/20" @click="adjustTime(item.id, -15)">-15m</button>
                        </div>

                        <div v-if="editingId === item.id" class="mt-4 grid gap-2 md:grid-cols-3">
                            <input v-model="updateForm.title" class="rounded-lg border border-white/15 bg-slate-900 px-3 py-2" />
                            <input v-model="updateForm.description" class="rounded-lg border border-white/15 bg-slate-900 px-3 py-2" />
                            <input v-model="updateForm.category" class="rounded-lg border border-white/15 bg-slate-900 px-3 py-2" />
                            <select v-model="updateForm.status" class="rounded-lg border border-white/15 bg-slate-900 px-3 py-2">
                                <option value="draft">draft</option>
                                <option value="active">active</option>
                                <option value="pending_payment">pending_payment</option>
                                <option value="closed">closed</option>
                            </select>
                            <input v-model="updateForm.startingPrice" type="number" min="0" step="0.01" class="rounded-lg border border-white/15 bg-slate-900 px-3 py-2" />
                            <input v-model="updateForm.minIncrement" type="number" min="0" step="0.01" class="rounded-lg border border-white/15 bg-slate-900 px-3 py-2" />
                            <input v-model="updateForm.currentPrice" type="number" min="0" step="0.01" class="rounded-lg border border-white/15 bg-slate-900 px-3 py-2" />
                            <input v-model="updateForm.endTime" type="datetime-local" class="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 md:col-span-2" />
                            <div class="flex gap-2">
                                <button class="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400" @click="updateAuction(item.id)">
                                    Save
                                </button>
                                <button class="rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10" @click="cancelEdit">
                                    Cancel
                                </button>
                            </div>
                        </div>

                        <div v-else class="mt-4 flex gap-2">
                            <button class="rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold hover:bg-blue-400" @click="startEdit(item)">
                                Edit
                            </button>
                            <button class="rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold hover:bg-rose-400" @click="deleteAuction(item.id)">
                                Delete
                            </button>
                        </div>
                    </article>

                    <p v-if="auctions.length === 0" class="text-sm text-slate-400">No auctions found.</p>
                </div>
            </section>
        </section>
    </main>
</template>
