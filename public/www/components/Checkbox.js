"use strict";

import React, { PropTypes } from "react";

export default class Checkbox extends React.Component {
    static propTypes = {
        name:     PropTypes.string.isRequired,
        label:    PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        checked:  PropTypes.bool
    };

    static defaultProps = {
        checked: false
    };

    render() {
        const {
            checked: bChecked,
            label:   sLabel
        } = this.props;

        return (
            <div className="field">
                <div ref="checkbox" className="ui checkbox">
                    <input type="checkbox" tabIndex="0" className="hidden" checked={bChecked} />
                    <label>{sLabel}</label>
                </div>
            </div>
        )
    }

    componentDidMount() {
        $(this.refs.checkbox).checkbox({
            onChecked:   oEvent => this.onChange(true),
            onUnchecked: oEvent => this.onChange(false),
        });
    }

    onChange(bChecked) {
        this.props.onChange(this.props.name, bChecked);
    }
}