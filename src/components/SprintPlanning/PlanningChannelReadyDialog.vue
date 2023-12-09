<template>
    <v-dialog v-if="isShow"
              v-model="isShow"
              persistent
              max-width="720">
        <v-card v-if="isShow"
                color="card"
                class="base-card">
            <v-card-title class="headline title primary--text">
                <h3>{{$t('Your_Planning_Channel_Is_Ready')}}</h3>
                <v-divider class="hr"/>
            </v-card-title>
            <v-card-text>
                <v-row class="mt-2 mb-0">
                    <v-col cols="12">
                        <v-text-field v-model="channelUrl"
                                      hide-details
                                      readonly
                                      outlined>
                            <v-icon slot="append"
                                    color="primary"
                                    @click="copyToClipboard">
                                mdi-content-copy
                            </v-icon>
                        </v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-icon left
                                color="primary">
                            mdi-information-outline
                        </v-icon>
                        <span style="font-size: normal; font-weight: 500;">{{$t('Sharing_Message')}}</span>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions class="actions">
                <v-checkbox v-model="autoStart"
                            :label="$t('Auto_Copy_And_Start_For_Next_Plannings')"
                            :value="true"
                            class="mt-0"
                            hide-details/>
                <v-spacer/>
                <v-btn class="action-btn"
                       :disabled="!channelUrl"
                       @click="apply">
                    {{$t('Copy_And_Start')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'
import {Watch} from 'vue-property-decorator';

@Component({
    name: 'sp-planning-channel-ready-dialog'
})
export default class PlanningChannelReadyDialog extends Vue {
    resolver: any;
    isShow = false;
    channelUrl = '';
    autoStart = false;

    open(channelUrl = '') {
        this.isShow = true;
        this.channelUrl = channelUrl;

        return new Promise(resolve => {
            this.resolver = resolve;
        });
    }

    apply() {
        if (!this.channelUrl) {
            return;
        }

        if (this.resolver) {
            this.copyToClipboard();
            this.resolver(this.autoStart);
            this.isShow = false;
        }
    }

    copyToClipboard() {
        if (this.channelUrl) {
            navigator.clipboard.writeText(this.channelUrl);
            this.$store.dispatch('toast', {
                text: this.$t('Planning_Channel_URL_Copied'),
                type: 'success',
                timeout: 2000
            });
        }
    }

    @Watch('isShow')
    dialogHandler(val: boolean) {
        if (!val) {
            this.channelUrl = '';
            this.autoStart = false;
            this.resolver(false);
        }
    }
}
</script>
