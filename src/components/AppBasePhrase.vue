<template>
  <div id="app">
    <h1>simple chat</h1>Phrase
    <br>
    <input type="text">
    <input type="button" value="send">
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
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
