import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Views (lazy loaded)
const LandingPage = () => import('../views/LandingPage.vue');
const LoginPage = () => import('../views/LoginPage.vue');
const RegisterPage = () => import('../views/RegisterPage.vue');
const AuctionsPage = () => import('../views/AuctionsPage.vue');
const AuctionRoom = () => import('../views/AuctionRoom.vue');
const AdminAuctionsPage = () => import('../views/AdminAuctionsPage.vue');
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
        path: '/auctions',
        name: 'auctions',
        component: AuctionsPage,
        meta: { requiresAuth: true, title: 'Auctions - Velocity Auction' },
    },
    {
        path: '/bid/:auctionId',
        name: 'bidding-room',
        component: AuctionRoom,
        props: (route) => ({ auctionId: Number(route.params.auctionId) || 1 }),
        meta: { requiresAuth: true, title: 'Bidding Room - Velocity Auction' },
    },
    {
        path: '/admin/auctions',
        name: 'admin-auctions',
        component: AdminAuctionsPage,
        meta: { requiresAuth: true, requiresAdmin: true, title: 'Admin Auctions - Velocity Auction' },
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
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // Set page title
    document.title = to.meta.title || 'Velocity Auction';

    if (authStore.token && !authStore.user) {
        await authStore.checkAuth();
    }

    // Check if route requires authentication
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login');
    }
    else if (to.meta.requiresAdmin && !authStore.user?.is_admin) {
        next('/auctions');
    }
    // Redirect authenticated users away from auth pages
    else if (!to.meta.requiresAuth && ['login', 'register'].includes(to.name)) {
        if (authStore.isAuthenticated) {
            if (authStore.user?.is_admin) {
                next('/admin/auctions');
            } else {
                next('/auctions');
            }
        } else {
            next();
        }
    }
    // Redirect authenticated users from landing to bidding
    else if (to.name === 'landing' && authStore.isAuthenticated) {
        if (authStore.user?.is_admin) {
            next('/admin/auctions');
        } else {
            next('/auctions');
        }
    }
    else {
        next();
    }
});

export default router;
