<template>
    <v-row class="create-planning background">
        <v-col lg="4"
               md="6"
               cols="12">
            <v-row no-gutters>
                <v-col class="text-center"
                       cols="12">
                    <img src="../../public/azure_icon.svg"
                         alt="azure"
                         class="azure-icon"/>
                </v-col>
                <v-col cols="12">
                    <h2 class="text-center primary--text">{{$t('Sprint_Planning')}}</h2>
                </v-col>
            </v-row>
            <v-form v-model="valid"
                    class="mt-5"
                    ref="form"
                    onsubmit="event.preventDefault(); return false"
                    lazy-validation>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="userName"
                                      :rules="rules.userName"
                                      :disabled="loading"
                                      :label="$t('User_Name')"
                                      hide-details="auto"
                                      outlined/>
                    </v-col>
                </v-row>
            </v-form>
            <v-row class="mt-5">
                <v-col v-if="workItems.length > 0"
                       cols="6">
                    <v-btn :disabled="loading"
                           block
                           x-large
                           @click="start"
                           color="primary">
                        <v-icon class="mr-2" dark>mdi-check-decagram</v-icon>
                        {{$t('Start')}}
                        <v-progress-circular v-if="loading"
                                             class="ml-2"
                                             :size="25"
                                             indeterminate
                                             color="white"/>
                    </v-btn>
                </v-col>
                <v-col :cols="workItems.length > 0 ? '6' : '12'">
                    <v-btn :disabled="loading"
                           block
                           x-large
                           @click="importCsv"
                           color="primary">
                        <v-icon class="mr-2" dark>mdi-import</v-icon>
                        {{ $t('Import_CSV') }}
                        <v-progress-circular v-if="loading"
                                             class="ml-2"
                                             :size="25"
                                             indeterminate
                                             color="green"/>
                    </v-btn>
                    <input ref="fileInput"
                           class="d-none"
                           type="file"
                           accept=".csv"
                           @change="onFileChanged"/>
                </v-col>
                <v-col cols="12" class="pt-0">
                    <p class="text-center">
                        <a href="https://github.com/huseyinkaraarslan"
                           target="_blank">
                           HK &copy;2023
                        </a>
                        <br/>
                        <small v-if="version">Version
                            <span style="color: #00cd81;">{{version}}</span>
                        </small>
                    </p>
                </v-col>
            </v-row>
            <v-bottom-navigation style="box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;"
                                 horizontal
                                 grow
                                 fixed
                                 color="primary"
                                 background-color="card">
                <v-btn :disabled="loading"
                       icon
                       @click="isShowSettings = true;">
                    <span>{{ $t('Settings') }}</span>
                    <v-icon>mdi-cog</v-icon>
                </v-btn>
                <v-btn :disabled="loading"
                       icon
                       @click="changeLang">
                  <span>{{$i18n.locale.toUpperCase()}}</span>
                  <v-icon>mdi-earth</v-icon>
                </v-btn>
                <v-btn :disabled="loading"
                       icon
                       @click="openHowToUse">
                    <span>{{$t('How_To_Use')}}</span>
                    <v-icon>mdi-comment-question-outline</v-icon>
                </v-btn>
            </v-bottom-navigation>
            <SettingsDialog v-if="isShowSettings"
                            @close="isShowSettings = false;"/>
        </v-col>
    </v-row>
</template>

<script>
import Vue from 'vue'
import Component from 'vue-class-component'
import {mapActions} from 'vuex';
import validator from 'validator';
import {Watch} from 'vue-property-decorator';
import SettingsDialog from '@/components/SprintPlanning/SettingsDialog.vue';
import {readme, version} from '../../package';
import Papa from 'papaparse';
import {getConfig, setConfig} from '@/services';

@Component({
    name: 'sp-home',
    components: {
        SettingsDialog
    },
    methods: {
        ...mapActions(['setLang']),
        changeLang() {
            if (this.$i18n.locale === 'tr') {
                this.setLang('en');
            } else {
                this.setLang('tr');
            }
        }
    }
})
export default class Home extends Vue {
    config = getConfig();
    version = version;
    valid = false;
    loading = false;
    isShowSettings = false;
    userName = '';
    workItems = [];

    rules = {
        userName: [
            (v) => (!validator.isEmpty(v.trim())) || this.$t('Error.Invalid_Username'),
            (v) => (validator.isByteLength(v.trim(), {min: 1, max: 32})) || `${this.$t('Error.Max_Characters_Must_Be_X', {length: 32})}`
        ]
    }

