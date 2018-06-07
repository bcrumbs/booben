import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import { noop } from '../../../../utils/misc';
import { TreeItemContent } from '../../../Tree';

const propTypes = {
  ...TreeItemContent.propTypes,

  componentId: PropTypes.number.isRequired,
  expanded: PropTypes.bool,
  active: PropTypes.bool,
  selected: PropTypes.bool,
  hovered: PropTypes.bool,
  disabled: PropTypes.bool,
  onExpand: PropTypes.func,
  onHover: PropTypes.func,
  onSelect: PropTypes.func,
  elementRef: PropTypes.func,
};

const defaultProps = {
  ...TreeItemContent.defaultProps,

  expanded: false,
  active: false,
  selected: false,
  hovered: false,
  disabled: false,
  onExpand: noop,
  onHover: noop,
  onSelect: noop,
  elementRef: noop,
};

export class ComponentsTreeItemContent extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._expandButtonElement = null;

    this._saveExpandButtonRef = this._saveExpandButtonRef.bind(this);
    this._handleHoverIn = this._handleHoverIn.bind(this);
    this._handleHoverOut = this._handleHoverOut.bind(this);
    this._handleClick = this._handleClick.bind(this);
    this._saveItemContentRef = this._saveItemContentRef.bind(this);
  }

  componentDidMount() {
    if (this._expandButtonElement) {
      this._expandButtonElement.addEventListener('click', event => {
        if (event.button === 0) this._handleExpand();
      });

      this._expandButtonElement.addEventListener('mousedown', event => {
        event.stopPropagation();
      });
    }
  }

  _saveExpandButtonRef(ref) {
    this._expandButtonElement = ref;
  }

  _handleHoverIn() {
    const { componentId, disabled, onHover } = this.props;
    if (!disabled) onHover({ componentId, hovered: true });
  }

  _handleHoverOut() {
    const { componentId, disabled, onHover } = this.props;
    if (!disabled) onHover({ componentId, hovered: false });
  }

  _handleExpand() {
    const { componentId, expanded, onExpand } = this.props;
    onExpand({ componentId, expanded: !expanded });
  }

  _handleClick(event) {
    const { componentId, active, disabled, onSelect } = this.props;
    if (!disabled) {
      event.stopPropagation();
      onSelect({ componentId, selected: !active });
    }
  }

  _saveItemContentRef(ref) {
    const { componentId, elementRef } = this.props;
    elementRef({ componentId, ref });
  }

  render() {
    return (
      <TreeItemContent
        {...this.props}
        onMouseOver={this._handleHoverIn}
        onMouseOut={this._handleHoverOut}
        onClick={this._handleClick}
        innerRef={this._saveItemContentRef}
        expandButtonRef={this._saveExpandButtonRef}
      />
    );
  }
}

ComponentsTreeItemContent.propTypes = propTypes;
ComponentsTreeItemContent.defaultProps = defaultProps;
