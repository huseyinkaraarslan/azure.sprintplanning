<template>
  <div>
    <router-view/>
  </div>
</template>

<script>
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    created() {
        document.title = this.$t('Sprint_Planning').toString();
    }
})
export default class Full extends Vue {
}
</script>

<style lang="scss">
::-webkit-scrollbar {
    display: none;
}
</style>
