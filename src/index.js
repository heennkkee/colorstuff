import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { SketchPicker, BlockPicker, PhotoshopPicker, HuePicker, SliderPicker, MaterialPicker, AlphaPicker, GithubPicker, TwitterPicker } from 'react-color';

class ColorColumn extends React.Component {
    render() {

        function renderColorBlock(col) {
            return (
                <div className="colorBlock">
                    <h3>{col.hex}</h3>
                    <div className="colorPreviewBlock" style={{backgroundColor: col.hex}}></div>
                </div>
            )
        }
        return (
            <div className="column">
                <button onClick={() => this.props.handleOnClickRemove(this.props.index)}>Ta bort</button>
                {renderColorBlock(this.props.Color)}
                {renderColorBlock(this.props.Color.toGrayscale())}
            </div>
        )
    }
}

class ColorContrastColumn extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {

        function renderContrastBlock(col1, col2) {
            const lum1 = col1.humanRelativeLuminance;
            const lum2 = col2.humanRelativeLuminance;
    
            const contrast = Math.round(((Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05)) * 100) / 100;

            return (
                <div className="contrastBlock">
                    <p>Contrast: {contrast}</p>
                </div>
            );
        }

        return (
            <div className="column">
                {renderContrastBlock(this.props.ColorFrom, this.props.ColorTo)}
                {renderContrastBlock(this.props.ColorFrom.toGrayscale(), this.props.ColorTo.toGrayscale())}
            </div>
        );
    }
}

class Color {
    constructor(colorInHex) {
        if (colorInHex.indexOf('#') !== 0) {
            colorInHex = '#' + colorInHex;
        }
        this.hex = colorInHex;
    }

    get RGB() {
        if (!this.rgbValues) {
            let hexNumerical = this.hex.replace('#', '');
            if (hexNumerical.length === '3') {
                hexNumerical += hexNumerical;
            }
            const [r, g, b] = [
                parseInt(hexNumerical.slice(0, 2), 16),
                parseInt(hexNumerical.slice(2, 4), 16),
                parseInt(hexNumerical.slice(4, 6), 16),
            ];
            this.RGB = {red: r, green: g, blue: b};
        }
        return this.rgbValues;
    }

    set RGB(values) {
        this.rgbValues = values;
    }

    get sRGB() {
        return {
            red: this.RGB.red / 255,
            green: this.RGB.green / 255,
            blue: this.RGB.blue / 255,
        }
    }

    get luminance() {
        if (!this.luminanceValues) {

            let [r, g, b] = [this.sRGB.red, this.sRGB.green, this.sRGB.blue];
            r = (r > 0.03928) ?
                Math.pow((r + 0.055) / 1.055, 2.4) :
                r / 12.92;
            g = (g > 0.03928) ?
                Math.pow((g + 0.055) / 1.055, 2.4) :
                g / 12.92;
            b = (b > 0.03928) ?
                Math.pow((b + 0.055) / 1.055, 2.4) :
                b / 12.92;

            this.luminanceValues = {
                red: r,
                green: g,
                blue: b
            }
        }
        return this.luminanceValues;
    }

    set luminance(values) {
        this.luminanceValues = values;
    }

    get humanRelativeLuminance() {
        let luminance = this.luminance;
        return (
            luminance.red * 0.2126
            + luminance.green * 0.7152
            + luminance.blue * 0.0722
        );
    }

    toGrayscale() {
        const hrl = this.humanRelativeLuminance;
        let revHrl = (hrl > 0.0031308) ? 
        Math.pow((hrl * 1.055), (1 / 2.4)) - 0.055 :
        hrl * 12.92;
        return new Color(Color.sRGBtoHex(revHrl, revHrl, revHrl));
    }

    static RGBtoHex(red, green, blue) {
        return (zeroPad(Math.round(red).toString(16)) 
        + zeroPad(Math.round(green).toString(16)) 
        + zeroPad(Math.round(blue).toString(16)));
    }
    static sRGBtoHex(red, green, blue) {
        return Color.RGBtoHex(255 * red, 255 * green, 255 * blue);
    }
}

function zeroPad(input) {
    return (input.length === 1) ? '0' + input : input;
}


class ColorPickerWrap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            colors: [
            ],
            colorToAdd: '#000000'
        }

        this.handleOnClickRemove = this.handleOnClickRemove.bind(this);
        this.addColor = this.addColor.bind(this);
        this.colorPickerComplete = this.colorPickerComplete.bind(this);
    }

    colorPickerComplete(color) {
        this.setState({colorToAdd: color.hex})
    }

    addColor() {
        let colors = this.state.colors.slice();
        colors.push(this.state.colorToAdd);

        this.setState({colors: colors, colorToAdd: '#000000'});        
    }

    handleOnClickRemove(index) {
        let colors = this.state.colors.slice();
        colors.splice(index, 1);
        this.setState({colors: colors});
    }


    render() {
        function compareColumn(index, col1, col2) {
            const key = 'compare_' + index + '_' + (index + 1);
            return (
                <ColorContrastColumn key={key} ColorFrom={col1} ColorTo={col2} />
            )
        }

        let colorColumns = this.state.colors.map((value, index, arr) => {
            let color = new Color(value);
            let key = "color_" + index + '_' + value;
            return (
                <ColorColumn index={index} handleOnClickRemove={this.handleOnClickRemove} Color={color} key={key} />
            );
        });

        for (let i = 0; i < colorColumns.length - 1; i += 2) {
            colorColumns.splice(i + 1, 0, compareColumn(i, colorColumns[i].props.Color, colorColumns[i + 1].props.Color));
        }

        const headerRow = (
            <div className="column">
                <div className="headerBlock">
                    <p>Color</p>
                </div>
                <div className="headerBlock">
                    <p>Grayscale</p>
                </div>
            </div>
        );

        return (
            <div>
                <BlockPicker color={this.state.colorToAdd}
                onChangeComplete={this.colorPickerComplete}
                triangle="hide" />
                <button onClick={this.addColor}>Lägg till</button>
                <div className="columnWrapper">
                    {headerRow}
                    {colorColumns}
                </div>
            </div>
        )
    }
}
// ========================================

class Layout extends React.Component {
    render() {
        return (
            <div>
                <header>Color stuff</header>
                <ColorPickerWrap />
                <footer>Willkommen</footer>
            </div>
        );
    }
}

ReactDOM.render(
    <Layout />,
    document.getElementById('root')
);