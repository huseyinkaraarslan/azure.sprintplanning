<template>
    <v-dialog v-if="config"
              :value="config ? true : false"
              persistent
              max-width="1024">
        <v-card color="background"
                class="base-card">
            <v-card-title class="title primary--text">
                <h2>{{$t('Settings')}}</h2>
                <v-divider class="hr"/>
            </v-card-title>
            <v-card-text>
                <v-form v-model="valid"
                        ref="form"
                        onsubmit="event.preventDefault(); return false"
                        lazy-validation>
                    <v-row class="settings">
                        <v-col cols="12"
                               class="pb-0">
                            <span class="category-title">{{$t('Screen')}}</span>
                        </v-col>
                        <v-col cols="12"
                               class="py-0">
                            <v-switch v-model="dark"
                                      inset
                                      :label="$t('Dark_Theme')"/>
                        </v-col>
                        <v-col cols="12"
                               class="py-0">
                            <v-switch v-model="lang"
                                      inset
                                      class="mt-0"
                                      :label="lang === 'en' ? 'Language (English)' : 'Dil (Türkçe)'"
                                      false-value="tr"
                                      true-value="en"/>
                        </v-col>
                        <v-col cols="12"
                               class="pb-0">
                            <span class="category-title">{{$t('Planning')}}</span>
                        </v-col>
                        <v-col cols="12"
                               class="py-0">
                            <v-switch v-model="config.autoStart"
                                      inset
                                      :label="$t('Auto_Start_The_Next_Plannings')"/>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions class="actions">
                <v-spacer/>
                <v-btn class="px-10"
                       text
                       @click="close">
                    {{$t('Common.Cancel')}}
                </v-btn>
                <v-btn class="action-btn px-10"
                       :disabled="!valid"
                       @click="save">
                    {{$t('Common.Save')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'
import {getConfig, setConfig} from '@/services';

@Component({
    name: 'sp-settings-dialog',
    computed: {
        lang: {
            get() {
                return this.$store.state.lang;
            },
            set(value) {
                this.$store.dispatch('setLang', value);
            }
        },
        dark: {
            get() {
                return this.$store.state.dark;
            },
            set(value) {
                this.$store.dispatch('setDark', value);
            }
        }
    }
})
export default class SettingsDialog extends Vue {
    valid = false;
    config = {
        autoStart: getConfig().autoStart || false,
        planningType: getConfig().planningType || 1,
        activities: getConfig().activities || []
    }

    save() {
        setConfig(this.config);
        this.close();
    }

    close() {
        this.$emit('close');
    }
}
</script>

<style lang="scss" scoped>
.settings {
    .category-title {
        font-size: 20px;
        font-weight: 500;
    }
}
</style>
