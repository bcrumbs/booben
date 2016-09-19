'use strict';

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Preview from './Preview';

class App extends Component {
    render() {
        return <Preview
            routes={this.props.routes}
            canSelected={this.props.canSelected}
        />;
    }
}

App.propTypes = {
    routes: PropTypes.object,
    canSelected: PropTypes.bool
};

App.defaultProps = {
    routes: {},
    canSelected: false
};

const mapStateToProps = state => ({
    routes: state.project.data.routes
});

export default connect(
    mapStateToProps
)(App);
