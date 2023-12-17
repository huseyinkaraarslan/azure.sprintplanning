<template>
    <v-container fluid class="pa-0">
        <template v-if="config && config.userName && planning">
            <PlanningBoard ref="PlanningBoard"
                           :config="config"
                           :planning="planning"
                           @workItemPoint="workItemPoint = $event"
                           @workItemTime="workItemTime = $event"
                           @play="playScoring"
                           @stop="stopScoring"
                           @updateUserScores="updateUserScores"
                           @updateWorkItems="updateWorkItems"/>
            <template v-if="planning.scoringScreenStatus !== scoringScreenStatus.READY">
                <WorkItemDialog v-if="tempWorkItem"
                                :config="config"
                                :planning="planning"
                                :workItem="tempWorkItem"
                                @showUsers="isShowUsers = true"
                                @input="updateTempWorkItem"
                                @update="updateWorkItem"
                                @close="closeWorkItemDialog"/>
                <SprintDialog v-if="isShowSprintDialog"
                              :config="config"
                              :planning="planning"
                              @input="updateSprintWorkItems"
                              @close="closeSprintDialog"/>
            </template>
        </template>
        <SetUserNameDialog ref="setUserNameDialog"/>
        <PlanningChannelReadyDialog ref="planningChannelReadyDialog"/>
        <ReconnectDialog ref="reconnectDialog"/>
        <UserListDialog v-if="isShowUsers"
                        :planning="planning"
                        :key="scoringKey"
                        @close="isShowUsers = false;"/>
        <PointTable v-if="isShowPointTable"
                    @close="isShowPointTable = false;"/>
        <SettingsDialog v-if="isShowSettings"
                        @close="isShowSettings = false;"/>
        <v-bottom-navigation v-else-if="isShowBottomNavigations && !isShowSprintDialog"
                             class="sp-footer"
                             horizontal
                             absolute
                             grow
                             color="primary"
                             background-color="card">
            <v-btn icon
                   width="30"
                   @click="isShowSettings = true;">
                <v-icon class="mx-0">mdi-cog</v-icon>
            </v-btn>
            <v-spacer/>
            <v-slide-group show-arrows>
                <v-slide-item class="px-6">
                    <v-btn icon
                           @click="isShowUsers = true">
                        <v-icon>mdi-account-multiple-outline</v-icon>
                    </v-btn>
                </v-slide-item>
                <v-slide-item>
                    <v-btn icon
                           @click="isShowPointTable = true">
                        <b :title="$t('Sprint.Point_Table')">PT</b>
                    </v-btn>
                </v-slide-item>
                <template v-if="config.isAdmin && !tempWorkItem">
                    <v-slide-item>
                        <v-btn icon
                               :disabled="Number(planning.workItemIndex) === -1"
                               @click="refreshScoring">
                            <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                    </v-slide-item>
                    <v-slide-item>
                        <v-btn icon
                               :disabled="Number(planning.workItemIndex) <= 0"
                               @click="playScoring(Number(--planning.workItemIndex))">
                            <v-icon>mdi-skip-previous</v-icon>
                        </v-btn>
                    </v-slide-item>
                    <v-slide-item>
                        <v-btn v-if="planning.scoringScreenStatus === scoringScreenStatus.PLAY"
                               icon
                               @click="pauseScoring">
                            <v-icon>mdi-pause</v-icon>
                        </v-btn>
                        <v-btn v-else
                               icon
                               :disabled="planning.scoringScreenStatus !== scoringScreenStatus.PAUSE"
                               @click="resumeScoring">
                            <v-icon>mdi-play</v-icon>
                        </v-btn>
                    </v-slide-item>
                    <v-slide-item>
                        <v-btn icon
                               :disabled="Number(planning.workItemIndex) === -1 || Number(planning.workItemIndex) === (planning.workItems.length - 1)"
                               @click="playScoring(Number(++planning.workItemIndex))">
                            <v-icon>mdi-skip-next</v-icon>
                        </v-btn>
                    </v-slide-item>
                    <v-slide-item>
                        <v-btn v-if="planning.showScores"
                               icon
                               @click="showHideScores">
                            <v-icon>mdi-eye-outline</v-icon>
                        </v-btn>
                        <v-btn v-else
                               icon
                               @click="showHideScores">
                            <v-icon>mdi-eye-off-outline</v-icon>
                        </v-btn>
                    </v-slide-item>
                    <v-slide-item>
                        <v-btn icon
                               color="primary"
                               :disabled="Number(planning.workItemIndex) === -1"
                               @click="openWorkItemDialog">
                            <v-icon>mdi-gavel</v-icon>
                        </v-btn>
                    </v-slide-item>
                    <v-slide-item v-if="planning.workItems.length > 0">
                        <v-btn icon
                               color="primary"
                               @click="openSprintDialog">
                            <v-icon>mdi-file-export-outline</v-icon>
                        </v-btn>
                    </v-slide-item>
                </template>
            </v-slide-group>
            <v-spacer/>
            <v-btn width="30"
                   @click="isShowSettings = true;">
                <a href="https://github.com/huseyinkaraarslan"
                   target="_blank">
                   HK &copy;2023
                </a>
            </v-btn>
        </v-bottom-navigation>
    </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Watch} from 'vue-property-decorator';
