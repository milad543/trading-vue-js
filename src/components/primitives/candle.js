
// Candle object for Candles overlay

export default class CandleExt {

    constructor(overlay, ctx, data) {
        this.ctx = ctx
        this.self = overlay
        this.style = data.raw[6] || this.self
        this.draw(data)
    }

    // draw(data) {
    //     const green = data.raw[4] >= data.raw[1]
    //     const body_color = green ?
    //         this.style.colorCandleUp :
    //         this.style.colorCandleDw

    //     const wick_color = green ?
    //         this.style.colorWickUp :
    //         this.style.colorWickDw

    //     let w = Math.max(data.w, 1)
    //     let hw = Math.max(Math.floor(w * 0.5), 1)
    //     let h = Math.abs(data.o - data.c)
    //     let max_h = data.c === data.o ? 1 : 2
    //     let x05 = Math.floor(data.x) - 0.5

    //     this.ctx.strokeStyle = wick_color

    //     this.ctx.beginPath()
    //     this.ctx.moveTo(x05, Math.floor(data.h))
    //     this.ctx.lineTo(x05, Math.floor(data.l))

    //     this.ctx.stroke()

    //     if (data.w > 1.5) {

    //         this.ctx.fillStyle = body_color
    //         // TODO: Move common calculations to layout.js
    //         let s = green ? 1 : -1
    //         this.ctx.fillRect(
    //             Math.floor(data.x - hw -1),
    //             data.c,
    //             Math.floor(hw * 2 + 1),
    //             s * Math.max(h, max_h),
    //         )

    //     } else {

    //         this.ctx.strokeStyle = body_color

    //         this.ctx.beginPath()
    //         this.ctx.moveTo(
    //             x05,
    //             Math.floor(Math.min(data.o, data.c)),
    //         )
    //         this.ctx.lineTo(
    //             x05,
    //             Math.floor(Math.max(data.o, data.c)) +
    //                 (data.o === data.c ? 1 : 0)
    //         )

    //         this.ctx.stroke()

    //     }

    // }
    
    // draw(data) {
    //     const green = data.raw[4] >= data.raw[1];
    //     const body_color = green ?
    //         this.style.colorCandleUp :
    //         this.style.colorCandleDw;
    
    //     const wick_color = green ?
    //         this.style.colorWickUp :
    //         this.style.colorWickDw;
    
    //     const border_color = this.style.borderColor || 'black'; // Define border color
    
    //     let w = Math.max(data.w, 1);
    //     let hw = Math.max(Math.floor(w * 0.5), 1);
    //     let h = Math.abs(data.o - data.c);
    //     let max_h = data.c === data.o ? 1 : 2;
    //     let x05 = Math.floor(data.x) - 0.5;
    
    //     this.ctx.strokeStyle = wick_color;
    //     this.ctx.beginPath();
    //     this.ctx.moveTo(x05, Math.floor(data.h));
    //     this.ctx.lineTo(x05, Math.floor(data.l));
    //     this.ctx.stroke();
    
    //     if (data.w > 1.5) {
    //         // Draw candlestick body with border
    //         this.ctx.fillStyle = border_color; // Set border color
    //         let s = green ? 1 : -1;
    //         this.ctx.fillRect(
    //             Math.floor(data.x - hw - 1),
    //             data.c,
    //             Math.floor(hw * 2 + 1),
    //             s * Math.max(h, max_h)
    //         );
    
    //         // Draw inner candlestick body
    //         this.ctx.fillStyle = body_color;
    //         this.ctx.fillRect(
    //             Math.floor(data.x - hw),
    //             data.c + 1, // Adjust for border thickness
    //             Math.floor(hw * 2 - 1),
    //             s * Math.max(h, max_h) - 2 // Adjust for border thickness
    //         );
    //     } else {
    //         // Draw candlestick with border
    //         this.ctx.strokeStyle = border_color; // Set border color
    //         this.ctx.beginPath();
    //         this.ctx.moveTo(
    //             x05,
    //             Math.floor(Math.min(data.o, data.c))
    //         );
    //         this.ctx.lineTo(
    //             x05,
    //             Math.floor(Math.max(data.o, data.c)) +
    //             (data.o === data.c ? 1 : 0)
    //         );
    //         this.ctx.stroke();
    
    //         // Draw inner candlestick
    //         this.ctx.fillStyle = body_color;
    //         this.ctx.fillRect(
    //             Math.floor(data.x - hw),
    //             Math.min(data.o, data.c) + 1, // Adjust for border thickness
    //             Math.floor(hw * 2 - 1),
    //             Math.abs(data.o - data.c) - 2 // Adjust for border thickness
    //         );
    //     }
    // }

    draw(data) {
        const green = data.raw[4] >= data.raw[1];
        const body_color = green ?
            this.style.colorCandleUp :
            this.style.colorCandleDw;
    
        const wick_color = green ?
            this.style.colorWickUp :
            this.style.colorWickDw;
    
        const border_color = this.style.borderColor || 'black'; // Define border color
    
        let w = Math.max(data.w, 1);
        let hw = Math.max(Math.floor(w * 0.5), 1);
        let h = Math.abs(data.o - data.c);
        let max_h = data.c === data.o ? 1 : 2;
        let x05 = Math.floor(data.x) - 0.5;
    
        this.ctx.strokeStyle = wick_color;
        this.ctx.beginPath();
        this.ctx.moveTo(x05, Math.floor(data.h));
        this.ctx.lineTo(x05, Math.floor(data.l));
        this.ctx.stroke();
    
        if (data.w > 1.5) {
            // Draw candlestick body with border
            this.ctx.fillStyle = border_color; // Set border color
            let s = green ? 1 : -1;
            this.ctx.fillRect(
                Math.floor(data.x - hw - 1),
                data.c,
                Math.floor(hw * 2 + 1),
                s * Math.max(h, max_h)
            );
    
            // Draw inner candlestick body
            this.ctx.fillStyle = body_color;
            this.ctx.fillRect(
                Math.floor(data.x - hw),
                data.c + 1, // Adjust for border thickness
                Math.floor(hw * 2 - 1),
                s * Math.max(h, max_h) - 2 // Adjust for border thickness
            );
        } else {
            // Draw candlestick with border
            this.ctx.strokeStyle = border_color; // Set border color
            this.ctx.beginPath();
            this.ctx.moveTo(
                x05,
                Math.floor(Math.min(data.o, data.c))
            );
            this.ctx.lineTo(
                x05,
                Math.floor(Math.max(data.o, data.c)) +
                (data.o === data.c ? 1 : 0)
            );
            this.ctx.stroke();
    
            // Draw inner candlestick
            this.ctx.fillStyle = body_color;
            this.ctx.fillRect(
                Math.floor(data.x - hw),
                Math.min(data.o, data.c) + 1, // Adjust for border thickness
                Math.floor(hw * 2 - 1),
                Math.abs(data.o - data.c) - 2 // Adjust for border thickness
            );
        }
    }
}
