/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';

import {
  AddNestedValueDialog,
} from './AddNestedValueDialog/AddNestedValueDialog';

import { noop, returnArg } from '../../../../utils/misc';

const propTypes = {
  hasAddButton: PropTypes.bool,
  askNameOnAdd: PropTypes.bool,
  getLocalizedText: PropTypes.func,
  onAdd: PropTypes.func,
};

const defaultProps = {
  hasAddButton: false,
  askNameOnAdd: false,
  getLocalizedText: returnArg,
  onAdd: noop,
};

export class NestedPropsList extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      isTitleDialogVisible: false,
      name: '',
    };
    
    this._handleAddButtonPress = this._handleAddButtonPress.bind(this);
    this._handleAdd = this._handleAdd.bind(this);
    this._handleCancelAdd = this._handleCancelAdd.bind(this);
  }
  
  _handleAddButtonPress() {
    if (this.props.askNameOnAdd) {
      this.setState({
        isTitleDialogVisible: true,
        name: '',
      });
    } else {
      this.props.onAdd({});
    }
  }
  
  _handleAdd({ name }) {
    this.setState({
      isTitleDialogVisible: false,
    });
    
    this.props.onAdd({ name });
  }
  
  _handleCancelAdd() {
    this.setState({
      isTitleDialogVisible: false,
    });
  }
  
  render() {
    const { getLocalizedText, hasAddButton, children } = this.props;
    const { isTitleDialogVisible } = this.state;
    
    let addButton = null;
    if (hasAddButton && !isTitleDialogVisible) {
      addButton = (
        <div className="prop-tree-item-action-row">
          <Button
            text={getLocalizedText('addValue')}
            icon="plus"
            size="small"
            narrow
            onPress={this._handleAddButtonPress}
          />
        </div>
      );
    }
    
    let titleDialog = null;
    if (isTitleDialogVisible) {
      titleDialog = (
        <AddNestedValueDialog
          getLocalizedText={getLocalizedText}
          onSave={this._handleAdd}
          onCancel={this._handleCancelAdd}
        />
      );
    }
    
    return (
      <div className="prop-tree_list">
        {children}
        {addButton}
        {titleDialog}
      </div>
    );
  }
}

NestedPropsList.propTypes = propTypes;
NestedPropsList.defaultProps = defaultProps;
NestedPropsList.displayName = 'NestedPropsList';
