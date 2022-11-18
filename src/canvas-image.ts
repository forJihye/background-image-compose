type imageConfig = {
  img: HTMLImageElement|null;
  width: number;
  height: number;
  x: number;
  y: number;
}

class CanvasImageRatio {
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  img!: HTMLImageElement;

  align!: 'vertical'|'horizontal'|'default';
  originalRatio: number = 0;
  transformRatio: number = 0;

  x: number = 0;
  y: number = 0;
  width!: number;
  height!: number;
  
  get size() {
    return {
      width: this.width,
      height: this.height,
      x: this.x,
      y: this.y,
      min: {
        x: 0,
        y: 0,
      },
      max: {
        x: this.align === 'horizontal' ? 0 : this.canvas.width - this.width,
        y: this.align === 'vertical' ? 0 : this.canvas.height - this.height,
      }
    }
  }
  private setRatio() {
    this.originalRatio = this.canvas.width / this.canvas.height;
    this.transformRatio = this.img.width / this.img.height;
  }
  private transformAlign() {
    if (this.originalRatio < this.transformRatio) {
      this.align = 'vertical'
    } 
    if (this.originalRatio > this.transformRatio) {
      this.align = 'horizontal'
    }
    if (this.originalRatio === this.transformRatio) {
      this.align = 'default';
    }
  }
  private transform() {
    if (this.align === 'vertical') {
      this.width = (this.img.width * this.canvas.width) / this.img.height;
      this.height = this.canvas.height;
      this.x = (this.canvas.width - this.width) / 2;
      this.y = 0;
    }
    if (this.align === 'horizontal') {
      this.width = this.canvas.width;
      this.height = (this.img.height * this.canvas.width) / this.img.width;
      this.x = 0;
      this.y = (this.canvas.height - this.height) / 2;
    }
    if (this.align === 'default') {
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.x = 0;
      this.y = 0;
    }
  }
  init(config: imageConfig) {
    this.img = config.img as HTMLImageElement;
    this.canvas = Object.assign(document.createElement('canvas'), {width: config.width, height: config.height}) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    
    this.setRatio();
    this.transformAlign();
    this.transform();
    this.drawImage();
  }
  drawImage() {
    this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
  clearRect() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
}

export default CanvasImageRatio;