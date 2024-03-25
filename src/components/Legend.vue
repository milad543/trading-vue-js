<template>
  <div class="trading-vue-legend" :style="calc_style">
    <div
      v-if="grid_id === 0"
      class="trading-vue-ohlcv"
      :style="{ 'max-width': common.width + 'px' }"
    >
      <template
        v-if="common?.showLegendPropsData && common.showLegendPropsData.length"
      >
        <b v-for="(n, i) in common.showLegendPropsData" :key="i"
          >{{ n.k }} : {{ n.v }}&nbsp;</b
        ><br />
      </template>
      <template v-if="show_CustomProps"
        ><span v-for="(n, i) in legendTxtConfig" :key="i" :style="n.style"
          >{{ n.name }}&nbsp;</span
        ></template
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
      <span>
        <span style="color: #131722; font-size: 22px; font-weight: 500"
          >International Business Machines Corporation</span
        >
        <span style="margin-left: 12px" class="cs-vue-title">{{ ohlcv[3] }}</span>
        <span class="cs-vue-title">{{ changeInPrice }}</span>
        <span class="cs-vue-title">{{ percentageChange }}%</span>
      </span>
      <!-- <span  v-if="show_values && !show_CustomProps">
            O<span style="color: #00977e;" class="t-vue-lspan" >{{ohlcv[0]}}</span>
            H<span style="color: #00977e;" class="t-vue-lspan" >{{ohlcv[1]}}</span>
            L<span style="color: #00977e;" class="t-vue-lspan" >{{ohlcv[2]}}</span>
            C<span style="color: #00977e;" class="t-vue-lspan" >{{ohlcv[3]}}</span>
            V<span style="color: #00977e;" class="t-vue-lspan" >{{ohlcv[4]}}</span>
        </span> -->
      <br />
      <!-- <div v-if="!show_custom" style="margin-top: 12px"> -->
      <div style="margin-top: 12px">
        <span class="cs-title-1">{{ secondLastData }}</span>
        <span style="padding: 6px">{{
          (lastJsonData - secondLastData).toFixed(2)
        }}</span>
        <span class="cs-title-2">{{ lastJsonData }}</span>
      </div>
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
        <spinner v-if="ind.loading" :colors="common.colors"> </spinner>
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
  components: { LegendButton, ButtonGroup, Spinner },
  props: [
    "common",
    "values",
    "decimalPlace",
    "grid_id",
    "meta_props",
    "legendDecimal",
  ],
  computed: {
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

      if (this.$props.legendDecimal) {
        return [
          this.$props.values.ohlcv[1].toFixed(
            this.$props.values.ohlcv[1] < 1 ? 3 : 2
          ),
          this.$props.values.ohlcv[2].toFixed(
            this.$props.values.ohlcv[2] < 1 ? 3 : 2
          ),
          this.$props.values.ohlcv[3].toFixed(
            this.$props.values.ohlcv[3] < 1 ? 3 : 2
          ),
          this.$props.values.ohlcv[4].toFixed(
            this.$props.values.ohlcv[4] < 1 ? 3 : 2
          ),
          this.$props.values.ohlcv[5]
            ? Number(this.$props.values.ohlcv[5].toFixed(0)).toLocaleString(
                "en-AU"
              )
            : "n/a",
        ];
      } else {
        return [
          this.$props.values.ohlcv[1].toFixed(prec),
          this.$props.values.ohlcv[2].toFixed(prec),
          this.$props.values.ohlcv[3].toFixed(prec),
          this.$props.values.ohlcv[4].toFixed(prec),
          this.$props.values.ohlcv[5]
            ? Number(this.$props.values.ohlcv[5].toFixed(0)).toLocaleString(
                "en-AU"
              )
            : "n/a",
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
    off_data() {
      return this.$props.common.offchart;
    },
    lastJsonData() {
      console.log(
        "this json_data last",
        this.json_data[0].data[this.json_data[0].data.length - 1][2] -
          this.json_data[0].data[this.json_data[0].data.length - 2][2]
      );
      console.log(
        "this json_data second last",
        this.json_data[0].data[this.json_data[0].data.length - 1]
      );
      return this.json_data[0].data[
        this.json_data[0].data.length - 1
      ][3].toFixed(2);
    },
    secondLastData() {
      console.log("this is changing price");
      return this.json_data[0].data[
        this.json_data[0].data.length - 2
      ][3].toFixed(2);
    },
    changeInPrice() {
      const currentPriceClosing =
        this.json_data[0].data[this.json_data[0].data.length - 1][3];
      const previousePriceClosing =
        this.json_data[0].data[this.json_data[0].data.length - 2][3];
      console.log(
        "changing",
        (currentPriceClosing - previousePriceClosing).toFixed(2)
      );
      return (currentPriceClosing - previousePriceClosing).toFixed(2);
    },
    percentageChange() {
      // formula (changeinprice / open price) * 100
      const previousePriceClosing =
        this.json_data[0].data[this.json_data[0].data.length - 2][3];
      return ((this.changeInPrice / previousePriceClosing) * 100).toFixed(2);
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
      return Array(len).fill({ value: "n/a" });
    },
    button_click(event) {
      this.$emit("legend-button-click", event);
    },
  },
  mounted() {
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
.cs-vue-title {
  font-weight: 400;
  color: #089981;
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
