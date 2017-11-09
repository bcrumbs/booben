import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@reactackle/reactackle';
import { noop } from '../../../utils/misc';
import { TreeItemStyled } from './styles/TreeItemStyled';
import { ItemContentStyled } from './styles/ItemContentStyled';
import { IconStyled } from './styles/IconStyled';

const propTypes = {
  componentId: PropTypes.number.isRequired,
  itemElement: PropTypes.element,
  expanded: PropTypes.bool,
  onExpand: PropTypes.func,
};

const defaultProps = {
  itemElement: null,
  expanded: false,
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
    let icon = null;

    if (children) {
      if (expanded) content = children;
      
      icon = (
        <IconStyled
          expanded={expanded}
          innerRef={this._saveExpandButtonRef}
        >
          <Button
            icon={{ name: 'chevron-down' }}
            size="small"
            radius="rounded"
          />
        </IconStyled>
      );
    }

    return (
      <TreeItemStyled>
        <ItemContentStyled noSublevel={!children}>
          {icon}
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
