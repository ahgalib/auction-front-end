import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Views (lazy loaded)
const LandingPage = () => import('../views/LandingPage.vue');
const LoginPage = () => import('../views/LoginPage.vue');
const RegisterPage = () => import('../views/RegisterPage.vue');
const BiddingRoom = () => import('../views/BiddingRoom.vue');
const NotFound = () => import('../views/NotFound.vue');

const routes = [
    {
        path: '/',
        name: 'landing',
        component: LandingPage,
        meta: { requiresAuth: false, title: 'Velocity Auction' },
    },
    {
        path: '/login',
        name: 'login',
        component: LoginPage,
        meta: { requiresAuth: false, title: 'Login - Velocity Auction' },
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterPage,
        meta: { requiresAuth: false, title: 'Register - Velocity Auction' },
    },
    {
        path: '/bid/:auctionId',
        name: 'bidding-room',
        component: BiddingRoom,
        meta: { requiresAuth: true, title: 'Bidding Room - Velocity Auction' },
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFound,
        meta: { title: '404 - Page Not Found' },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    // Set page title
    document.title = to.meta.title || 'Velocity Auction';

    // Check if route requires authentication
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login');
    }
    // Redirect authenticated users away from auth pages
    else if (!to.meta.requiresAuth && ['login', 'register'].includes(to.name)) {
        if (authStore.isAuthenticated) {
            next('/bid/1');
        } else {
            next();
        }
    }
    // Redirect authenticated users from landing to bidding
    else if (to.name === 'landing' && authStore.isAuthenticated) {
        next('/bid/1');
    }
    else {
        next();
    }
});

export default router;
