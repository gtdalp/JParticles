const {utils, Base} = JParticles;
const {random, abs, PI, sin, ceil} = Math;
const twicePI = PI * 2;
const UNDEFINED = 'undefined';
const {
    pInt, limitRandom, calcSpeed,
    scaleValue, randomColor, isArray,
    isFunction, isPlainObject,
    defineReadOnlyProperty
} = utils;

class WaveLoading extends Base {

    static defaultConfig = {

        // [font style][font weight][font size][font family]
        // 同css一样，但必须包含 [font size] 和 [font family]
        // 进度文本颜色
        font: 'normal 900 20px Arial',

        // 文本颜色
        color: '#333',

        // 填充的背景色
        fillColor: '#27C9E5',

        // 线条横向偏移值，距离canvas画布左边的偏移值
        // (0, 1)表示容器宽度的倍数，0 & [1, +∞)表示具体数值
        offsetLeft: 0,

        // 波峰高度，(0, 1)表示容器高度的倍数，0 & [1, +∞)表示具体数值
        crestHeight: 4,

        // 波纹个数，即正弦周期个数
        rippleNum: 1,

        // 运动速度
        speed: .3
    };

    get version() {
        return '3.0.0';
    }

    constructor(selector, options) {
        super(WaveLoading, selector, options);
    }

    init() {
        this.c.style.borderRadius = '50%';
        this.progress = 0;
        this.set.offsetTop = this.ch;
        this.halfCW = this.cw / 2;
        this.halfCH = this.ch / 2;
        this.dots = [];
        this.createDots();
        this.draw();
    }

    createDots() {
        const {cw, dots} = this;

        // 线条波长，每个周期(2π)在canvas上的实际长度
        const rippleLength = cw / this.set.rippleNum;

        // 点的y轴步进
        const step = twicePI / rippleLength;

        // 一条线段所需的点
        for (let i = 0; i <= cw; i++) {
            dots.push({
                x: i,
                y: i * step
            });
        }
    }

    draw() {
        const {cxt, cw, ch, halfCW, halfCH, paused} = this;
        const {
            font, color, opacity, crestHeight,
            offsetLeft, offsetTop, fillColor,
            speed
        } = this.set;

        cxt.clearRect(0, 0, cw, ch);
        cxt.globalAlpha = opacity;

        cxt.save();
        cxt.beginPath();

        this.dots.forEach((dot, i) => {
            cxt[i ? 'lineTo' : 'moveTo'](
                dot.x,

                // y = A sin ( ωx + φ ) + h
                crestHeight * sin(dot.y + offsetLeft) + offsetTop
            );
            !paused && ( dot.y -= speed );
        });

        cxt.lineTo(cw, ch);
        cxt.lineTo(0, ch);
        cxt.closePath();
        cxt.fillStyle = fillColor;
        cxt.fill();
        cxt.restore();

        let progressText = ceil(this.progress) + '%';
        if (this.progressListeners) {
            const response = this.progressListeners(this.progress);
            if (typeof response !== UNDEFINED) {
                progressText = response;
            }
        }

        cxt.font = font;
        cxt.textAlign = 'center';
        cxt.textBaseline = 'middle';
        cxt.fillStyle = color;
        cxt.fillText(progressText, halfCW, halfCH, cw);

        this.progress += 0.5;

        if (this.progress >= 99) {
            this.progress = 99;
        }

        this._setOffsetTop();
        this.requestAnimationFrame();
    }

    _setOffsetTop() {
        this.set.offsetTop = ceil((100 - this.progress) / 100 * this.ch);
    }

    setOptions(newOptions) {
        if (isPlainObject(newOptions)) {
            for (const name in newOptions) {
                if (name !== 'offsetTop' && (name in this.set)) {
                    this.set[name] = newOptions[name];
                }
            }
        }
    }

    done() {

    }

    onProgress(callback) {
        if (isFunction(callback)) {
            this.progressListeners = callback;
        }
    }
}

defineReadOnlyProperty(WaveLoading, 'waveLoading');