    async start() {
        const form = this.$refs.form;
        if (form.validate()) {
            if (this.workItems.length > 0) {
                try {
                    this.loading = true;
                    setConfig({
                        userName: this.userName.trim(),
                        workItems: this.workItems
                    });
                    if (this.config?.isAdmin === true && this.config?.planningId) {
                        this.$router.push('/sprintPlanning/' + this.config.planningId);
                    } else {
                        this.$router.push('/sprintPlanning/-1');
                    }
                } finally {
                    this.loading = false;
                }
            } else {
                this.$store.dispatch('toast', {
                    text: this.$t('Work_Item_Not_Found'),
                    type: 'error',
                    timeout: 3000
                });
            }
        }
    }

    importCsv() {
        const fileInput = this.$refs.fileInput;
        fileInput.click();
    }

    onFileChanged(e) {
        const file = e.target.files[0];
        if (file && (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel')) {
            Papa.parse(file, {
                complete: (results) => {
                    const data = results.data;
                    const headers = data?.[0];
                    if (headers && headers.length > 0) {
                        data.shift();
                        const _workItems = [];
                        data.forEach(item => {
                            const workItem = {};
                            headers.forEach((header, i) => {
                                workItem[header] = item[i];
                            });
                            _workItems.push(workItem);
                        });
                        const workItemIndexses = _workItems.reduce((indexses, item, index) => {
                            if (item['Work Item Type'] === 'User Story') {
                                indexses.push(index);
                            }

                            return indexses;
                        }, []);
                        const workItems = [];
                        workItemIndexses.forEach((index, i) => {
                            const workItem = _workItems[index];
                            workItem.title = workItem.Title || workItem['Title 1'] || workItem['Title 2'];
                            workItem.tasks = [];
                            if (i < (workItemIndexses.length - 1)) {
                                for (let x = (index + 1); x < workItemIndexses[i + 1]; x++) {
                                    if (_workItems[x]['Work Item Type'] === 'Task') {
                                        workItem.tasks.push(_workItems[x]);
                                        _workItems[x].title = _workItems[x].Title || _workItems[x]['Title 1'] || _workItems[x]['Title 2'];
                                        _workItems[x].time = _workItems[x]['Original Estimate'];
                                        _workItems[x].activity = _workItems[x].Activity;
                                    }
                                }
                            } else if (i === (workItemIndexses.length - 1)) {
                                for (let x = (index + 1); x < _workItems.length; x++) {
                                    if (_workItems[x]['Work Item Type'] === 'Task') {
                                        workItem.tasks.push(_workItems[x]);
                                        _workItems[x].title = _workItems[x].Title || _workItems[x]['Title 1'] || _workItems[x]['Title 2'];
                                        _workItems[x].time = _workItems[x]['Original Estimate'];
                                        _workItems[x].activity = _workItems[x].Activity;
                                    }
                                }
                            }
                            workItems.push(workItem);
                        });
                        if (workItems.length > 0) {
                            this.workItems = workItems;
                        } else {
                            this.$store.dispatch('toast', {
                                text: this.$t('Work_Item_Not_Found'),
                                type: 'error',
                                timeout: 3000
                            });
                        }
                    } else {
                        this.$store.dispatch('toast', {
                            text: this.$t('Error.Invalid_File_Type'),
                            type: 'error',
                            timeout: 3000
                        });
                    }
                }
            });
        } else {
            this.$store.dispatch('toast', {
                text: this.$t('Error.Invalid_File_Type'),
                type: 'error',
                timeout: 3000
            });
        }
    }

    openHowToUse() {
        window.open(readme, '_blank');
    }

    mounted() {
        if (this.config?.userName) {
            this.userName = this.config.userName;
        }
        if (this.config?.workItems?.length > 0) {
            this.workItems = this.config.workItems;
        }
    }

    @Watch('$i18n.locale')
    langHandler() {
        const form = this.$refs.form;
        form.validate();
        form.resetValidation();
    }
}
</script>

<style lang="scss" scoped>
.create-planning {
    display: flex;
    height: 100vh;
    justify-content: center;
    align-items: center;
    background: #fff;
    padding: 30px;

    .azure-icon {
        height: 128px;
    }

    .hk {
        position: absolute;
        right: 0;
        padding: 20px 20px 0 0;
        color: #000;
    }

    .app-version {
        position: absolute;
        left: 0;
        padding: 20px 0 0 20px;
        color: #000;
    }
}
</style>
