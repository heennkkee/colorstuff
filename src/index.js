import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { ChromePicker } from 'react-color';

class ColorColumn extends React.Component {
    render() {
        function renderColorBlock(col, includeButtons, index = 0, onEdit = null, onRemove = null) {
            let buttons;

            if (includeButtons) {
                buttons = <div className="colorPreviewButtons">
                    <button className="button" onClick={() => onEdit(index)}><i className="fas fa-palette fa-2x"></i></button>
                    <button className="button" onClick={() => onRemove(index)}><i className="fas fa-trash fa-2x"></i></button>
                </div>;
            }

            return (
                <div className="colorBlock">
                    <h3>{col.hex}</h3>
                    <div className="colorPreviewBlock" style={{ backgroundColor: col.hex }}>
                        {buttons}
                    </div>
                </div>
            )
        }


        return (
            <div className="column">
                {renderColorBlock(this.props.Color, true, this.props.index, this.props.handleOnClickEdit, this.props.handleOnClickRemove)}
                {renderColorBlock(this.props.Color.toGrayscale(), false)}
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
                    <table className="contrastTable">
                        <tbody>
                            <tr>
                                <td>Contrast:</td><td><b>{forceTwoDecimals(contrast)}</b></td>
                            </tr><tr className="wcag-level-row">
                                <td colSpan="2">AA</td>
                            </tr><tr>
                                <td>Graphics:</td><td>{checkOrTimes(contrast, 3)}</td>
                            </tr><tr>
                                <td>Normal text:</td><td>{checkOrTimes(contrast, 4.5)}</td>
                            </tr><tr>
                                <td>Large text:</td><td>{checkOrTimes(contrast, 3)}</td>
                            </tr><tr className="wcag-level-row">
                                <td colSpan="2">AAA</td>
                            </tr><tr>
                                <td>Normal text:</td><td>{checkOrTimes(contrast, 7)}</td>
                            </tr><tr>
                                <td>Large text:</td><td>{checkOrTimes(contrast, 4.5)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        }

        function forceTwoDecimals(val) {
            const strVal = String(val);
            let decimals = strVal.split(".")[1];

            if (decimals === undefined) {
                return strVal + ".00";
            } else if (decimals.length === 1) {
                return strVal + "0";
            } else {
                return strVal;
            }
        }

        function checkOrTimes(value, limit) {
            if (value >= limit) {
                return <i className="icon-positive fas fa-check"></i>
            }
            return <i className="icon-negative fas fa-times"></i>
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
            this.RGB = { red: r, green: g, blue: b };
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
                '#000000',
                '#6F6F6F'
            ],
            colorToAdd: '#000000',
            editingIndex: null
        }

        this.editColorBackup = null;

        this.handleOnClickRemove = this.handleOnClickRemove.bind(this);
        this.addColor = this.addColor.bind(this);
        this.handleAddColorChange = this.handleAddColorChange.bind(this);
        this.handleOnClickEdit = this.handleOnClickEdit.bind(this);
        this.handleEditColorChange = this.handleEditColorChange.bind(this);
        this.saveEditing = this.saveEditing.bind(this);
        this.abortEditing = this.abortEditing.bind(this);
    }

    handleEditColorChange(color) {
        let colors = this.state.colors.slice();
        colors[this.state.editingIndex] = color.hex;
        this.setState({ colors: colors });
    }

    handleAddColorChange(color) {
        this.setState({colorToAdd: color.hex});
    }

    saveEditing() {
        this.setState({ editingIndex: null });
    }

    abortEditing() {
        let colors = this.state.colors.slice();
        colors[this.state.editingIndex] = this.editColorBackup;
        this.setState({ colors: colors, editingIndex: null });
    }

    handleOnClickEdit(index) {
        let colors = this.state.colors.slice();
        this.editColorBackup = colors[index];
        console.log(this.editColorBackup);

        this.setState({ editingIndex: index });
    }

    addColor() {
        let colors = this.state.colors.slice();
        colors.push(this.state.colorToAdd);
        
        this.setState({ colors: colors, colorToAdd: '#000000' });
    }

    handleOnClickRemove(index) {
        let colors = this.state.colors.slice();
        colors.splice(index, 1);
        this.setState({ colors: colors, editingIndex: null });
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
                <ColorColumn index={index}
                    handleOnClickRemove={this.handleOnClickRemove}
                    Color={color}
                    key={key}
                    handleOnClickEdit={this.handleOnClickEdit}
                />
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

        let editColor;
        if (this.state.editingIndex !== null) {

            editColor = <div style={{ display: 'inline-block', margin: '10px 10px 10px 150px' }}>
                <ChromePicker
                    color={this.state.colors[this.state.editingIndex]}
                    onChange={this.handleEditColorChange}
                />
                <button
                    onClick={this.saveEditing}
                    className="button"
                ><i className="fas fa-check"></i> Select</button>
                <button
                    onClick={this.abortEditing}
                    className="button"
                ><i className="fas fa-undo"></i> Cancel</button>
            </div>

        }

        return (
            <>
                <div style={{ display: 'inline-block', margin: '10px' }}>
                    <ChromePicker color={this.state.colorToAdd}
                        onChange={this.handleAddColorChange} />
                    <button className="button" onClick={this.addColor}><i className="fas fa-plus"></i> Add</button>
                </div>

                {editColor}

                <div className="columnWrapper">
                    {headerRow}
                    {colorColumns}
                </div>
            </>
        )
    }
}
// ========================================

class Layout extends React.Component {
    render() {
        return (
            <div>
                <header className="header">Color contrasts</header>
                <div className="wrapper main">
                    <ColorPickerWrap />
                    <p>Made by Henrik</p>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <Layout />,
    document.getElementById('root')
);