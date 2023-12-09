<template>
    <div>
        <v-text-field v-model="searchWorkItem"
                      class="rounded-sm"
                      color="strange"
                      background-color="background"
                      outlined
                      clearable
                      :placeholder="$t('Common.Search') + ' (' + planning.workItems.length + ' ' + $t('Common.Records') + ')'"
                      hide-details
                      clear-icon="mdi-close-circle-outline"
                      :append-icon="isAdmin ? 'mdi-plus-circle-outline' : ''"
                      @click:append="Number(planning.workItemIndex) >= 0 ? () => {} : openWorkItemDialog(-1)"
                      dense/>
        <v-data-table fixed-header
                      :search="searchWorkItem"
                      height="85vh"
                      class="background"
                      :headers="headers"
                      :items="planning.workItems"
                      item-key="index"
                      :items-per-page="1000"
                      hide-default-footer>
            <template v-slot:[`header.title`]="{ header }">
                <span :class="isAdmin && 'ml-6'">{{header.text}}</span>
            </template>
            <template v-slot:[`item.title`]="{ item, index }">
                <template v-if="isAdmin">
                    <v-icon v-if="Number(planning.workItemIndex) === index"
                            color="error"
                            class="mr-3"
                            style="margin: -0.7rem;"
                            :disabled="playStopButtonDisabled"
                            @click="stopScoring">
                        mdi-stop-circle-outline
                    </v-icon>
                    <v-icon v-else
                            class="mr-3"
                            style="margin: -0.7rem;"
                            :disabled="playStopButtonDisabled"
                            @click="playScoring(index)">
                        mdi-play-circle-outline
                    </v-icon>
                </template>
                <v-tooltip top color="primary">
                    <template v-slot:activator="{ on, attrs }">
                        <span v-bind="attrs"
                              v-on="on"
                              class="wi-title"
                              @click="Number(planning.workItemIndex) >= 0 ? () => {} :openWorkItemDialog(index)">
                            {{ item.title }}
                        </span>
                    </template>
                    <span>{{ item.title }}</span>
                </v-tooltip>
            </template>
            <template v-if="isAdmin"
                      v-slot:[`item.actions`]="{ item, index}">
                <v-menu transition="slide-x-transition"
                        bottom
                        right
                        offset-y>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn icon
                               v-bind="attrs"
                               v-on="on"
                               :disabled="Number(planning.workItemIndex) >= 0">
                            <v-icon small
                                    class="action-icon">
                                mdi-dots-vertical
                            </v-icon>
                        </v-btn>
                    </template>
                    <v-btn-toggle>
                        <v-btn @click="openWorkItemDialog(index)">
                            <v-icon class="text-center"
                                    color="primary">
                                mdi-pencil-outline
                            </v-icon>
                        </v-btn>
                        <v-btn @click="removeWorkItem(item, index)">
                            <v-icon class="text-center"
                                    color="error">
                                mdi-delete-outline
                            </v-icon>
                        </v-btn>
                    </v-btn-toggle>
                </v-menu>
            </template>
        </v-data-table>
        <v-dialog v-model="workItemDialog"
                  max-width="600px">
            <v-card v-if="workItemDialog" color="card">
                <v-card-title>
                    <span class="headline">{{ editIndex > -1 ? $t('Update_WorkItem') : $t('Add_WorkItem') }}</span>
              </v-card-title>
              <v-card-text>
                    <v-container>
                        <v-form v-model="valid"
                                class="mt-5"
                                ref="form"
                                onsubmit="event.preventDefault(); return false"
                                lazy-validation>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-model="workItem.ID"
                                                  label="Id"
                                                  :rules="rules.id"
                                                  outlined
                                                  :disabled="!isAdmin"/>
                                    <v-text-field v-model="workItem.title"
                                                  :label="$t('Work_Item_Title')"
                                                  :rules="rules.workItemTitle"
                                                  outlined
                                                  autofocus
                                                  :disabled="!isAdmin"/>
                                    <v-text-field v-model="workItem['Story Points']"
                                                  :label="$t('Work_Item_Point')"
                                                  :rules="rules.workItemPoint"
                                                  outlined
                                                  :disabled="!isAdmin"/>
                                    <v-text-field v-model="workItem['Original Estimate']"
                                                  :label="$t('Work_Item_Time')"
                                                  :rules="rules.workItemTime"
                                                  outlined
                                                  :disabled="!isAdmin"/>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-container>
                </v-card-text>
                <v-card-actions v-if="isAdmin">
                  <v-spacer/>
                  <v-btn text
                    :disabled="!valid"
                    @click="save">
                    {{ editIndex > -1 ?  $t('Common.Update') : $t('Common.Save') }}
                  </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Planning} from '@/model/Planning';
