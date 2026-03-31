<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
    endTime: {
        type: String,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(['ended']);

const remainingMs = ref(0);
let rafId = null;
let lastTick = 0;
let endedEmitted = false;
let lastTargetMs = null;

const getTargetMs = (value) => {
    if (!value) {
        return 0;
    }

    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
};

const stopTicker = () => {
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
};

const startTicker = () => {
    if (!props.isActive || rafId) {
        return;
    }

    lastTick = 0;
    rafId = requestAnimationFrame(tick);
};

const tick = (t) => {
    if (t - lastTick >= 250) {
        lastTick = t;
        const target = getTargetMs(props.endTime);
        const nextRemaining = Math.max(0, target - Date.now());

        if (lastTargetMs !== null && target === lastTargetMs) {
            // Keep countdown monotonic for the same end target to avoid jump-ups caused by timing jitter.
            remainingMs.value = Math.min(remainingMs.value, nextRemaining);
        } else {
            remainingMs.value = nextRemaining;
            lastTargetMs = target;
        }

        if (!endedEmitted && props.isActive && remainingMs.value === 0) {
            endedEmitted = true;
            emit('ended');
        }
    }
    if (props.isActive) {
        rafId = requestAnimationFrame(tick);
    } else {
        rafId = null;
    }
};

onMounted(() => {
    startTicker();
});

onUnmounted(() => {
    stopTicker();
});

watch(
    [() => props.endTime, () => props.isActive],
    ([endTime, isActive], [previousEndTime, previousIsActive]) => {
        const targetMs = getTargetMs(endTime);
        const didTargetChange = endTime !== previousEndTime;
        const didBecomeActive = isActive && !previousIsActive;

        remainingMs.value = isActive ? Math.max(0, targetMs - Date.now()) : 0;

        if (didTargetChange || didBecomeActive) {
            endedEmitted = false;
        }

        lastTargetMs = targetMs || null;

        if (!isActive) {
            stopTicker();
            return;
        }

        startTicker();
    },
    { immediate: true }
);

const timeLabel = computed(() => {
    if (!props.isActive) {
        return 'CLOSED';
    }

    if (remainingMs.value === 0) {
        return '00:00:00';
    }

    const totalSeconds = Math.floor(remainingMs.value / 1000);
    const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const ss = String(totalSeconds % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
});
</script>

<template>
    <div class="rounded-xl border border-cyan-300/40 bg-cyan-500/10 p-4">
        <p class="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Auction Timer</p>
        <p class="mt-2 font-mono text-3xl font-semibold text-cyan-100">{{ timeLabel }}</p>
    </div>
</template>