import SetUserNameDialog from '@/components/SprintPlanning/SetUserNameDialog.vue';
import PlanningBoard from '@/components/SprintPlanning/PlanningBoard.vue';
import WorkItemDialog from '@/components/SprintPlanning/WorkItemDialog.vue';
import SprintDialog from '@/components/SprintPlanning/SprintDialog.vue';
import ReconnectDialog from '@/components/SprintPlanning/ReconnectDialog.vue';
import UserListDialog from '@/components/SprintPlanning/UserListDialog.vue';
import PlanningChannelReadyDialog from '@/components/SprintPlanning/PlanningChannelReadyDialog.vue';
import PointTable from '@/components/SprintPlanning/PointTable.vue';
import SettingsDialog from '@/components/SprintPlanning/SettingsDialog.vue';
import {scoringScreenStatus} from '@/enums/scoringScreenStatus';
import {Config, Planning} from '@/model/Planning';
import {getConfig, setConfig} from '@/services';

@Component({
    name: 'sp-planning',
    components: {
        SetUserNameDialog,
        PlanningBoard,
        WorkItemDialog,
        SprintDialog,
        PlanningChannelReadyDialog,
        ReconnectDialog,
        UserListDialog,
        PointTable,
        SettingsDialog
    }
})
export default class SprintPlanning extends Vue {
    config: Config = getConfig();
    socket: any = null;
    scoringScreenStatus = scoringScreenStatus;
    planning: Planning = {
        users: [],
        adminName: '',
        scoringScreenStatus: scoringScreenStatus.READY,
        showScores: false,
        workItemIndex: -1,
        workItems: []
    };

    isShowUsers = false;
    isShowSettings = false;
    isShowPointTable = false;
    isShowBottomNavigations = false;
    scoringKey = 0;
    tempWorkItem = null;
    isShowSprintDialog = false;
    workItemPoint = 0;
    workItemTime = 0;

    checkAdminConditions() {
        if (this.config?.userName && this.config.workItems && this.config.workItems.length > 0) {
            this.connectToSocket();
        } else {
            this.$router.push('/');
        }
    }

    async openSetUserNameDialog() {
        const setUserNameDialog: any = this.$refs.setUserNameDialog;
        setUserNameDialog.open().then((userName: string) => {
            if (userName) {
                this.joinPlanning(userName);
            }
        });
    }

    async openPlanningChannelReadyDialog(planningId = '') {
        if (planningId) {
            if (this.$route.params.id === '-1') {
                // Admin can use same url in next plannings.
                this.$router.push('/sprintPlanning/' + planningId);
            }
            const planningChannelReadyDialog: any = this.$refs.planningChannelReadyDialog;
            planningChannelReadyDialog.open(window.location.href).then((autoStart) => {
                const config: any = {
                    planningId
                };
                if (autoStart) {
                    config.autoStart = autoStart;
                }
                this.config = setConfig(config);
            });
        }
    }

