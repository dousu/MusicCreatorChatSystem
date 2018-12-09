<template>
  <div id="app">
    <audio id="sound-file-button" preload="auto">
      <source src="static/sound/button/nc167288.mp3" type="audio/mp3">
    </audio>

    <div id="refer-abc">
      <div class="score-title">Score Viewer</div>
      <br>
      <button v-on:click="leftbutton" class="direction" style="margin-left: 0px;">
        <font-awesome-icon icon="chevron-left"/>
      </button>
      <button v-on:click="rightbutton" class="direction">
        <font-awesome-icon icon="chevron-right"/>
      </button>
      <div class="container">
        <div id="paper"></div>
      </div>
      <div id="midi-source" class="midi"></div>
      <div id="midi-download-source"></div>
    </div>
    <hr>
  </div>
</template>

<script>
import "abcjs/abcjs-midi.css";
import abcjs from "abcjs/midi";

export default {
  mounted: async function() {
    await fetch("./static/index.json")
      .then(response => {
        return response.json();
      })
      .then(jsondata => {
        this.allrefdata = jsondata;
      });
    function rand_sort(ary) {
      for (var i = ary.length - 1; i > 0; i--) {
        var r = Math.floor(Math.random() * (i + 1));
        [ary[i], ary[r]] = [ary[r], ary[i]];
      }
      return ary;
    }

    function Rand(value_int) {
      return Math.round(Math.random() * (value_int - 1));
    }
    const sample_s = function(ary_in, n) {
      var ary_out = [];
      let t = 0;
      let m = 0;
      let loc = 0;
      while (m < n && loc != ary_in.length) {
        if (Rand(ary_in.length - t) >= n - m) {
          ++t;
          ++loc;
        } else {
          ary_out.push(ary_in[loc]);
          ++m;
          ++loc;
          ++t;
        }
      }

      return rand_sort(ary_out);
    };
    this.refdata = sample_s(this.allrefdata, this.sample_n);
    this.abcdata = this.refdata[this.refloc];
  },
  name: "AppBaseSource",
  data() {
    return {
      abcdata: "",
      refdata: [],
      allrefdata: [],
      refloc: 0,
      sample_n: 150
    };
  },
  watch: {
    abcdata() {
      document.getElementById("abc-source").value = this.abcdata;
      new abcjs.Editor("abc-source", {
        paper_id: "paper",
        staffwidth: "auto",
        generate_midi: true,
        midi_id: "midi-source",
        midi_download_id: "midi-download-source",
        abcjsParams: {
          generateDownload: true,
          clickListener: this.selectionCallback,
          midiListener: this.listener,
          animate: {
            listener: this.animate
          }
        }
      });
    }
  },
  methods: {
    listener(midiControl, progress) {},
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
    selectionCallback(abcelem) {
      this.$emit("update-element", abcelem);
    },
    leftbutton() {
      this.soundButton();
      if (this.refloc === 0) {
        this.refloc = this.refdata.length - 1;
      } else {
        this.refloc--;
      }
      this.abcdata = this.refdata[this.refloc];
    },
    rightbutton() {
      this.soundButton();
      if (this.refloc === this.refdata.length - 1) {
        this.refloc = 0;
      } else {
        this.refloc++;
      }
      this.abcdata = this.refdata[this.refloc];
    },
    soundButton() {
      const id = "sound-file-button";
      if (typeof document.getElementById(id).currentTime != "undefined") {
        document.getElementById(id).currentTime = 0;
      }
      document.getElementById(id).play();
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.direction {
  width: 49.5%;
  font-size: 150%;
}
#refer-abc {
  margin: 30px;
}
</style>
