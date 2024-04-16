<template>
  <!-- Horizontal section: (grid + sidebar) -->
  <div class="trading-vue-section">
    <chart-legend
      ref="legend"
      :values="section_values"
      :decimalPlace="decimalPlace"
      :legendDecimal="legendDecimal"
      :grid_id="grid_id"
      :common="legend_props"
      :meta_props="get_meta_props"
      @legend-button-click="button_click"
    >
    </chart-legend>


    <grid
      v-bind="grid_props"
      ref="grid"
      :common="legend_props"
      :grid_id="grid_id"
      :enableZoom="enableZoom"
      :decimalPlace="decimalPlace"
      :priceLine="priceLine"
      :candleBorder="candleBorder"
      :enableCrosshair="enableCrosshair"
      @register-kb-listener="register_kb"
      @remove-kb-listener="remove_kb"
      @range-changed="range_changed"
      @cursor-changed="cursor_changed"
      @cursor-locked="cursor_locked"
      @layer-meta-props="emit_meta_props"
      @custom-event="emit_custom_event"
      @sidebar-transform="sidebar_transform"
      @rezoom-range="rezoom_range"
    >
    </grid>
    
    <sidebar
      :ref="'sb-' + grid_id"
       v-bind="sidebar_props"
      :grid_id="grid_id"
      :rerender="rerender"
      @sidebar-transform="sidebar_transform"
      :decimalPlace="decimalPlace"
      :roundOffVolume="roundOffVolume"
      :common="common"
      :applyShaders="applyShaders"
      :enableSideBarBoxValue="enableSideBarBoxValue"
    >
    </sidebar>

  </div>
</template>

<script>
import Grid from "./Grid.vue";
import Sidebar from "./Sidebar.vue";
import ChartLegend from "./Legend.vue";
import Shaders from "../mixins/shaders.js";
import Crosshair from "./Crosshair.vue";

