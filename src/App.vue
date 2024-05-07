<template>
  <div style="background: #cccccc;">
    <!-- <label for="start">Start date:</label>

    <input type="number" id="decimalPlace" @change="changeNumber($event.target.value)" name="decimalPlace" />
    <input type="checkbox" id="start" @change="changeType($event.target.checked)" name="trip-start" /> -->
    <!--    <select v-model="chartType" @change="changeType">
      <option value="Candle">Candle</option>
      <option value="Splines">Splines</option>
    </select>-->
    <!-- <button class="ui icon button" @click="sliceD">
      <i class="icon">Toggle {{ auto_y_axis ? "A" : "M" }}</i>
    </button>

    max<input type="number" id="max" name="max" v-model.number="max" />
    min<input type="number" id="min" name="min" v-model.number="min" />
    <button @click="handleChangeRange()">range</button> -->
    <!-- :chart-config=" { DEFAULT_LEN: 20 } " -->
    
    <button style="cursor: pointer" @click="toggleVariant('firstVariant')">Activate V1</button>
    <button style="cursor: pointer"  @click="toggleVariant('secondVariant')">Activate V2</button>
    <button style="cursor: pointer" @click="toggleVariant('thirdVariant')">Activate V3</button>
    <button style="cursor: pointer" @click="toggleVariant('fourthVariant')">Activate V4</button>
    <button style="cursor: pointer" @click="darkMode">Dark</button>
    <button>
      <span @click="toggleMagnet" style="display: flex; align-items: center" class="mgt">
        <svg :fill="magnet ? 'green' : '#000000'" height="14" width="14" version="1.1" id="Capa_1" xm lns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 490 490" xml:space="preserve" transform="rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M245,0C109.8,0,0.5,109.2,0.5,243.4v225.8c0,11.4,9.4,20.8,20.8,20.8h90.5c11.4,0,20.8-9.4,20.8-20.8 c0-0.4,0-225.8,0-225.8c0-62.4,51-112.4,112.4-112.4s112.4,51,112.4,112.4c0,0,0,224.4,0,224.7c0,11.4,9.4,20.8,20.8,20.8h90.5 c11.4,0,20.8-9.4,20.8-19.8V243.4C489.5,109.2,380.2,0,245,0z M41.1,369.3H91v79.1H41.1V369.3z M245,90.5 c-85.3,0-154,68.7-154,152.9v84.3H41.1v-84.3C41.1,131,132.6,40.5,245,40.5S448.9,132,448.9,243.4v84.3H399v-84.3 C399,159.2,330.3,90.5,245,90.5z M399,447.3v-78h49.9v78H399z"></path> </g> </g>
        </svg>
     </span>
    </button>
    
    <button id="show-modal" @click="showModal = true">Show Modal</button>
    <!-- use the modal component, pass in the prop -->
    <Modal v-if="showModal" style="position: relative">
      <!-- custom content here to overwrite default content -->
      <!-- for header -->
      <div style="width: 40vw; height: 50vh;">
        <h3 style="margin:6px 0 6px 6px;">Settings</h3>
        <hr style="border-bottom: 1px solid rgba(34, 36, 38, 0.1); margin-bottom:18px;">
        <div style="display: flex">
          <!-- General button with conditional class -->
          <div>
            <button 
            
              :style="{ 'background-color': 'transparent', 'color': 'green', 'border': isSelected === 'general' ? '1px solid ' : 'none', 'padding': '5px 8px', 'border-top-left-radius': '6px', 'border-top-right-radius': '6px', 'margin-right': '6px', 'cursor': 'pointer' }"
              @click="selected('general')"
              :class="{'selectedClass': isSelected === 'general'}"
            >
              General
            </button>
          </div>
          <!-- Theme button with conditional class -->
          <div>
            <button 
              :style="{ 'background-color': 'transparent', 'color': 'green', 'border': isSelected === 'theme' ?  '1px solid gray' : 'none', 'padding': '5px 8px', 'border-top-left-radius': '6px', 'border-top-right-radius': '6px', 'margin-right': '6px','cursor': 'pointer' }"
              @click="selected('theme')"
              :class="{'selectedClass': isSelected === 'theme'}"
            >
              Theme
            </button>
            <button 
              :style="{ 'background-color': 'transparent', 'color': 'green', 'border':  isSelected === 'variant' ? '1px solid gray' : 'none', 'padding': '5px 8px', 'border-top-left-radius': '6px', 'border-top-right-radius': '6px', 'margin-right': '6px','cursor': 'pointer' }"
              @click="selected('variant')"
              :class="{'selectedClass': isSelected === 'variant'}"
            >
              Variant
            </button>
          </div>
        </div>

        <!-- Render content based on which button is clicked -->
        <div v-if="isSelected === 'general'" >
         <General @updateSettingFromChild="updateSetting" :ChartSetting="chartSetting" :chartSetting2="chartSetting2"/>
        </div>
        <div v-if="isSelected === 'theme'">
          <Theme  :theme="theme" />
        </div>
        <div v-if="isSelected === 'variant'">
          <Variant  :variant="variant"  />
        </div>
      </div>
      <!-- Close button for modal -->
      <div style="display: flex; justify-content: flex-end; margin-right: 15px">
        <button   style=" margin-right: 20px" @click="handleOkay">Ok</button>
      <button @click="showModal = false">Close</button>
      </div>
    </Modal>

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
      :waterMarkText="'incometradercharts'"
      :waterMark="waterMarkFunction()"
      :color-back="colors.colorBack"
      :color-grid="colors.colorGrid"
      :color-text="colors.colorText"
      :colorWickUp="colors ? colors.colorWickUp : 'black'"
      :colorWickDw="colors ? colors.colorWickDw : 'black'"
      :colorCandleUp="candleColorUp()"
      :colorCandleDw="candleColorDw()"
      :candleBorder="candleBorder"
      :magnet="magnet"
      v-on-click="toggleMagnet"
      @darkMode="darkMode"
      :isDark="isDark"
      :firstVariant="firstVariant" 
      :secondVariant="secondVariant"
      :thirdVariant="thirdVariant"
      :fourthVariant="fourthVariant"
      :title-txt="'IBM'"
      :colorCross="colors.colorCross"
      :companyName="'International Business Machines Corporation'"
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
import Modal from "../src/components/modal.vue"
import General from "../src/components/General.vue"
import Theme from "../src/components/Theme.vue"
import Variant from "../src/components/Variant.vue"

