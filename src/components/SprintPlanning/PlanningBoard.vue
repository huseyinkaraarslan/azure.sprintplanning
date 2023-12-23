<template>
    <v-card flat
            color="background">
        <v-card-text class="pt-2">
            <v-row style="height: 80px !important;">
                <v-col cols="12"
                       md="8"
                       lg="9">
                    <v-row no-gutters
                           class="pl-3"
                           :key="planning.workItemIndex">
                        <v-col cols="12">
                            <span style="display: inline-block; width: 80px;">
                                SPRINT
                            </span>
                            :
                            <b :style="$store.state.dark ? 'color: white' : 'color: black'">
                                {{ getSprintTitle() }}
                            </b>
                        </v-col>
                        <v-col cols="12">
                            <span style="display: inline-block; width: 80px;">
                                WORKITEM
                            </span>
                            :
                            <b :style="$store.state.dark ? 'color: white' : 'color: black'">
                                {{ getWorkItemTitle() }}
                            </b>
                        </v-col>
                    </v-row>
                </v-col>
                <v-divider vertical />
                <v-col v-if="$vuetify.breakpoint.xl || $vuetify.breakpoint.lg || $vuetify.breakpoint.md"
                       cols="12"
                       md="4"
                       lg="3">
                    <v-row>
                        <v-col xs="6"
                               align="center"
                               justify="center">
                            {{ $t('Common.Point') }}
                            <br/>
                            <v-avatar style="opacity: .9"
                                      size="45"
                                      color="primary">
                                <span v-if="planning.showScores"
                                      class="black--text headline"
                                      style="font-size: 16px !important;">
                                    {{ workItemPoint }}
                                </span>
                                <span v-else
                                      class="black--text headline"
                                      style="font-size: 16px !important;">
                                    -
                                </span>
                            </v-avatar>
                        </v-col>
                        <v-col xs="6"
                               align="center"
                               justify="center">
                            {{ $t('Common.Time') }}
                            <br/>
                            <v-avatar style="opacity: .9"
                                      size="45"
                                      color="primary">
                                <span v-if="planning.showScores"
                                      class="black--text headline"
                                      style="font-size: 16px !important;">
                                    {{ parseFloat(workItemTime).toFixed(2) }}
                                </span>
                                <span v-else
                                      class="black--text headline"
                                      style="font-size: 16px !important;">
                                    -
                                </span>
                            </v-avatar>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-divider class="mt-3"/>
            <v-row>
                <v-col v-if="$vuetify.breakpoint.sm || $vuetify.breakpoint.xs"
                       class="pb-0">
                    <v-row>
                        <v-col xs="6"
                              align="center"
                              justify="center">
                            {{ $t('Common.Point') }}
                            <br/>
                            <v-avatar style="opacity: .9"
                                      size="50"
                                      color="primary">
                                <span v-if="planning.showScores"
                                      class="black--text headline"
                                      style="font-size: 20px !important;">
                                    {{ workItemPoint }}
                                </span>
                                <span v-else
                                      class="black--text headline"
                                      style="font-size: 16px !important;">
                                    -
                                </span>
                            </v-avatar>
                        </v-col>
                        <v-col xs="6"
                               align="center"
                               justify="center">
                            {{ $t('Common.Time') }}
                            <br/>
                            <v-avatar style="opacity: .9"
                                      size="50"
                                      color="primary">
                                <span v-if="planning.showScores"
                                      class="black--text headline"
                                      style="font-size: 20px !important;">
                                    {{ parseFloat(workItemTime).toFixed(2) }}
                                </span>
                                <span v-else
                                      class="black--text headline"
                                      style="font-size: 16px !important;">
                                    -
                                </span>
                            </v-avatar>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col class="pb-16 mb-16 mt-6"
                       cols="12"
                       md="8"
                       lg="9">
                    <template v-if="planning.scoringScreenStatus === scoringScreenStatus.READY">
                        <div v-if="planning.users && planning.users.length > 0"
                             class="sprintInfoCard">
                            <div align="center"
                                 justify="center"
                                 class="iconBox py-4">
                                <h2 style="color: white">{{ getTeamName() }}</h2>
                                <br/>
                                <h3 style="color: white">{{ $t('Sprint_Planning') }}</h3>
                                <br/>
                                <v-carousel :show-arrows="false"
                                            hide-delimiters
                                            cycle
                                            interval="3000"
                                            :key="planning.users.length">
                                    <v-carousel-item v-for="(user, i) in planning.users"
                                                     :key="i">
                                        <v-avatar size="80"
                                                  color="primary">
                                              <span class="white--text headline"
                                                    style="font-size: 20px !important;">
                                                    {{ getUserNameInitials(user.name) }}
                                              </span>
                                        </v-avatar>
                                        <h3 class="mt-2"
                                            style="color: white">
                                        {{ user.name }}
                                        </h3>
                                    </v-carousel-item>
                                </v-carousel>
                            </div>
                            <div class="details">
                                <h3>{{ $t('Common.Active') }}<br/><span>{{ planning.users.length }} {{ $t('Common.Users') }}</span></h3>
                            </div>
                        </div>
                    </template>
                    <template v-else-if="planning.workItemIndex > -1">
                        <template v-if="planning.showScores">
                            <v-row>
                                <v-col lg="2"
                                       md="3"
                                       xs="6"
                                       v-for="(header, hi) in config.scoringMetrics.columnHeaders"
                                       :key="hi">
                                    <div class="teamPointCard"
                                         :class="{'animate__animated': true, 'animate__flip': true}"
                                         :style="!$vuetify.theme.isDark ? 'border: 5px solid rgba(255,255,255,.3)' : ''"
                                         align="center"
                                         justify="center">
                                        <h3 class="mt-2" style="color: #00cd81">{{ header }}</h3>
                                        <v-text-field v-model="scores[hi]"
                                                      :type="config.isAdmin ? (showAdminInput ? 'text' : 'password') : 'text'"
                                                      :append-icon="config.isAdmin ? (showAdminInput ? 'mdi-eye' : 'mdi-eye-off') : ''"
                                                      :readonly="planning.scoringScreenStatus !== scoringScreenStatus.PLAY"
                                                      :disabled="planning.scoringScreenStatus !== scoringScreenStatus.PLAY"
                                                      @input="validate(hi)"
                                                      @click:append="showAdminInput = !showAdminInput"
                                                      @focus="currentScoreIndex = hi"
                                                      :autofocus="currentScoreIndex === hi"
                                                      class="text-white"
                                                      :placeholder="$t('Common.Point')"
                                                      color="white"
                                                      :key="'score_' + hi + '_' + scoringKey"
                                                      single-line/>
                                        <h4 class="mt-2" style="color: white">{{ config.userName }}</h4>
                                    </div>
                                </v-col>
                            </v-row>
                            <template v-for="(_user, ui) in planning.users.filter(u => u.name !== config.userName)">
                                <v-row :key="ui"
                                       :class="ui > 0 ? 'mt-0' : ''">
                                    <v-col lg="2"
                                           md="3"
                                           xs="6"
                                           v-for="(header, hi) in config.scoringMetrics.columnHeaders"
                                           :key="hi">
                                        <div class="teamPointCard"
                                             :class="{'animate__animated': true, 'animate__flip': true}"
                                             :style="!$vuetify.theme.isDark ? 'border: 5px solid rgba(255,255,255,.3)' : ''"
                                             align="center"
                                             justify="center">
                                            <v-avatar v-if="_user.scores[hi]"
                                                      class="mt-10"
                                                      style="opacity: .9"
                                                      size="60"
                                                      color="primary">
                                                <span class="black--text headline"
                                                      style="font-size: 20px !important;">
                                                    {{ _user.scores[hi] }}
                                                </span>
                                            </v-avatar>
                                            <v-avatar v-else
                                                      class="mt-10"
                                                      style="opacity: .9"
                                                      size="60"
                                                      color="white">
                                                <span class="black--text headline"
                                                      style="font-size: 20px !important;">
                                                    -
                                                </span>
                                            </v-avatar>
                                            <h4 class="mt-2"
                                                style="color: white">
                                                {{ _user.name }}
                                            </h4>
                                        </div>
                                    </v-col>
                                </v-row>
                            </template>
                        </template>
                        <template v-else>
                            <v-row>
                                <v-col lg="2"
                                       md="3"
                                       xs="6"
                                       v-for="(header, hi) in config.scoringMetrics.columnHeaders"
                                       :key="hi">
                                    <div class="teamPointCard"
                                         :style="!$vuetify.theme.isDark ? 'border: 5px solid rgba(255,255,255,.3)' : ''"
                                         align="center"
                                         justify="center">
                                        <h3 class="mt-2" style="color: #00cd81">{{ header }}</h3>
                                        <v-text-field v-model="scores[hi]"
                                                      :type="config.isAdmin ? (showAdminInput ? 'text' : 'password') : 'text'"
                                                      :append-icon="config.isAdmin ? (showAdminInput ? 'mdi-eye' : 'mdi-eye-off') : ''"
                                                      :readonly="planning.scoringScreenStatus !== scoringScreenStatus.PLAY"
                                                      :disabled="planning.scoringScreenStatus !== scoringScreenStatus.PLAY"
                                                      @input="validate(hi)"
                                                      @click:append="showAdminInput = !showAdminInput"
                                                      @focus="currentScoreIndex = hi"
                                                      :autofocus="currentScoreIndex === hi"
                                                      class="text-white"
                                                      :placeholder="$t('Common.Point')"
                                                      color="white"
                                                      :key="'score_' + hi + '_' + scoringKey"
                                                      single-line/>
                                        <h4 class="mt-2" style="color: white">{{ config.userName }}</h4>
                                    </div>
                                </v-col>
                            </v-row>
                            <template v-for="(_user, ui) in planning.users.filter(u => u.name !== config.userName)">
                                <v-row :key="ui"
                                       :class="ui > 0 ? 'mt-0' : ''">
                                    <v-col lg="2"
                                           md="3"
                                           xs="6"
                                           v-for="(header, hi) in config.scoringMetrics.columnHeaders"
                                           :key="hi">
                                        <div class="teamPointCard"
                                             :style="!$vuetify.theme.isDark ? 'border: 5px solid rgba(255,255,255,.3)' : ''"
                                             align="center"
                                             justify="center">
                                            <v-icon v-if="_user.scores[hi]"
                                                    class="mt-10"
                                                    color="primary"
                                                    size="60">
                                                mdi-check-circle-outline
                                            </v-icon>
                                            <v-icon v-else
                                                    class="mt-10"
                                                    style="opacity: .2"
                                                    color="white"
                                                    size="60">
                                                mdi-check-circle-outline
                                            </v-icon>
                                            <h4 class="mt-2"
                                                style="color: white">
                                                {{ _user.name }}
                                            </h4>
                                        </div>
                                    </v-col>
                                </v-row>
                            </template>
                        </template>
                    </template>
                </v-col>
                <v-col v-if="planning.workItems && planning.workItems.length > 0"
                       cols="12"
                       md="4"
                       lg="3"
                       class="pl-0 px-1">
                    <v-card style="min-height: 88vh">
                        <v-card-text class="pa-0">
                            <work-item-list :planning="planning"
                                            :isAdmin="config.isAdmin"
                                            @play="$emit('play', $event)"
                                            @stop="$emit('stop', $event)"
                                            @update="$emit('updateWorkItems')"/>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'
