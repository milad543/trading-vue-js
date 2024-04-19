

export default class Crosshair {

    constructor(comp) {

        this.comp = comp
        this.$p = comp.$props
        this.data = this.$p.sub
        this._visible = false
        this.locked = false
        this.layout = this.$p.layout
        this.enableCrosshair = this.$p.enableCrosshair

    }

    draw(ctx) {
        // Update reference to the grid
        this.layout = this.$p.layout

        const cursor = this.comp.$props.cursor
        const candleData = this.$p.cursor.values[0]?.Candles_0;
        // console.log(this.vis)
        if (!this.visible && cursor.mode === 'explore') return

        this.x = this.$p.cursor.x
        this.y = this.$p.cursor.y

        const closingPriceOfCandle = candleData[4];
        const openingPriceOfCandle = candleData[1];

        const closingPrice = candleData[4]; // Assuming closing price is at index 4
        const isOpeningAboveClosing = closingPrice > openingPriceOfCandle; // Check if opening price is above closing price if true red candle
    
        let yCoord;
    
        if (isOpeningAboveClosing) {
            const candleLow = candleData[4]; // Low price of the candle
            yCoord = this.$p.layout.$2screen(candleLow); // Convert low price to screen coordinates
        } else {
            const candleHigh = candleData[4]; // High price of the candle
            yCoord = this.$p.layout.$2screen(candleHigh); // Convert high price to screen coordinates
        }
    

        ctx.save()
        ctx.strokeStyle = this.$p.colors.cross
        ctx.beginPath()
        ctx.setLineDash([3])

        // H
        if(this.comp.common.magnet && this.$p.cursor.grid_id === this.layout.id){
            ctx.moveTo(0,yCoord);
            ctx.lineTo(this.layout.width - 0.5, yCoord);
        }
       else if (this.$p.cursor.grid_id === this.layout.id) {
            ctx.moveTo(0, this.y)
            ctx.lineTo(this.layout.width - 0.5, this.y)
        }

        // V
        ctx.moveTo(this.x, 0)
        ctx.lineTo(this.x, this.layout.height)

        if(this.enableCrosshair){
            ctx.stroke()
        }
        
        ctx.restore()

    }

    hide() {
        this.visible = false
        this.x = undefined
        this.y = undefined
    }

    get visible() {
        return this._visible
    }

