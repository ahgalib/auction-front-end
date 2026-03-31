import api from './api';

export const authService = {
    async register(name, email, password) {
        const response = await api.post('/register', {
            name,
            email,
            password,
        });
        return response.data;
    },

    async login(email, password) {
        const response = await api.post('/login', {
            email,
            password,
        });
        return response.data;
    },

    async getMe() {
        const response = await api.get('/me');
        return response.data;
    },

    async logout() {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('auction_access_token');
        localStorage.removeItem('auction_refresh_token');
        localStorage.removeItem('auction_user');
        localStorage.removeItem('auction_token_expires');
    },
};

export const auctionService = {
    async getAuction(auctionId) {
        const response = await api.get(`/auctions/${auctionId}`);
        return response.data;
    },

    async placeBid(auctionId, amount) {
        const response = await api.post(`/auctions/${auctionId}/bid`, {
            amount,
        });
        return response.data;
    },

    async withdrawBid(auctionId) {
        const response = await api.post(`/auctions/${auctionId}/withdraw-bid`);
        return response.data;
    },
};
