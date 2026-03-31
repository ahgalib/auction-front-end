<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import FormInput from '../components/common/FormInput.vue';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const generalError = ref('');
const fieldErrors = ref({});
const successMessage = ref('');

const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    return strength;
};

const getPasswordStrengthLabel = (strength) => {
    if (strength === 0) return { label: 'Very Weak', color: 'bg-red-500' };
    if (strength === 1) return { label: 'Weak', color: 'bg-orange-500' };
    if (strength === 2) return { label: 'Fair', color: 'bg-yellow-500' };
    if (strength === 3) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Excellent', color: 'bg-green-500' };
};

const passwordStrength = () => getPasswordStrength(password.value);

const validateForm = () => {
    fieldErrors.value = {};
    generalError.value = '';

    let isValid = true;

    if (!name.value || name.value.trim().length < 2) {
        fieldErrors.value.name = 'Name must be at least 2 characters';
        isValid = false;
    }

    if (name.value && name.value.length > 100) {
        fieldErrors.value.name = 'Name must be less than 100 characters';
        isValid = false;
    }

    if (!email.value || !email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        fieldErrors.value.email = 'Please enter a valid email address';
        isValid = false;
    }

    if (!password.value || password.value.length < 8) {
        fieldErrors.value.password = 'Password must be at least 8 characters';
        isValid = false;
    }

    if (!/[A-Z]/.test(password.value)) {
        fieldErrors.value.password = 'Password must contain at least one uppercase letter';
        isValid = false;
    }

    if (!/[a-z]/.test(password.value)) {
        fieldErrors.value.password = 'Password must contain at least one lowercase letter';
        isValid = false;
    }

    if (!/[0-9]/.test(password.value)) {
        fieldErrors.value.password = 'Password must contain at least one number';
        isValid = false;
    }

    if (password.value !== confirmPassword.value) {
        fieldErrors.value.confirmPassword = 'Passwords do not match';
        isValid = false;
    }

    return isValid;
};

const handleSubmit = async () => {
    if (!validateForm()) return;

    isLoading.value = true;
    successMessage.value = '';

    const result = await authStore.register(name.value, email.value, password.value);

    if (result.success) {
        successMessage.value = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
            router.push('/login');
        }, 2000);
    } else {
        if (result.errors) {
            fieldErrors.value = result.errors;
        } else {
            generalError.value = 'Registration failed. Please try again.';
        }
    }

    isLoading.value = false;
};
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-md">
            <!-- Back Link -->
            <router-link to="/" class="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold mb-8 transition">
                ← Back to home
            </router-link>

            <!-- Header -->
            <div class="text-center mb-10">
                <h1 class="text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    🚀 Join Velocity
                </h1>
                <p class="text-gray-600 text-lg">Start bidding today</p>
            </div>

            <!-- Card -->
            <div class="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
                <!-- Success Message -->
                <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
                    <p class="text-green-900 text-sm font-semibold">✅ {{ successMessage }}</p>
                </div>

                <!-- General Error -->
                <div v-if="generalError" class="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                    <p class="text-red-900 text-sm font-semibold">{{ generalError }}</p>
                </div>

                <!-- Form -->
                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <FormInput
                        v-model="name"
                        label="Full Name"
                        type="text"
                        placeholder="John Doe"
                        :error="fieldErrors.name"
                        :disabled="isLoading"
                    />

                    <FormInput
                        v-model="email"
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        :error="fieldErrors.email"
                        :disabled="isLoading"
                    />

                    <div>
                        <FormInput
                            v-model="password"
                            label="Password"
                            type="password"
                            placeholder="Create a strong password"
                            :error="fieldErrors.password"
                            :disabled="isLoading"
                        />
                        <!-- Password Strength Indicator -->
                        <div v-if="password" class="mt-3">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-semibold text-gray-600">Password Strength</span>
                                <span class="text-xs font-semibold" :class="{
                                    'text-red-600': passwordStrength() < 2,
                                    'text-amber-600': passwordStrength() < 4,
                                    'text-green-600': passwordStrength() >= 4,
                                }">
                                    {{ getPasswordStrengthLabel(passwordStrength()).label }}
                                </span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    class="h-full transition-all duration-300"
                                    :style="{ 
                                        width: (passwordStrength() / 4) * 100 + '%',
                                        backgroundColor: passwordStrength() < 2 ? '#ef4444' : passwordStrength() < 4 ? '#f59e0b' : '#10b981'
                                    }"
                                ></div>
                            </div>
                            <p class="text-xs text-gray-500 mt-2">
                                💡 Use uppercase, numbers, and 8+ characters for a stronger password
                            </p>
                        </div>
                    </div>

                    <FormInput
                        v-model="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        placeholder="Re-enter your password"
                        :error="fieldErrors.confirmPassword"
                        :disabled="isLoading"
                    />

                    <!-- Terms Checkbox -->
                    <div class="flex items-start">
                        <input
                            id="terms"
                            type="checkbox"
                            class="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer mt-1"
                            :disabled="isLoading"
                        />
                        <label for="terms" class="ml-3 text-sm text-gray-700 cursor-pointer">
                            I agree to the <a href="#" class="text-indigo-600 hover:text-indigo-700 font-semibold">Terms of Service</a> and <a href="#" class="text-indigo-600 hover:text-indigo-700 font-semibold">Privacy Policy</a>
                        </label>
                    </div>

                    <!-- Submit Button -->
                    <button
                        type="submit"
                        :disabled="isLoading"
                        class="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                    >
                        {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                    </button>
                </form>

                <!-- Divider -->
                <div class="relative my-8">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-200"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500 font-medium">Already have an account?</span>
                    </div>
                </div>

                <!-- Login Link -->
                <router-link
                    to="/login"
                    class="w-full block text-center py-3 px-4 border-2 border-purple-600 text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition duration-200 transform hover:scale-105 active:scale-95"
                >
                    Sign In
                </router-link>
            </div>

            <!-- Trust Badge -->
            <div class="text-center mt-8 text-sm text-gray-600">
                <p>🔐 Secure registration. No spam guarantee.</p>
            </div>
        </div>
    </div>
</template>
