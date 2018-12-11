<template>
  <div id="app">
    <div id="creation">
      <audio id="sound-file-clear" preload="auto">
        <source src="static/sound/clear/nc78407.mp3" type="audio/mp3">
      </audio>
      <audio id="sound-file-add" preload="auto">
        <source src="static/sound/add/nc44409.mp3" type="audio/mp3">
      </audio>
      <audio id="sound-file-undo" preload="auto">
        <source src="static/sound/undo/nc78408.mp3" type="audio/mp3">
      </audio>
      <div class="score-title">Your Music</div>
      <br>
      <div class="container">
        <div id="paper-creation"></div>
      </div>
      <button v-on:click="clear_creation" class="modifier">
        <font-awesome-icon icon="minus"/>clear
      </button>
      <button v-on:click="undo_creation" class="modifier">
        <font-awesome-icon icon="undo"/>undo
      </button>
      <button v-on:click="comp_creation" id="button_comp">
        <font-awesome-icon icon="share-square"/>send
      </button>
      <div id="midi-creation" class="midi"></div>
      <div id="midi-download-creation"></div>
    </div>
  </div>
</template>

<script>
import "abcjs/abcjs-midi.css";
import abcjs from "abcjs/midi";

export default {
  name: "AppBaseCreation",
  data() {
    return {
      creationdata: "",
      old_creation: []
    };
  },
  watch: {
    creationdata() {
      document.getElementById("abc-creation").value = this.creationdata;
      new abcjs.Editor("abc-creation", {
        paper_id: "paper-creation",
        staffwidth: "auto",
        generate_midi: true,
        midi_id: "midi-creation",
        midi_download_id: "midi-download-creation",
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
    async editPhrase() {
      this.old_creation.push(this.creationdata);
      await this.concatenation(this.editPhrase, this.creationdata);
    }
  },
  methods: {
    async concatenation(phrase_data, creation_data) {
      const phrase_info = await this.get_info(
        phrase_data,
        phrase_data.indexOf("[")
      );
      const creation_info = await this.get_info(
        creation_data,
        creation_data.length
      );
      if (
        creation_data === "" ||
        creation_data.lastIndexOf(creation_info.get("K")) +
          creation_info.get("K").length +
          1 ===
          creation_data.length
      ) {
        this.creationdata = phrase_data.replace(
          phrase_info.get("T"),
          "T:Music"
        );
      } else {
        await this.creation_set_info(phrase_info, creation_info);
        this.creationdata =
          document.getElementById("abc-creation").value +
          phrase_data.slice(
            phrase_data.indexOf(phrase_info.get("K")) +
              phrase_info.get("K").length +
              1
          );
      }
    },
    get_info(abcdata, start) {
      function setting(d) {
        return d.slice(0, d.search(/[\n\]]/));
      }
      let res = new Map();
      const data_slice = abcdata.slice(0, start);
      const mes_slice = data_slice.slice(data_slice.lastIndexOf("M:"));
      res.set("M", setting(mes_slice));
      const len_slice = data_slice.slice(data_slice.lastIndexOf("L:"));
      res.set("L", setting(len_slice));
      const tempo_slice = data_slice.slice(data_slice.lastIndexOf("Q:"));
      res.set("Q", setting(tempo_slice));
      const chord_slice = data_slice.slice(data_slice.lastIndexOf("K:"));
      res.set("K", setting(chord_slice));
      const title_slice = data_slice.slice(data_slice.lastIndexOf("T:"));
      res.set("T", setting(title_slice));
      return res;
    },
    creation_set_info(targ, dest) {
      for (const [key, val] of targ) {
        if (key !== "T" && val !== dest.get(key))
          document.getElementById("abc-creation").value +=
            "[" + targ.get(key) + "]";
      }
    },
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
    clear_creation() {
      this.soundClear();
      this.creationdata = "";
    },
    undo_creation() {
      this.soundUndo();
      if (this.old_creation.length > 0)
        this.creationdata = this.old_creation.pop();
    },
    comp_creation() {
      this.soundAdd();
      this.$emit("update-creation", this.creationdata);
      // this.creationdata = "";
    },
    soundClear() {
      const id = "sound-file-clear";
      if (typeof document.getElementById(id).currentTime != "undefined") {
        document.getElementById(id).currentTime = 0;
      }
      document.getElementById(id).play();
    },
    soundAdd() {
      const id = "sound-file-add";
      if (typeof document.getElementById(id).currentTime != "undefined") {
        document.getElementById(id).currentTime = 0;
      }
      document.getElementById(id).play();
    },
    soundUndo() {
      const id = "sound-file-undo";
      if (typeof document.getElementById(id).currentTime != "undefined") {
        document.getElementById(id).currentTime = 0;
      }
      document.getElementById(id).play();
    }
  },
  props: ["editPhrase"]
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#creation {
  margin: 1%;
}
#button_comp {
  width: 100%;
  font-size: 150%;
}
</style>