    async joinPlanning(userName = '') {
        if (userName) {
            this.config = setConfig({userName});
            await this.connectToSocket();
        }
    }

    async connectToSocket() {
        const id = this.$route.params.id;
        const config = getConfig();
        const queryObject: any = {
            userName: config.userName,
            scoresLength: this.config?.scoringMetrics?.columnHeaders?.length || 0
        };
        if (this.config.planningId) {
            queryObject.prevPlanningId = this.config.planningId;
        }
        if (id === '-1') {
            queryObject.isNew = 1;
            this.config = setConfig({isAdmin: true});
        } else {
            let isAdmin = this.config.isAdmin;
            queryObject.planningId = id;
            if (!this.config.planningId || this.config.planningId !== id) {
                isAdmin = false;
            }
            queryObject.isAdmin = isAdmin;
            this.config = setConfig({isAdmin, planningId: id});
        }
        try {
            this.$store.commit('overlay', {show: true});
            const url = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/' : process.env.BASE_URL;
            this.socket = await require('socket.io-client').io.connect(url, {
                reconnection: false,
                query: queryObject
            });
            this.listenSocketEvents();
        } finally {
            this.$store.commit('overlay', {show: false});
        }
    }

    openReconnectDialog(message = '') {
        this.$store.commit('overlay', {show: false});
        const reconnectDialog: any = this.$refs.reconnectDialog;
        reconnectDialog.open(message).then((val: boolean) => {
            if (val) {
                this.reconnect();
            }
        });
    }

    reconnect() {
        this.$store.commit('overlay', {show: true});
        this.socket.connect();
    }