export default {
  name: "GridSection",
  components: {
    Grid,
    Sidebar,
    ChartLegend,
    Crosshair
  },
  mixins: [Shaders],
  props: ["common", "grid_id",'enableSideBarBoxValue', "enableZoom","decimalPlace","priceLine","candleBorder","enableCrosshair","applyShaders","ignore_OHLC","legendDecimal","roundOffVolume"],
  data() {
    return {
      meta_props: {},
      rerender: 0,
      last_ghash: "",
    };
  },
  computed: {
    // Component-specific props subsets:
    grid_props() {
      const id = this.$props.grid_id;
      let p = Object.assign({}, this.$props.common);

      // Split offchart data between offchart grids
      
      if (id > 0) {
        //console.log("grid.settings",id)
        let all = p.data;
        // p.data = [p.data[id - 1]]
        p.data = [p.data.filter(d => !this.hasGridId(d))[id - 1]];
        // Merge offchart overlays with custom ids with
        // the existing onse (by comparing the grid ids)
        p.data.push(...all.filter((x) => x.grid && x.grid.id === id));
      }

      p.width = p.layout.grids[id].width;
      p.height = p.layout.grids[id].height;
      p.y_transform = p.y_ts[id];
      p.shaders = this.grid_shaders;
      return p;
    },
    sidebar_props() {
      const id = this.$props.grid_id;
      let p = Object.assign({}, this.$props.common);
      p.width = p.layout.grids[id].sb;
      p.height = p.layout.grids[id].height;
      p.y_transform = p.y_ts[id];
      p.shaders = this.sb_shaders;
     
     
      return p;
    },
    section_values() {
      const id = this.$props.grid_id;
     // console.log("section_values")
      let p = Object.assign({}, this.$props.common);
      p.width = p.layout.grids[id].width;
      return p.cursor.values[id];
    },
    legend_props() {
      //console.log("legend_props")
      const id = this.$props.grid_id;
      let p = Object.assign({}, this.$props.common);

      // Split offchart data between offchart grids
      if (id > 0) {
        let all = p.data;
        p.offchart = all;
        // p.data = [p.data[id - 1]];
        // Legend Props Update here 
        p.data = [p.data.filter(d => !this.hasGridId(d))[id - 1]];
        p.data.push(...all.filter((x) => x.grid && x.grid.id === id));
      }else{
        let res = [];
        let showLegendPropsData = [];
        let legendTxtConfig = localStorage.getItem('legendTxtConfig')
        let showLegendProps = localStorage.getItem('showLegendProps')
        // console.log('legendTxtConfig',legendTxtConfig)
        if(this.$props.ignore_OHLC && legendTxtConfig){
          res = JSON.parse(legendTxtConfig)
          //console.log('parse response ',res)
        }
        if(showLegendProps){
          showLegendPropsData = JSON.parse(showLegendProps)
          if(Array.isArray(showLegendPropsData) && showLegendPropsData.length > 0){
            p.showLegendPropsData = showLegendPropsData
          }
      } 
        let mainData = p.data.find(d => d.main)
        let chartType = mainData.type ? mainData.type : "";
        let show_CustomProps = this.$props.ignore_OHLC.includes(chartType)
        let showSettingsMain = this.$props.common.showSettingsButton.includes(chartType)
        p.legendTxtConfig = res
        p.chartType = chartType
        p.show_CustomProps = show_CustomProps
        p.showSettingsMain = showSettingsMain
        // console.log(JSON.stringify({a:p.show_CustomProps,b:p.legendTxtConfig,mainType}))
      }
      return p;
    },
    get_meta_props() {
      return this.meta_props;
    },
    main_chart_type() {
      const id = this.$props.grid_id;
      let p = Object.assign({}, this.$props.common);
      if(id === 0){
        let rangeParams = this.$props.common.range;
        let mainData = p.data.find(d => d.main)
        let mainType = mainData.type ? mainData.type : "";
        // console.log('this.$props.range',mainType,JSON.stringify(rangeParams))
        return mainType
      }
      return "";
    },
    grid_shaders() {
      return this.shaders.filter((x) => x.target === "grid");
    },
    sb_shaders() {
      return this.shaders.filter((x) => x.target === "sidebar");
    },
  },
  watch: {
    common: {
      handler: function (val, old_val) {
        let newhash = this.ghash(val);
        if (newhash !== this.last_ghash) {
          this.rerender++;
        }

        if (val.data.length !== old_val.data.length) {
          // Look at this nasty trick!
          this.rerender++;
        }
        this.last_ghash = newhash;
      },
      deep: true,
    },
  },
  mounted() {
    this.init_shaders(this.$props.common.skin);
    // console.log('common.data',this.meta_props)
  },
  methods: {
    hasGridId(single){
      if(single?.grid){
        if(single.grid?.id > 0){
          return true
        }
      }
      return false;
    },
    range_changed(r,manualInteraction = false) {
      // console.log("range_changed",r)
      this.$emit("range-changed", r,manualInteraction);
    },
    cursor_changed(c) {
      c.grid_id = this.$props.grid_id;
      this.$emit("cursor-changed", c);
    },
    cursor_locked(state) {
      this.$emit("cursor-locked", state);
    },
    sidebar_transform(s) {
      this.$emit("sidebar-transform", s);
    },
    emit_meta_props(d) {
      // console.log("layer-meta-props section.vue ",d)
      this.$set(this.meta_props, d.layer_id, d);
      this.$emit("layer-meta-props", d);
    },
    emit_custom_event(d) {
      this.on_shader_event(d, "sidebar");
      this.$emit("custom-event", d);
    },
    button_click(event) {
      this.$emit("legend-button-click", event);
    },
    register_kb(event) {
      this.$emit("register-kb-listener", event);
    },
    remove_kb(event) {
      this.$emit("remove-kb-listener", event);
    },
    rezoom_range(event) {
      let id = "sb-" + event.grid_id;
      if (this.$refs[id]) {
        this.$refs[id].renderer.rezoom_range(event.z, event.diff1, event.diff2);
      }
    },
    ghash(val) {
      // Measures grid heights configuration
      let hs = val.layout.grids.map((x) => x.height);
      return hs.reduce((a, b) => a + b, "");
    },
  },
};
</script>
<style>
.trading-vue-section {
  height: 0;
  position: absolute;
}
</style>
