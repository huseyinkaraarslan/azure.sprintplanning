import Vue from 'vue'
import Vuex from 'vuex'
import config from '@/config';
import {getConfig, setConfig} from '@/services';
import {toastification} from '@/utils';
import i18n from '@/plugins/i18n';
import vuetify from '@/plugins/vuetify';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        lang: getConfig().lang || config.LANG,
        dark: getConfig().dark || config.DARK,
        overlay: {}
    },
    getters: {},
    mutations: {
        lang(state, lang) {
            i18n.locale = lang;
            state.lang = setConfig({lang}).lang || lang;
        },
        dark(state, dark) {
            vuetify.framework.theme.dark = dark;
            state.dark = setConfig({dark}).dark || dark;
        },
        toast(state, payload) {
            const vm = this._vm;
            toastification({vm, ...payload});
        },
        overlay(state, value) {
            state.overlay = value;
        }
    },
    modules: {},
    actions: {
        setLang(context, value) {
            context.commit('lang', value);
        },
        setDark(context, value) {
            context.commit('dark', value);
        },
        toast(context, payload) {
            context.commit('toast', payload);
        }
    }
});
