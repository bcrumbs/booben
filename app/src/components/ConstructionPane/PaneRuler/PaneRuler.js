// TODO: Finish it

import React from 'react';
import PropTypes from 'prop-types';
import { PaneRulerStyled } from './styles/PaneRulerStyled';

const propTypes = {
  position: PropTypes.oneOf(['horizontal', 'vertical']),
};

const defaultProps = {
  position: 'horizontal',
};

export const PaneRuler = props => {
  const rulerPoints = null;
  
  return (
    <PaneRulerStyled position={props.position}>
      {rulerPoints}
    </PaneRulerStyled>
  );
};

PaneRuler.propTypes = propTypes;
PaneRuler.defaultProps = defaultProps;
PaneRuler.displayName = 'PaneRuler';
