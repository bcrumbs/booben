/**
 * @author Vladimir Nadygin
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../../../utils/misc';
import { ItemContentStyled } from './styles/ItemContentStyled';
import { ItemButtonExpand } from '../ItemButton/ItemButtonExpand';
import { ButtonsStyled } from '../styles/ButtonsStyled';
import { IconStyled } from '../styles/IconStyled';
import { SpacerStyled } from '../styles/SpacerStyled';

const propTypes = {
  componentId: PropTypes.number.isRequired,
  itemElement: PropTypes.element,
  subLevel: PropTypes.element,
  expanded: PropTypes.bool,
  // visible: PropTypes.bool,
  active: PropTypes.bool,
  selected: PropTypes.bool,
  hovered: PropTypes.bool,
  disabled: PropTypes.bool,
  onExpand: PropTypes.func,
};

const defaultProps = {
  itemElement: null,
  subLevel: null,
  expanded: false,
  visible: false,
  active: false,
  selected: false,
  hovered: false,
  disabled: false,
  onExpand: noop,
};

export class ComponentsTreeItemContent extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this._expandButtonElement = null;
  
    this._saveExpandButtonRef = this._saveExpandButtonRef.bind(this);
  }
  
  componentDidMount() {
    if (this._expandButtonElement) {
      this._expandButtonElement.addEventListener('click', event => {
        if (event.button === 0) this._handleExpand();
      });
    }
  }
  
  _saveExpandButtonRef(ref) {
    this._expandButtonElement = ref;
  }
  
  _handleExpand() {
    const { componentId, expanded, onExpand } = this.props;
    onExpand({ componentId, expanded: !expanded });
  }
  
  render() {
    const { expanded, itemElement, subLevel } = this.props;
    let button = null;
    let spacer = null;

    if (subLevel) {
      button = (
        <ButtonsStyled>
          <IconStyled innerRef={this._saveExpandButtonRef}>
            <ItemButtonExpand
              disabled={this.props.disabled}
              expanded={expanded}
            />
          </IconStyled>
        </ButtonsStyled>
      );
    } else {
      spacer = <SpacerStyled />;
    }
    return (
      <ItemContentStyled
        hovered={this.props.hovered}
        active={this.props.active}
        selected={this.props.selected}
        disabled={this.props.disabled}
      >
        {spacer}
        {button}
        {itemElement}
      </ItemContentStyled>
    );
  }
}


ComponentsTreeItemContent.propTypes = propTypes;
ComponentsTreeItemContent.defaultProps = defaultProps;
ComponentsTreeItemContent.displayName = 'ComponentsTreeItemContent';
