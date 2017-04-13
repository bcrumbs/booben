/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// TODO: Finish it

import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  position: PropTypes.oneOf(['horizontal', 'vertical']),
};

const defaultProps = {
  position: 'horizontal',
};

export const PaneRuler = props => {
  const rulerPoints = null;
  
  return (
    <div className={`construction-pane_ruler ruler_position-${props.position}`}>
      {rulerPoints}
    </div>
  );
};

PaneRuler.propTypes = propTypes;
PaneRuler.defaultProps = defaultProps;
PaneRuler.displayName = 'PaneRuler';
