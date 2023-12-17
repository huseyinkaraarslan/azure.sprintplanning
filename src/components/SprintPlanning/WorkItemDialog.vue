<template>
    <v-dialog v-if="planning && config && workItem"
              :value="true"
              persistent
              attach
              max-width="1200px">
        <v-card v-if="planning && config && workItem"
                color="card">
            <v-card-title>
                <span class="headline">
                    {{ config.isAdmin ? $t('Update_WorkItem') : $t('Updating_WorkItem_By_Admin', {adminName: planning.adminName}) }}
                </span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-progress-linear v-if="!config.isAdmin"
                                       color="info"
                                       rounded
                                       indeterminate
                                       height="1"/>
                    <v-form v-model="valid"
                            class="mt-5"
                            ref="form"
                            lazy-validation>
                        <v-row>
                            <v-col cols="6">
                                <small v-if="config.isAdmin"
                                       class="ml-3"
                                       style="color: #2196f3">
                                    {{$t('Current_Point')}} - {{workItem.currentPoint}}
                                </small>
                                <v-text-field v-model="workItem['Story Points']"
                                              :readonly="!config.isAdmin"
                                              :disabled="!config.isAdmin"
                                              :label="$t('Work_Item_Point')"
                                              :rules="rules.workItemPoint"
                                              dense
                                              outlined/>
                            </v-col>
                            <v-col cols="6">
                                <small v-if="config.isAdmin"
                                       class="ml-3"
                                       style="color: #2196f3">
                                    {{$t('Current_Time')}} - {{workItem.currentTime}}
                                </small>
                                <v-text-field v-model="workItem['Original Estimate']"
                                              :readonly="!config.isAdmin"
                                              :disabled="!config.isAdmin"
                                              :label="$t('Work_Item_Time')"
                                              :rules="rules.workItemTime"
                                              dense
                                              outlined/>
                            </v-col>
                            <v-col cols="12">
                                <v-simple-table>
                                    <template v-slot:default>
                                        <thead>
                                            <tr>
                                                <th/>
                                                <th class="text-left" style="min-width: 300px; width: 560px;">
                                                    {{ $t('Task_Title') }}
                                                </th>
                                                <th class="text-left">
                                                    {{ $t('Task_Time') }}
                                                </th>
                                                <th class="text-left">
                                                    {{ $t('Activity') }}
                                                </th>
                                                <th class="text-left">
                                                    <v-menu v-if="config.isAdmin"
                                                            offset-y
                                                            open-on-hover
                                                            origin="center center"
                                                            transition="scale-transition">
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-btn v-bind="attrs"
                                                                   v-on="on"
                                                                   text
                                                                   block
                                                                   large>
                                                                <v-icon class="text-center"
                                                                        color="info">
                                                                    mdi-plus-circle-outline
                                                                </v-icon>
                                                            </v-btn>
                                                        </template>
                                                        <v-list>
                                                            <v-subheader style="font-size: 16px;">
                                                                <b>{{$t('Select_Activity')}}</b>
                                                            </v-subheader>
                                                            <v-divider class="mx-3"/>
                                                            <v-list-item v-for="(taskActivity, tai) in config.activities"
                                                                         :key="tai"
                                                                         dense
                                                                         link
                                                                         @click="workItem.tasks.push({title: taskActivity.text + ' - ' + workItem.title, time: '', activity: taskActivity.value})">
                                                                <v-list-item-title>{{taskActivity.text}}</v-list-item-title>
                                                            </v-list-item>
                                                        </v-list>
                                                    </v-menu>
                                                </th>
                                            </tr>
                                        </thead>
                                        <draggable :key="draggableKey"
                                                   v-model="workItem.tasks"
                                                   tag="tbody"
                                                   handle=".handle"
                                                   @change="draggableKey++"
                                                   :move="() => config.isAdmin"
                                                   animation="150"
                                                   :selected-class="config.isAdmin ? 'sortableSelected' : ''"
                                                   :ghost-class="config.isAdmin ? 'imageGhost' : ''"
                                                   :component-data="{row: true}"
                                                   :force-fallback="true"
                                                   multi-drag>
                                            <tr v-for="(task, ti) in workItem.tasks" :key="task.key">
                                                <td v-if="config.isAdmin"
                                                    class="handle">
                                                    <v-icon class="text-center">
                                                        mdi-menu
                                                    </v-icon>
                                                </td>
                                                <td v-else/>
                                                <td>
                                                  <v-text-field v-model="task.title"
                                                                :readonly="!config.isAdmin"
                                                                :disabled="!config.isAdmin"
                                                                :rules="rules.taskTitle"
                                                                hide-details
                                                                dense
                                                                outlined/>
                                                </td>
                                                <td>
                                                  <v-text-field v-model="task.time"
                                                                :readonly="!config.isAdmin"
                                                                :disabled="!config.isAdmin"
                                                                :rules="rules.taskTime"
                                                                hide-details
                                                                dense
                                                                outlined/>
                                                </td>
                                                <td>
                                                    <v-select v-model="task.activity"
                                                              :items="config.activities"
                                                              :readonly="!config.isAdmin"
                                                              :disabled="!config.isAdmin"
                                                              menu-props='{class:purple}'
                                                              hide-details
                                                              dense
                                                              outlined/>
                                                </td>
                                                <td>
                                                    <v-btn v-if="config.isAdmin"
                                                           text
                                                           @click="workItem.tasks.splice(ti, 1)">
                                                        <v-icon color="error">
                                                            mdi-delete-outline
                                                        </v-icon>
                                                    </v-btn>
                                                </td>
                                              </tr>
                                        </draggable>
                                    </template>
                                </v-simple-table>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-container>
            </v-card-text>
            <v-card-actions v-if="config.isAdmin">
                <v-alert v-if="userCount"
                         class="ml-8 pa-0 pl-3"
                         dense
                         outlined
                         color="warning">
                    <span>
                        {{ $t('Common.Users_Did_Not_Point', {userCount: userCount}) }}
                        <strong>
                          <v-btn text
                                 @click="$emit('showUsers')">
                            {{ $t('Common.Check_Scores') }}
                          </v-btn>
                        </strong>
                    </span>
                </v-alert>
                <v-spacer/>
                <v-btn text
                       @click="$emit('close')">
                    {{ $t('Common.Cancel') }}
                </v-btn>
                <v-btn text
                       :disabled="!valid"
                       @click="updateWorkItem">
                    {{ $t('Common.Update') }}
                </v-btn>
                <v-btn v-if="planning.workItemIndex < (planning.workItems.length - 1)"
                       text
                       :disabled="!valid"
                       @click="updateWorkItem(true)">
                    {{ $t('Update_And_Start_Next') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'
import validator from 'validator';
import draggable from 'vuedraggable';
import {Planning, Config} from '@/model/Planning';
import {Prop, Watch} from 'vue-property-decorator';

@Component({
    name: 'sp-work-item-dialog',
    components: {
        draggable
    }
})
export default class WorkItemDialog extends Vue {
    @Prop({
        required: true
    })
    config: Config;

    @Prop({
        required: true
    })
    planning: Planning;

    @Prop({
        required: true
    })
    workItem: any;

    valid = false;
    draggableKey = 0;

    rules = {
        workItemPoint: [
            (v) => (/^([0-9]{1,2}){1}(\.[0-9]{1,2})?$|^100$/.test(v) && (v.length > 1 ? !v.startsWith('0') : true)) || `${this.$t('WorkItem_Point_Range', {sizeRange: '0-100'})}`
        ],
        workItemTime: [
            (v) => (/^([0-9]{1,2}){1}(\.[0-9]{1,2})?$|^100$/.test(v) && (v.length > 1 ? !v.startsWith('0') : true)) || `${this.$t('WorkItem_Time_Range', {sizeRange: '0-100'})}`
        ],
        taskTitle: [
            (v) => (validator.isByteLength((v || '').trim(), {min: 2, max: 250})) || `${this.$t('Task_Title_Size_Range', {sizeRange: '2-250'})}`
        ],
        taskTime: [
            (v) => (/^([0-9]{1,2}){1}(\.[0-9]{1,2})?$|^100$/.test(v) && (v.length > 1 ? !v.startsWith('0') : true)) || `${this.$t('Task_Time_Range', {sizeRange: '0-100'})}`
        ]
    }

    get userCount() {
        let count = 0;
        this.planning.users.forEach(user => {
            let emptyScoreCount = 0;
            user.scores.forEach(score => {
                if (!score) {
                    emptyScoreCount++;
                }
            });
            if (emptyScoreCount > 0) {
                count++;
            }
        });

        return count;
    }

    updateWorkItem(startNext = false) {
        const form: any = this.$refs.form;
        if (this.config.isAdmin && form.validate()) {
            this.$emit('update', {workItem: this.workItem, startNext: startNext === true});
        }
    }

    mounted() {
        if (this.workItem.tasks.length === 0 && this.config.activities) {
            this.config.activities.forEach(taskActivity => {
                this.workItem.tasks.push({title: taskActivity.text + ' - ' + this.workItem.title, time: '', activity: taskActivity.value})
            });
        }
    }

    @Watch('workItem', {deep: true})
    routeHandler(val) {
        if (this.config.isAdmin) {
            this.$emit('input', val);
        }
    }
}
</script>

<style lang="scss" scoped>
.sortableSelected {
    background-color: rgba(#00cd81, 0.2);
}

.imageGhost {
    background-color: rgba(#2196f3, 0.5);
}
</style>
