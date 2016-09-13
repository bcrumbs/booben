'use strict';

import React, { Component, PropTypes } from 'react';

class Overlay extends Component {
    render() {
        const style = {
            'bottom': 0,
            'top': 0,
            'position': 'absolute',
            'left': 0,
            'right': 0,
            'zIndex': 1
        };

        console.log(this.props.selected);

        return <div style={style}/>;
    }
}

export default Overlay;