<template>
    <v-container fluid class="pa-0">
        <transition name="fade">
            <router-view/>
        </transition>
    </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
    created() {
        document.title = this.$t('Sprint_Planning').toString();
    }
})
export default class Default extends Vue {}
</script>

<style lang="scss">
.fade-enter-active, .fade-leave-active {
  transition-property: opacity;
  transition-duration: .25s;
}

.fade-enter-active {
  transition-delay: .25s;
}

.fade-enter, .fade-leave-active {
  opacity: 0
}
</style>
