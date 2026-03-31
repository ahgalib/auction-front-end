import './bootstrap';
import './style.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { provideApolloClient } from '@vue/apollo-composable';
import App from './App.vue';
import { apolloClient } from './api/apolloClient';
import router from './router';
import { useAuthStore } from './stores/auth';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Load auth from storage before mounting
const authStore = useAuthStore();
authStore.loadFromStorage();

provideApolloClient(apolloClient);

app.mount('#app');