import WorkItemList from '@/components/SprintPlanning/WorkItemList.vue';
import {Planning, Config} from '@/model/Planning';
import {scoringScreenStatus} from '@/enums/scoringScreenStatus';
import {Prop, Watch} from 'vue-property-decorator';

@Component({
    name: 'sp-planning-board',
    components: {
        WorkItemList
    }
})
export default class PlanningBoard extends Vue {
    @Prop({
        required: true
    })
    config: Config;

    @Prop({
        required: true
    })
    planning: Planning;

    scoringScreenStatus = scoringScreenStatus;
    workItemPoint = 0;
    workItemTime = 0;
    showAdminInput = false;
    currentScoreIndex = 0;
    scoringKey = 0;
    tempScores = Array<string>();
    scores = Array<string>();

    getSprintTitle() {
        let sprintTitle = '';
        if (this.planning.workItemIndex > -1) {
            const workItems = this.planning.workItems;
            if (workItems && workItems[this.planning.workItemIndex]['Iteration Path']) {
                const iterationPath = workItems[this.planning.workItemIndex]['Iteration Path'];
                if (iterationPath) {
                    sprintTitle = iterationPath.split('\\')?.pop() || '-';
                }
            }
        }

        return sprintTitle;
    }

    getWorkItemTitle() {
        let workItemTitle = '';
        if (this.planning.workItemIndex > -1) {
            workItemTitle = this.planning.workItems[this.planning.workItemIndex].title;
        }

        return workItemTitle;
    }

