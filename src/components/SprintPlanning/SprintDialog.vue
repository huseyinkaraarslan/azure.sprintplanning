<template>
    <v-dialog v-if="planning && config && planning.workItems"
              :value="true"
              persistent
              attach
              fullscreen>
        <v-card v-if="planning && config && planning.workItems"
                color="secondary">
            <v-toolbar color="secondary"
                       dense>
                <v-btn v-if="config.isAdmin"
                       icon
                       @click="$emit('close')">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>
                    <span class="headline">{{ $t('Edit_Sprint') + ' (' + sprintTitle + ')' }}</span>
                </v-toolbar-title>
                <v-spacer/>
                <v-toolbar-items>
                    <download-excel type="csv"
                                    :escapeCsv="false"
                                    :data="excelData"
                                    :fields="excelFields"
                                    :worksheet="teamName + '-' + sprintTitle"
                                    :name="teamName + '-' + $t('Sprint_Planning') + '(' + sprintTitle + ')-' + moment.utc(new Date()).local().format('DD-MM-YYYY HH-mm-ss') + '.csv'">
                        <v-btn class="mt-2 mr-2"
                               :disabled="planning.workItems.filter(wi => wi.isSelected === true).length === 0"
                               color="primary">
                            <v-icon class="mr-2">mdi-microsoft-excel</v-icon>
                            {{ $t('Csv_Export') }}
                        </v-btn>
                    </download-excel>
                    <download-excel :data="excelData"
                                    :fields="excelFields"
                                    :worksheet="teamName + '-' + sprintTitle"
                                    :name="teamName + '-' + $t('Sprint_Planning') + '(' + sprintTitle + ')-' + moment.utc(new Date()).local().format('DD-MM-YYYY HH-mm-ss') + '.xls'">
                        <v-btn class="mt-2"
                               :disabled="planning.workItems.filter(wi => wi.isSelected === true).length === 0"
                               color="primary">
                            <v-icon class="mr-2">mdi-microsoft-excel</v-icon>
                            {{ $t('Excel_Export') }}
                        </v-btn>
                    </download-excel>
                </v-toolbar-items>
            </v-toolbar>
            <v-card-text class="pa-3">
                <v-progress-linear v-if="!config.isAdmin"
                                   color="info"
                                   rounded
                                   indeterminate
                                   height="1"/>
                <v-row>
                    <v-col cols="12" md="8">
                        <v-simple-table :key="tableKey">
                            <template v-slot:default>
                                <thead slot="header">
                                    <tr>
                                        <th :style="config.isAdmin ? 'width: 10px;' : 'width: 0px;'"/>
                                        <th style="width: 10px;" class="text-center">
                                            <v-checkbox v-if="planning.workItems"
                                                        @change="selectAllWorkItems"
                                                        :disabled="!config.isAdmin"
                                                        :readonly="!config.isAdmin"
                                                        class="mt-0 pt-0"
                                                        :value="planning.workItems.length > 0 && planning.workItems.filter(wi => wi.isSelected === true).length === planning.workItems.length ? true : false"
                                                        :indeterminate="planning.workItems.length > 0 ? (planning.workItems.length !== planning.workItems.filter(wi => wi.isSelected === true).length && planning.workItems.filter(wi => wi.isSelected === true).length > 0 ? true : false) : false"
                                                        hide-details/>
                                        </th>
                                        <th style="width: 200px;">{{$t('Work_Item_Id')}}</th>
                                        <th>{{$t('Work_Item_Title')}}</th>
                                        <th style="width: 160px;">{{$t('Work_Item_Point')}}</th>
                                        <th style="width: 160px;">{{$t('Work_Item_Time')}}</th>
                                        <th style="width: 10px;" class="text-center"/>
                                    </tr>
                                </thead>
                                <draggable v-model="planning.workItems"
                                           tag="tbody"
                                           handle=".handle"
                                           @change="tableKey++"
                                           :move="() => config.isAdmin"
                                           animation="150"
                                           :selected-class="config.isAdmin ? 'sortableSelected' : ''"
                                           :ghost-class="config.isAdmin ? 'imageGhost' : ''"
                                           :component-data="{row: true}"
                                           :force-fallback="true">
                                    <template v-for="(workItem, twi) in planning.workItems">
                                        <tr :key="'table-row-' + twi">
                                            <td v-if="config.isAdmin"
                                                class="handle">
                                                <v-icon class="text-center">
                                                    mdi-menu
                                                </v-icon>
                                            </td>
                                            <td v-else/>
                                            <td>
                                                <v-checkbox v-model="workItem.isSelected"
                                                            :disabled="!config.isAdmin"
                                                            :readonly="!config.isAdmin"
                                                            class="mt-0 pt-0"
                                                            hide-details/>
                                            </td>
                                            <td class="pr-0 pl-0">
                                                <v-text-field v-model="workItem.ID"
                                                              :readonly="!config.isAdmin"
                                                              :disabled="!config.isAdmin"
                                                              hide-details
                                                              dense
                                                              outlined/>
                                            </td>
                                            <td class="pr-0">
                                                <v-text-field v-model="workItem.title"
                                                              :readonly="!config.isAdmin"
                                                              :disabled="!config.isAdmin"
                                                              hide-details
                                                              dense
                                                              outlined/>
                                            </td>
                                            <td class="pr-0">
                                                <v-text-field v-model="workItem.point"
                                                              :readonly="!config.isAdmin"
                                                              :disabled="!config.isAdmin"
                                                              hide-details
                                                              dense
                                                              outlined/>
                                            </td>
                                            <td class="pr-0">
                                                <v-text-field v-model="workItem.time"
                                                              :readonly="!config.isAdmin"
                                                              :disabled="!config.isAdmin"
                                                              hide-details
                                                              dense
                                                              outlined/>
                                            </td>
                                            <td class="pr-0">
                                                <v-btn icon @click="currentWorkItem = workItem; showTaskDialog = true;"
                                                       :class="(config.isAdmin && workItem.isSelected) ? ((!workItem.tasks || workItem.tasks.length === 0) ? 'empty-task' : (workItem.tasks && workItem.tasks.length > 0 && checkWorkItemTask(workItem)) ? '' : 'empty-task-time') : ''"
                                                       :title="(config.isAdmin && workItem.isSelected) ? ((!workItem.tasks || workItem.tasks.length === 0) ? $t('Task_Not_Found').toString() : (workItem.tasks && workItem.tasks.length > 0 && checkWorkItemTask(workItem)) ? '' : $t('Empty_Task_Time').toString()) : ''">
                                                    <v-icon>mdi-clipboard-edit-outline</v-icon>
                                                </v-btn>
                                            </td>
                                        </tr>
                                    </template>
                                </draggable>
                            </template>
                        </v-simple-table>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-simple-table :key="groupedWorkItemsKey">
                            <template v-slot:default>
                                <thead>
                                    <tr>
                                        <th style="width: 150px;">#</th>
                                        <th>{{ $t('Common.Selected_') }}</th>
                                        <th>{{ $t('Common.Unselected') }}</th>
                                        <th>{{ $t('Common.Total') }}</th>
                                    </tr>
                                </thead>
                                <tr>
                                    <td colspan="4">
                                        <v-alert outlined
                                                 dense
                                                 class="text-center mb-2">
                                            WorkItem
                                        </v-alert>
                                    </td>
                                </tr>
                                <tbody>
                                    <tr>
                                        <td>{{$t('Common.Count')}}</td>
                                        <td class="text-left fs24">{{ groupedWorkItems.selected.count }}</td>
                                        <td class="text-left fs24">{{ groupedWorkItems.unselected.count }}</td>
                                        <td class="text-left fs24">{{ groupedWorkItems.total.count }}</td>
                                    </tr>
                                    <tr>
                                        <td>{{$t('Common.Point')}}</td>
                                        <td class="text-left fs24">{{ numberToString(groupedWorkItems.selected.point, 1) }}</td>
                                        <td class="text-left fs24">{{ numberToString(groupedWorkItems.unselected.point, 1) }}</td>
                                        <td class="text-left fs24">{{ numberToString(groupedWorkItems.total.point, 1) }}</td>
                                    </tr>
                                    <tr>
                                        <td>{{$t('Common.Time')}}</td>
                                        <td class="text-left fs24">{{ numberToString(groupedWorkItems.selected.time, 1) }}</td>
                                        <td class="text-left fs24">{{ numberToString(groupedWorkItems.unselected.time, 1) }}</td>
                                        <td class="text-left fs24">{{ numberToString(groupedWorkItems.total.time, 1) }}</td>
                                    </tr>
                                </tbody>
                                <tr>
                                    <td colspan="4">
                                        <v-alert outlined
                                                 dense
                                                 class="text-center mb-2">
                                            {{$t('Activity_Times')}}
                                        </v-alert>
                                    </td>
                                </tr>
                                <tbody>
                                    <tr v-for="(activity, ai) in groupedWorkItems.activities" :key="ai">
                                        <td style="width: 150px;">{{ activity.activity }}</td>
                                        <td class="text-left fs24">{{ activity.selectedTime }}</td>
                                        <td class="text-left fs24">{{ activity.unSelectedTime }}</td>
                                        <td class="text-left fs24">{{ activity.totalTime }}</td>
                                    </tr>
                                </tbody>
                            </template>
                        </v-simple-table>
                    </v-col>
                    <v-dialog v-if="currentWorkItem"
                              v-model="showTaskDialog"
                              max-width="1200px"
                              @input="showTaskDialog = $event">
                        <v-card v-if="showTaskDialog && currentWorkItem" color="card">
                            <v-card-title>
                                <span class="headline">{{ currentWorkItem.title }}</span>
                            </v-card-title>
                            <v-card-text class="pa-0">
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
                                                    <v-menu offset-y
                                                            open-on-hover
                                                            origin="center center"
                                                            transition="scale-transition">
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-btn v-bind="attrs"
                                                                   v-on="on"
                                                                   :disabled="!config.isAdmin"
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
                                                                         :disabled="!config.isAdmin"
                                                                         :key="tai"
                                                                         dense
                                                                         link
                                                                         @click="currentWorkItem.tasks.push({title: taskActivity.text + ' - ' + currentWorkItem.title, time: '', activity: taskActivity.value})">
                                                                <v-list-item-title>{{taskActivity.text}}</v-list-item-title>
                                                            </v-list-item>
                                                        </v-list>
                                                    </v-menu>
                                                </th>
                                            </tr>
                                        </thead>
                                        <draggable v-model="currentWorkItem.tasks"
                                                   tag="tbody"
                                                   handle=".task-handle"
                                                   @change="tableKey++"
                                                   :move="() => config.isAdmin"
                                                   animation="150"
                                                   :selected-class="config.isAdmin ? 'sortableSelected' : ''"
                                                   :ghost-class="config.isAdmin ? 'imageGhost' : ''"
                                                   :component-data="{row: true}"
                                                   :force-fallback="true">
                                            <tr v-for="(task, ti) in currentWorkItem.tasks" :key="task.key">
                                                <td v-if="config.isAdmin"
                                                    class="task-handle">
                                                    <v-icon class="text-center">
                                                        mdi-menu
                                                    </v-icon>
                                                </td>
                                                <td v-else/>
                                                <td>
                                                    <v-text-field v-model="task.title"
                                                                  :readonly="!config.isAdmin"
                                                                  :disabled="!config.isAdmin"
                                                                  hide-details
                                                                  dense
                                                                  outlined/>
                                                </td>
                                                <td>
                                                    <v-text-field v-model="task.time"
                                                                  :readonly="!config.isAdmin"
                                                                  :disabled="!config.isAdmin"
                                                                  :error="!task.time"
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
                                                    <v-btn text
                                                          :disabled="!config.isAdmin"
                                                          @click="currentWorkItem.tasks.splice(ti, 1)">
                                                        <v-icon color="error">
                                                            mdi-delete-outline
                                                        </v-icon>
                                                    </v-btn>
                                                </td>
                                            </tr>
                                            <tr v-if="currentWorkItem.tasks.length === 0">
                                                <td class="text-center"
                                                    colspan="5">
                                                    {{ $t('Common.No_Records_Found') }}
                                                </td>
                                            </tr>
                                        </draggable>
                                    </template>
                                </v-simple-table>
                            </v-card-text>
                        </v-card>
                    </v-dialog>
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'
import downloadExcel from 'vue-json-excel';
import draggable from 'vuedraggable';
import moment from 'moment';
import {Planning, Config} from '@/model/Planning';
import {Prop, Watch} from 'vue-property-decorator';

