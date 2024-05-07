<template>
<div>
    <div style="display: flex;" >

        <div style="width: 50%">
            <h4 style="margin: 0; padding: 0; margin-left: 6px; margin-top: 18px; margin-bottom: 15px ">Chart</h4>
            <div v-for="(item, index) in ChartSetting" :key="index">
                <div style="margin-top: 6px; display: flex; justify-content: space-between;  width: 100%; align-items: center;">
                    <span style="font-size: 13px; font-weight: medium; margin-left: 8px;">{{ item.lable }}</span>
                    <span v-if="item.type === 'check'" style="margin-right: 10px; border-radius: 6px; display: flex; align-items: center; justify-content: center"> 
                     <input v-model="item.checked" type="checkbox" @change="updateSetting(item)"  /></span>
                     <input v-model="item.color" @change="updateSetting(item)" v-else style="width: 30px;  height: 22px;" type="color">
                </div>
                <hr style="border-bottom: 1px solid rgba(34, 36, 38, 0.1); margin-bottom:6px; width: 96%;">
            </div>
        </div>

        <div style="width: 50%;">
            <h4 style="margin: 0; padding: 0; margin-left: 6px; margin-top: 18px; margin-bottom: 15px ">Crosshair & Magnet</h4>
            <div v-for="(item, index) in chartSetting2" :key="index">
                <div style="margin-top: 6px; display: flex; justify-content: space-between;  width: 100%; align-items: center;">
                <span style="font-size: 13px; font-weight: medium; margin-left: 8px;">{{ item.lable }}</span>
                   <span style="margin-right: 10px; border-radius: 6px; display: flex; align-items: center; justify-content: center"> <input type="checkbox" /></span>
                </div>
                <hr style="border-bottom: 1px solid rgba(34, 36, 38, 0.1); margin-bottom:6px; width: 96%;">
            </div>
        </div>
        <button @click="updateSetting">OK</button>
    </div>
</div>
</template>

<script>
export default {
    props:{
        ChartSetting:{
            type: Array,
            required: true
        },
        chartSetting2:{
            type: Array
        }
    },
    data(){
        return {
            setting: [],
        }
    },
    mounted(){
        this.setting = {...this.ChartSetting}
        
    },
    methods:{
        updateSetting(){
            console.log("update setting",this.setting)
            this.$emit("updateSettingFromChild", this.setting)
        }
    },
}
</script>

<style>

input[type="color"] {
   border: none;
   padding: 0px 0px;
    background-color: transparent;
    border-radius: 100px;
}
    
</style>