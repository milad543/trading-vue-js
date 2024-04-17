<template>
  <div class="trading-vue-legend" :style="calc_style">
  
    <div
        v-if="grid_id === 0"
        class="trading-vue-ohlcv"
        :style="{ 'max-width': common.width + 'px' }"
    >
      <template v-if="common?.showLegendPropsData && common.showLegendPropsData.length">
        <b v-for="(n, i) in common.showLegendPropsData" :key="i"
        >{{ n.k }} : {{ n.v }}&nbsp;</b
        ><br/>
      </template>
      <template  v-if="show_CustomProps">
        <span v-for="(n, i) in legendTxtConfig" :key="i" :style="n.style">
          {{ n.name }}&nbsp;
        </span>
      </template
      >
      <!-- <span
        class="t-vue-title"
        v-if="!show_CustomProps"
        :style="{ color: common.colors.title }"
      >
        {{common.title_txt}}
      </span> -->
      <!-- Old legend -->
      <!-- <span  v-if="show_values && !show_CustomProps"> -->
        <span @click="openModal"  class="stx-panel legendArea " v-if="show_values && !show_CustomProps && common.firstVariant"> 
          <span class="clr"></span>
          <span class="stx-info">
            <span class="stx-sym">{{common.title_txt}}</span>
            <span class="stx-price">{{ ohlcv[3] }}</span>
          </span>

          <!-- <span v-if="show_values && !show_CustomProps">
            O<span :style="styleTxt" class="t-vue-lspan">{{ ohlcv[0] }}</span>
            H<span :style="styleTxt" class="t-vue-lspan">{{ ohlcv[1] }}</span>
            L<span :style="styleTxt" class="t-vue-lspan">{{ ohlcv[2] }}</span>
            C<span :style="styleTxt" class="t-vue-lspan">{{ ohlcv[3] }}</span>
            V<span :style="styleTxt" class="t-vue-lspan">{{ ohlcv[4] }}</span>
         </span>
          <span :style="styleTxt" class="cs-vue-title">{{ ohlcv[6]  }}</span>
          <span :style="styleTxt" class="cs-vue-title">{{ ohlcv[7] }}%</span> -->
       </span>

       <!-- //TODO: work for firstvariant of charts -->

       <div v-if="common.firstVariant && show_values && !show_CustomProps && showModal" class="stx-tooltip legendArea">
        <div class="close-btn legendArea" @click="showModal = false">X</div>
        <div class="stx-tooltip-field auto">
          <div class="stx-field-name">Open</div>
          <div class="stx-field-value">{{ ohlcv[0] }}</div>
        </div>
        <div class="stx-tooltip-field auto">
          <div class="stx-field-name">High</div>
          <div class="stx-field-value">{{ ohlcv[1] }}</div>
        </div>
        <div class="stx-tooltip-field auto">
          <div class="stx-field-name">Low</div>
          <div class="stx-field-value">{{ ohlcv[2] }}</div>
        </div>
        <div class="stx-tooltip-field auto">
          <div class="stx-field-name">Close</div>
          <div class="stx-field-value">{{ ohlcv[3] }}</div>
        </div>
        <div class="stx-tooltip-field auto">
          <div class="stx-field-name">Volume</div>
          <div class="stx-field-value">{{ formatVolume(ohlcv[4]) }}</div>
        </div>
        <div class="stx-tooltip-field auto">
          <div class="stx-field-name">% Change</div>
          <div class="stx-field-value">{{ ohlcv[7] }}%</div>
        </div>
      </div>
      <br/>

      <!-- TODO: work for secondVariants, thirdVariant and fourthVariant of charts -->

       <div  class="main-legend legendArea " v-if="common.secondVariant || common.thirdVariant || common.fourthVariant && show_values && !show_CustomProps "> 
          <div class="legend-right-section">
            <span class="right-title">{{common.title_txt}}</span>
          </div>
          <div class="legend-center-section">
            <p>International Business Machines Corporation</p>
          </div>
          <div class="legend-left-section">
            <span>
              <span id="flex" class="stx-text">O</span>
              <span :style="getStyle()" class="stx-value">{{ ohlcv[0] }}</span>
            </span>
            <span>
              <span class="stx-text">H</span>
              <span  :style="getStyle()" class="stx-value">{{ ohlcv[1] }}</span>
            </span>
            <span>
              <span class="stx-text">L</span>
              <span :style="getStyle()"  class="stx-value"> {{ ohlcv[2] }}</span>
            </span>
            <span>
              <span class="stx-text">C</span>
              <span  :style="getStyle()" class="stx-value"> {{ ohlcv[3] }}</span>
            </span>
            <span>
              <span :style="getStyle()" class="stx-value">{{ ohlcv[6] }} ({{ ohlcv[7] }}%)</span>
            </span>
            <span>
              <span class="stx-text">Vol</span>
              <span :style="getStyle()" class="stx-value">{{ formatVolume(ohlcv[4]) }}</span>
            </span>
          </div>
          <div class="legend-last-section">
            
          </div>
       </div>

       <!-- <p v-if="common.magnet" style="position: absolute; right: 0;">Magnet</p> -->

      <!-- changin in new legend -->
     
      <!-- <div v-if="!show_custom" style="margin-top: 12px"> -->
      <!-- <div style="margin-top: 12px">
        <span class="cs-title-1">{{ ohlcv[5] }}</span>
        <span style="padding: 6px">{{ohlcv[6]}}</span>
        <span class="cs-title-2">{{ ohlcv[3] }}%</span>
      </div> -->
      <span
          v-if="!show_values"
          class="t-vue-lspan"
          :style="{ color: common.colors.text }"
      >
        {{ (common.meta.last || [])[4] }}
      </span>
      <legend-button
          v-if="show_Settings"
          key="main_chart_settings"
          id="main_settings"
          :tv_id="grid_id"
          :ov_id="common.chartType"
          :grid_id="grid_id"
          :index="grid_id"
          :icon="settingIcon"
          :config="{ L_BTN_SIZE: 21 }"
          @legend-button-click="button_click"
      >
      </legend-button>
    </div>
    <div v-for="ind in this.indicators" class="t-vue-ind">
      <span class="t-vue-iname">{{ ind.name }}</span>
      <button-group
          v-if="ind.showLegendButtons"
          :buttons="common.buttons"
          :config="common.config"
          :ov_id="ind.id"
          :grid_id="grid_id"
          :index="ind.index"
          :tv_id="common.tv_id"
          :display="ind.v"
          @legend-button-click="button_click"
      >
      </button-group>
      <span v-if="ind.v" class="t-vue-ivalues">
        <span
            v-for="v in ind.values"
            v-if="show_values"
            class="t-vue-lspan t-vue-ivalue"
            :style="{ color: v.color }"
        >
          {{ v.value }}
        </span>
      </span>
      <span v-if="ind.unk" class="t-vue-unknown"> (Unknown type) </span>
      <transition name="tvjs-appear">
        <spinner v-if="ind.loading" :colors="common.colors"></spinner>
      </transition>
    </div>
  </div>
