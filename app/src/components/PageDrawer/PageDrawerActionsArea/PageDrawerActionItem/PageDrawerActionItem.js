import React from 'react';
import PropTypes from 'prop-types';
import { Button, withTooltip } from '@reactackle/reactackle';
import { noop } from '../../../../utils/misc';

import {
  PageDrawerActionItemStyled,
} from './styles/PageDrawerActionItemStyled';

const propTypes = {
  showTooltip: PropTypes.func.isRequired,
  hideTooltip: PropTypes.func.isRequired,
  Tooltip: PropTypes.func.isRequired,
  icon: PropTypes.string,
  title: PropTypes.string,
  isActive: PropTypes.bool,
  onPress: PropTypes.func,
  colorScheme: PropTypes.oneOf(['dark', 'light']),
};

const defaultProps = {
  icon: '',
  title: '',
  isActive: false,
  onPress: noop,
  colorScheme: 'dark',
};

const _PageDrawerActionItem = props => {
  const buttonColorScheme = props.colorScheme === 'dark'
    ? 'flatLight'
    : 'flat';
  
  let button = null;
  if (props.icon) {
    button = (
      <Button
        icon={{ name: props.icon }}
        onPress={props.onPress}
        radius="none"
        size="normal"
        colorScheme={buttonColorScheme}
      />
    );
  } else {
    button = (
      <Button
        text={{ name: props.title }}
        onPress={props.onPress}
        radius="none"
        size="normal"
        colorScheme={buttonColorScheme}
      />
    );
  }
  
  if (props.title) {
    const TooltipComponent = props.Tooltip;
  
    /* eslint-disable react/jsx-handler-names */
    return (
      <PageDrawerActionItemStyled
        onMouseEnter={props.showTooltip}
        onMouseLeave={props.hideTooltip}
        active={props.isActive}
      >
        {button}
        <TooltipComponent text={props.title} />
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
