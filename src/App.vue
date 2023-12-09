<template>
    <v-app>
        <template>
            <v-main :style="{background: $vuetify.theme.themes[dark ? 'dark' : 'light'].background}">
                <router-view/>
            </v-main>
        </template>
        <v-overlay :value="overlay.show"
                   :z-index="1000000"
                   class="text-center">
            <v-progress-circular class="mb-8"
                                 indeterminate
                                 size="100">
                <v-icon v-if="overlay.icon"
                        size="50">
                    {{ overlay.icon }}
                </v-icon>
            </v-progress-circular>
            <br/>
            <v-alert v-if="overlay.message"
                     class="mx-16"
                     dense
                     type="info">
                {{overlay.message}}
            </v-alert>
        </v-overlay>
    </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import {getConfig, setConfig} from '@/services';
import {mapState} from 'vuex';
import {Watch} from 'vue-property-decorator';

@Component({
    computed: {
        ...mapState(['dark', 'overlay'])
    }
})
export default class App extends Vue {
    mounted() {
        const config = getConfig();
        if (!config?.scoringMetrics) {
            setConfig({
                scoringMetrics: {
                    columnHeaders: ['Complexity', 'Uncertainty', 'Time', 'Risk'],
                    rowHeaders: ['Very Complex', 'Complex', 'Normal', 'Moderate', 'Easy'],
                    tableMatrix: [[55, 5, 40, 5], [21, 4, 20, 4], [13, 3, 10, 3], [8, 2, 5, 2], [3, 1, 3, 1]]
                }
            });
        }
        if (!config?.activities) {
            setConfig({
                activities: [
                    {
                        text: 'Development',
                        value: 'Development'
                    },
                    {
                        text: 'UI Development',
                        value: 'UI Development'
                    },
                    {
                        text: 'Test',
                        value: 'Testing'
                    },
                    {
                        text: 'Test Case',
                        value: 'Testing'
                    },
                    {
                        text: 'Deployment',
                        value: 'Deployment'
                    },
                    {
                        text: 'Code Review',
                        value: 'Code Review'
                    },
                    {
                        text: 'Meeting',
                        value: 'Meeting'
                    }
                ]
            });
        }
    }

    @Watch('$route.path', {deep: true})
    routeHandler() {
        this.$store.commit('overlay', {show: false});
    }
}
</script>
