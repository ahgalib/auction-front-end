import { gql } from '@apollo/client/core';
import { apolloClient } from './apolloClient';

function authHeaders(token) {
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildError(error) {
    const gqlError = error?.graphQLErrors?.[0] ?? error?.networkError?.result?.errors?.[0];
    const wrapped = new Error(gqlError?.message || error?.message || 'GraphQL request failed');
    wrapped.code = gqlError?.extensions?.code || null;
    return wrapped;
}

export async function graphqlQuery(query, variables = {}, token = null) {
    try {
        const result = await apolloClient.query({
            query: gql`${query}`,
            variables,
            fetchPolicy: 'no-cache',
            context: {
                headers: authHeaders(token),
            },
        });

        return result.data;
    } catch (error) {
        throw buildError(error);
    }
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
