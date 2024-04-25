
// Price bar & price line (shader)

export default class Price {

    constructor(comp) {
        this.comp = comp
    }

    // Defines an inline shader (has access to both
    // target & overlay's contexts)
    init_shader() {

        let layout = this.comp.$props.layout
        let config = this.comp.$props.config
        let comp = this.comp
        let last_bar = () => this.last_bar()
        //console.log("init_shader comp",comp?.isArrow)
        this.comp.$emit('new-shader', {
            target: 'sidebar', draw: ctx => {

                let bar = last_bar()
                if (!bar) return

                let w = ctx.canvas.width
                let h = config.PANHEIGHT
                //let lbl = bar.price.toFixed(layout.prec)
                let lbl = bar.price.toFixed(comp.decimalPlace)
             
              

                ctx.fillStyle = bar.color
                
                let x = - 0.5

               
             
                let a = 7
                // let isArrow = comp.$props.settings
                
                if(comp?.isArrow){
                    //y according to arrow
                    let y = bar.y - h * 0 - 0.5

                    //map client arrow work
                    ctx.miterLimit=4;
                    ctx.font="15px''";
                    ctx.fillStyle=bar.color;
                    ctx.font="15px''";
                    ctx.save();
                    ctx.fillStyle=bar.color;
                    ctx.font="15px''";
                    ctx.beginPath();
                    //1. ctx.moveTo(0,16);
                    ctx.moveTo(x - 0.5,y);
                    //2. ctx.lineTo(19,0);
                    ctx.lineTo(x - 0.5 + 19,y-16);
                    //3. ctx.lineTo(66.5,0);
                    ctx.lineTo(x - 0.5 + 19 + 66.5,y-16);
                    //4. ctx.lineTo(66.5,35);
                    ctx.lineTo(x - 0.5 + 19 + 66.5,y+32-16);
                    //5. ctx.lineTo(19,35);
                    ctx.lineTo(x - 0.5 + 19,y+32-16);
                    //6. ctx.lineTo(0,16);
                    ctx.lineTo(x - 0.5,y);
                    ctx.closePath();
                    ctx.fill();
                    // ctx.stroke();
                    ctx.restore();
                    ctx.restore();

                    ctx.fillStyle = comp.$props.colors.textHL
                    ctx.textAlign = 'left'

                    //for arrow work
                    ctx.fillText(lbl, a+10, y + 5)
                }else{
                    let x = - 0.5
                    let y = bar.y - h * 0.5 - 0.5
                    let a = 7
                    ctx.fillRect(x - 0.5, y, w + 1, h)
                    ctx.fillStyle = comp.$props.colors.textHL
                    ctx.textAlign = 'left'
                    ctx.fillText(lbl, a, y + 15)
                }
            

              

            }
        })
        this.shader = true
    }

    // Regular draw call for overaly
    draw(ctx) {

        console.log("this.comp.colorCandleDw",typeof this.comp.colorCandleDw);
        if (!this.comp.$props.meta.last) return
        if (!this.shader) this.init_shader()

        let layout = this.comp.$props.layout
        let last = this.comp.$props.last

        let dir = last[4] >= last[1]
        let color = dir ? this.green() : this.red()
        let y = layout.$2screen(last[4]) + (dir ? 1 : 0)

        ctx.strokeStyle = color
        ctx.setLineDash([1, 1])
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(layout.width, y)
        ctx.stroke()
        ctx.setLineDash([])
    }

    last_bar() {

        if (!this.comp.data.length) return undefined
        let layout = this.comp.$props.layout
        let last = this.comp.data[this.comp.data.length - 1]
        let y = layout.$2screen(last[4])
        //let cndl = layout.c_magnet(last[0])
        return {
            y: y, //Math.floor(cndl.c) - 0.5,
            price: last[4],
            color: last[4] >= last[1] ? this.green() : this.red()
        }
    }

    last_price() {
        return this.comp.$props.meta.last ?
            this.comp.$props.meta.last[4] : undefined
    }

    green() {
        return this.comp.colorCandleUp
    }

    red() {
        if(this.comp.colorCandleDw === "#FCFCFC"){
            return "#B0B0B0"
        }else{
            return this.comp.colorCandleDw
        }
        // return this.comp.colorCandleDw
    }

    drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color){
        //variables to be used when creating the arrow
        ctx.strokeStyle="rgba(0,0,0,0)";
        ctx.miterLimit=4;
        ctx.font="15px ''";
        ctx.fillStyle="rgba(0,0,0,0)";
        ctx.font="   15px ''";
        ctx.save();
        ctx.fillStyle="#E65C5C";
        ctx.font="   15px ''";
        ctx.beginPath();
        ctx.moveTo(0,16);
        ctx.lineTo(19,0);
        ctx.lineTo(66.5,0);
        ctx.lineTo(66.5,35);
        ctx.lineTo(19,35);
        ctx.lineTo(0,16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        ctx.restore();

        return;

        var headlen = 15;
        var angle = Math.atan2(toy-fromy,tox-fromx);
     
        ctx.save();
        ctx.strokeStyle = color;
     
        //starting path of the arrow from the start square to the end square
        //and drawing the stroke
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.lineWidth = arrowWidth;
        ctx.stroke();
     
        //starting a new path from the head of the arrow to one of the sides of
        //the point
        ctx.beginPath();
        ctx.moveTo(tox, toy);
        ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/4),
                   toy-headlen*Math.sin(angle-Math.PI/4));
     
        //path from the side point of the arrow, to the other side point
        ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/4),
                   toy-headlen*Math.sin(angle+Math.PI/4));
     
        //path from the side point back to the tip of the arrow, and then
        //again to the opposite side point
        ctx.lineTo(tox, toy);
        ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/4),
                   toy-headlen*Math.sin(angle-Math.PI/4));
     
        //draws the paths created above
        ctx.stroke();
        ctx.restore();
    }

}