</template>
<script>
import ButtonGroup from "./ButtonGroup.vue";
import Spinner from "./Spinner.vue";
import LegendButton from "./LegendButton.vue";
import Icons from "../stuff/icons.json";

const settingPng = Icons["gear.png"];
export default {
  name: "ChartLegend",
  components: {LegendButton, ButtonGroup, Spinner},
  props: [
    "common",
    "values",
    "decimalPlace",
    "grid_id",
    "meta_props",
    "legendDecimal",
  ],
  data(){
    return {
      showModal: true
    }
  },

  computed: {
    
    styleTxt() {
      return {
        color: this?.common?.legend_txt_color
      }
    },
    show_CustomProps() {
      return this.common?.show_CustomProps || false;
    },
    show_Settings() {
      return this.common?.showSettingsMain || false;
    },
    settingIcon() {
      return settingPng;
    },
    legendTxtConfig() {
      return this.common?.legendTxtConfig;
    },
    ohlcv() {
      if (!this.$props.values || !this.$props.values.ohlcv) {
        return Array(6).fill("n/a");
      }
      // const prec = this.layout.prec
      const prec = this.decimalPlace;
      // const prec = 3
      // TODO: main the main legend more customizable
      let id = this.main_type + "_0";
      let meta = this.$props.meta_props[id] || {};
      if (meta.legend) {
        return (meta.legend() || []).map((x) => x.value);
      }
      let candleId = this.$props.values.ohlcv[0]
      let main_data = this.main_data;
      // let main_data_length = main_data?.length;

      let findIndexId = main_data.findIndex(d => d[0] === candleId);
      let changeInPrice = 0
      let changeInPercent = 0
      let prevData = []
      if (findIndexId > 0) {
        prevData = main_data[findIndexId - 1]
      } else {
        prevData = this.$props.values.ohlcv
      }

      if (this.$props.legendDecimal) {
        let open = this.$props.values.ohlcv[1].toFixed(
            this.$props.values.ohlcv[1] < 1 ? 3 : 2
        );
        let high = this.$props.values.ohlcv[2].toFixed(
            this.$props.values.ohlcv[2] < 1 ? 3 : 2
        );
        let low = this.$props.values.ohlcv[3].toFixed(
            this.$props.values.ohlcv[3] < 1 ? 3 : 2
        );
        let close = this.$props.values.ohlcv[4].toFixed(
            this.$props.values.ohlcv[4] < 1 ? 3 : 2
        );

        const prevPriceCLosing = prevData[4];
        changeInPrice = close - prevPriceCLosing;
        changeInPrice = changeInPrice.toFixed(changeInPrice < 1 ? 2 : 2)
        changeInPercent = (changeInPrice / prevPriceCLosing) * 100;
        changeInPercent = changeInPercent.toFixed(changeInPercent < 1 ? 2 : 2)
        
        let volume = this.$props.values.ohlcv[5]
            ? Number(this.$props.values.ohlcv[5].toFixed(0)).toLocaleString(
                "en-AU"
            )
            : "n/a";
        return [
          open,
          high,
          low,
          close,
          volume,
          // findIndexId,
          prevPriceCLosing,
          changeInPrice,
          changeInPercent
        ];
      } else {

        let open = this.$props.values.ohlcv[1].toFixed(prec);
        let high = this.$props.values.ohlcv[2].toFixed(prec);
        let low = this.$props.values.ohlcv[3].toFixed(prec);
        let close = this.$props.values.ohlcv[4].toFixed(prec);
        const prevPriceCLosing = prevData[4];
        changeInPrice = (close - prevPriceCLosing).toFixed(prec);
        changeInPercent = (changeInPrice / prevPriceCLosing) * 100;
        changeInPercent = changeInPercent.toFixed(prec)
        let volume = this.$props.values.ohlcv[5]
            ? Number(this.$props.values.ohlcv[5].toFixed(0)).toLocaleString(
                "en-AU"
            )
            : "n/a";
        return [
          open,
          high,
          low,
          close,
          volume,
          // findIndexId,
          prevPriceCLosing,
          changeInPrice,
          changeInPercent
        ];
      }
    },
    // TODO: add support for { grid: { id : N }}
    indicators() {
      const values = this.$props.values;
      const f = this.format;
      var types = {};

      return this.json_data
          .filter((x) => x.settings.legend !== false && !x.main)
          .map((x) => {
            if (!(x.type in types)) types[x.type] = 0;
            const id = x.type + `_${types[x.type]++}`;

            return {
              v: "display" in x.settings ? x.settings.display : true,
              name: x.name || id,
              index: (this.off_data || this.json_data).indexOf(x),
              id: id,
              values: values ? f(id, values) : this.n_a(1),
              unk: !(id in (this.$props.meta_props || {})),
              loading: x.loading,
              showLegendButtons:
                  "legendButtons" in x.settings ? x.settings.legendButtons : true,
            };
          });
    },
    calc_style() {
      let top = this.layout.height > 150 ? 10 : 5;
      let grids = this.$props.common.layout.grids;
      let w = grids[0] ? grids[0].width : undefined;
      return {
        top: `${this.layout.offset + top}px`,
        width: `${w - 20}px`,
      };
    },
    layout() {
      const id = this.$props.grid_id;
      return this.$props.common.layout.grids[id];
    },
    json_data() {
      return this.$props.common.data;
    },
    main_data() {
      return this.$props.common.sub;
    },
    off_data() {
      return this.$props.common.offchart;
    },
    main_type() {
      let f = this.common.data.find((x) => x.main);
      return f ? f.type : undefined;
    },
    show_values() {
      return this.common.cursor.mode !== "explore";
    },
  },
  methods: {
    getStyle(){
      if(this.ohlcv[3] > this.ohlcv[0]){
        return {color: '#089981'}
      }else{
        return {color: '#F23645'}
      }
    },
    openModal(){
        this.showModal = true
    },
     formatVolume(volume) {
    // Remove commas from the string and convert it to a number
    var volumeNumber = parseFloat(volume.replace(/,/g, ''));
    if (!isNaN(volumeNumber)) {
        // Convert volume to millions and round to 2 decimal places
        var volumeInMillions = (volumeNumber / 1e6).toFixed(2);
        // Append "M" to the formatted volume
        return volumeInMillions + "M";
    } else {
        return volume; // Return the original value if conversion fails
    }
},
//      formatNumberToMillions(number) {
//     if (Math.abs(number) >= 1e6) {
//         // Divide the number by 1 million and round to one decimal place
//         var formattedNumber = (number / 1e6).toFixed(1) + 'M';
//         return formattedNumber;
//     } else {
//         // If the number is less than a million, just return it as is
//         return number.toString();
//     }
// },
    format(id, values) {
      let meta = this.$props.meta_props[id] || {};
      // Matches Overlay.data_colors with the data values
      // (see Spline.vue)
      if (!values[id]) return this.n_a(1);

      // Custom formatter
      if (meta.legend) return meta.legend(values[id]);

      return values[id].slice(1).map((x, i) => {
        const cs = meta.data_colors ? meta.data_colors() : [];
        if (typeof x == "number") {
          // Show 8 digits for small values
          x = x.toFixed(Math.abs(x) > 0.001 ? 4 : 8);
        }
        return {
          value: x,
          color: cs ? cs[i % cs.length] : undefined,
        };
      });
    },

    n_a(len) {
      return Array(len).fill({value: "n/a"});
    },
    button_click(event) {
      this.$emit("legend-button-click", event);
    },
  },
  
  mounted() {
    // console.log("ohlcv is here", this.ohlcv)
    // console.log("math calculation",this.ohlcv)
    // const open = Number(this.$props?.values?.ohlcv[0]);
    // const close = Number(this.$props?.values?.ohlcv[3])
    // console.log("this is props ohlcv==>", this.$props.values.ohlcv)
    // this.secondLastvalue()
    // if(this.ohlcv === n/a){
    //     return []
    // }else{
    //     return this.ohlcv
    // }
  },
};
</script>
<style>
/* CSS for secondVariants */
@import '../../src/variants2.css';

 
/*  */
.trading-vue-legend {
  position: relative;
  z-index: 100;
  font-size: 1.25em;
  margin-left: 10px;
  pointer-events: none;
  text-align: left;
  user-select: none;
  font-weight: 300;
}
.legendArea{
  pointer-events: all;
}
.stx-tooltip {
   margin-top: 12px;
   width: 100px;
   height: 110px;
   background-color: #fff;
   box-shadow: 0 0 8px 0 rgba(70,78,86,.25);
   opacity: .9;
   padding: 10px 15px;
   color: #464e56;
   border-radius: 2px;
   font-size: 13px;
   font-weight: 300;
   line-height: 18px;
   position: absolute;
   z-index: 4;
   white-space: nowrap;
}

