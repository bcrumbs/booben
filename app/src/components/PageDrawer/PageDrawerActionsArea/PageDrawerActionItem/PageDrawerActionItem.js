import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactackle-button';
import { withTooltip } from 'reactackle-tooltip';
import { noop } from '../../../../utils/misc';

import {
  PageDrawerActionItemStyled,
} from './styles/PageDrawerActionItemStyled';

const propTypes = {
  showTooltip: PropTypes.func.isRequired,
  hideTooltip: PropTypes.func.isRequired,
  Tooltip: PropTypes.func.isRequired,
  icon: PropTypes.element,
  title: PropTypes.string,
  isActive: PropTypes.bool,
  onPress: PropTypes.func,
  colorScheme: PropTypes.oneOf(['dark', 'light']),
};

const defaultProps = {
  icon: null,
  title: '',
  isActive: false,
  onPress: noop,
  colorScheme: 'dark',
};

const _PageDrawerActionItem = props => {
  const buttonColorScheme = props.colorScheme === 'dark'
    ? 'flatLight'
    : 'flat';

  const button = (
    <Button
      icon={props.icon}
      radius="none"
      size="normal"
      colorScheme={buttonColorScheme}
      onPress={props.onPress}
    />
  );

  if (props.title) {
    const TooltipComponent = props.Tooltip;

    /* eslint-disable react/jsx-handler-names */
    return (
      <PageDrawerActionItemStyled
        active={props.isActive}
        onMouseEnter={props.showTooltip}
        onMouseLeave={props.hideTooltip}
      >
        {button}
        <TooltipComponent>{props.title}</TooltipComponent>
      </PageDrawerActionItemStyled>
    );
    /* eslint-enable react/jsx-handler-names */
  } else {
    return (
      <PageDrawerActionItemStyled>
        {button}
      </PageDrawerActionItemStyled>
    );
  }
};

_PageDrawerActionItem.propTypes = propTypes;
_PageDrawerActionItem.defaultProps = defaultProps;
_PageDrawerActionItem.displayName = 'PageDrawerActionItem';

export const PageDrawerActionItem = withTooltip(_PageDrawerActionItem, true);