@Component({
    name: 'sp-sprint-dialog',
    components: {
        downloadExcel,
        draggable
    }
})
export default class SprintDialog extends Vue {
    @Prop({
        required: true
    })
    config: Config;

    @Prop({
        required: true
    })
    planning: Planning;

    moment = moment;
    sprintTitle = '';
    teamName = '';
    collectionName = '';
    tableKey = 0;
    showTaskDialog = false;
    groupedWorkItemsKey = 0;
    excelData: any = [];
    activities: Array<string> = [];
    currentWorkItem = null;
    initialGroupedWorkItems = {
        selected: {
            count: 0,
            point: 0,
            time: 0,
            totalTaskTime: 0
        },
        unselected: {
            count: 0,
            point: 0,
            time: 0,
            totalTaskTime: 0
        },
        total: {
            count: 0,
            point: 0,
            time: 0,
            totalTaskTime: 0
        },
        activities: ([] as Array<{activity: string; selectedTime: number; unSelectedTime: number; totalTime: number}>)
    };

    groupedWorkItems = JSON.parse(JSON.stringify(this.initialGroupedWorkItems));

    excelFields = {
        ID: 'id',
        'Work Item Type': 'workItemType',
        'Title 1': 'title1',
        'Title 2': 'title2',
        State: 'state',
        'Iteration Path': 'iterationPath',
        'Area Path': 'areaPath',
        'Story Points': 'storyPoints',
        'Original Estimate': 'originalEstimate',
        'Remaining Work': 'remainingWork',
        'Assigned To': 'assignedTo',
        Activity: 'activity',
        'Value Area': 'valueArea',
        Tags: 'tags',
        'Closed By': 'closedBy'
    };

