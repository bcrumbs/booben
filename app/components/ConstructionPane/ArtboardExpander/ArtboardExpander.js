/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  position: PropTypes.oneOf(['horizontal', 'vertical', 'entire']),
};

const defaultProps = {
  position: 'horizontal',
};

export const ArtboardExpander = props => {
  const className =
    'construction-pane_artboard-expander ' +
    `artboard-expander_position-${props.position}`;
  
  return (
    <div className={className}>
      <div className="construction-pane_artboard-expander_icon" />
    </div>
  );
};

ArtboardExpander.propTypes = propTypes;
ArtboardExpander.defaultProps = defaultProps;
ArtboardExpander.displayName = 'ArtboardExpander';
