<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center px-4">
        <div class="text-center">
            <h1 class="text-9xl font-bold text-white mb-4">404</h1>
            <p class="text-4xl font-bold text-white mb-6">Page Not Found</p>
            <p class="text-xl text-white text-opacity-80 mb-8">Oops! The page you're looking for doesn't exist.</p>

            <div class="space-x-4">
                <button
                    @click="router.push('/')"
                    class="px-8 py-3 rounded-lg bg-white text-indigo-600 font-bold hover:bg-gray-100 transition inline-block"
                >
                    Go to Home
                </button>
                <button
                    @click="router.back()"
                    class="px-8 py-3 rounded-lg bg-transparent border-2 border-white text-white font-bold hover:bg-white hover:bg-opacity-10 transition inline-block"
                >
                    Go Back
                </button>
            </div>
        </div>
    </div>
</template>
