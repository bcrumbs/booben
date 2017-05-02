/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Canvas } from '../containers/Canvas/Canvas';
import { containerStyleSelector } from '../selectors';

const propTypes = {
  match: PropTypes.object.isRequired, // router
  containerStyle: PropTypes.string.isRequired, // state
};

const defaultProps = {
};

const mapStateToProps = state => ({
  containerStyle: containerStyleSelector(state),
});

const wrap = connect(mapStateToProps);

const PreviewRouteComponent = props => (
  <Canvas
    projectName={props.match.params.projectName}
    containerStyle={props.containerStyle}
  />
);

PreviewRouteComponent.propTypes = propTypes;
PreviewRouteComponent.defaultProps = defaultProps;
PreviewRouteComponent.displayName = 'PreviewRoute';

export default wrap(PreviewRouteComponent);
