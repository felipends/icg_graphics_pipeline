class Line {
  constructor(x0, y0, x1, y1, color_0, color_1){
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    this.color_0 = color_0;
    this.color_1 = color_1;
  }

  plotHigh() {
    let dx = this.x1 - this.x0;
    let dy = this.y1 - this.y0;
    
    let inc_x = 1;
    if(dx < 0){
      inc_x = -1;
      dx = -dx;
    }
    
    let d = (2*dx) - dy;
    let x = this.x0;
    
    let color = this.color_0;
    let dr = (this.color_1[0] - this.color_0[0])/dy;
    let dg = (this.color_1[1] - this.color_0[1])/dy;
    let db = (this.color_1[2] - this.color_0[2])/dy;
    
    for(let y = this.y0; y <= this.y1; y++){
      color = this.colorInterpolation(color, dr, dg, db);
      color_buffer.putPixel(x, y, color);
      if (d > 0) {
        x += inc_x;
        d += (2*(dx - dy));
      } else {
        d += 2*dx;
      }
    }
  }

  plotLow() {
    let dx = this.x1 - this.x0;
    let dy = this.y1 - this.y0;
    
    let inc_y = 1;
    
    if(dy < 0){
      inc_y = -1;
      dy = -dy;
    }
    
    let d = (2*dy) - dx;
    let y = this.y0;
    
    let color = this.color_0;
    let dr = (this.color_1[0] - this.color_0[0])/dx;
    let dg = (this.color_1[1] - this.color_0[1])/dx;
    let db = (this.color_1[2] - this.color_0[2])/dx;
    
    for(let x = this.x0; x <= this.x1; x++){
      color = this.colorInterpolation(color, dr, dg, db);
      color_buffer.putPixel(x, y, color);

      if(d > 0){
        y += inc_y;
        d += (2*(dy - dx));
      } else {
        d += 2*dy;
      }
    }
  }

  colorInterpolation(current_color, dr = 0, dg = 0, db = 0) {
    let color_result = current_color;

    color_result = [color_result[0] + dr, color_result[1] + dg, color_result[2] + db];

    return color_result;
  }
}

function MidPointLineAlgorithm(x0, y0, x1, y1, color_0, color_1) {
  let line;
  const dy = Math.abs(y1 - y0);
  const dx = Math.abs(x1 - x0);
  if(dy < dx){
    if (x0 > x1) {
      line = new Line(x1, y1, x0, y0, color_1, color_0);
      line.plotLow();
    } else {
      line = new Line(x0, y0,x1, y1, color_0, color_1);
      line.plotLow();
    }
  } else {
    if (y0 > y1) {
      line = new Line(x1, y1, x0, y0, color_1, color_0);
      line.plotHigh();
    } else {
      line = new Line(x0, y0, x1, y1, color_0, color_1);
      line.plotHigh();
    }
  }
}

function DrawTriangle(x0, y0, x1, y1, x2, y2, color_0, color_1, color_2) {
	MidPointLineAlgorithm(x0, y0, x1, y1, color_0, color_1);
	MidPointLineAlgorithm(x1, y1, x2, y2, color_1, color_2);
	MidPointLineAlgorithm(x2, y2, x0, y0, color_2, color_0);
}

// MidPointLineAlgorithm(25, 30, 100,80, [255,0,0,255], [255,255,0,255]);
// DrawTriangle(25, 30, 50, 100, 100, 15, [255,0,0,255], [0,0,255,255], [0,255,0,255]);