'use strict';

import React, { Component, PropTypes } from 'react';

class Container extends Component {
    render() {
        return <div className="preview-container">
            {this.props.children}
        </div>;
    }
}

Container.propTypes = {
    data: React.PropTypes.object,
};

Container.defaultProps = {
    data: {}
};

export default Container;