import {setConfig} from '@/services';
import {Prop} from 'vue-property-decorator';
import validator from 'validator';

@Component({
    name: 'sp-work-item-list',
    computed: {
        headers() {
            return [
                {
                    text: this.$t('Common.Title'),
                    sortable: false,
                    value: 'title',
                    class: 'background',
                    cellClass: 'overflow-text'
                },
                {
                    text: this.$t('Common.Point'),
                    sortable: false,
                    value: 'point',
                    class: 'background'
                },
                {
                    text: this.$t('Common.Time'),
                    sortable: false,
                    value: 'time',
                    class: 'background'
                },
                {text: '', value: 'actions', sortable: false, align: 'end', class: 'background'}
            ]
        }
    }
})
export default class WorkItemList extends Vue {
    @Prop({
        required: false,
        default: false
    })
    isAdmin: boolean;

    @Prop({
        required: true
    })
    planning: Planning;

    playStopButtonDisabled = false;
    searchWorkItem = '';
    workItemDialog = false;
    editIndex = -1;
    valid = false;
    initialWorkItem = {
        isManual: true,
        ID: '',
        title: '',
        'Story Points': '0',
        'Original Estimate': '0',
        tasks: []
    }

    workItem = null;

    rules = {
        id: [
            (v) => (!v || validator.isByteLength(v.trim(), {min: 0, max: 10})) || `${this.$t('CustomId_Size_Range', {sizeRange: '0-10'})}`
        ],
        workItemTitle: [
            (v) => (validator.isByteLength(v.trim(), {min: 2, max: 250})) || `${this.$t('WorkItem_Title_Size_Range', {sizeRange: '2-250'})}`
        ],
        workItemPoint: [
            (v) => (/^([0-9]{1,2}){1}(\.[0-9]{1,2})?$|^100$/.test(v) && (v.length > 1 ? !v.startsWith('0') : true)) || `${this.$t('WorkItem_Point_Range', {sizeRange: '0-100'})}`
        ],
        workItemTime: [
            (v) => (/^([0-9]{1,2}){1}(\.[0-9]{1,2})?$|^100$/.test(v) && (v.length > 1 ? !v.startsWith('0') : true)) || `${this.$t('WorkItem_Time_Range', {sizeRange: '0-100'})}`
        ]
    }

    togglePlayStopButton() {
        this.playStopButtonDisabled = true;
        setTimeout(() => {
            this.playStopButtonDisabled = false;
        }, 1000);
    }

    openWorkItemDialog(index: number) {
        this.editIndex = index;
        const isEdit = index > -1;
        this.workItem = JSON.parse(JSON.stringify(isEdit ? this.planning.workItems[index] : this.initialWorkItem));
        this.workItemDialog = true;
    }

    async save() {
        const form: any = this.$refs.form;
        if (form.validate()) {
            const workItem = JSON.parse(JSON.stringify(this.workItem));
            if (this.editIndex > -1) {
                this.planning.workItems[this.editIndex] = workItem;
            } else {
                this.planning.workItems.unshift(workItem);
            }
            this.workItemDialog = false;
            this.updateWorkItems();
        }
    }

    async removeWorkItem(workItem, index: number) {
        this.$dialog.confirm({
            actions: {
                false: this.$t('Cancel').toString(),
                true: {
                    text: this.$t('Yes').toString(),
                    color: 'primary',
                    handle: async (): Promise<void> => {
                        this.planning.workItems.splice(index, 1);
                        this.updateWorkItems();
                    }
                }
            },
            text: `"${workItem.title}" ${this.$t('will_be_removed')}!`,
            title: this.$t('Warning').toString()
        } as any);
    }

    updateWorkItems() {
        setConfig({
            workItems: this.planning.workItems
        });
        this.$emit('update');
    }

    playScoring(index: number) {
        this.planning.workItemIndex = index;
        this.togglePlayStopButton();
        this.$emit('play', index);
    }

    stopScoring() {
        this.planning.workItemIndex = -1;
        this.togglePlayStopButton();
        this.$emit('stop', this.planning.workItemIndex);
    }
}
</script>
