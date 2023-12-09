import Vue from 'vue'
import '@mdi/font/css/materialdesignicons.css'
import Vuetify, {
    VAvatar,
    VBtn,
    VCard,
    VCardActions,
    VCardText,
    VCardTitle,
    VCheckbox,
    VCol,
    VContainer,
    VDataTable,
    VDialog,
    VDivider,
    VForm,
    VIcon,
    VList,
    VListItem,
    VListItemAction,
    VListItemAvatar,
    VListItemContent,
    VListItemIcon,
    VListItemSubtitle,
    VListItemTitle,
    VMain,
    VMenu,
    VProgressCircular,
    VRow,
    VSelect,
    VSpacer,
    VTab,
    VTabItem,
    VTabs,
    VTextField,
    VToolbar,
    VToolbarTitle,
    VTooltip,
    VAlert
} from 'vuetify/lib'
import {getConfig} from '@/services';
import config from '@/config';

Vue.use(Vuetify, {
    components: {
        VAvatar,
        VBtn,
        VCard,
        VCardActions,
        VCardText,
        VCardTitle,
        VCheckbox,
        VCol,
        VContainer,
        VDataTable,
        VDialog,
        VDivider,
        VForm,
        VIcon,
        VList,
        VListItem,
        VListItemAction,
        VListItemAvatar,
        VListItemContent,
        VListItemIcon,
        VListItemSubtitle,
        VListItemTitle,
        VMain,
        VMenu,
        VProgressCircular,
        VRow,
        VSelect,
        VSpacer,
        VTab,
        VTabItem,
        VTabs,
        VTextField,
        VToolbar,
        VToolbarTitle,
        VTooltip,
        VAlert
    }
})

export default new Vuetify({
    icons: {
        iconfont: 'mdi'
    },
    theme: {
        disable: false,
        dark: getConfig().dark || config.DARK,
        options: {
            customProperties: true
        },
        themes: {
            light: {
                primary: '#00cd81', // 00cd81 00cd81
                secondary: '#ffffff',
                accent: '#f0f2f5',
                error: '#b71c1c',
                strange: '#2c3239',
                remark: '#3f79d8',
                colorful: '#687dd5',
                background: '#ffffff',
                card: '#ffffff' // f0f2f5
            },
            dark: {
                primary: '#00cd81', // 00cd81 00cd81
                secondary: '#1f262f',
                strange: '#d3d5db',
                remark: '#3f79d8',
                colorful: '#687dd5',
                accent: '#13171c',
                error: '#FF5252',
                info: '#2196F3',
                success: '#4CAF50',
                warning: '#FFC107',
                background: '#1a202c',
                sidebar: '#2d3748',
                card: '#2d3748'
            }
        }
    }
})
