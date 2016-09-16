'use strict';

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Preview from './Preview';

class App extends Component {
    render() {
        return <Preview routes={this.props.project.data.routes} />;
    }
}

App.propTypes = {
    project: PropTypes.object
};

App.defaultProps = {
    project: {}
};

const mapStateToProps = state => ({
    project: state.project
});

export default connect(
    mapStateToProps
)(App);
