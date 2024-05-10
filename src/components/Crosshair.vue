<!-- <script>

import Crosshair from './js/crosshair.js'
import Utils from '../stuff/utils.js'

export default {
    name: 'Crosshair',
    props: [ 'cursor', 'colors', 'layout', 'sub','enableCrosshair'],
    watch: {
        cursor: {
            handler: function() {

                if (!this.ch) this.create()

                // Explore = default mode on mobile
                const cursor = this.$props.cursor
                const explore = cursor.mode === 'explore'

                if (!cursor.x || !cursor.y) {
                    this.ch.hide()
                    this.$emit('redraw-grid')
                    return
                }
                this.ch.visible = !explore
            },
            deep: true
        },
      enableCrosshair:{
        handler: function(n) {
          this.create()
        }
          
      }
    },
    methods: {
        create() {
            this.ch = new Crosshair(this)

            // New grid overlay-renderer descriptor.
            // Should implement draw() (see Spline.vue)
            this.$emit('new-grid-layer', {
            name: 'crosshair',
                renderer: this.ch
            })
        }
    },
    render(h) { return h() }
}
</script> -->

<template>
    <div>
        
    </div>
</template>

<script>
import Crosshair from './js/crosshair.js'
import Utils from '../stuff/utils.js'

export default {
    name: 'Crosshair',
    props: ['cursor', 'colors', 'layout', 'sub', 'enableCrosshair', 'common'],
    data() {
        return {
            ch: null
        }
    },
    watch: {
        cursor: {
            handler() {
                if (!this.ch) this.create()

                const cursor = this.$props.cursor
                const explore = cursor.mode === 'explore'

                if (!cursor.x || !cursor.y) {
                    this.ch.hide()
                    this.$emit('redraw-grid')
                    return
                }
                this.ch.visible = !explore
            },
            deep: true
        },
        enableCrosshair: {
            handler() {
                this.create()
            },
            immediate: true
        }
    },
    computed:{
        magnet(){
            return this.$props.common
        }
    },
    methods: {
        create() {
            this.ch = new Crosshair(this)

            // console.log("crosshair vue.js==>", this.common)

            // console.log("this keyword from crosshair", this.common)

            // New grid overlay-renderer descriptor.
            // Should implement draw() (see Spline.vue)
            this.$emit('new-grid-layer', {
                name: 'crosshair',
                renderer: this.ch
            })
        }
    },
}
</script>
