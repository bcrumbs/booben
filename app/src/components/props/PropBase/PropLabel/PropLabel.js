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
};

const defaultProps = {
  secondaryLabel: '',
  tooltip: '',
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
    <LabelStyled>
      <div>
        <LabelTextStyled>
          {props.label}
        </LabelTextStyled>

        {secondaryLabel}
        {tooltip}
      </div>
    </LabelStyled>
  );
};

PropLabel.propTypes = propTypes;
PropLabel.defaultProps = defaultProps;
PropLabel.displayName = 'PropLabel';
