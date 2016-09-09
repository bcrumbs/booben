import React, { Component, PropTypes } from 'react';
import * as Reactackle from '@reactackle/reactackle';

/**
 * class Builder
 */
class Builder extends Component {
    /**
     * Build React component by metadata
     * 
     * @param  {Object} data - Scheme for preview app
     * @return {function} React component for render
     */
    getComponentFromMeta(data = null) {
        if(data) {
            if(Array.isArray(data)) {
                if(data.length == 1 && data[0] == 'outlet') {
                    return this.props.children;
                }

                return data.map((item) => {
                    return this.getComponentFromMeta(item);
                });
            } else {
                let _component = getComponentByName(data['name']);

                return <_component {...getProps(data['props'])}>
                    { this.getComponentFromMeta(data['children']) }
                </_component>;
            }
        } else {
            return null;
        }
    }

    render() {
        return <div>
            {this.getComponentFromMeta(this.props.data)}
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

/**
 * Props constructor by meta
 * @param  {Object} props
 * @return {Object}
 */
const getProps = (props = {}) => {
    if(props.source == 'static') {
        return props.sourceData.SourceDataStatic;
    }

    return {};
}


export default Builder;