.stx-field-value{
    font-weight: 600;
    background-color: #fff;
    color: #464e56;
    font-size: 13px;
    line-height: 18px;
}

/* .stx-tooltip {
    background-color: #fff;
    border-radius: 3px;
    box-shadow: 0 0 8px 0 rgba(70,78,86,.25);
    color: #464e56;
    font-size: 13px;
    left: -1000px;
    line-height: 18px;
    opacity: .9;
    padding: 10px 15px;
    position: absolute;
    white-space: nowrap;
    z-index: 4;
} */

.stx-tooltip  .close-btn {
    cursor: pointer;
    font-size: 11px;
    opacity: .5;
    position: absolute;
    right: 5px;
    top: 2px;
}

.stx-field-name{
    font-weight: 400;
    opacity: .7;
}



.stx-panel{
  height: 30px;
  width: 15px;
  background-color: #fff;
  box-shadow: 0 0 8px 0 rgba(70,78,86,.25);
  font-size: 13px;
  color: #464e56;
  font-weight: 500;
  border-radius: 5px;
  padding: 2px 5px 2px 5px;
  align-items: center;
  text-align: center;
  border-left: 5px solid rgb(0, 129, 242);;
}

.stx-panel > .clr{
    border-bottom-left-radius: 3px;
    border-top-left-radius: 3px;
    height: 100%;
    width: 5px;
}

