<template>
  <div style="background: #cccccc">
    <!-- <label for="start">Start date:</label>

    <input type="number" id="decimalPlace" @change="changeNumber($event.target.value)" name="decimalPlace" />
    <input type="checkbox" id="start" @change="changeType($event.target.checked)" name="trip-start" /> -->
    <!--    <select v-model="chartType" @change="changeType">
      <option value="Candle">Candle</option>
      <option value="Splines">Splines</option>
    </select>-->
    <button class="ui icon button" @click="sliceD">
      <i class="icon">Toggle {{ auto_y_axis ? "A" : "M" }}</i>
    </button>

    max<input type="number" id="max" name="max" v-model.number="max" />
    min<input type="number" id="min" name="min" v-model.number="min" />
    <button @click="handleChangeRange()">range</button>

    <trading-vue
      v-on:range-changed="handleChartRange"
      v-on:sidebar-transform="sidebar_transform"
      :enableZoom="enableZoom"
      :priceLine="priceLine"
      :decimalPlace="decimalPlace"
      :applyShaders="applyShaders"
      :enableCrosshair="enableCrosshair"
      :enableSideBarBoxValue="enableSideBarBoxValue"
      :legendDecimal="legendDecimal"
      :enableArrow="enableArrow"
      :data="chart"
      :width="this.width"
      :height="this.height"
      :roundOffVolume="roundOffVolume"
      :legend-buttons="buttons"
      :ignore_OHLC="['Spline']"
      legendTxtColor="red"
      :indexBased="true"
      :ignoreNegativeIndex="true"
      ref="tradeRef"
      :waterMarkText="'incometradercharts.com'"
      :color-back="colors.colorBack"
      :color-grid="colors.colorGrid"
      :color-text="colors.colorText"
      :colorWickUp="'black'"
      :colorWickDw="'black'"
      :colorCandleUp="candleColorUp()"
      :colorCandleDw="candleColorDw()"
      :magnet="magnet"
      :candleBorder="candleBorder"
      @showMagnetOnChart="toggleMagnet"
      :firstVariant="firstVariant" 
      :secondVariant="secondVariant"
      :thirdVariant="thirdVariant"
      :fourthVariant="fourthVariant"
      :colorPanel="'blue'"
    >
    </trading-vue>
    
  </div>
</template>

<script>
import TradingVue from "./TradingVue.vue";
import Data from "../data/data.json";
import Data2 from "../test/data/data_buttons.json";
import CodeIcon from "../test/tests/LegendButtons/code3.json";
import DataCube from "../src/helpers/datacube.js";

