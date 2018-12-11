<template>
  <div id="app">
    <div id="room-textarea"></div>
    <div id="history">
      <div class="score-title">History</div>
      <br>
      <button v-on:click="reload_chat" class="modifier">
        <font-awesome-icon icon="retweet"/>reload
      </button>
      <button v-on:click="trash_chat" class="modifier">
        <font-awesome-icon icon="trash"/>cancel
      </button>
      <div id="score-list"></div>
    </div>
  </div>
</template>

<script>
import "abcjs/abcjs-midi.css";
import abcjs from "abcjs/midi";
export default {
  mounted: async function() {
    var add_score_view = (title, scoreText) => {
      const id_str = "history" + this.record_num.toString();
      this.record_num++;
      document.getElementById("room-textarea").innerHTML +=
        '<textarea id="' + id_str + '" class="dummy-textarea"></textarea>';
      document.getElementById(id_str).innerHTML = scoreText;
      document.getElementById("score-list").innerHTML +=
        '<div class="mini-container"><div class="history-element"><div class="history-title">' +
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
    };
    var add_score_view_list = scores => {
      this.record_num = 1;
      document.getElementById("room-textarea").innerHTML = "";
      document.getElementById("score-list").innerHTML = "";
      scores.forEach(function(value) {
        add_score_view(value[0], value[1]);
      });
    };
    this.host = window.document.location.host.replace(/:.*/, "");
    this.ws = new WebSocket("ws://" + this.host + ":3000");
    this.ws.onmessage = function(event) {
      this.message_value = JSON.parse(event.data);
      console.log(this.message_value);
      add_score_view_list(this.message_value);
    };
    this.ws.onclose = function(event) {
      console.log("close:", event.code, event.reason);
      this.close_msg = "WebSocket does not work.";
      document.getElementById("room-textarea").innerHTML = "";
      document.getElementById("score-list").innerHTML = this.close_msg;
    };
    this.ws.onclose = function(event) {
      console.log("error:", event.error);
      this.close_msg = "WebSocket does not work.";
      document.getElementById("room-textarea").innerHTML = "";
      document.getElementById("score-list").innerHTML = this.close_msg;
    };
  },
  name: "AppBaseChat",
  data() {
    return {
      record_num: 1,
      message_value: "",
      host: "",
      ws: null,
      close_msg: ""
    };
  },
  watch: {
    sendCreation() {
      //this.sendCreation
      this.ws.send(this.sendCreation.replace(/T:.*\n/g, ""));
    }
  },
  methods: {
    listener(midiControl, progress) {
      this.progress = progress;
    },
    colorRange(range, color) {
      if (range && range.elements) {
        range.elements.forEach(function(set) {
          set.forEach(function(item) {
            item.setAttribute("fill", color);
          });
        });
      }
    },
    animate(lastRange, currentRange) {
      // This provides the actual visual note being played. It can be used to create the "bouncing ball" effect.
      this.colorRange(lastRange, "#000000"); // Set the old note back to black.
      this.colorRange(currentRange, "#3D9AFC"); // Set the currently sounding note to blue.
    },
    reload_chat() {
      this.ws.send("");
    },
    trash_chat() {
      //this.message_value
      this.ws.send("_cancel");
    }
  },
  props: ["sendCreation"]
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.dummy-textarea {
  display: none;
}
.mini-container {
  margin: 0.1%;
  display: inline-block;
  border: solid 1px #000000;
  width: 49%;
  height: 170px;
  overflow: auto;
  float: left;
}
#history {
  margin: 1%;
}
.history-element {
  margin: 1%;
}
.history-title {
  margin-top: 2.2%;
  font-size: 90%;
  font-weight: bold;
}
#button_reload {
  width: 100%;
  font-size: 150%;
}
</style>