    listenSocketEvents() {
        this.socket.on('connect', () => {
            this.$store.commit('overlay', {show: false});
            this.$store.dispatch('toast', {
                text: this.$t('Common.Connected'),
                type: 'success',
                timeout: 3000
            });
            this.isShowBottomNavigations = true;
        });

        this.socket.on('connect_error', (err) => {
            this.isShowBottomNavigations = false;
            this.$store.commit('overlay', {show: false});
            this.$store.dispatch('toast', {
                text: this.$t(err.message).toString(),
                type: 'error',
                timeout: 3000
            });
            if (err.message === 'User_Name_Is_Required') {
                this.openSetUserNameDialog();
            } else if (err.message === 'Same_User_Message') {
                this.openSetUserNameDialog();
            } else if (err.message === 'Access_Denied' || err.message === 'Planning_Not_Found') {
                this.config = setConfig({planningId: undefined});
                this.$router.push('/');
            } else {
                this.openReconnectDialog(err.message);
            }
        });

        this.socket.on('error', (err) => {
            this.$store.dispatch('toast', {
                text: err.message,
                type: 'error',
                timeout: 3000
            });
        });

        this.socket.on('Planning_Stopped_Because_Your_Admin_Is_Joining_Another_Planning', () => {
            this.$store.dispatch('toast', {
                text: this.$t('Planning_Stopped_Because_Your_Admin_Is_Joining_Another_Planning'),
                type: 'error',
                timeout: 10000
            });
        });

        this.socket.on('You_Were_Disconnected_Because_You_Joined_Another_Planning', () => {
            this.$store.dispatch('toast', {
                text: this.$t('You_Were_Disconnected_Because_You_Joined_Another_Planning'),
                type: 'error',
                timeout: 5000
            });
        });

        this.socket.on('disconnect', () => {
            this.resetScores();
            this.isShowBottomNavigations = false;
            this.$store.dispatch('toast', {
                text: this.$t('Common.Disconnected'),
                type: 'error',
                timeout: 3000
            });
            this.openReconnectDialog(this.$t('Common.Disconnected').toString());
        });

        this.socket.on('new_planning_created', (res) => {
            if (res?.adminName && res.planningId) {
                this.planning = res;
                if (this.config.autoStart === true) {
                    if (this.$route.params.id === '-1') {
                        // Admin can use same url in next plannings.
                        this.$router.push('/sprintPlanning/' + res.planningId);
                    }
                    this.config = setConfig({planningId: res.planningId});
                } else {
                    this.openPlanningChannelReadyDialog(res.planningId);
                }
                this.updateWorkItems();
            }
        });

        this.socket.on('init', (res) => {
            if (res?.adminName) {
                this.planning = res;
                setTimeout(() => {
                    this.calculatePointAndTime();
                }, 100);
                if (JSON.stringify(this.config.workItems) !== JSON.stringify(this.planning.workItems)) {
                    if (this.config.isAdmin) {
                        // from home with new import
                        this.updateWorkItems();
                    }
                }
            }
        });

        this.socket.on('user_joined', (user) => {
            this.$store.dispatch('toast', {
                text: user.name + ' ' + this.$t('Common.Joined').toString(),
                type: 'success',
                timeout: 3000
            });
            this.planning.users.push(user);
        });

        this.socket.on('user_left', (res) => {
            this.$store.dispatch('toast', {
                text: res.leftUserName + ' ' + this.$t('Common.Left').toString(),
                type: 'warning',
                timeout: 3000
            });
            delete res.leftUserName;
            this.planning = res;
            setTimeout(() => {
                this.calculatePointAndTime();
            }, 100);
        });

        this.socket.on('update_work_items', (workItems) => {
            if (workItems && !this.config.isAdmin) {
                this.planning.workItemIndex = -1;
                this.planning.workItems = workItems;
            }
        });

        this.socket.on('update_user_scores', (user) => {
            const _user = this.planning.users.find(u => u.name === user.name);
            if (_user) {
                _user.scores = user.scores;
                this.calculatePointAndTime();
            }
        });

        this.socket.on('show_scores', (val) => {
            if (!this.config.isAdmin) {
                this.planning.showScores = !!val;
                this.shuffleCards();
            }
        });

        this.socket.on('update_screen_status', (data) => {
            if (!this.config.isAdmin) {
                if (data.scoringScreenStatus === scoringScreenStatus.PAUSE) {
                    this.planning.scoringScreenStatus = data.scoringScreenStatus;
                } else if (data.scoringScreenStatus === scoringScreenStatus.RESUME) {
                    this.planning.scoringScreenStatus = scoringScreenStatus.PLAY;
                } else {
                    this.planning.scoringScreenStatus = scoringScreenStatus.NONE;
                    this.collectCards();
                    setTimeout(() => {
                        this.planning.scoringScreenStatus = data.scoringScreenStatus;
                        this.planning.workItemIndex = data.workItemIndex;
                    }, 100);
                }
            }
        });

        this.socket.on('open_work_item', () => {
            if (!this.config.isAdmin) {
                this.$store.commit('overlay', {show: false});
                const workItem = JSON.parse(JSON.stringify(this.planning.workItems[this.planning.workItemIndex]));
                workItem.currentPoint = workItem['Story Points'];
                workItem.currentTime = workItem['Original Estimate'];
                workItem['Story Points'] = this.workItemPoint;
                workItem['Original Estimate'] = this.workItemTime;
                this.tempWorkItem = workItem;
            }
        });

        this.socket.on('close_work_item', () => {
            if (!this.config.isAdmin) {
                this.$store.commit('overlay', {show: true, icon: 'mdi-pause', message: this.$t('Common.Scoring_Paused', {userName: this.planning.adminName}).toString()});
                this.tempWorkItem = null;
            }
        });

        this.socket.on('update_temp_work_item', (workItem) => {
            if (!this.config.isAdmin) {
                this.$store.commit('overlay', {show: false});
                this.tempWorkItem = workItem;
            }
        });

        this.socket.on('update_work_item', (workItem) => {
            if (!this.config.isAdmin) {
                this.$store.commit('overlay', {show: false});
                this.planning.workItems[this.planning.workItemIndex] = workItem;
                this.tempWorkItem = null;
            }
        });

        this.socket.on('open_sprint', () => {
            if (!this.config.isAdmin && this.planning.workItems.length > 0) {
                this.$store.commit('overlay', {show: false});
                this.isShowSprintDialog = true;
            }
        });

        this.socket.on('close_sprint', () => {
            if (!this.config.isAdmin) {
                this.$store.commit('overlay', {show: true, icon: 'mdi-pause', message: this.$t('Common.Scoring_Paused', {userName: this.planning.adminName}).toString()});
                this.isShowSprintDialog = false;
            }
        });

        this.socket.on('update_sprint_work_items', (workItems) => {
            if (!this.config.isAdmin) {
                this.$store.commit('overlay', {show: false});
                this.planning.workItems = workItems;
            }
        });
    }

