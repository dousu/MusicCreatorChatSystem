<template>
  <div>
    <textarea id="abc-source"></textarea>
    <textarea id="abc-phrase"></textarea>
    <textarea id="abc-creation"></textarea>
    <div id="room-textarea1"></div>
    <div id="room-textarea2"></div>
    <div id="main-text">
      <div id="main-title">Music Creator</div>
      <br>Please select the consecutive notes on the score to make a new score.
      <br>On "Phrase Editor", you can play the selected notes.
      <br>Add your favorite and perfect phrase to "Your Music".
      <br>Let's make your music which is the concatenation of phrases got out from the popular pieces of music.
    </div>
    <hr>
    <div class="frame-container">
      <app-base-source v-on:update-element="updateElement"/>
    </div>
    <div class="frame-container">
      <app-base-phrase v-on:update-phrase="updatePhrase" v-bind:abc-element="element"/>
    </div>
    <div class="frame-container">
      <app-base-creation v-on:update-creation="updateCreation" v-bind:edit-phrase="phrase"/>
    </div>
    <div class="frame-container">
      <app-base-chat
        v-on:update-reference="updateReference"
        v-bind:send-creation="creation"
        ref="chat"
      />
    </div>
    <button v-on:click="log_base" class="button_comp">
      <font-awesome-icon icon="check"/>logging
    </button>
    <br>
    <br>
    <div class="score-title">Reference</div>
    <br>
    <button v-on:click="load_base" class="button_comp">
      <font-awesome-icon icon="comments"/>load reference
    </button>
    <div id="score-list2"></div>
  </div>
</template>

<script>
import Vue from "vue";
import AppBaseSource from "@/components/AppBaseSource";
import AppBasePhrase from "@/components/AppBasePhrase";
import AppBaseCreation from "@/components/AppBaseCreation";
import AppBaseChat from "@/components/AppBaseChat";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faPlus,
  faChevronRight,
  faMinus,
  faUndo,
  faChevronLeft,
  faShareSquare,
  faRetweet,
  faTrash,
  faCheck,
  faComments
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import "abcjs/abcjs-midi.css";
import abcjs from "abcjs/midi";

library.add(
  faPlus,
  faMinus,
  faUndo,
  faChevronRight,
  faChevronLeft,
  faShareSquare,
  faRetweet,
  faTrash,
  faCheck,
  faComments
);

Vue.component("font-awesome-icon", FontAwesomeIcon);

export default {
  name: "AppBase",
  data() {
    return {
      element: "",
      phrase: "",
      creation: "",
      reference: ""
    };
  },
  components: {
    AppBaseSource: AppBaseSource,
    AppBasePhrase: AppBasePhrase,
    AppBaseCreation: AppBaseCreation,
    AppBaseChat: AppBaseChat
  },
  watch: {
    reference() {
      console.log(this.reference);
      this.add_score_view_list(this.reference);
    }
  },
  methods: {
    add_score_view(title, scoreText) {
      const id_str = "reference" + this.record_num.toString();
      this.record_num++;
      document.getElementById("room-textarea2").innerHTML +=
        '<textarea id="' + id_str + '" class="dummy-textarea"></textarea>';
      document.getElementById(id_str).innerHTML = scoreText;
      document.getElementById("score-list2").innerHTML +=
        '<div class="reference-container"><div class="history-element"><div class="history-title">' +
        title +
        '</div><div class="container"><div id="paper-' +
        id_str +
        '"></div></div><div id="midi-' +
        id_str +
        '" class="midi"></div><div id="midi-download-' +
        id_str +
        '"></div></div></div>';
      new abcjs.Editor(id_str, {
        paper_id: "paper-" + id_str,
        staffwidth: "auto",
        generate_midi: true,
        midi_id: "midi-" + id_str,
        midi_download_id: "midi-download-" + id_str,
        abcjsParams: {
          responsive: "resize",
          generateDownload: true,
          midiListener: this.listener,
          animate: {
            listener: this.animate
          }
        }
      });
    },
    add_score_view_list(scores) {
      this.record_num = 1;
      document.getElementById("room-textarea2").innerHTML = "";
      document.getElementById("score-list2").innerHTML = "";
      scores.forEach(value => {
        this.add_score_view(value[0], value[1]);
      });
    },
    updateElement(el) {
      // console.log(el);
      this.element = el;
    },
    updatePhrase(el) {
      // console.log(el);
      this.phrase = el;
    },
    updateCreation(el) {
      // console.log(el);
      this.creation = el;
    },
    updateReference(el) {
      // console.log(el);
      this.reference = el;
    },
    log_base() {
      this.$refs.chat.log_chat();
    },
    load_base() {
      this.$refs.chat.load_chat();
    }
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
  height: auto;
  margin: 2mm;
  overflow: auto;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.4);
}
.midi {
  background-position: top;
  width: auto;
}
.score-title {
  width: fit-content;
  padding: 3px;
  border: solid 3px #000000;
  font-size: 200%;
  font-weight: bold;
}
.modifier {
  width: 49.5%;
  font-size: 150%;
}
#abc-source {
  padding: 6px;
  display: none;
}
#abc-phrase {
  padding: 6px;
  display: none;
}
#abc-creation {
  padding: 6px;
  display: none;
}
.frame-container {
  display: inline-block;
  width: 49.5%;
  overflow: auto;
  border: solid 1px #000000;
  height: 450px;
}
.button_comp {
  width: 100%;
  font-size: 150%;
}
.dummy-textarea {
  display: none;
}
.reference-container {
  margin: 0.1%;
  display: inline-block;
  border: solid 1px #000000;
  width: 49%;
  height: 285px;
  overflow: auto;
  float: left;
}
</style>