    numberToString(number: number, toFixed: 0): string {
        return parseFloat(number.toString()).toFixed(toFixed);
    }

    setSprintTitle() {
        let sprintTitle = '';
        const workItems = this.planning.workItems;
        const iterationPath = workItems?.find(wi => wi['Iteration Path'])?.['Iteration Path'] || '';
        if (iterationPath) {
            sprintTitle = iterationPath.split('\\')?.pop() || '';
        }

        this.sprintTitle = sprintTitle;
    }

    setTeamName() {
        let teamName = '-';
        const areaPath = this.planning.workItems?.find(i => i['Area Path'] && i['Area Path'])?.['Area Path'] || '';
        if (areaPath) {
            teamName = areaPath.split('\\')?.pop() || '';
        }

        this.teamName = teamName;
    }

    setCollectionName() {
        let collectionName = '-';
        const iterationPath = this.planning.workItems?.find(wi => wi['Iteration Path'])?.['Iteration Path'] || '';
        if (iterationPath) {
            collectionName = iterationPath.split('\\')?.[0] || '';
        }

        this.collectionName = collectionName;
    }

    selectAllWorkItems(isSelected: boolean) {
        if (this.config.isAdmin) {
            const workItems = JSON.parse(JSON.stringify(this.planning.workItems));
            workItems.forEach(workItem => {
                workItem.isSelected = isSelected || false;
            });
            this.planning.workItems = workItems;
        }
    }

