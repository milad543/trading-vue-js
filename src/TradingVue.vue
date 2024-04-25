<template>
  <!-- Main component  -->
  <div
    :id="id"
    class="trading-vue"
    :style="{
      color: this.chart_props.colors.text,
      font: this.font_comp,
      width: this.width + 'px',
      height: this.height + 'px',
    }"
    @mousedown="mousedown"
    @mouseleave="mouseleave"
  >
    <div style="display:flex; justify-content:flex-end; cursor: pointer;   pointer-events: all;">
      <span @click="showMagnet" class="mgt">
      <svg :fill="magnet ? 'green' : '#000000'" height="18" width="18" version="1.1" id="Capa_1" xm lns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 490 490" xml:space="preserve" transform="rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M245,0C109.8,0,0.5,109.2,0.5,243.4v225.8c0,11.4,9.4,20.8,20.8,20.8h90.5c11.4,0,20.8-9.4,20.8-20.8 c0-0.4,0-225.8,0-225.8c0-62.4,51-112.4,112.4-112.4s112.4,51,112.4,112.4c0,0,0,224.4,0,224.7c0,11.4,9.4,20.8,20.8,20.8h90.5 c11.4,0,20.8-9.4,20.8-19.8V243.4C489.5,109.2,380.2,0,245,0z M41.1,369.3H91v79.1H41.1V369.3z M245,90.5 c-85.3,0-154,68.7-154,152.9v84.3H41.1v-84.3C41.1,131,132.6,40.5,245,40.5S448.9,132,448.9,243.4v84.3H399v-84.3 C399,159.2,330.3,90.5,245,90.5z M399,447.3v-78h49.9v78H399z"></path> </g> </g>
      </svg>
     </span>
      <button  @click="$emit('darkMode')" style="margin-left:8px; cursor: pointer;">Dark</button>
    </div>

    <toolbar
      v-if="toolbar"
      ref="toolbar" 
      v-bind="chart_props"
      :config="chart_config"
      @custom-event="custom_event"
    >
    </toolbar>
    <widgets
      v-if="controllers.length"
      ref="widgets"
      :map="ws"
      :width="width"
      :height="height"
      :tv="this"
      :dc="data"
    >
    </widgets>
    
    <chart
      :enableZoom="enableZoom"
      :enableSideBarBoxValue="enableSideBarBoxValue"
      :applyShaders="applyShaders"
      :priceLine="priceLine"
      :candleBorder="candleBorder"
      :decimalPlace="decimalPlace"
      :roundOffVolume="roundOffVolume"
      :legendDecimal="legendDecimal"
      :enableCrosshair="enableCrosshair"
      :ignoreNegativeIndex="ignoreNegativeIndex"
      :ignore_OHLC="ignore_OHLC"
      :key="reset"
      ref="chart"
      v-bind="chart_props"
      :tv_id="id"
      :config="chart_config"
      @custom-event="custom_event"
      @range-changed="range_changed"
      @chart_data_changed="chart_data_changed"
      @sidebar-transform="sidebar_transform"
      @legend-button-click="legend_button"
      >
      <!-- :title_txt="'IBM'" -->
    </chart>
    
    <transition name="tvjs-drift">
      <the-tip v-if="tip" :data="tip" @remove-me="tip = null" />
    </transition>
  </div>
</template>

<script>

import Const from "./stuff/constants.js";
import Chart from "./components/Chart.vue";
import Toolbar from "./components/Toolbar.vue";
import Widgets from "./components/Widgets.vue";
import TheTip from "./components/TheTip.vue";
import XControl from "./mixins/xcontrol.js";
import IndexedArray from "arrayslicer";

