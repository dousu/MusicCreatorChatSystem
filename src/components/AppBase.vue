<template>
  <div>
    <app-base-source/>
    <app-base-phrase/>
    <app-base-creation/>
  </div>
</template>

<script>
import Vue from "vue";
import AppBaseSource from "@/components/AppBaseSource";
import AppBasePhrase from "@/components/AppBasePhrase";
import AppBaseCreation from "@/components/AppBaseCreation";

export default {
  name: "AppBase",
  components: {
    AppBaseSource: AppBaseSource,
    AppBasePhrase: AppBasePhrase,
    AppBaseCreation: AppBaseCreation
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
