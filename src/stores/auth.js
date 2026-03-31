import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { graphqlMutation, graphqlQuery } from '../api/graphql';
import { LOGIN_MUTATION, LOGOUT_MUTATION, OAUTH_TOKEN_MUTATION, REGISTER_MUTATION } from '../api/mutations/auth';
import { ME_QUERY } from '../api/queries/me';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const token = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    // Load from localStorage on initialization
    const loadFromStorage = () => {
        const storedToken = localStorage.getItem('auction_access_token');
        const storedUser = localStorage.getItem('auction_user');
        const tokenExpires = localStorage.getItem('auction_token_expires');

        if (storedToken && storedUser) {
            const now = Date.now();
            if (tokenExpires && now > parseInt(tokenExpires)) {
                // Token expired
                logout();
                return;
            }

            token.value = storedToken;
            user.value = JSON.parse(storedUser);
        }
    };

    const isAuthenticated = computed(() => !!token.value && !!user.value);

    const normalizeUser = (incoming) => {
        if (!incoming) return null;

        return {
            id: Number(incoming.id),
            name: incoming.name,
            email: incoming.email,
            is_admin: Boolean(incoming.isAdmin ?? incoming.is_admin),
            wallet_balance: Number(incoming.walletBalance ?? incoming.wallet_balance ?? 0),
        };
    };

    const register = async (name, email, password) => {
        isLoading.value = true;
        error.value = null;

        try {
            await graphqlMutation(REGISTER_MUTATION, { name, email, password });
            return { success: true };
        } catch (err) {
            error.value = err?.message || 'Registration failed';
            return {
                success: false,
                errors: {},
            };
        } finally {
            isLoading.value = false;
        }
    };

    const login = async (email, password, rememberMe = false) => {
        isLoading.value = true;
        error.value = null;

        try {
            const data = await graphqlMutation(LOGIN_MUTATION, { email, password });
            const authToken = data?.login?.access_token || null;
            const expiresIn = Number(data?.login?.expires_in ?? 3600);

            if (!authToken) {
                throw new Error('Token missing from login response');
            }

            token.value = authToken;

            // Calculate expiration
            const expiresAt = Date.now() + expiresIn * 1000;

            // Store in localStorage
            localStorage.setItem('auction_access_token', authToken);

            if (rememberMe) {
                // 7 days for remember me
                localStorage.setItem(
                    'auction_token_expires',
                    String(expiresAt + 7 * 24 * 60 * 60 * 1000)
                );
            } else {
                // 1 hour normal session
                localStorage.setItem('auction_token_expires', String(expiresAt));
            }

            await checkAuth();

            return { success: true };
        } catch (err) {
            error.value = 'Invalid email or password';
            return { success: false };
        } finally {
            isLoading.value = false;
        }
    };

    const logout = () => {
        user.value = null;
        token.value = null;
        error.value = null;
        localStorage.removeItem('auction_access_token');
        localStorage.removeItem('auction_refresh_token');
        localStorage.removeItem('auction_user');
        localStorage.removeItem('auction_token_expires');
    };

    const checkAuth = async () => {
        if (!token.value) return false;

        try {
            const data = await graphqlQuery(ME_QUERY, {}, token.value);
            const userData = normalizeUser(data?.me);
            if (!userData) {
                throw new Error('User profile missing');
            }
            user.value = userData;
            localStorage.setItem('auction_user', JSON.stringify(userData));
            return true;
        } catch (err) {
            logout();
            return false;
        }
    };

    const oauthPasswordGrant = async (payload) => {
        isLoading.value = true;
        error.value = null;

        try {
            const data = await graphqlMutation(OAUTH_TOKEN_MUTATION, {
                grantType: payload.grantType,
                clientId: Number(payload.clientId),
                clientSecret: payload.clientSecret,
                username: payload.username,
                password: payload.password,
                scope: payload.scope,
            });

            const authToken = data?.oauthToken?.access_token || null;
            const expiresIn = Number(data?.oauthToken?.expires_in ?? 3600);

            if (!authToken) {
                throw new Error('Token missing from oauth response');
            }

            token.value = authToken;
            localStorage.setItem('auction_access_token', authToken);
            localStorage.setItem('auction_token_expires', String(Date.now() + expiresIn * 1000));
            await checkAuth();

            return { success: true };
        } catch (err) {
            error.value = err?.message || 'OAuth login failed';
            return { success: false };
        } finally {
            isLoading.value = false;
        }
    };

    const logoutRemote = async () => {
        if (token.value) {
            try {
                await graphqlMutation(LOGOUT_MUTATION, {}, token.value);
            } catch {
                // Best effort only.
            }
        }
        logout();
    };

    return {
        user,
        token,
        isLoading,
        error,
        isAuthenticated,
        loadFromStorage,
        register,
        login,
        logout: logoutRemote,
        logoutLocal: logout,
        checkAuth,
        oauthPasswordGrant,
    };
});
