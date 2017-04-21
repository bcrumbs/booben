/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Canvas } from '../containers/Canvas/Canvas';
import store from '../store';
import { containerStyleSelector } from '../selectors';

const propTypes = {
  params: PropTypes.shape({
    projectName: PropTypes.string.isRequired,
  }).isRequired,
  
  containerStyle: PropTypes.string.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
  containerStyle: containerStyleSelector(state),
});

const PreviewRouteComponent = props => (
  <Canvas
    projectName={props.params.projectName}
    store={store}
    containerStyle={props.containerStyle}
  />
);

PreviewRouteComponent.propTypes = propTypes;
PreviewRouteComponent.defaultProps = defaultProps;
PreviewRouteComponent.displayName = 'PreviewRoute';

export default connect(mapStateToProps)(PreviewRouteComponent);
