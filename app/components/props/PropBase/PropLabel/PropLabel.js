'use strict';

// noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { TooltipIcon } from '@reactackle/reactackle';

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
      <span className="prop-item_type">
        {props.secondaryLabel}
      </span>
    );
  }

  return (
    <label className="prop-item-label">
      <div className="prop-item_label-wrapper">
        <span className="prop-item_label-text">
          {props.label}
        </span>

        {secondaryLabel}
        {tooltip}
      </div>
    </label>
  );
};

PropLabel.propTypes = propTypes;
PropLabel.defaultProps = defaultProps;
PropLabel.displayName = 'PropLabel';
