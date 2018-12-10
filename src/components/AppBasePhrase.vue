<template>
  <div id="app">
    <audio id="sound-file-click" preload="auto">
      <source src="static/sound/click/nc112322.wav" type="audio/wav">
    </audio>
    <audio id="sound-file-failed" preload="auto">
      <source src="static/sound/failed/nc45878.mp3" type="audio/mp3">
    </audio>
    <audio id="sound-file-clear" preload="auto">
      <source src="static/sound/clear/nc78407.mp3" type="audio/mp3">
    </audio>
    <audio id="sound-file-add" preload="auto">
      <source src="static/sound/add/nc44409.mp3" type="audio/mp3">
    </audio>

    <div id="editing">
      <div class="score-title">Phrase Editor</div>
      <div class="note">
        <p id="editing-alert"></p>
      </div>
      <div class="container">
        <div id="paper-phrase"></div>
      </div>
      <button v-on:click="clear_phrase" class="modifier">
        <font-awesome-icon icon="minus"/>clear
      </button>
      <button v-on:click="regist_phrase" class="modifier">
        <font-awesome-icon icon="plus"/>add
      </button>
      <div id="midi-phrase" class="midi"></div>
      <div id="midi-download-phrase"></div>
    </div>
  </div>
</template>

<script>
import "abcjs/abcjs-midi.css";
import abcjs from "abcjs/midi";
export default {
  mounted: async function() {
    this.editingdata = this.tune;
  },
  name: "AppBasePhrase",
  data() {
    return {
      editingdata: "",
      tune: "X:1\nT:Phrase Editor\nM:4/4\nL:1/8\nQ:100\nK:C\n",
      lastelem: "",
      lastscore: ""
    };
  },
  watch: {
    async abcElement() {
      console.log(this.abcElement);
      const val = await this.elemContinuty(this.abcElement);
      if (val > 0) {
        this.soundClick();
        console.log(val);
        const data = document.getElementById("abc-source").value;
        const targ_data = data.slice(
          this.abcElement.startChar,
          this.abcElement.endChar
        );
        const targ_info = await this.get_info(data, this.abcElement.startChar);

        const phrase_data = document.getElementById("abc-phrase").value;
        const phrase_info = await this.get_info(
          phrase_data,
          phrase_data.length
        );

        await this.phrase_set_info(targ_info, phrase_info);
        this.editingdata =
          document.getElementById("abc-phrase").value + targ_data;
        document.getElementById("editing-alert").innerHTML = "<em>Success</em>";
      } else {
        this.soundFailed();
        document.getElementById("editing-alert").innerHTML =
          "Failed<br>Please select a consecutive note.";
      }
    },
    editingdata() {
      document.getElementById("abc-phrase").value = this.editingdata;
      new abcjs.Editor("abc-phrase", {
        paper_id: "paper-phrase",
        staffwidth: "auto",
        generate_midi: true,
        midi_id: "midi-phrase",
        midi_download_id: "midi-download-phrase",
        abcjsParams: {
          responsive: "resize",
          generateDownload: true,
          midiListener: this.listener,
          animate: {
            listener: this.animate
          }
        }
      });
    }
  },
  methods: {
    async elemContinuty(elem) {
      console.log(
        elem.type,
        elem.el_type,
        elem.type != "specified" && elem.el_type == "note"
      );
      const func = () => {
        console.log(this.lastelem);
        console.log(elem.startChar);
        let str = document
          .getElementById("abc-source")
          .value.slice(this.lastelem, elem.startChar);
        console.log(str);
        str = str.replace(/!.*?!|\".*?\"|\[.*?\]/g, "");
        return str.slice(str.search("]") + 1, str.length).search(/([A-Za-z])/);
      };
      if (
        !(
          elem.type != "specified" &&
          (elem.el_type == "note" || elem.el_type == "bar")
        )
      ) {
        return -1;
      }
      if (
        this.lastelem !== "" &&
        (this.lastscore !== this.refloc || this.lastelem > elem.startChar)
      ) {
        return -1;
      } else if (this.lastelem !== "") {
        let res = await func();
        if (res === -1) {
          this.lastelem = elem.endChar;
          this.lastscore = this.refloc;
        }
        if (res === 0) res++;
        return res * -1;
      } else {
        this.lastelem = elem.endChar;
        this.lastscore = this.refloc;
        return 1;
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
    phrase_set_info(targ, dest) {
      const str = document.getElementById("abc-phrase").value;
      if (str.lastIndexOf("\n") !== str.length - 1) {
        for (var [key, val] of targ) {
          if (key !== "T" && val !== dest.get(key))
            document.getElementById("abc-phrase").value +=
              "[" + targ.get(key) + "]";
        }
      } else {
        for (var [key, val] of targ) {
          if (key !== "T" && val !== dest.get(key))
            document.getElementById(
              "abc-phrase"
            ).value = document
              .getElementById("abc-phrase")
              .value.replace(dest.get(key), val);
        }
      }
    },
    clear_phrase() {
      this.soundClear();
      this.editingdata = this.tune;
      this.lastelem = "";
      this.lastscore = "";
    },
    async regist_phrase() {
      this.soundAdd();
      if (document.getElementById("abc-phrase").value !== this.tune) {
        this.$emit(
          "update-phrase",
          document.getElementById("abc-phrase").value
        );
        this.clear_phrase();
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
    soundClick() {
      const id = "sound-file-click";
      if (typeof document.getElementById(id).currentTime != "undefined") {
        document.getElementById(id).currentTime = 0;
      }
      document.getElementById(id).play();
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
    soundFailed() {
      const id = "sound-file-failed";
      if (typeof document.getElementById(id).currentTime != "undefined") {
        document.getElementById(id).currentTime = 0;
      }
      document.getElementById(id).play();
    }
  },
  props: ["abcElement"]
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.note {
  border: 1px solid #e9ef96;
  height: 30%;
  width: 30%;
  color: red;
  background-color: #fbf4b8;
  margin: 3px;
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.2);
}
#editing {
  margin: 1%;
}
</style>
