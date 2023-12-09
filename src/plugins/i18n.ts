import Vue from 'vue';
import VueI18n from 'vue-i18n';
import en from '../locales/en.json';
import tr from '../locales/tr.json';
import {getConfig} from '@/services';
import config from '@/config';

const lang = getConfig().lang || config.LANG;

Vue.use(VueI18n)

export default new VueI18n({
    locale: lang, messages: {en, tr}
});
