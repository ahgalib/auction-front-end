import { gql } from '@apollo/client/core';
import { apolloClient } from './apolloClient';

const queryCache = new Map();
const inFlightQueries = new Map();
const QUERY_CACHE_TTL_MS = 15000;
const recentQueryMeta = new Map();

function authHeaders(token) {
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function queryKey(query, variables, token) {
    return JSON.stringify({
        query,
        variables,
        token: token ?? null,
    });
}

function buildError(error) {
    const gqlError = error?.graphQLErrors?.[0] ?? error?.networkError?.result?.errors?.[0];
    const wrapped = new Error(gqlError?.message || error?.message || 'GraphQL request failed');
    wrapped.code = gqlError?.extensions?.code || null;
    return wrapped;
}

function operationNameFromQuery(query) {
    const match = query.match(/\b(?:query|mutation)\s+([_A-Za-z][_0-9A-Za-z]*)/);
    return match?.[1] || 'AnonymousOperation';
}

export async function graphqlQuery(query, variables = {}, token = null, options = {}) {
    const forceNetwork = options.forceNetwork === true;
    const key = queryKey(query, variables, token);
    const now = Date.now();
    const operationName = operationNameFromQuery(query);

    if (import.meta.env.DEV) {
        const previous = recentQueryMeta.get(key);
        if (previous && now - previous.timestamp < 2000) {
            console.warn('[graphql-repeat]', {
                operationName,
                elapsedMs: now - previous.timestamp,
                variables,
                previousStack: previous.stack,
                currentStack: new Error().stack,
            });
        }

        recentQueryMeta.set(key, {
            timestamp: now,
            stack: new Error().stack,
        });
    }

    const cached = queryCache.get(key);
    if (!forceNetwork && cached && now - cached.timestamp < QUERY_CACHE_TTL_MS) {
        return cached.data;
    }

    if (!forceNetwork && inFlightQueries.has(key)) {
        return inFlightQueries.get(key);
    }

    const request = (async () => {
    try {
        const result = await apolloClient.query({
            query: gql`${query}`,
            variables,
            fetchPolicy: 'no-cache',
            context: {
                headers: authHeaders(token),
            },
        });

        queryCache.set(key, {
            data: result.data,
            timestamp: Date.now(),
        });

        return result.data;
    } catch (error) {
        throw buildError(error);
    } finally {
        inFlightQueries.delete(key);
    }
    })();

    inFlightQueries.set(key, request);
    return request;
}

export async function graphqlMutation(mutation, variables = {}, token = null) {
    try {
        const result = await apolloClient.mutate({
            mutation: gql`${mutation}`,
            variables,
            context: {
                headers: authHeaders(token),
            },
        });

        return result.data;
    } catch (error) {
        throw buildError(error);
    }
}
