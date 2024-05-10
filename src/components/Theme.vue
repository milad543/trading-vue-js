<template>
    <div>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        <div style="display: flex; margin-top: 20px; margin-left: 20px;" >
            <button @click="modeFunction('dark')" :class="{isModeActive: isModeSelected === 'dark'}" class="dark">Dark</button>
            <button @click="modeFunction('light')" :class="{isModeActive: isModeSelected === 'light'}" class="light" >Light</button>
        </div>

    </div>
    </template>
    
    <script>
    export default {
        props:{
            ChartSetting:{
                type: Array
            },
            chartSetting2:{
                type: Array
            }
        },
        data(){
            return {
                isModeSelected: 'light'
            }
        },
        methods:{
            modeFunction(payload){
                // console.log("somethidn");
                this.isModeSelected = payload
            }
        },
        mounted(){
           
        }
    }
    </script>
    
    <style>
    @import url("https://fonts.googleapis.com/css2?family=Montserrat&display=swap");
        .dark, .light{
            padding: 6px 16px 6px 16px;
            margin-right: 16px;
            border: none;
            border-radius: 6px;
        }
        .isModeActive{
            border: 1px solid green;
        }
        .checkbox {
  opacity: 0;
  position: absolute;
}

.checkbox-label {
  background-color: #111;
  width: 50px;
  height: 26px;
  border-radius: 50px;
  position: relative;
  padding: 5px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fa-moon {color: #f1c40f;}

.fa-sun {color: #f39c12;}

.checkbox-label .ball {
  background-color: #fff;
  width: 22px;
  height: 22px;
  position: absolute;
  left: 2px;
  top: 2px;
  border-radius: 50%;
  transition: transform 0.2s linear;
}

.checkbox:checked + .checkbox-label .ball {
  transform: translateX(24px);
}

    </style>