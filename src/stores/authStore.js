import { defineStore } from 'pinia';
import { graphqlMutation, graphqlQuery } from '../api/graphql';
import { TOKEN_KEY } from '../api/http';
import { LOGIN_MUTATION, LOGOUT_MUTATION, OAUTH_TOKEN_MUTATION, REGISTER_MUTATION } from '../api/mutations/auth';
import { ME_QUERY } from '../api/queries/me';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem(TOKEN_KEY),
        loading: false,
        error: null,
    }),
    getters: {
        isAuthenticated: (state) => Boolean(state.token),
    },
    actions: {
        async register(payload) {
            this.loading = true;
            this.error = null;
            try {
                await graphqlMutation(REGISTER_MUTATION, payload);
            } finally {
                this.loading = false;
            }
        },
        async login(payload) {
            this.loading = true;
            this.error = null;
            try {
                const data = await graphqlMutation(LOGIN_MUTATION, payload);
                this.token = data?.login?.access_token || null;
                if (this.token) {
                    localStorage.setItem(TOKEN_KEY, this.token);
                }
                await this.me();
                return data;
            } catch (error) {
                this.error = error.message || 'Login failed';
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async oauthPasswordGrant(payload) {
            const data = await graphqlMutation(OAUTH_TOKEN_MUTATION, {
                grantType: payload.grantType,
                clientId: Number(payload.clientId),
                clientSecret: payload.clientSecret,
                username: payload.username,
                password: payload.password,
                scope: payload.scope,
            });

            this.token = data?.oauthToken?.access_token || null;
            if (this.token) {
                localStorage.setItem(TOKEN_KEY, this.token);
            }
            await this.me();
            return data;
        },
        async me() {
            if (!this.token) return null;
            const data = await graphqlQuery(ME_QUERY, {}, this.token);
            this.user = data?.me || null;
            return this.user;
        },
        async logout() {
            try {
                if (this.token) {
                    await graphqlMutation(LOGOUT_MUTATION, {}, this.token);
                }
            } finally {
                this.token = null;
                this.user = null;
                localStorage.removeItem(TOKEN_KEY);
            }
        },
    },
});
