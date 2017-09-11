import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../../utils/misc';
import { ItemButtonExpand } from './ItemButton/ItemButtonExpand';
import { TreeItemStyled } from './styles/TreeItemStyled';
import { ItemContentStyled } from './styles/ItemContentStyled';
import { ButtonsStyled } from './styles/ButtonsStyled';
import { IconStyled } from './styles/IconStyled';
import { SpacerStyled } from './styles/SpacerStyled';

const propTypes = {
  componentId: PropTypes.number.isRequired,
  itemElement: PropTypes.element,
  expanded: PropTypes.bool,
  visible: PropTypes.bool,
  onExpand: PropTypes.func,
};

const defaultProps = {
  itemElement: null,
  expanded: false,
  visible: false,
  onExpand: noop,
};


export class ComponentsTreeItem extends PureComponent {
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
    const { expanded, itemElement, children } = this.props;

    let content = null;
    let button = null;
    let spacer = null;

    if (children) {
      if (expanded) content = children;
      
      button = (
        <ButtonsStyled>
          <IconStyled innerRef={this._saveExpandButtonRef}>
            <ItemButtonExpand expanded={expanded} />
          </IconStyled>
        </ButtonsStyled>
      );
    } else {
      spacer = <SpacerStyled />;
    }

    return (
      <TreeItemStyled>
        <ItemContentStyled>
          {spacer}
          {button}
          {itemElement}
        </ItemContentStyled>

        {content}
      </TreeItemStyled>
    );
  }
}

ComponentsTreeItem.propTypes = propTypes;
ComponentsTreeItem.defaultProps = defaultProps;
ComponentsTreeItem.displayName = 'ComponentsTreeItem';

export * from './ComponentsTreeItemTitle/ComponentsTreeItemTitle';
