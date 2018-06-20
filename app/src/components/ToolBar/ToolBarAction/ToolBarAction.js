import React from 'react';
import PropTypes from 'prop-types';
import _pick from 'lodash.pick';
import { Button } from 'reactackle-button';
import { Theme } from 'reactackle-core';
import { withTooltip } from 'reactackle-tooltip';
import { ToolBarActionStyled } from './styles/ToolBarActionStyled';
import reactackleThemeMixin from './styles/reactackle-theme-mixin';
import { noop } from '../../../utils/misc';

const propTypes = {
  ...Button.propTypes,
  tooltipText: PropTypes.string,
  Tooltip: PropTypes.func.isRequired,
  showTooltip: PropTypes.func.isRequired,
  hideTooltip: PropTypes.func.isRequired,
};

const defaultProps = {
  ...Button.defaultProps,
  tooltipText: '',
};

const buttonProps = Object.keys(Button.propTypes);

const _ToolBarAction = props => {
  const { tooltipText, Tooltip, showTooltip, hideTooltip } = props;

  const hasTooltip = tooltipText !== '';

  const onMouseEnter = hasTooltip ? showTooltip : noop;
  const onMouseLeave = hasTooltip ? hideTooltip : noop;
  const tooltipElement = hasTooltip
    ? <Tooltip>{tooltipText}</Tooltip>
    : null;

  return (
    <ToolBarActionStyled
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Theme mixin={reactackleThemeMixin}>
        <Button
          {..._pick(props, buttonProps)}
          radius="none"
          colorScheme="flatLight"
        />
      </Theme>

      {tooltipElement}
    </ToolBarActionStyled>
  );
};

_ToolBarAction.propTypes = propTypes;
_ToolBarAction.defaultProps = defaultProps;
_ToolBarAction.displayName = 'ToolBarAction';

export const ToolBarAction = withTooltip(_ToolBarAction);
