'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { TooltipIcon } from '@reactackle/reactackle';
import { TypeStyled } from './styles/TypeStyled';
import { LabelStyled } from './styles/LabelStyled';
import { LabelTextStyled } from './styles/LabelTextStyled';

const propTypes = {
  label: PropTypes.string.isRequired,
  secondaryLabel: PropTypes.string,
  tooltip: PropTypes.string,
  colorScheme: PropTypes.oneOf(['dark', 'light']),
};

const defaultProps = {
  secondaryLabel: '',
  tooltip: '',
  colorScheme: 'dark',
};

export const PropLabel = props => {
  let tooltip = null;
  if (props.tooltip) {
    tooltip = (
      <TooltipIcon text={props.tooltip} />
    );
  }

  let secondaryLabel = null;
  if (props.secondaryLabel) {
    secondaryLabel = (
      <TypeStyled>
        {props.secondaryLabel}
      </TypeStyled>
    );
  }

  return (
    <LabelStyled colorScheme={props.colorScheme}>
      <LabelTextStyled>
        {props.label}
      </LabelTextStyled>

      {secondaryLabel}
      {tooltip}
    </LabelStyled>
  );
};

PropLabel.propTypes = propTypes;
PropLabel.defaultProps = defaultProps;
PropLabel.displayName = 'PropLabel';