    set visible(val) {
        this._visible = val
    }

}

   // draw(ctx) {
    //     // Update reference to the grid
    //     this.layout = this.$p.layout

    //     const cursor = this.comp.$props.cursor
    //     // console.log(this.vis)
    //     if (!this.visible && cursor.mode === 'explore') return

    //     this.x = this.$p.cursor.x
    //     this.y = this.$p.cursor.values[0].ohlcv[4]
    //     // this.y = this.$p.cursor.y

    //     console.log("this is y coordinate", this.y)

    //     ctx.save()
    //     ctx.strokeStyle = this.$p.colors.cross
    //     ctx.beginPath()
    //     ctx.setLineDash([3])


    //     // Horizontally
    //     if (this.$p.cursor.grid_id === this.layout.id) {
    //         ctx.moveTo(0, this.y)
    //         ctx.lineTo(this.layout.width - 0.5, this.y)
    //     }

    //     // Vertically
    //     ctx.moveTo(this.x, 0)
    //     ctx.lineTo(this.x, this.layout.height)
        

    //     if(this.enableCrosshair){
    //         ctx.stroke()
    //     }
        
    //     ctx.restore()

    // }

    // draw(ctx) {
    //     // Update reference to the grid
    //     this.layout = this.$p.layout
    
    //     const cursor = this.comp.$props.cursor;
    //     const candles = this.comp.$props?.layout?.candles; // Access the candles array
    
    //     if (!this.visible && cursor.mode === 'explore') return;
    
    //     let y = undefined; // Initialize y-coordinate to undefined
    
    //     // Check if candles data is available and not empty
    //     if (candles && candles.length > 0) {
    //         // Get the closing price from the last candle
    //         const lastCandle = candles[candles.length - 1];
    //         y = lastCandle.close;
    //     }
    
    //     this.y = y; // Set the y-coordinate
    
    //     ctx.save();
    //     ctx.strokeStyle = this.$p.colors.cross;
    //     ctx.beginPath();
    //     ctx.setLineDash([3]);
    
    //     // Horizontally
    //     if (this.$p.cursor.grid_id === this.layout.id && typeof this.y === 'number') {
    //         ctx.moveTo(0, this.$p.layout.screen2$(this.y)); // Convert y-coordinate to screen coordinates
    //         ctx.lineTo(this.layout.width - 0.5, this.$p.layout.screen2$(this.y)); // Convert y-coordinate to screen coordinates
    //     }
    
    //     // Vertically
    //     ctx.moveTo(this.$p.cursor.x, 0);
    //     ctx.lineTo(this.$p.cursor.x, this.layout.height);
    
    //     if (this.enableCrosshair) {
    //         ctx.stroke();
    //     }
    
    //     ctx.restore();
    // }
    

    // draw(ctx) {
    //     // Update reference to the grid
    //     this.layout = this.$p.layout;
    
    //     const cursor = this.comp.$props.cursor;
    //     const data = this.comp.$data.ch?.data; // Access the data array
    //     // const data = this.$p.cursor.values[0].Candles_0[4]
    
    //     console.log("data from ctx part", data[data.length - 1][3])

    //     if (!this.visible && cursor.mode === 'explore') return;
    
    //     let lastCandle = null;
    //     let y = undefined; // Initialize y-coordinate to undefined
    
    //     // Check if data array is available and not empty
    //     if (data && data.length > 0) {
    //         // Get the last candle data from the data array
    //         lastCandle = data[data.length - 1];
    //         // Extract the closing price from the candle data
    //         y = lastCandle[3]; // Assuming the closing price is at index 4
    //     }
    
    //     this.y = y; // Set the y-coordinate
    
    //     ctx.save();
    //     ctx.strokeStyle = this.$p.colors.cross;
    //     ctx.beginPath();
    //     ctx.setLineDash([3]);
    
    //     // Horizontally
    //     if (this.$p.cursor.grid_id === this.layout.id && typeof this.y === 'number') {
    //         ctx.moveTo(0, this.y); // Convert y-coordinate to screen coordinates
    //         ctx.lineTo(this.layout.width - 0.5, this.$p.layout.screen2$(this.y)); // Convert y-coordinate to screen coordinates
    //     }
    
    //     // Vertically
    //     ctx.moveTo(this.$p.cursor.x, 0);
    //     ctx.lineTo(this.$p.cursor.x, this.layout.height);
    
    //     if (this.enableCrosshair) {
    //         ctx.stroke();
    //     }
    
    //     ctx.restore();
    // }
    

    // draw(ctx) {
    //     // Update reference to the grid
    //     this.layout = this.$p.layout;
    
    //     const cursor = this.comp.$props.cursor;
    //     const data = this.comp.$props?.sub

    //     console.log("data from ctx", data)
    
    //     if (!this.visible && cursor.mode === 'explore') return;
    
    //     let y = undefined; // Initialize y-coordinate to undefined
    
    //     // Check if data array is available and not empty
    //     if (data && data?.length > 0) {
    //         // Get the last candle data from the data array
    //         const lastCandle = data[data?.length - 1];
    //         // Extract the closing price from the candle data
    //         // Replace the index '4' with the correct index for closing price in your data structure
    //         y = lastCandle[3]; // Assuming the closing price is available as 'close' property
    //     }
    
    //     // Convert the closing price to screen coordinates
    //     const yCoord = this.$p.layout.screen2$(y);
    
    //     ctx.save();
    //     ctx.strokeStyle = this.$p.colors.cross;
    //     ctx.beginPath();
    //     ctx.setLineDash([3]);
    
    //     // Horizontally
    //     if (this.$p.cursor.grid_id === this.layout.id) {
    //         ctx.moveTo(0, yCoord);
    //         ctx.lineTo(this.layout.width - 0.5, yCoord);
    //     }
    
    //     // Vertically
    //     ctx.moveTo(this.$p.cursor.x, 0);
    //     ctx.lineTo(this.$p.cursor.x, this.layout.height);
    
    //     if (this.enableCrosshair) {
    //         ctx.stroke();
    //     }
    
    //     ctx.restore();
    // }
    
    // draw(ctx) {
    //     // Update reference to the grid
    //     this.layout = this.$p.layout;
    
    //     const cursor = this.comp.$props.cursor;
    
    //     if (!this.visible && cursor.mode === 'explore') return;
    
    //     const y = this.$p.cursor.values[0].Candles_0[4] // Get the closing price from the props

    //     console.log("y is here", y)
    
    //     ctx.save();
    //     ctx.strokeStyle = this.$p.colors.cross;
    //     ctx.beginPath();
    //     ctx.setLineDash([3]);
    
    //     // Horizontally
    //     if (typeof y === 'number') {
    //         const yCoord = this.$p.layout.screen2$(y); // Convert closing price to screen coordinates
    //         ctx.moveTo(0, yCoord);
    //         ctx.lineTo(this.layout.width - 0.5, yCoord);
    //     }
    
    //     // Vertically
    //     ctx.moveTo(cursor.x, 0);
    //     ctx.lineTo(cursor.x, this.layout.height);
    
    //     if (this.enableCrosshair) {
    //         ctx.stroke();
    //     }
    
    //     ctx.restore();
    // }
    
    // draw(ctx) {
    //     // Update reference to the grid
    //     this.layout = this.$p.layout;
    
    //     const cursor = this.comp.$props.cursor;
    //     const y = this.$p.cursor.values[0].Candles_0[4]; 
        
    //     console.log("this is y",y)// Closing price from cursor data

    
    //     ctx.save();
    //     ctx.strokeStyle = this.$p.colors.cross;
    //     ctx.beginPath();
    //     ctx.setLineDash([3]);
    
    //     // Calculate screen coordinates for the closing price
    //     const yCoord = this.$p.layout.screen2$(y);
    
    //     // Horizontally
    //     if (this.$p.cursor.grid_id === this.layout.id && typeof y === 'number') {
    //         ctx.moveTo(0, yCoord);
    //         ctx.lineTo(this.layout.width - 0.5, yCoord);
    //     }
    
    //     // Vertically
    //     ctx.moveTo(cursor.x, 0);
    //     ctx.lineTo(cursor.x, this.layout.height);
    
    //     if (this.enableCrosshair) {
    //         ctx.stroke();
    //     }
    
    //     ctx.restore();
    // }
    // draw(ctx) {
    //     // Update reference to the grid
    //     this.layout = this.$p.layout;
    
    //     const cursor = this.comp.$props.cursor;
    //     const data = this.$p.cursor.values[0].Candles_0[4]; 
    
    //     if (!this.visible && cursor.mode === 'explore') return;
    
    //     let y = undefined; // Initialize y-coordinate to undefined
    
    //     // Check if data array is available and not empty
    //     if (data && data.length > 0) {
    //         // Get the last candle data from the data array
    //         const lastCandle = data[data.length - 1];
    //         // Extract the closing price from the candle data
    //         y = lastCandle.close; // Assuming the closing price is available as 'close' property
            
    //         // Determine if the candle is green or red
    //         const isGreenCandle = lastCandle.close > lastCandle.open;
    
    //         // Adjust the position of the crosshair line based on candle color
    //         if (isGreenCandle) {
    //             y += 0.1; // Move the crosshair line slightly above the green candle
    //         } else {
    //             y -= 0.1; // Move the crosshair line slightly below the red candle
    //         }
    //     }
    
    //     // Convert the closing price to screen coordinates
    //     const yCoord = this.$p.layout.screen2$(y);
    
    //     ctx.save();
    //     ctx.strokeStyle = this.$p.colors.cross;
    //     ctx.beginPath();
    //     ctx.setLineDash([3]);
    
    //     // Horizontally
    //     if (typeof y === 'number') {
    //         ctx.moveTo(0, yCoord);
    //         ctx.lineTo(this.layout.width - 0.5, yCoord);
    //     }
    
    //     // Vertically
    //     ctx.moveTo(cursor.x, 0);
    //     ctx.lineTo(cursor.x, this.layout.height);
    
    //     if (this.enableCrosshair) {
    //         ctx.stroke();
    //     }
    
    //     ctx.restore();
    // }
    
    // draw(ctx) {
    //     // Update reference to the grid
    //     this.layout = this.$p.layout;
    
    //     const cursor = this.comp.$props.cursor;
    //     const candleData = this.$p.cursor.values[0].Candles_0;
    
    //     if (!this.visible && cursor.mode === 'explore') return;
    
    //     // Extract the closing price from the candle data
    //     const closingPrice = candleData[4]; // Assuming closing price is at index 4

    //     console.log("closing price", closingPrice)
    
    //     // Convert closing price to screen coordinates
    //     const yCoord = this.$p.layout.screen2$(closingPrice);
    
    //     ctx.save();
    //     ctx.strokeStyle = this.$p.colors.cross;
    //     ctx.beginPath();
    //     ctx.setLineDash([3]);
    
    //     // Draw the horizontal line at the calculated screen coordinates
    //     ctx.moveTo(0, yCoord);
    //     ctx.lineTo(this.layout.width - 0.5, yCoord);
    
    //     // Draw the vertical line based on the cursor position
    //     ctx.moveTo(cursor.x, 0);
    //     ctx.lineTo(cursor.x, this.layout.height);
    
    //     if (this.enableCrosshair) {
    //         ctx.stroke();
    //     }
    
    //     ctx.restore();
    // }
    
    // draw(ctx) {
    //     // Update reference to the grid
    //     this.layout = this.$p.layout;
    
    //     const cursor = this.comp.$props.cursor;
    //     const candleData = this.$p.cursor.values[0].Candles_0;
    
    //     if (!this.visible && cursor.mode === 'explore') return;
    
    //     // Extract the closing price from the candle data
    //     const closingPrice = candleData[4]; // Assuming closing price is at index 4
    
    //     console.log("Closing Price:", closingPrice); // Log the closing price
    
    //     // Convert closing price to screen coordinates
    //     const yCoord = this.$p.layout.screen2$(closingPrice);

    //     console.log("ycoordinate", yCoord)
    
    //     ctx.save();
    //     ctx.strokeStyle = this.$p.colors.cross;
    //     ctx.beginPath();
    //     ctx.setLineDash([3]);
    
    //     // Draw the horizontal line at the calculated screen coordinates
    //     ctx.moveTo(0, yCoord);
    //     ctx.lineTo(this.layout.width - 0.5, yCoord);
    
    //     // Draw the vertical line based on the cursor position
    //     ctx.moveTo(cursor.x, 0);
    //     ctx.lineTo(cursor.x, this.layout.height);
    
    //     if (this.enableCrosshair) {
    //         ctx.stroke();
    //     }
    
    //     ctx.restore();
    // }
    
    // draw(ctx) {
    //     // Update reference to the grid
    //     this.layout = this.$p.layout;
    
    //     const cursor = this.comp.$props.cursor;
    //     const candleData = this.$p.cursor.values[0].Candles_0;
    
    //     if (!this.visible && cursor.mode === 'explore') return;
    
    //     // Extract the closing price from the candle data
    //     const closingPrice = candleData[4]; // Assuming closing price is at index 4

    //     const openPrice = candleData[1]
    //     const closePrice = candleData[4]
    //     const highPrice = candleData[2]
    //     const lowPrice = candleData[3]

    //     console.log("ohlcv===>", openPrice, closePrice, highPrice, lowPrice)
    
    //     // Determine if the current candle is green or red
    //     const isGreenCandle = closePrice > openPrice; // Compare closing price with opening price
    
    //     // Calculate the y-coordinate for the crosshair line based on candle color
    //     let yCoord = this.$p.layout.screen2$(closingPrice); // Convert closing price to screen coordinates
    
    //     if (isGreenCandle) {
    //         // For green candles, align the crosshair line with the top-center of the candle
    //         const candleTop = this.$p.layout.screen2$(highPrice); // High price
    //         yCoord = candleTop;
    //     } else {
    //         // For red candles, align the crosshair line slightly below the candle
    //         const candleBottom = this.$p.layout.screen2$(lowPrice); // Low price
    //         yCoord = candleBottom + 5; // Adjust the offset as needed
    //     }

    //     console.log("ycoordinates", yCoord)
    
    //     ctx.save();
    //     ctx.strokeStyle = this.$p.colors.cross;
    //     ctx.beginPath();
    //     ctx.setLineDash([3]);
    
    //     // Draw the horizontal line at the calculated screen coordinates
    //     ctx.moveTo(0, yCoord );
    //     ctx.lineTo(this.layout.width - 0.5, yCoord);
    
    //     // Draw the vertical line based on the cursor position
    //     ctx.moveTo(cursor.x, 0);
    //     ctx.lineTo(cursor.x, this.layout.height);
    
    //     if (this.enableCrosshair) {
    //         ctx.stroke();
    //     }
    
    //     ctx.restore();
    // }
    

    // draw(ctx) {
    //     // Update reference to the grid
    //     this.layout = this.$p.layout;
    
    //     const cursor = this.comp.$props.cursor;
    //     const candleData = this.$p.cursor.values[0].Candles_0;
    
    //     if (!this.visible && cursor.mode === 'explore') return;
    
    //     // Extract the closing price from the candle data
    //     const closingPrice = candleData[4]; // Assuming closing price is at index 4
    
    //     // Determine if the candle is green or red
    //     const isGreenCandle = closingPrice > candleData[1]; // Compare closing price with opening price
    
    //     // Calculate the y-coordinate for the crosshair line based on candle color
    //     let yCoord;
    
    //     if (isGreenCandle) {
    //         // For green candles, align the crosshair line with the top-center of the candle
    //         const candleHigh = candleData[2]; // High price of the candle
    //         yCoord = this.$p.layout.screen2$(candleHigh); // Convert high price to screen coordinates
    //     } else {
    //         // For red candles, align the crosshair line slightly below the candle
    //         const candleLow = candleData[3]; // Low price of the candle
    //         yCoord = this.$p.layout.screen2$(candleLow) + 5; // Adjust the offset as needed
    //     }
    
    //     ctx.save();
    //     ctx.strokeStyle = this.$p.colors.cross;
    //     ctx.beginPath();
    //     ctx.setLineDash([3]);
    
    //     // Draw the horizontal line at the calculated screen coordinates
    //     ctx.moveTo(0, yCoord);
    //     ctx.lineTo(this.layout.width - 0.5, yCoord);
    
    //     // Draw the vertical line based on the cursor position
    //     ctx.moveTo(cursor.x, 0);
    //     ctx.lineTo(cursor.x, this.layout.height);
    
    //     if (this.enableCrosshair) {
    //         ctx.stroke();
    //     }
    
    //     ctx.restore();
    // }