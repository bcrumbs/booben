'use strict';

import React, { Component, PropTypes } from 'react';

import Preview from './Preview';

class App extends Component {
    render() {
        return <Preview routes={this.props.project.routes} />;
    }
}

App.propTypes = {
    project: PropTypes.object
};

App.defaultProps = {
    project: {}
};

export default App;