export default {
  name: "App",
  components: {
    TradingVue,
    Modal,
    General,
    Theme,
    Variant
  },
  data() {
    return {
      isSelected: 'general',
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
      // colors: {
      //   colorBack: "#fff",
      //   colorGrid: "#eee",
      //   colorText: "#333",
      // },
      // darkModeObj:{
      //   colorBack: "#fff",
      //   colorGrid: "#eee",
      //   colorText: "#6B6B6B",
      //   colorWickUp:"#188874",
      //   colorWickDw:"#B21523"
      // },
      // colorCandleUp: "candleColorUp",
      // colorCandleDw: "candleColorDw",
      // watermarkText : "Invest-EDU",
      isDark: false,
      magnet: false,
      firstVariant: false, // for like yahoo charts
      secondVariant: false,
      thirdVariant: false,
      fourthVariant: false,
      isOpenModal: false,
      showModal: false,
      general: true,
      chartSetting:[
        {lable: 'Up Color',type: 'edit', color: '#ff0000'},
        {lable: 'Down Color',type: 'edit', color: '#00ff00'},
        {lable: 'Volume Color',type: 'edit',color: '#0000ff'},
        {lable: 'Up Volume Color',type: 'edit',color: '#00ff00'},
        {lable: 'Down Volume Color',type: 'edit', color: '#00ff00'},
        {lable: 'Candle Border',type: 'check', boolean: false},
      ],
      chartSetting2:[
        {lable: 'Enabled',type: 'check'},
        {lable: 'Magnet',type: 'check'},
      ],
      theme:[
        {darkTheme: false}
      ],
      variant:[
        {lable: 'firstVariant', check: false},
        {lable: 'secondVariant', check: false},
        {lable: 'thirdVariant', check: false},
        {lable: 'fourthVariant', check: false},
      ]
    };
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    window.dc = this.chart;
    this.chart.set("chart.type", "Candles");
    this.chart.set("chart.tf", "1D");
    this.$nextTick(() => {
      this.width = window.innerWidth * 1.0; // 0.98 previous
      this.height = window.innerHeight * 1.0; // 0.98 previous
    });

    // this.chart.data.chart.type = "Splines";
    // console.log("chart", this.chart.tv);
    // this.chart.tv.goto(1543626000000);
    // console.log('Data2',this.chart.data.chart)
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },
  computed: {
    colors(){
      if(!this.isDark){
         return {
            colorBack: '#fff',
            colorGrid: '#e0dcdc',
            colorText: '#333',
            colorWickUp:'#000000',
            colorWickDw:'#000000' ,
            colorCross: '#8091a0'
        }
      }else{
        return {
          colorBack: '#1A1A1A',
          colorGrid: '#3B3B3B',
          colorText: '#6B6B6B',
          colorWickUp:'#188874',
          colorWickDw:'#B21523',
          colorCross: '#6B6B6B'
        }
      }
    }
  },
  methods: {
    handleOkay(){
      this.showModal = false
      console.log("setting",this.chartSetting)
    },
    updateSetting(item){
      console.log("item==>", item)
    },
    selected(selectedValue){
      this.isSelected = selectedValue;
    },
    openModal(){
      this.isOpenModal = true
    },
    closeModal(){
      this.isOpenModal = false
    },
    waterMarkFunction(){
      return 'it'
    },
    toggleVariant(variant){
      this.firstVariant = false;
      this.secondVariant = false;
      this.thirdVariant = false;
      this.fourthVariant = false;

      this[variant] = true;
    },
    // candleColorUp and candleColorDw
    candleColorUp(){
      if(this.firstVariant){
        this.candleBorder = false
        return this.chartSetting ? this.chartSetting[0].color : "#00B061"
      }else if(this.secondVariant){
        this.candleBorder = true;
        return "#16B195"
      }else if(this.thirdVariant){
        this.candleBorder = true;
        return "#7D7E7E"
      }else if(this.fourthVariant) {
        this.candleBorder = true;
        return "#0D66CE"
      }
    },
    candleColorDw(){
      if(this.firstVariant){
        return this.chartSetting ? this.chartSetting[1].color :  "#F23645"
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
    darkMode(){
      this.isDark = !this.isDark;
      // console.log("this.isDark",this.isDark);
      // if(this.isDark){
      //   this.colors.colorBack = "#000000"
      //   this.colors.colorGrid = "#3B3B3B"
      //   this.colors.colorText = "#6B6B6B"
      //   this.
      // }else {
      //   this.colors.colorBack = "#fff"
      //   this.colors.colorGrid = "#eee"
      //   this.colors.colorText = "#333"
      // }
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
.selectedClass{
  border: 1px solid gray;
}
</style>
