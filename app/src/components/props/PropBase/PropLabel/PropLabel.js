import React from 'react';
import PropTypes from 'prop-types';
import { TooltipIcon } from 'reactackle-tooltip-icon';
import { TypeStyled } from './styles/TypeStyled';
import { LabelStyled } from './styles/LabelStyled';
import { LabelTextStyled } from './styles/LabelTextStyled';
import { TooltipBoxStyled } from './styles/TooltipBoxStyled';

const propTypes = {
  label: PropTypes.string.isRequired,
  secondaryLabel: PropTypes.string,
  tooltip: PropTypes.string,
  positionTop: PropTypes.bool,
  itemCheckable: PropTypes.bool,
};

const defaultProps = {
  secondaryLabel: '',
  tooltip: '',
  positionTop: false,
  itemCheckable: false,
};

export const PropLabel = props => {
  let tooltip = null;
  if (props.tooltip) {
    tooltip = (
      <TooltipBoxStyled>
        <TooltipIcon text={props.tooltip} />
      </TooltipBoxStyled>
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
    <LabelStyled
      positionTop={props.positionTop}
      itemCheckable={props.itemCheckable}
    >
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
