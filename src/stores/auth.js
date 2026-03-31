import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '../services/authService';

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

    const register = async (name, email, password) => {
        isLoading.value = true;
        error.value = null;

        try {
            await authService.register(name, email, password);
            return { success: true };
        } catch (err) {
            error.value = err.response?.data?.message || 'Registration failed';
            return {
                success: false,
                errors: err.response?.data?.errors || {},
            };
        } finally {
            isLoading.value = false;
        }
    };

    const login = async (email, password, rememberMe = false) => {
        isLoading.value = true;
        error.value = null;

        try {
            const data = await authService.login(email, password);

            token.value = data.token;
            user.value = data.user;

            // Calculate expiration
            const expiresIn = data.expires_in || 3600;
            const expiresAt = Date.now() + expiresIn * 1000;

            // Store in localStorage
            localStorage.setItem('auction_access_token', data.token);
            if (data.refresh_token) {
                localStorage.setItem('auction_refresh_token', data.refresh_token);
            }
            localStorage.setItem('auction_user', JSON.stringify(data.user));

            if (rememberMe) {
                // 7 days for remember me
                localStorage.setItem(
                    'auction_token_expires',
                    expiresAt + 7 * 24 * 60 * 60 * 1000
                );
            } else {
                // 1 hour normal session
                localStorage.setItem('auction_token_expires', expiresAt);
            }

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
        authService.logout();
    };

    const checkAuth = async () => {
        if (!token.value) return false;

        try {
            const userData = await authService.getMe();
            user.value = userData;
            localStorage.setItem('auction_user', JSON.stringify(userData));
            return true;
        } catch (err) {
            logout();
            return false;
        }
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
        logout,
        checkAuth,
    };
});
