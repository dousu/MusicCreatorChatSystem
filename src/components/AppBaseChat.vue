<template>
  <div id="app">
    <div id="room-textarea"></div>
    <div class="score-title">History</div>
    <br>
    <div id="score-list"></div>
  </div>
</template>

<script>
import "abcjs/abcjs-midi.css";
import abcjs from "abcjs/midi";
export default {
  mounted: async function() {
    var add_score_view = scoreText => {
      const id_str = "history" + this.record_num.toString();
      this.record_num++;
      document.getElementById("room-textarea").innerHTML +=
        '<textarea id="' + id_str + '" class="dummy-textarea"></textarea>';
      document.getElementById(id_str).innerHTML = scoreText;
      document.getElementById("score-list").innerHTML +=
        '<div class="container"><div id="paper-' +
        id_str +
        '"></div></div><div id="midi-' +
        id_str +
        '" class="midi"></div><div id="midi-download-' +
        id_str +
        '"></div>';
      new abcjs.Editor(id_str, {
        paper_id: "paper-" + id_str,
        staffwidth: "auto",
        generate_midi: true,
        midi_id: "midi-" + id_str,
        midi_download_id: "midi-download-" + id_str,
        abcjsParams: {
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
        add_score_view(value);
      });
    };
    this.host = window.document.location.host.replace(/:.*/, "");
    this.ws = new WebSocket("ws://" + this.host + ":3000");
    this.ws.onmessage = function(event) {
      this.message_value = JSON.parse(event.data);
      console.log(this.message_value);
      add_score_view_list(this.message_value);
    };
  },
  name: "AppBaseChat",
  data() {
    return {
      record_num: 1,
      message_value: "",
      host: "",
      ws: null
    };
  },
  watch: {
    sendCreation() {
      //this.sendCreation
      this.ws.send(this.sendCreation);
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
</style>
