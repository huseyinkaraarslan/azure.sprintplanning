<template>
    <v-dialog v-if="isShow"
              v-model="isShow"
              persistent
              max-width="480">
        <v-card v-if="isShow"
                color="card"
                class="base-card">
            <v-card-title class="headline title primary--text">
                <h3>{{$t('User_Name')}}</h3>
                <v-divider class="hr"/>
            </v-card-title>
            <v-card-text>
                <v-form v-model="valid"
                        ref="form"
                        class="mt-6"
                        onsubmit="event.preventDefault(); return false"
                        lazy-validation>
                    <v-row class="mb-0">
                        <v-col cols="12">
                            <v-text-field v-model="userName"
                                          :label="$t('User_Name')"
                                          :rules="rules.userName"
                                          hide-details="auto"
                                          autofocus
                                          outlined/>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions class="actions">
                <v-spacer/>
                <v-btn text
                       @click="isShow = false;">
                    {{$t('Common.Cancel')}}
                </v-btn>
                <v-btn class="action-btn"
                       :disabled="!valid"
                       @click="apply">
                    {{$t('Join_The_Planning')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'
import validator from 'validator';
import {Watch} from 'vue-property-decorator';

@Component({
    name: 'sp-set-user-name-dialog'
})
export default class SetUserNameDialog extends Vue {
    resolver: any;
    isShow = false;
    valid = false;
    userName = '';

    rules = {
        userName: [
            (v) => (!validator.isEmpty(v.trim())) || this.$t('Error.Invalid_Username'),
            (v) => (validator.isByteLength(v.trim(), {min: 1, max: 32})) || `${this.$t('Error.Max_Characters_Must_Be_X', {length: 32})}`
        ]
    }

    open() {
        this.isShow = true;

        return new Promise(resolve => {
            this.resolver = resolve;
        });
    }

    apply() {
        const form: any = this.$refs.form;
        if (!form.validate()) {
            return;
        }

        if (this.resolver) {
            this.resolver(this.userName);
            this.isShow = false;
        }
    }

    @Watch('isShow')
    dialogHandler(val: boolean) {
        if (!val) {
            this.valid = false;
            this.userName = '';
            this.resolver(false);
        }
    }
}
</script>