    updateGroupedWorkItems() {
        this.groupedWorkItems = JSON.parse(JSON.stringify(this.initialGroupedWorkItems));
        if (this.config.activities) {
            this.activities = [...new Set(this.config.activities.map(ta => ta.value))];
            this.activities.forEach((taskActivity: string) => {
                const item = {
                    activity: taskActivity,
                    selectedTime: 0,
                    unSelectedTime: 0,
                    totalTime: 0
                };
                this.groupedWorkItems.activities.push(item);
            });
        }
        this.excelData = [];
        this.planning.workItems.forEach(workItem => {
            if (workItem.isSelected) {
                const excelDataItem = {
                    id: workItem.ID || '',
                    workItemType: 'User Story',
                    title1: workItem.title,
                    title2: '',
                    state: workItem.State || 'Committed',
                    iterationPath: workItem['Iteration Path'] || `${this.collectionName}\\${this.teamName}\\${this.sprintTitle}`,
                    areaPath: workItem['Area Path'] || `${this.collectionName}\\${this.teamName}`,
                    storyPoints: workItem['Story Points'] || '',
                    originalEstimate: '',
                    remainingWork: '',
                    assignedTo: workItem['Assigned To'] || '',
                    activity: '',
                    valueArea: workItem['Value Area'] || 'Business',
                    tags: workItem.Tags || this.sprintTitle,
                    closedBy: workItem['Closed By'] || ''
                };
                this.excelData.push(excelDataItem);
            }

            if (workItem.isSelected === true) {
                this.groupedWorkItems.selected.count++;
                this.groupedWorkItems.selected.point += parseFloat(workItem.point || 0);
                this.groupedWorkItems.selected.time += parseFloat(workItem.time || 0);
                workItem.tasks.forEach(task => {
                    this.groupedWorkItems.selected.totalTaskTime += parseFloat(task.time || 0);
                    const activityIndex = this.groupedWorkItems.activities.findIndex(a => a.activity === task.activity);
                    if (activityIndex !== -1) {
                        this.groupedWorkItems.activities[activityIndex].selectedTime += parseFloat(task.time || 0);
                    }
                });
            } else {
                this.groupedWorkItems.unselected.count++;
                this.groupedWorkItems.unselected.point += parseFloat(workItem.point || 0);
                this.groupedWorkItems.unselected.time += parseFloat(workItem.time || 0);
                workItem.tasks.forEach(task => {
                    this.groupedWorkItems.unselected.totalTaskTime += parseFloat(task.time || 0);
                    const activityIndex = this.groupedWorkItems.activities.findIndex(a => a.activity === task.activity);
                    if (activityIndex !== -1) {
                        this.groupedWorkItems.activities[activityIndex].unSelectedTime += parseFloat(task.time || 0);
                    }
                });
            }
            this.groupedWorkItems.total.count++;
            this.groupedWorkItems.total.point += parseFloat(workItem.point || 0);
            this.groupedWorkItems.total.time += parseFloat(workItem.time || 0);
            workItem.tasks.forEach(task => {
                this.groupedWorkItems.total.totalTaskTime += parseFloat(task.time || 0);
                const activityIndex = this.groupedWorkItems.activities.findIndex(a => a.activity === task.activity);
                if (activityIndex !== -1) {
                    this.groupedWorkItems.activities[activityIndex].totalTime += parseFloat(task.time || 0);
                }
                if (workItem.isSelected) {
                    const _excelDataItem = {
                        id: '',
                        workItemType: 'Task',
                        title1: '',
                        title2: task.title,
                        state: task.State || 'New',
                        iterationPath: workItem['Iteration Path'] || `${this.collectionName}\\${this.teamName}\\${this.sprintTitle}`,
                        areaPath: workItem['Area Path'] || `${this.collectionName}\\${this.teamName}`,
                        storyPoints: '',
                        originalEstimate: task.time,
                        remainingWork: task.time,
                        assignedTo: '',
                        activity: task.activity,
                        valueArea: '',
                        tags: '',
                        closedBy: ''
                    };
                    this.excelData.push(_excelDataItem);
                }
            });
        });
        this.groupedWorkItemsKey++;
    }

    checkWorkItemTask(workItem) {
        let checked = true;
        for (let index = 0; index < workItem.tasks.length; index++) {
            const task = workItem.tasks[index];
            if (!task.time || Number(task.time) === 0) {
                checked = false;
                task.errorClass = 'empty-task-time';
            } else {
                task.errorClass = '';
            }
        }

        return checked;
    }

    mounted() {
        this.setSprintTitle();
        this.setTeamName();
        this.setCollectionName();
        this.updateGroupedWorkItems();
    }

    @Watch('planning.workItems', {deep: true})
    routeHandler(val) {
        this.updateGroupedWorkItems();
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

.empty-task {
    animation: empty-task-anim 1s infinite;
}

@keyframes empty-task-anim {
    20% {
        background: #fb8c00;
    }
}

.empty-task-time {
    animation: empty-task-time-anim 1s infinite;
}

@keyframes empty-task-time-anim {
    20% {
        background: #ff5252;
    }
}

.fs24 {
    font-size: 24px !important;
}
</style>