export default {
  name: "App",
  components: {
    TradingVue,
  },
  data() {
    return {
      buttons: ["display", "settings", "remove"],
      enableZoom: true,
      auto_y_axis: true,
      max: 200,
      min: 100,
      decimalPlace: 3,
      legendDecimal: true,
      roundOffVolume: false,
      chartType: "Candle",
      priceLine: true,
      candleBorder: true,
      enableSideBarBoxValue: false,
      applyShaders: true,
      enableCrosshair: true,
      enableArrow: false,
      ohlcv: JSON.parse(JSON.stringify(Data.ohlcv)),
      chart: new DataCube(Data),
      width: window.innerWidth,
      height: window.innerHeight,
      date: "",
      colors: {
        colorBack: "#fff",
        colorGrid: "#eee",
        colorText: "#333",
      },
      // colorCandleUp: "candleColorUp",
      // colorCandleDw: "candleColorDw",
      watermarkText : "Invest-EDU",
      magnet: false,
      
      firstVariant: true, // for like yahoo charts
      secondVariant: false,
      thirdVariant: false,
      fourthVariant: false
    };
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    window.dc = this.chart;
    this.chart.set("chart.type", "Candles");
    this.chart.set("chart.tf", "1D");
    this.$nextTick(() => {
      this.width = window.innerWidth * 0.98;
      this.height = window.innerHeight * 0.97;
    });

    // this.chart.data.chart.type = "Splines";
    // console.log("chart", this.chart.tv);
    // this.chart.tv.goto(1543626000000);
    // console.log('Data2',this.chart.data.chart)
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },
  computed: {},
  methods: {
    // candleColorUp and candleColorDw
    candleColorUp(){
      if(this.firstVariant){
        this.candleBorder = false
        return "#00B061"
      }else if(this.secondVariant){
        return "#16B195"
      }else if(this.thirdVariant){
        return "#7D7E7E"
      }else if(this.fourthVariant) {
        return "#0D66CE"
      }
    },
    candleColorDw(){
      if(this.firstVariant){
        return "#F23645"
      }else if(this.secondVariant){
        return "#F23645"
      }else if(this.thirdVariant){
        return "#FCFCFC"
      }
      else if(this.fourthVariant) {
        return "#F23645"
      }
    },
    candleVolumeUp(){
      if(this.firstVariant){
        return "#4cc790"
      }else if(this.secondVariant){
        return "#16B195"
      }else if(this.thirdVariant){
        return "#7D7E7E"
      }else if(this.fourthVariant) {
        return "#0D66CE"
      }
    },
    candleVolumeDw(){
      if(this.firstVariant){
        return "#fc6d72"
      }else if(this.secondVariant){
        return "#F23645 "
      }else if(this.thirdVariant){
        return "#D3D3D3"
      }else if(this.fourthVariant) {
        return "#F23645"
      }
    },
    toggleMagnet(){
      console.log("this is magnet", this.magnet)
      this.magnet =  !this.magnet
    },
    handleChangeRange() {
      this.$refs?.tradeRef?.toggleSidebarCustomRange([this.max, this.min]);
    },
    sidebar_transform(yTransform) {
      console.log("yTransform", yTransform);
      this.auto_y_axis = yTransform.auto;
    },
    handleChartRange(timeBased, indexBased) {
      // console.log("handleChartRange",timeBased,indexBased)
    },
    sliceD() {
      // let dataSlice = this.ohlcv.slice(this.ohlcv.length - 10,this.ohlcv.length - 1);
      // let date = new Date(dataSlice[0][0]);
      // // date.setUTCDate(Date.UTC())
      // console.log("dataSlice",dataSlice,this.ohlcv,date.toLocaleDateString())
      // this.chart.set("chart",{data: dataSlice})
      // this.chart.tv.setRange(0,dataSlice.length + 10)

      console.log(
        "this.$refs.tradeRef",
        this.$refs?.tradeRef?.toggleSideBarYAxis
      );
      this.$refs?.tradeRef?.toggleSideBarYAxis();
    },
    changeType(val) {
      // let data = this.chart.get_one('chart.settings.priceLine')
      // console.log("priceLine",data.isArrow)
      // this.chart.merge("chart.settings",{
      //   isArrow:val
      // })
      // console.log("this.chart.data.chart",candles)
      // this.chart.data.chart.type = this.chartType;
      this.enableArrow = val;
    },
    changeNumber(val) {
      //console.log(val)
      this.decimalPlace = Number(val);
    },
    handleDate() {
      let convertedDate = new Date(this.date);
      //console.log("date",convertedDate.getTime())
      this.chart.tv.goto(convertedDate.getTime);
    },
    onResize() {
      this.width = window.innerWidth * 0.9;
      this.height = window.innerHeight * 0.8;
    },

    handleCrosshair() {
      //console.log(this.enableCrosshair)
      this.enableCrosshair = !this.enableCrosshair;
    },
  },
  //   mounted(){
  //   this.goto(1543572000000)
  // }
};
</script>

<style>
html,
body {
  background-color: #000;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.backclass {
  clip-path: polygon(40% 20%, 100% 20%, 100% 80%, 40% 80%, 39% 81%, 0% 50%);
  background-color: #399bf7;
  width: 60px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  color: white;
  font-size: 16px;
}
</style>
