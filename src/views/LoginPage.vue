<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import FormInput from '../components/common/FormInput.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const isLoading = ref(false);
const generalError = ref('');

const sessionExpired = computed(() => route.query['session-expired'] === 'true');

const validateForm = () => {
    generalError.value = '';

    if (!email.value || !password.value) {
        generalError.value = 'Please fill in all fields';
        return false;
    }

    if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        generalError.value = 'Please enter a valid email address';
        return false;
    }

    return true;
};

const handleSubmit = async () => {
    if (!validateForm()) return;

    isLoading.value = true;

    const result = await authStore.login(email.value, password.value, rememberMe.value);

    if (result.success) {
        router.push('/bid/1');
    } else {
        generalError.value = 'Invalid email or password';
    }

    isLoading.value = false;
};
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-blue-50 flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-md">
            <!-- Back Link -->
            <router-link to="/" class="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold mb-8 transition">
                ← Back to home
            </router-link>

            <!-- Header -->
            <div class="text-center mb-10">
                <h1 class="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    🏆 Velocity
                </h1>
                <p class="text-gray-600 text-lg">Welcome back to the action</p>
            </div>

            <!-- Card -->
            <div class="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
                <!-- Session Expired Alert -->
                <div
                    v-if="sessionExpired"
                    class="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg"
                >
                    <p class="text-amber-900 text-sm font-semibold">
                        ⚠️ Your session has expired. Please log in again.
                    </p>
                </div>

                <!-- General Error -->
                <div v-if="generalError" class="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                    <p class="text-red-900 text-sm font-semibold">{{ generalError }}</p>
                </div>

                <!-- Form -->
                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <FormInput
                        v-model="email"
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        :disabled="isLoading"
                    />

                    <FormInput
                        v-model="password"
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        :disabled="isLoading"
                    />

                    <!-- Remember Me -->
                    <div class="flex items-center">
                        <input
                            id="rememberMe"
                            v-model="rememberMe"
                            type="checkbox"
                            class="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            :disabled="isLoading"
                        />
                        <label for="rememberMe" class="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                            Keep me signed in for 7 days
                        </label>
                    </div>

                    <!-- Submit Button -->
                    <button
                        type="submit"
                        :disabled="isLoading"
                        class="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                    >
                        {{ isLoading ? 'Signing in...' : 'Sign In' }}
                    </button>
                </form>

                <!-- Divider -->
                <div class="relative my-8">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-200"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500 font-medium">New to Velocity?</span>
                    </div>
                </div>

                <!-- Register Link -->
                <router-link
                    to="/register"
                    class="w-full block text-center py-3 px-4 border-2 border-indigo-600 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition duration-200 transform hover:scale-105 active:scale-95"
                >
                    Create Account
                </router-link>

                <!-- Forgot Password Link -->
                <div class="text-center mt-6">
                    <a href="#" class="text-sm text-indigo-600 hover:text-indigo-700 font-semibold underline">
                        Forgot your password?
                    </a>
                </div>
            </div>

            <!-- Security Badge -->
            <div class="text-center mt-8 text-sm text-gray-600">
                <p>🔒 Your data is encrypted and secure</p>
            </div>
        </div>
    </div>
</template>
