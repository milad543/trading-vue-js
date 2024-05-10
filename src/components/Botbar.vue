<!-- <template>
    <div class="trading-vue-botbar">
      <button class="setting-button" @click="openSetting">
        <i class="fa fa-cog"></i> 
      </button>
    </div>
</template> -->

<script>
// The bottom bar (yep, that thing with a bunch of dates)



import Botbar from './js/botbar.js'
import Canvas from '../mixins/canvas.js'

export default {
    name: 'Botbar',
    mixins: [Canvas],
    props: [
        'sub', 'layout', 'range', 'interval', 'cursor', 'colors', 'font',
        'width', 'height', 'rerender', 'tv_id', 'config', 'shaders',
        'timezone'
    ],
    computed: {
        bot_shaders() {
            // console.log("botbar",this.$props.shaders)
            return this.$props.shaders?.filter(x => x.target === 'botbar')
        }
    },
    watch: {
        range: {
            handler: function() { this.redraw() },
            deep: true
        },
        cursor: {
            handler: function() { this.redraw() },
            deep: true
        },
        rerender() {
            this.$nextTick(() => this.redraw())
        }
    },
    methods:{
        openSetting(){
        //    console.log("checking the form!");
        }
    },
    mounted() {
        const el = this.$refs['canvas']
        this.renderer = new Botbar(el, this)
        this.setup()
        this.redraw()

    },
    render(h) {
        const sett = this.$props.layout.botbar
        return this.create_canvas(h, 'botbar', {
            position: {
                x: 0,
                y: sett.offset || 0
            },
            attrs: {
                rerender: this.$props.rerender,
                width: sett.width,
                height: sett.height,
            },
            style: {
                backgroundColor: this.$props.colors.back
            },
        })
    }
}

</script>
<style>
.trading-vue-botbar {
    position: relative !important;
}
/* Styles for the settings button */
.setting-button {

    position: absolute;
    top: 700px;
    right: 0;
    transform: translateY(-50%);
    padding: 8px;
    background-color: gray; 
    color: #fff;
    border: none; 
    border-radius: 50%; 
    cursor: pointer;
    font-size: 14px; 
    z-index: 999;

}

.setting-button i {
    /* Add icon-specific styles here */
}

.setting-button:hover {
    background-color: #0056b3; /* Darker blue background color on hover */
}
</style>
