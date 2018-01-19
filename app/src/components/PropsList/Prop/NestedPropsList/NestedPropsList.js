import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactackle-button';
import { ActionsRowStyled } from './styles/ActionsRowStyled';
import { PropsListStyled } from '../../styles/PropsListStyled';

import {
  AddNestedValueDialog,
} from './AddNestedValueDialog/AddNestedValueDialog';

import { noop, returnArg } from '../../../../utils/misc';
import { IconAdd } from '../../../icons';

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
  constructor(props, context) {
    super(props, context);
    
    this.state = {
      isTitleDialogVisible: false,
      name: '',
    };
    
    this._handleAddButtonPress = this._handleAddButtonPress.bind(this);
    this._handleAdd = this._handleAdd.bind(this);
    this._handleCancelAdd = this._handleCancelAdd.bind(this);
  }
  
  _handleAddButtonPress() {
    const { askNameOnAdd, onAdd } = this.props;

    if (askNameOnAdd) {
      this.setState({
        isTitleDialogVisible: true,
        name: '',
      });
    } else {
      onAdd({});
    }
  }
  
  _handleAdd({ name }) {
    const { onAdd } = this.props;

    this.setState({
      isTitleDialogVisible: false,
    });
    
    onAdd({ name });
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
        <ActionsRowStyled>
          <Button
            text={getLocalizedText('valueEditor.addValue')}
            icon={<IconAdd />}
            size="small"
            narrow
            onPress={this._handleAddButtonPress}
          />
        </ActionsRowStyled>
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
      <PropsListStyled>
        {children}
        {addButton}
        {titleDialog}
      </PropsListStyled>
    );
  }
}

NestedPropsList.propTypes = propTypes;
NestedPropsList.defaultProps = defaultProps;
NestedPropsList.displayName = 'NestedPropsList';