    getTeamName() {
        let teamName = '-';
        const areaPath = this.planning.workItems?.find(i => i['Area Path'] && i['Area Path'])?.['Area Path'] || '';
        if (areaPath) {
            teamName = areaPath.split('\\')?.pop() || '-';
        }

        return teamName;
    }

    getUserNameInitials(userName) {
        try {
            const splittedUserName = userName.split(' ');
            let initials = splittedUserName.shift().charAt(0);
            if (splittedUserName.length >= 1) {
                initials += splittedUserName.pop().charAt(0)
            }

            return initials.toUpperCase();
        } catch (error) {
            return '-';
        }
    }

    calculatePointAndTime() {
        this.workItemPoint = 0;
        this.workItemTime = 0;
        if (this.planning?.users?.length > 0) {
            let totalTime = 0;
            const timeColumnIndex = 2;
            const averageList: Array<any> = [];
            if (this.config?.scoringMetrics?.columnHeaders) {
                this.config.scoringMetrics.columnHeaders.forEach(() => {
                    const item = {
                        count: 0,
                        total: 0
                    };
                    averageList.push(item);
                });
                this.planning.users.forEach(user => {
                    user.scores.forEach((score, i) => {
                        if (score) {
                            averageList[i].count++;
                            averageList[i].total += parseInt(score);
                            if (i === timeColumnIndex) {
                                totalTime += parseInt(score);
                            }
                        }
                    });
                });

                this.workItemTime = (totalTime / averageList[timeColumnIndex].count) || 0;

                let target = 0;
                averageList.forEach((item, index) => {
                    if (item.count > 0) {
                        const average = item.total / item.count;
                        if (index === 0) {
                            target = target + (average * 0.4);
                        } else if (index === 1) {
                            target = target + (average * 1);
                        } else if (index === 2) {
                            target = target + (average * 0.5);
                        } else if (index === 3) {
                            target = target + (average * 0.2);
                        }
                    }
                });

                if (target && target > 0) {
                    const points = [55, 34, 21, 13, 8, 5, 3];
                    const tempPoints = [55, 34, 21, 13, 8, 5, 3];
                    tempPoints.forEach((point, i) => {
                        tempPoints[i] = point - target;
                    });
                    const nearestValue = Math.min.apply(null, tempPoints.map(Math.abs));
                    const indexOfNearestValue = tempPoints.findIndex(point => Math.abs(point) === nearestValue);

                    this.workItemPoint = points[indexOfNearestValue];
                } else {
                    this.workItemPoint = 0;
                }
            }
            // boş alanlar hesaplamaya dahil edilmemiştir.
        }
    }

