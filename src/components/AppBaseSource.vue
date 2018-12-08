<template>
  <div id="app">
    <textarea id="abc-source"></textarea>
    <audio id="sound-file-click" preload="auto">
      <source src="static/sound/click/nc112322.wav" type="audio/wav">
    </audio>
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
      sample_n: 150,
      lastelem: "",
      lastscore: ""
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
    async selectionCallback(abcelem) {
      this.soundClick();
      // const val = await this.elemContinuty(abcelem);
      // console.log(val);
      // if (val > 0) {
      //   this.soundClick();
      //   console.log(val);
      //   const data = document.getElementById("abc-source").value;
      //   const targ_data = data.slice(abcelem.startChar, abcelem.endChar);
      //   const targ_info = await this.get_info(data, abcelem.startChar);
      // const phrase_data = document.getElementById("abc-phrase").value;
      // const phrase_info = await this.get_info(
      //   phrase_data,
      //   phrase_data.length
      // );
      // await this.phrase_set_info(targ_info, phrase_info);
      // this.editingdata =
      //   document.getElementById("abc-phrase").value + targ_data;
      // document.getElementById("editing-alert").innerHTML = "<em>Success</em>";
      // } else {
      //   this.soundFailed();
      // document.getElementById("editing-alert").innerHTML =
      //   "Failed<br>Please select a consecutive note.";
      // }
    },
    // get_info(abcdata, start) {
    //   function setting(d) {
    //     return d.slice(0, d.search(/[\n\]]/));
    //   }
    //   let res = new Map();
    //   const data_slice = abcdata.slice(0, start);
    //   const mes_slice = data_slice.slice(data_slice.lastIndexOf("M:"));
    //   res.set("M", setting(mes_slice));
    //   const len_slice = data_slice.slice(data_slice.lastIndexOf("L:"));
    //   res.set("L", setting(len_slice));
    //   const tempo_slice = data_slice.slice(data_slice.lastIndexOf("Q:"));
    //   res.set("Q", setting(tempo_slice));
    //   const chord_slice = data_slice.slice(data_slice.lastIndexOf("K:"));
    //   res.set("K", setting(chord_slice));
    //   const title_slice = data_slice.slice(data_slice.lastIndexOf("T:"));
    //   res.set("T", setting(title_slice));
    //   return res;
    // },
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
    // async elemContinuty(elem) {
    //   const func = () => {
    //     console.log(this.abcdata);
    //     console.log(this.lastelem);
    //     console.log(elem.startChar);
    //     const str = document
    //       .getElementById("abc-source")
    //       .value.slice(this.lastelem, elem.startChar);
    //     console.log(str);
    //     console.log(str.slice(str.search("]") + 1, str.length));
    //     return str.slice(str.search("]") + 1, str.length).search(/([A-Za-z])/);
    //   };
    //   if (
    //     this.lastelem !== "" &&
    //     (this.lastscore !== this.refloc || this.lastelem > elem.startChar)
    //   ) {
    //     return -1;
    //   } else if (this.lastelem !== "") {
    //     let res = await func();
    //     if (res === -1) {
    //       this.lastelem = elem.endChar;
    //       this.lastscore = this.refloc;
    //     }
    //     if (res === 0) res++;
    //     return res * -1;
    //   } else {
    //     this.lastelem = elem.endChar;
    //     this.lastscore = this.refloc;
    //     return 1;
    //   }
    // },
    soundClick() {
      const id = "sound-file-click";
      if (typeof document.getElementById(id).currentTime != "undefined") {
        document.getElementById(id).currentTime = 0;
      }
      document.getElementById(id).play();
    },

    soundButton() {
      const id = "sound-file-button";
      if (typeof document.getElementById(id).currentTime != "undefined") {
        document.getElementById(id).currentTime = 0;
      }
      document.getElementById(id).play();
    }
    // soundFailed() {
    //   const id = "sound-file-failed";
    //   if (typeof document.getElementById(id).currentTime != "undefined") {
    //     document.getElementById(id).currentTime = 0;
    //   }
    //   document.getElementById(id).play();
    // }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#abc-source {
  padding: 6px;
  display: none;
}
.direction {
  width: 49.5%;
  font-size: 150%;
}
#refer-abc {
  margin: 30px;
}
</style>
