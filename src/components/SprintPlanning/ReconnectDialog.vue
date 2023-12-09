<template>
    <v-dialog v-if="isShow"
              v-model="isShow"
              persistent
              max-width="480">
        <v-card v-if="isShow"
                color="card"
                class="base-card">
            <v-card-text class="text-center pa-5">
                <v-icon color="warning"
                        large>
                    mdi-alert-circle-outline
                </v-icon>
                <h2 class="pt-3 mb-8"
                    style="color: orange">
                    {{message}}
                </h2>
                <v-btn text
                       @click="$router.push('/')">
                    {{$t('Common.Home')}}
                </v-btn>
                <v-btn text
                       @click="apply">
                    {{$t('Common.Reconnect')}}
                </v-btn>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'
import {Watch} from 'vue-property-decorator';

@Component({
    name: 'sp-reconnect-dialog'
})
export default class ReconnectDialog extends Vue {
    resolver: any;
    isShow = false;
    message = '';

    open(message: '') {
        this.message = message;
        this.isShow = true;

        return new Promise(resolve => {
            this.resolver = resolve;
        });
    }

    apply() {
        if (this.resolver) {
            this.resolver(true);
            this.isShow = false;
        }
    }

    @Watch('isShow')
    dialogHandler(val: boolean) {
        if (!val) {
            this.message = '';
            this.resolver(false);
        }
    }
}
</script>