    resetScores() {
        this.workItemPoint = 0;
        this.workItemTime = 0;
        this.planning.users.forEach(user => {
            user.scores.fill('');
        });
        this.scores.fill('');
        this.currentScoreIndex = 0;
    }

    validate(index) {
        if (this.scores[index]) {
            const score = parseInt(this.scores[index], 10);
            if (Number.isInteger(score) && score > 0) {
                if (this.config?.scoringMetrics?.tableMatrix[0][index] && score <= this.config.scoringMetrics.tableMatrix[0][index]) {
                    this.scores[index] = score.toString();
                } else {
                    let _score = score.toString();
                    _score = _score.substring(0, _score.length - 1);
                    this.scores[index] = _score;
                    this.validate(index);

                    return false;
                }
            } else {
                this.scores[index] = '';
            }
        } else {
            this.scores[index] = '';
        }
        this.scoringKey++;
        if (this.scoringKey > 99) {
            this.scoringKey = 0;
        }
        if (JSON.stringify(this.tempScores) !== JSON.stringify(this.scores)) {
            this.tempScores = JSON.parse(JSON.stringify(this.scores));
            const user = this.planning.users.find(u => u.name === this.config.userName);
            if (user) {
                user.scores = this.tempScores;
            }
            this.calculatePointAndTime();
            this.$emit('updateUserScores', this.scores);
        }
    }

    created() {
        this.scores.length = this.config?.scoringMetrics?.columnHeaders?.length || 0;
        this.tempScores.length = this.config?.scoringMetrics?.columnHeaders?.length || 0;
    }

    @Watch('workItemPoint')
    workItemPointHandler() {
        this.$emit('workItemPoint', this.workItemPoint);
    }

    @Watch('workItemTime')
    workItemTimeHandler() {
        this.$emit('workItemTime', this.workItemTime);
    }
}
</script>

<style lang="scss" scoped>
.teamPointCard{
    // display: none;
    position: relative;
    width: 150px;
    height: 200px;
    background: #2d3748;
    margin: 0 auto;
    padding: 10px;
    border: 5px solid white;
    border-radius: 4px;
    box-shadow:0 2px 10px rgba(0,0,0,.2);
    transition: top 2s linear, left 2s linear !important;
}

.sprintInfoCard {
    position: relative;
    width: 300px;
    height: 350px;
    background: #fff;
    margin: 0 auto;
    border-radius: 4px;
    box-shadow:0 2px 10px rgba(0,0,0,.2);
    z-index: 1;
}

.sprintInfoCard:before, .sprintInfoCard:after {
    content:"";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    background: #fff;
    transition: 0.5s;
    z-index:-1;
}

.sprintInfoCard:hover:before {
    transform: rotate(10deg);
    box-shadow: 0 2px 20px rgba(0,0,0,.2);
}

.sprintInfoCard .iconBox{
    position: absolute;
    top: 10px;
    left: 10px;
    bottom: 10px;
    right: 10px;
    background: #2d3748;
    transition: 0.5s;
    z-index: 1;
}

.sprintInfoCard:hover .iconBox {
    bottom: 80px;
}

.sprintInfoCard .iconBox img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
}

.sprintInfoCard .details {
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 10px;
    height: 60px;
    text-align: center;
}

.sprintInfoCard .details h3 {
    margin: 0;
    padding: 0;
    font-weight: 600;
    font-size: 20px;
    color: #777;
    text-transform: uppercase;
}

.sprintInfoCard .details h3 span {
    font-weight: 500;
    font-size: 16px;
    color: #00cd81;
    display: block;
    margin-top: 5px;
}
</style>
