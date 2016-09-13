/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import {
    Content
} from '@reactackle/reactackle';

class StructureRoute extends Component {
    render() {
        return (
            <Content>

            </Content>
        )
    }
}

StructureRoute.propTypes = {
    routes: PropTypes.arrayOf(PropTypes.object).isRequired
};

StructureRoute.displayName = 'StructureRoute';

const mapStateToProps = state => ({
    routes: state.project.data.routes
});

export default connect(mapStateToProps)(StructureRoute);
