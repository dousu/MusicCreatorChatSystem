<template>
  <div id="app">
    <h1>simple chat</h1>Phrase
    <br>

    <hr>
    <!-- <div id="messages"/> -->
  </div>
</template>

<script>
export default {
  name: "AppBasePhrase",
  data() {
    return {
      msg: "Welcome to Your Vue.js App"
    };
  },
  watch: {
    abcElement() {
      console.log(this.abcElement.startChar);
    }
  },
  props: ["abcElement"]
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
