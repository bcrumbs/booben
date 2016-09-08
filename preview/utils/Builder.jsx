import React, { Component, PropTypes } from 'react';
import * as Reactackle from '@reactackle/reactackle';

/**
 * class Builder
 */
class Builder extends Component {
    render() {
        return <div>
            {getComponentFromMeta(this.props.data)}
        </div>;
    }
}

Builder.propTypes = {
    data: PropTypes.array
};

Builder.defaultProps = {
    data: []
};

/**
 * Get component from UI library
 * 
 * @param  {string} name - Name of React components
 * @return {function} React component for render
 */
const getComponentByName = (name = '') => {
    return Reactackle[name];
}

class Test extends Component {
    render() {
        return <div>TEST</div>;
    }
}

/**
 * Build React component by metadata
 * 
 * @param  {Object} data - Scheme for preview app
 * @return {function} React component for render
 */
const getComponentFromMeta = (data = null) => {
    if(data) {
        if(Array.isArray(data)) {
            return data.map((item) => {
                return getComponentFromMeta(item);
            });
        } else {
            let _component = getComponentByName(data['name']);

            return <_component>
                { getComponentFromMeta(data['children']) }
            </_component>;
        }
    } else {
        return null;
    }
}

export default Builder;