import { ref } from 'vue';

const offsetMs = ref(0);
const lastSyncedAt = ref(null);

export function useServerTime() {
    const getNow = () => Date.now() + offsetMs.value;

    const sync = async (force = false) => {
        // Keep the interface stable without making backend time requests.
        // The app now uses the browser clock as the timer source of truth.
        offsetMs.value = 0;
        lastSyncedAt.value = new Date().toISOString();
    };

    return {
        getNow,
        offsetMs,
        lastSyncedAt,
        sync,
    };
}