export default {
  name: "TradingVue",
  components: {
    Chart,
    Toolbar,
    Widgets,
    TheTip,
  },
  mixins: [XControl],
  props: {
    titleTxt: {
      type: String,
      default: "TradingVue.js",
    },
    legendTxtColor: {
      type: String,
      default: "#00977e",
    },
    magnet:{
      type: Boolean,
      default: false
    },
    isDark:{
      type: Boolean,
      default: false
    },
    waterMarkText:{
      type: String,
      default: "incometradercharts.com"
    },
    candleBorder:{
      type: Boolean,
      deafault: false
    },
    firstVariant:{
      type: Boolean,
      deafault: false
    },
    secondVariant:{
      type: Boolean,
      deafault: false
    },
    thirdVariant:{
      type: Boolean,
      deafault: false
    },
    fourthVariant:{
      type: Boolean,
      deafault: false
    },
    roundOffVolume: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: "trading-vue-js",
    },
    
    width: {
      type: Number,
      default: 800,
    },
    height: {
      type: Number,
      default: 421,
    },
    colors:{
      type: Object,
      default: {}
    },
    colorTitle: {
      type: String,
      default: "#42b883"
    },
   
    colorOhlcv:{
      type: String,
      default: "#000000"
    },
    colorBack: {
      type: String,
      default: "#121826",
    },
    colorGrid: {
      type: String,
      default: "#2f3240",
    },
    colorText: {
      type: String,
      default: "#dedddd",
    },
    colorTextHL: {
      type: String,
      default: "#fff",
    },
    colorScale: {
      type: String,
      default: "#838383",
    },
    colorCross: {
      type: String,
      default: "#8091a0",
    },
    colorCandleUp: {
      type: String,
      default: "#23a776",
    },
    colorCandleDw: {
      type: String,
      default: "#e54150",
    },
    colorWickUp: {
      type: String,
      default: "#23a77688",
    },
    colorWickDw: {
      type: String,
      default: "#e5415088",
    },
    colorWickSm: {
      type: String,
      default: "transparent", // deprecated
    },
    colorVolUp: {
      type: String,
      default: "#79999e42",
    },
    colorVolDw: {
      type: String,
      default: "#ef535042",
    },
    colorPanel: {
      type: String,
      default: "#565c68",
    },
    colorTbBack: {
      type: String,
    },
    colorTbBorder: {
      type: String,
      default: "#8282827d",
    },
    colors: {
      type: Object,
    },
    font: {
      type: String,
      default: Const.ChartConfig.FONT,
    },
    toolbar: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      required: true,
    },
    enableSideBarBoxValue: {
      type: Boolean,
      default: false,
    },
    // Your overlay classes here
    overlays: {
      type: Array,
      default: function () {
        return [];
      },
    },
    // Overwrites ChartConfig values,
    // see constants.js
    chartConfig: {
      type: Object,
      default: function () {
        return {};
      },
    },
    legendButtons: {
      type: Array,
      default: function () {
        return [];
      },
    },
    legendDecimal: {
      type: Boolean,
      default: false,
    },
    indexBased: {
      type: Boolean,
      default: false,
    },
    extensions: {
      type: Array,
      default: function () {
        return [];
      },
    },
    xSettings: {
      type: Object,
      default: function () {
        return {};
      },
    },
    skin: {
      type: String, // Skin Name
    },
    timezone: {
      type: Number,
      default: 0,
    },
    enableZoom: {
      type: Boolean,
      default: false,
    },
    priceLine: {
      type: Boolean,
      default: true,
    },
    decimalPlace: {
      type: Number,
      default: 2,
    },
    applyShaders: {
      type: Boolean,
      default: true,
    },
    enableCrosshair: {
      type: Boolean,
      default: false,
    },
    enableArrow: {
      type: Boolean,
      default: false,
    },
    ignoreNegativeIndex: {
      type: Boolean,
      default: false,
    },
    ignore_OHLC: {
      type: Array[Object],
      default: function () {
        return [];
      },
    },
    showSettingsButton: {
      type: Array[Object],
      default: function () {
        return [];
      },
    },
  },
  data() {
    return { reset: 0, tip: null };
  },
  computed: {
    // Copy a subset of TradingVue props
    chart_props() {
      let offset = this.$props.toolbar ? this.chart_config.TOOLBAR : 0;
      let chart_props = {
        title_txt: this.$props.titleTxt,
        legend_txt_color: this.$props.legendTxtColor,
        waterMarkText: this.$props.waterMarkText,
        magnet: this.$props.magnet,
        isDark: this.$props.isDark,
        firstVariant: this.$props.firstVariant,
        secondVariant: this.$props.secondVariant,
        thirdVariant: this.$props.thirdVariant,
        fourthVariant: this.$props.fourthVariant,
        overlays: this.$props.overlays.concat(this.mod_ovs),
        data: this.decubed,
        width: this.$props.width - offset,
        height: this.$props.height,
        font: this.font_comp,
        buttons: this.$props.legendButtons,
        toolbar: this.$props.toolbar,
        ib: this.$props.indexBased || this.index_based || false,
        colors: Object.assign({}, this.$props.colors || this.colorpack),
        skin: this.skin_proto,
        timezone: this.$props.timezone,
        showSettingsButton: this.$props.showSettingsButton,
      };

      this.parse_colors(chart_props.colors);
      return chart_props;
    },
    chart_config() {
      return Object.assign({}, Const.ChartConfig, this.$props.chartConfig);
    },
    decubed() {
      let data = this.$props.data;
      if (data.data !== undefined) {
        // DataCube detected
        data.init_tvjs(this);
        return data.data;
      } else {
        return data;
      }
    },
    index_based() {
      const base = this.$props.data;
      if (base.chart) {
        return base.chart.indexBased;
      } else if (base.data) {
        return base.data.chart.indexBased;
      }
      return false;
    },
    mod_ovs() {
      let arr = [];
      for (var x of this.$props.extensions) {
        arr.push(...Object.values(x.overlays));
      }
      return arr;
    },
    font_comp() {
      return this.skin_proto && this.skin_proto.font
        ? this.skin_proto.font
        : this.font;
    },
    auto_y_axis() {
      return this.$refs.chart?.auto_y_axis || true;
    },
  },
  beforeDestroy() {
    this.custom_event({ event: "before-destroy" });
    this.ctrl_destroy();
  },
  methods: {
    showMagnet(){
      this.$emit('showMagnetOnChart')
    },
    chart_data_changed(flag) {
      this.$emit("chart_data_changed", flag);
    },
    // TODO: reset extensions?
    resetChart(resetRange = true) {
      this.reset++;
      let range = this.getRange();
      if (!resetRange && range[0] && range[1]) {
        this.$nextTick(() => this.setRange(...range));
      }
      if (resetRange) {
        let initRange = this.$refs?.chart?.initRange;
        if (initRange && initRange?.[0] && initRange?.[1]) {
          this.$nextTick(() => this.setRange(...initRange));
        }
      }
      this.$nextTick(() =>
        this.custom_event({
          event: "chart-reset",
          args: [],
        })
      );
    },
    updateChart() {
      //  console.log(" update chart was called")
      //       this.$nextTick(() =>
      //         this.custom_event({
      //           event: "?chart-resize",
      //           args:[]
      //         })
      //       );
    },
    goto(t) {
      // TODO: limit goto & setRange (out of data error)
      if (this.chart_props.ib) {
        const ti_map = this.$refs.chart.ti_map;
        t = ti_map.gt2i(t, this.$refs.chart.ohlcv);
      }
      this.$refs.chart.goto(t);
    },
    setRange(t1, t2) {
      if (this.chart_props.ib) {
        const ti_map = this.$refs.chart.ti_map;
        const ohlcv = this.$refs.chart.ohlcv;
        t1 = ti_map.gt2i(t1, ohlcv);
        t2 = ti_map.gt2i(t2, ohlcv);
        // console.log('this.ignoreNegativeIndex and t1',t1, t2,this.ignoreNegativeIndex)
        if (t1 < 0 && this.ignoreNegativeIndex) {
          t1 = 0;
        }
      }
      this.$refs.chart.setRange(t1, t2);
    },
    getRange() {
      if (this.chart_props.ib) {
        const ti_map = this.$refs.chart.ti_map;
        // Time range => index range
        // console.log('this.$refs.chart',this.$refs.chart)
        return this.$refs.chart.range.map((x) => ti_map.i2t(x));
      }
      return this.$refs.chart.range;
    },
    getCursor() {
      let cursor = this.$refs.chart.cursor;
      if (this.chart_props.ib) {
        const ti_map = this.$refs.chart.ti_map;
        let copy = Object.assign({}, cursor);
        copy.i = copy.t;
        copy.t = ti_map.i2t(copy.t);
        return copy;
      }
      return cursor;
    },
    getTimeIndex(t) {
      // let cursor = this.$refs.chart.cursor;
      if (this.chart_props.ib) {
        const ti_map = this.$refs.chart.ti_map;
        // let copy = Object.assign({}, cursor);
        // copy.i = copy.t;
        // copy.t = ti_map.i2t(copy.t);
        return ti_map.t2i(t);
      }
      return null;
    },
    showTheTip(text, color = "orange") {
      this.tip = { text, color };
    },
    legend_button(event) {
      this.custom_event({
        event: "legend-button-click",
        args: [event],
      });
    },
    custom_event(d) {
      if ("args" in d) {
        this.$emit(d.event, ...d.args);
      } else {
        this.$emit(d.event);
      }
      let data = this.$props.data;
      let ctrl = this.controllers.length !== 0;
      if (ctrl) this.pre_dc(d);
      if (data.tv) {
        // If the data object is DataCube
        data.on_custom_event(d.event, d.args);
      }
      if (ctrl) this.post_dc(d);
    },
    range_changed(r, manualInteraction = false) {
      if (this.chart_props.ib) {
        const ti_map = this.$refs.chart.ti_map;
        r = r.map((x) => ti_map.i2t(x));
      }
      // update
      this.$emit("range-changed", r, manualInteraction);
      // this.custom_event({ event: "range-changed", args: [r,r2] });
      if (this.onrange) this.onrange(r);
    },
    sidebar_transform(y_transform) {
      this.$emit("sidebar-transform", y_transform);
    },
    set_loader(dc) {
      this.onrange = (r) => {
        let pf = this.chart_props.ib ? "_ms" : "";
        let tf = this.$refs.chart["interval" + pf];
        dc.range_changed(r, tf);
      };
    },
    parse_colors(colors) {
      for (var k in this.$props) {
        if (k.indexOf("color") === 0 && k !== "colors") {
          let k2 = k.replace("color", "");
          k2 = k2[0].toLowerCase() + k2.slice(1);
          if (colors[k2]) continue;
          colors[k2] = this.$props[k];
        }
      }
    },
    mousedown() {
      this.$refs.chart.activated = true;
    },
    mouseleave() {
      this.$refs.chart.activated = false;
    },
    toggleSideBarYAxis() {
      this.$refs.chart.toggleSideBarYAxis();
    },
    toggleSidebarCustomRange(verticalRange) {
      this.$refs.chart.toggleSidebarCustomRange(verticalRange);
    },
  },
  watch: {
    decimalPlace(n) {
      const base = this.$props.data;
      // console.log("props:",base);
      base.merge("chart.settings", { decimalPlace: n });
    },
    enableArrow(n) {
      const base = this.$props.data;
      // console.log("props:",base);
      base.merge("chart.settings", { isArrow: n });
    },
  },
  mounted() {
    const base = this.$props.data;
    // console.log("props:",this.$props.enableArrow);
    base.merge("chart.settings", {
      isArrow: this.$props.enableArrow,
      decimalPlace: this.$props.decimalPlace,
    });
  },
};
</script>
<style>
/* Anit-boostrap tactix */
.trading-vue *,
::after,
::before {
  box-sizing: content-box;
}
.trading-vue img {
  vertical-align: initial;
}

.mgt{
  display: flex;
  justify-content: end;
  margin-bottom:3px;
}
</style>
