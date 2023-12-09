<template>
    <v-dialog v-if="isShow"
              v-model="isShow"
              max-width="1000">
        <v-card v-if="isShow"
                color="card"
                class="base-card">
            <v-card-text class="text-center pa-5">
                <v-simple-table>
                    <template v-slot:default>
                        <thead>
                            <tr>
                                <th class="text-left"
                                    style="width: 30px;">
                                    No
                                </th>
                                <th class="text-left"
                                    style="width: 300px;">
                                    {{ $t('User_Name') }}
                                </th>
                                <th class="text-left"
                                    style="width: 50px;"
                                    v-for="(header, hi) in config.scoringMetrics.columnHeaders"
                                    :key="hi">
                                    {{ header }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(user, ui) in planning.users"
                                :key="ui">
                                <td class="text-left">{{ ++ui }}</td>
                                <td class="text-left">{{ user.name }}</td>
                                <td class="text-left"
                                    v-for="(score, si) in user.scores"
                                    :key="si">
                                    <template v-if="planning.showScores">
                                        <v-avatar v-if="score"
                                                  style="opacity: .9"
                                                  size="30"
                                                  color="primary">
                                            <span class="black--text headline"
                                                  style="font-size: 12px !important;">
                                                {{ score }}
                                            </span>
                                        </v-avatar>
                                        <v-avatar v-else
                                                  :style="'opacity: .9'"
                                                  size="30"
                                                  :color="'white'">
                                            <span class="black--text headline"
                                                  style="font-size: 12px !important;">
                                                -
                                            </span>
                                        </v-avatar>
                                    </template>
                                    <template v-else>
                                        <v-icon v-if="score"
                                                color="primary"
                                                size="30">
                                            mdi-check-circle-outline
                                        </v-icon>
                                        <v-icon v-else
                                                style="opacity: .2"
                                                :color="$store.state.dark ? 'white' : 'black'"
                                                size="30">
                                            mdi-check-circle-outline
                                        </v-icon>
                                    </template>
                                </td>
                            </tr>
                        </tbody>
                    </template>
                </v-simple-table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'
import {Planning} from '@/model/Planning';
import {getConfig} from '@/services';
import {Prop, Watch} from 'vue-property-decorator';

@Component({
    name: 'sp-user-list-dialog'
})
export default class UserListDialog extends Vue {
    @Prop({
        required: true
    })
    planning: Planning;

    config = getConfig();
    isShow = true;

    @Watch('isShow')
    dialogHandler(val: boolean) {
        if (!val) {
            this.$emit('close');
        }
    }
}
</script>
