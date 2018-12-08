<template>
  <div>
    <div id="main-text">
      <div id="main-title">Music Creator</div>
      <br>Please select consecutive notes on scores to make a new score.
      <br>Push "Add" button to add "Phrase Editor" to your "Music".
    </div>
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
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faPlus,
  faChevronRight,
  faMinus,
  faUndo,
  faChevronLeft
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faPlus, faMinus, faUndo, faChevronRight, faChevronLeft);

Vue.component("font-awesome-icon", FontAwesomeIcon);

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
#main-text {
  font-size: 170%;
  font-weight: lighter;
}
#main-title {
  font-size: 282%;
  font-weight: bold;
}
.abcjs-midi-start.abcjs-btn.abcjs-pushed::before {
  font-family: sans-serif !important;
  content: "■" !important;
}
.abcjs-midi-start.abcjs-btn::before {
  font-family: sans-serif !important;
  content: "▶" !important;
}
.abcjs-midi-reset.abcjs-btn::before {
  font-family: sans-serif !important;
  content: "▕◀" !important;
}
.container {
  border: solid 1px #000000;
  width: auto;
  height: 300px;
  overflow: auto;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.4);
}
.midi {
  width: auto;
}
.score-title {
  width: fit-content;
  padding: 3px;
  border: solid 3px #000000;
  font-size: 200%;
  font-weight: bold;
}
</style>