.stx-tooltip .stx-tooltip-field {
    display: flex;
    justify-content: space-between;
}

.cs-vue-title {
  font-weight: 400;
  font-size: 16px;
}

.cs-title-1 {
  border: 1px solid red;
  border-radius: 6px;
  font-weight: 400;
  background-color: white;
  color: red;
  padding: 5px 10px 5px 10px;
}

.cs-title-2 {
  border: 1px solid blue;
  border-radius: 6px;
  font-weight: 400;
  background-color: white;
  color: #0043fc;
  padding: 5px 10px 5px 10px;
}

@media (min-resolution: 2x) {
  .trading-vue-legend {
    font-weight: 400;
  }
}

.trading-vue-ohlcv {
  pointer-events: none;
  margin-bottom: 0.5em;
}

.t-vue-lspan {
  font-variant-numeric: tabular-nums;
  font-size: 0.95em;
  color: #999999; /* TODO: move => params */
  margin-left: 0.1em;
  margin-right: 0.2em;
}

.t-vue-title {
  margin-right: 0.25em;
  font-size: 1.45em;
}

.t-vue-ind {
  display: flex;
  margin-left: 0.2em;
  margin-bottom: 0.5em;
  font-size: 1em;
  margin-top: 0.3em;
  /* border: 1px solid rgba(242, 242, 242, 1);
  border-radius: 8px;
  box-shadow: 2px 2px 5px 1px #0000001A;
  border: 1px solid #F2F2F2;
  color: rgba(0, 0, 0, 1);
  padding: 5px 9px;
  font-weight: 400; */
  
}

.magnet{
  /* display: flex;
  justify-content: end; */
  background-color: crimson;
}


.t-vue-ivalue {
  margin-left: 0.5em;
}

.t-vue-unknown {
  color: #999999; /* TODO: move => params */
}

.tvjs-appear-enter-active,
.tvjs-appear-leave-active {
  transition: all 0.25s ease;
}

.tvjs-appear-enter,
.tvjs-appear-leave-to {
  opacity: 0;
}
</style>
