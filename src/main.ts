import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import router from './router/router'
import store from '@/store'
import vuetify from './plugins/vuetify'
import './sass/main.scss'
import i18n from '@/plugins/i18n';
import VuetifyDialog from 'vuetify-dialog'
import 'vuetify-dialog/dist/vuetify-dialog.css'
import 'animate.css';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

Vue.use(Toast, {
    transition: 'Vue-Toastification__bounce',
    maxToasts: 20,
    newestOnTop: true
});

Vue.use(VuetifyDialog, {
    context: {
        vuetify
    }
})

Vue.config.productionTip = false;
Vue.use(Vuex)

new Vue({
    store,
    router,
    i18n,
    vuetify,
    render: h => h(App)
}).$mount('#app')
