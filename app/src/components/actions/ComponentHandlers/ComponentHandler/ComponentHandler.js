import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TooltipIcon } from 'reactackle-tooltip-icon';
import { noop } from '../../../../utils/misc';
import { IconArrowChevronRight } from '../../../icons';
import { HandlerStyled } from './styles/HandlerStyled';
import { HandlerHeadingStyled } from './styles/HandlerHeadingStyled';
import { HandlerTitleStyled } from './styles/HandlerTitleStyled';
import { HandlerTitleTextStyled } from './styles/HandlerTitleTextStyled';
import { HandlerIconStyled } from './styles/HandlerIconStyled';
import { HandlerBodyStyled } from './styles/HandlerBodyStyled';

const propTypes = {
  id: PropTypes.any.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  hasActions: PropTypes.bool,
  expanded: PropTypes.bool,
  onExpand: PropTypes.func,
};

const defaultProps = {
  title: '',
  description: '',
  hasActions: false,
  expanded: false,
  onExpand: noop,
};

export class ComponentHandler extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._handleExpandButtonClick = this._handleExpandButtonClick.bind(this);
  }

  _handleExpandButtonClick(event) {
    const { id, onExpand } = this.props;

    if (event.button === 0) {
      onExpand({ handlerId: id });
    }
  }

  render() {
    const { title, description, hasActions, expanded, children } = this.props;

    let content = null;
    if (expanded && children) {
      content = (
        <HandlerBodyStyled>
          {children}
        </HandlerBodyStyled>
      );
    }

    let tooltip = null;
    if (description) {
      tooltip = (
        <TooltipIcon text={description} />
      );
    }

    return (
      <HandlerStyled>
        <HandlerHeadingStyled onClick={this._handleExpandButtonClick}>
          <HandlerTitleStyled active={hasActions}>
            <HandlerTitleTextStyled>
              {title}
            </HandlerTitleTextStyled>

            {tooltip}
          </HandlerTitleStyled>

          <HandlerIconStyled expanded={expanded}>
            <IconArrowChevronRight />
          </HandlerIconStyled>
        </HandlerHeadingStyled>

        {content}
      </HandlerStyled>
    );
  }
}

ComponentHandler.propTypes = propTypes;
ComponentHandler.defaultProps = defaultProps;
ComponentHandler.displayName = 'ComponentHandler';
