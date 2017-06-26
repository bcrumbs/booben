/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { withTooltip } from '@reactackle/reactackle';
import { CursorStyled } from './styles/CursorStyled';

const propTypes = {
  showTooltip: PropTypes.func.isRequired,
  hideTooltip: PropTypes.func.isRequired,
  Tooltip: PropTypes.func.isRequired,
  tooltipText: PropTypes.string,
};

const defaultProps = {
  tooltipText: 'Move cursor - CRTL + ↓ / ↑. Check out help page for more info.',
};

export const _ComponentsTreeCursor = props => {
  const TooltipComponent = props.Tooltip;
  
  return (
    <CursorStyled
      onMouseEnter={props.showTooltip}
      onMouseLeave={props.hideTooltip}
    >
      <TooltipComponent text={props.tooltipText} />
    </CursorStyled>
  );
};

_ComponentsTreeCursor.propTypes = propTypes;
_ComponentsTreeCursor.defaultProps = defaultProps;
_ComponentsTreeCursor.displayName = 'ComponentsTreeCursor';
export const ComponentsTreeCursor = withTooltip(_ComponentsTreeCursor, true);