    updateWorkItems() {
        this.config = getConfig();
        if (this.config.workItems) {
            this.planning.workItemIndex = -1;
            const workItems = JSON.parse(JSON.stringify(this.config.workItems));
            this.socket.emit('update_work_items', workItems);
            this.planning.workItems = workItems;
        }
    }

    updateUserScores(scores) {
        if (scores) {
            this.socket.emit('update_user_scores', scores);
        }
    }

    calculatePointAndTime() {
        const planningBoard: any = this.$refs.PlanningBoard;
        planningBoard.calculatePointAndTime();
    }

    resetScores() {
        this.scoringKey++;
        const planningBoard: any = this.$refs.PlanningBoard;
        planningBoard.resetScores();

        if (this.config.isAdmin) {
            this.socket.emit('update_screen_status', {scoringScreenStatus: this.planning.scoringScreenStatus, workItemIndex: this.planning.workItemIndex});
        }
    }

    playScoring(index: number) {
        if (this.config.isAdmin) {
            this.planning.workItemIndex = index;
            this.planning.scoringScreenStatus = scoringScreenStatus.NONE;
            this.collectCards();
            setTimeout(() => {
                this.planning.scoringScreenStatus = scoringScreenStatus.PLAY;
            }, 100);
        }
    }

    stopScoring() {
        if (this.config.isAdmin) {
            this.planning.workItemIndex = -1;
            this.planning.scoringScreenStatus = scoringScreenStatus.STOP;
        }
    }

    refreshScoring() {
        if (this.config.isAdmin) {
            this.playScoring(Number(this.planning.workItemIndex));
        }
    }

    pauseScoring() {
        if (this.config.isAdmin) {
            this.planning.scoringScreenStatus = scoringScreenStatus.PAUSE;
            this.socket.emit('update_screen_status', {scoringScreenStatus: this.planning.scoringScreenStatus, workItemIndex: this.planning.workItemIndex});
        }
    }

    resumeScoring() {
        if (this.config.isAdmin) {
            this.planning.scoringScreenStatus = scoringScreenStatus.PLAY;
            this.socket.emit('update_screen_status', {scoringScreenStatus: scoringScreenStatus.RESUME, workItemIndex: this.planning.workItemIndex});
        }
    }

    showHideScores() {
        if (this.config.isAdmin) {
            this.planning.showScores = !this.planning.showScores;
            this.shuffleCards();
            this.socket.emit('show_scores', this.planning.showScores);
        }
    }

    shuffleCards() {
        if (this.planning.scoringScreenStatus === scoringScreenStatus.PLAY) {
            const cards: any = document.querySelectorAll('.teamPointCard');
            cards.forEach((card, i) => {
                setTimeout(() => {
                    card.classList.remove('hide');
                    card.classList.add('show');
                }, i * 40);
            });
        }
    }

    collectCards() {
        const cards: any = document.querySelectorAll('.teamPointCard');
        cards.forEach(card => {
            card.classList.remove('show');
            card.classList.add('hide');
            // setTimeout(() => {
            //     card.classList.remove('show');
            //     card.classList.add('hide');
            //     // cards[cards.length - i].classList.remove('show');
            //     // cards[cards.length - i].classList.add('hide');
            // }, i * 20);
        });
    }

