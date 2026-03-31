import { computed, ref } from 'vue';
import { graphqlQuery } from '../api/graphql';
import { SERVER_TIME_QUERY } from '../api/queries/serverTime';

const offsetMs = ref(0);
const lastSyncedAt = ref(null);

export function useServerTime() {
    const now = computed(() => Date.now() + offsetMs.value);

    const sync = async () => {
        const data = await graphqlQuery(SERVER_TIME_QUERY);
        const serverTime = new Date(data?.serverTime?.serverTimeUtc).getTime();
        offsetMs.value = serverTime - Date.now();
        lastSyncedAt.value = new Date().toISOString();
    };

    return {
        now,
        offsetMs,
        lastSyncedAt,
        sync,
    };
}
