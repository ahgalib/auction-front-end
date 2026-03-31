<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
    <div class="min-h-screen bg-white">
        <!-- Navigation -->
        <nav class="sticky top-0 z-50 bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <div class="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    🏆 Velocity
                </div>
                <div class="hidden sm:flex items-center space-x-3">
                    <button
                        @click="router.push('/login')"
                        class="px-7 py-2.5 rounded-full text-indigo-600 font-semibold hover:bg-indigo-50 transition duration-200"
                    >
                        Sign In
                    </button>
                    <button
                        @click="router.push('/register')"
                        class="px-7 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-200 transition duration-200"
                    >
                        Get Started
                    </button>
                </div>
                <!-- Mobile Menu -->
                <div class="sm:hidden flex space-x-2">
                    <button
                        @click="router.push('/login')"
                        class="px-4 py-2 rounded-full text-sm font-semibold text-indigo-600"
                    >
                        Sign In
                    </button>
                    <button
                        @click="router.push('/register')"
                        class="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-bold"
                    >
                        Start
                    </button>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="pt-20 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-indigo-50 to-white">
            <div class="max-w-4xl mx-auto text-center">
                <div class="mb-6 inline-block px-4 py-2 bg-indigo-100 rounded-full">
                    <p class="text-sm font-semibold text-indigo-700">✨ Welcome to the Future of Bidding</p>
                </div>
                <h1 class="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight text-gray-900">
                    Real-Time
                    <span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Auction
                    </span>
                    Magic
                </h1>
                <p class="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                    Experience the thrill of bidding on exclusive items with live updates, secure transactions, and lightning-fast performance
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <button
                        @click="router.push('/register')"
                        class="px-8 sm:px-10 py-3 sm:py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-indigo-300 transition duration-300 transform hover:scale-105"
                    >
                        Start Bidding Now
                    </button>
                    <button
                        @click="router.push('/login')"
                        class="px-8 sm:px-10 py-3 sm:py-4 rounded-full border-2 border-indigo-600 text-indigo-600 font-bold text-lg hover:bg-indigo-50 transition duration-200"
                    >
                        Sign In
                    </button>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-gray-200">
                    <div>
                        <p class="text-3xl sm:text-4xl font-black text-indigo-600">50K+</p>
                        <p class="text-sm text-gray-600 mt-2">Active Bidders</p>
                    </div>
                    <div>
                        <p class="text-3xl sm:text-4xl font-black text-indigo-600">1M+</p>
                        <p class="text-sm text-gray-600 mt-2">Items Sold</p>
                    </div>
                    <div>
                        <p class="text-3xl sm:text-4xl font-black text-indigo-600">24/7</p>
                        <p class="text-sm text-gray-600 mt-2">Live Auctions</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="py-24 px-4 sm:px-6 lg:px-8 bg-white">
            <div class="max-w-6xl mx-auto">
                <div class="text-center mb-16">
                    <h2 class="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
                        Why Choose Velocity?
                    </h2>
                    <p class="text-lg text-gray-600">Everything you need for an amazing auction experience</p>
                </div>

                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- Feature 1 -->
                    <div class="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:shadow-xl transition duration-300 group cursor-pointer">
                        <div class="text-5xl mb-4 group-hover:scale-110 transition duration-300">⚡</div>
                        <h3 class="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
                        <p class="text-gray-600 leading-relaxed">
                            Real-time updates every second. See bids instantly and never miss an opportunity.
                        </p>
                    </div>

                    <!-- Feature 2 -->
                    <div class="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-xl transition duration-300 group cursor-pointer">
                        <div class="text-5xl mb-4 group-hover:scale-110 transition duration-300">🔒</div>
                        <h3 class="text-xl font-bold text-gray-900 mb-3">Bank-Level Secure</h3>
                        <p class="text-gray-600 leading-relaxed">
                            Your transactions are protected with enterprise-grade security and encryption.
                        </p>
                    </div>

                    <!-- Feature 3 -->
                    <div class="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:shadow-xl transition duration-300 group cursor-pointer">
                        <div class="text-5xl mb-4 group-hover:scale-110 transition duration-300">💎</div>
                        <h3 class="text-xl font-bold text-gray-900 mb-3">Exclusive Items</h3>
                        <p class="text-gray-600 leading-relaxed">
                            Discover rare treasures and unique items you won't find anywhere else.
                        </p>
                    </div>

                    <!-- Feature 4 -->
                    <div class="p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 hover:shadow-xl transition duration-300 group cursor-pointer">
                        <div class="text-5xl mb-4 group-hover:scale-110 transition duration-300">📊</div>
                        <h3 class="text-xl font-bold text-gray-900 mb-3">Full Transparency</h3>
                        <p class="text-gray-600 leading-relaxed">
                            Complete bid history and auction details. No hidden fees or surprises.
                        </p>
                    </div>

                    <!-- Feature 5 -->
                    <div class="p-8 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 hover:shadow-xl transition duration-300 group cursor-pointer">
                        <div class="text-5xl mb-4 group-hover:scale-110 transition duration-300">💰</div>
                        <h3 class="text-xl font-bold text-gray-900 mb-3">Fair Pricing</h3>
                        <p class="text-gray-600 leading-relaxed">
                            Start with low base prices and let market forces determine true value.
                        </p>
                    </div>

                    <!-- Feature 6 -->
                    <div class="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 hover:shadow-xl transition duration-300 group cursor-pointer">
                        <div class="text-5xl mb-4 group-hover:scale-110 transition duration-300">📱</div>
                        <h3 class="text-xl font-bold text-gray-900 mb-3">Mobile First</h3>
                        <p class="text-gray-600 leading-relaxed">
                            Seamlessly works on all devices. Bid from anywhere, anytime.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
            <div class="max-w-3xl mx-auto text-center">
                <h2 class="text-4xl sm:text-5xl font-black text-white mb-6">
                    Ready to Start Bidding?
                </h2>
                <p class="text-xl text-white text-opacity-90 mb-10">
                    Join thousands of bidders competing for amazing items. Create your account and place your first bid today!
                </p>
                <button
                    @click="router.push('/register')"
                    class="px-10 py-4 rounded-full bg-white text-indigo-600 font-bold text-lg hover:shadow-2xl transition duration-300 transform hover:scale-105 inline-block"
                >
                    Get Started Now
                </button>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
            <div class="max-w-6xl mx-auto">
                <div class="grid md:grid-cols-4 gap-12 mb-12">
                    <div>
                        <h4 class="text-white font-bold mb-4 text-lg">Velocity Auction</h4>
                        <p class="text-gray-400 text-sm leading-relaxed">The premier real-time auction platform for modern bidders.</p>
                    </div>
                    <div>
                        <h4 class="text-white font-bold mb-4">Platform</h4>
                        <ul class="space-y-3 text-sm">
                            <li><a href="#" class="hover:text-white transition">How it Works</a></li>
                            <li><a href="#" class="hover:text-white transition">Browse Auctions</a></li>
                            <li><a href="#" class="hover:text-white transition">Seller Guide</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-white font-bold mb-4">Support</h4>
                        <ul class="space-y-3 text-sm">
                            <li><a href="#" class="hover:text-white transition">Help Center</a></li>
                            <li><a href="#" class="hover:text-white transition">Contact Us</a></li>
                            <li><a href="#" class="hover:text-white transition">Security</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-white font-bold mb-4">Legal</h4>
                        <ul class="space-y-3 text-sm">
                            <li><a href="#" class="hover:text-white transition">Privacy Policy</a></li>
                            <li><a href="#" class="hover:text-white transition">Terms of Service</a></li>
                            <li><a href="#" class="hover:text-white transition">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>
                <div class="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
                    <p>&copy; 2026 Velocity Auction. All rights reserved. Built with ❤️</p>
                </div>
            </div>
        </footer>
    </div>
</template>