    openWorkItemDialog() {
        if (this.config.isAdmin) {
            if (this.planning.scoringScreenStatus !== scoringScreenStatus.PAUSE) {
                this.pauseScoring();
            }
            const workItem = JSON.parse(JSON.stringify(this.planning.workItems[this.planning.workItemIndex]));
            workItem.currentPoint = workItem['Story Points'];
            workItem.currentTime = workItem['Original Estimate'];
            workItem['Story Points'] = this.workItemPoint;
            workItem['Original Estimate'] = this.workItemTime;
            this.tempWorkItem = workItem;
            this.socket.emit('open_work_item');
        }
    }

    closeWorkItemDialog() {
        if (this.config.isAdmin) {
            this.socket.emit('close_work_item');
            this.tempWorkItem = null;
        }
    }

    updateTempWorkItem(workItem) {
        if (this.config.isAdmin && workItem) {
            this.socket.emit('update_temp_work_item', workItem);
        }
    }

    updateWorkItem(data: {workItem: any; startNext: boolean}) {
        if (this.config.isAdmin && data.workItem && this.config.workItems && this.config.workItems[this.planning.workItemIndex]) {
            this.planning.workItems[this.planning.workItemIndex] = data.workItem;
            this.config.workItems[this.planning.workItemIndex] = data.workItem;
            setConfig(this.config);
            this.socket.emit('update_work_item', data.workItem);
            this.tempWorkItem = null;
            if (data.startNext) {
                this.playScoring(Number(this.planning.workItemIndex) + 1)
            }
        }
    }

    openSprintDialog() {
        if (this.config.isAdmin && this.planning.workItems.length > 0) {
            if (this.planning.scoringScreenStatus !== scoringScreenStatus.PAUSE) {
                this.pauseScoring();
            }
            this.isShowSprintDialog = true;
            this.socket.emit('open_sprint');
        }
    }

    closeSprintDialog() {
        if (this.config.isAdmin) {
            this.socket.emit('close_sprint');
            this.isShowSprintDialog = false;
        }
    }

    updateSprintWorkItems(workItems) {
        if (this.config.isAdmin && workItems) {
            this.planning.workItems = workItems;
            this.config.workItems = workItems;
            setConfig(this.config);
            this.socket.emit('update_sprint_work_items', workItems);
        }
    }

    mounted() {
        const id = this.$route.params.id;
        if (id) {
            if (id === '-1') {
                this.checkAdminConditions();
            } else {
                if (this.config?.isAdmin === true) {
                    this.checkAdminConditions();
                } else {
                    if (this.config?.userName) {
                        this.connectToSocket();
                    } else {
                        this.openSetUserNameDialog();
                    }
                }
            }
        }
    }

    @Watch('planning.scoringScreenStatus')
    scoringScreenStatusHandler(val: scoringScreenStatus, oldVal: scoringScreenStatus) {
        switch (Number(val)) {
        case this.scoringScreenStatus.READY:
            this.resetScores();
            break;
        case this.scoringScreenStatus.PLAY:
            if (oldVal !== scoringScreenStatus.PAUSE) {
                this.resetScores();
                this.shuffleCards();
            }
            break;
        case this.scoringScreenStatus.PAUSE:
            if (!this.config.isAdmin) {
                this.$store.commit('overlay', {show: true, icon: 'mdi-pause', message: this.$t('Common.Scoring_Paused', {userName: this.planning.adminName}).toString()});
            }
            break;
        case this.scoringScreenStatus.STOP:
            this.resetScores();
            this.collectCards();
            break;
        }

        if (val !== this.scoringScreenStatus.PAUSE || this.config.isAdmin) {
            this.$store.commit('overlay', {show: false});
        }

        this.isShowUsers = false;
    }

    beforeDestroy() {
        this.socket.disconnect();
    }
}
</script>

<style lang="scss">
.fs24 {
    font-size: 24px !important;
}

.show {
    display: block !important;
}

.hide {
    display: none !important;
}

.text-white input{
    color: white !important;
    text-align: center !important;
}

.text-white input::placeholder {
    color: white !important;
    text-align: center !important;
    opacity: .5;
}
</style>
