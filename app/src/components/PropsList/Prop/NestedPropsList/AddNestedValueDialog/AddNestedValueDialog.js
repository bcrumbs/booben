/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from '@reactackle/reactackle';
import { noop, returnArg } from '../../../../../utils/misc';

const propTypes = {
  getLocalizedText: PropTypes.func,
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
  onSave: noop,
  onCancel: noop,
};

export class AddNestedValueDialog extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this.state = {
      name: '',
    };
    
    this._handleNameChange = this._handleNameChange.bind(this);
    this._handleSave = this._handleSave.bind(this);
  }
  
  _handleNameChange({ value }) {
    this.setState({ name: value });
  }
  
  _handleSave() {
    this.props.onSave({ name: this.state.name });
  }
  
  render() {
    const { getLocalizedText, onCancel } = this.props;
    const { name } = this.state;
    
    const saveButtonIsDisabled = !name;
    
    return (
      <div className="prop-tree_field-new">
        <div className="prop-tree_field-new_row field-new_title">
          {getLocalizedText('valueEditor.addValueDialogTitle')}
        </div>
    
        <div className="prop-tree_field-new_row">
          <Input
            stateless
            dense
            label={getLocalizedText('valueEditor.addValueNameInputLabel')}
            value={name}
            onChange={this._handleNameChange}
          />
        </div>
    
        <div className="prop-tree_field-new_row field-new_buttons">
          <Button
            narrow
            text={getLocalizedText('common.save')}
            disabled={saveButtonIsDisabled}
            onPress={this._handleSave}
          />
      
          <Button
            narrow
            text={getLocalizedText('common.cancel')}
            onPress={onCancel}
          />
        </div>
      </div>
    );
  }
}

AddNestedValueDialog.propTypes = propTypes;
AddNestedValueDialog.defaultProps = defaultProps;
AddNestedValueDialog.displayName = 'AddNestedValueDialog';
