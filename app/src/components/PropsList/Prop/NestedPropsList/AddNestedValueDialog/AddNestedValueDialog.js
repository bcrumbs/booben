/**
 * @author Dmitriy Bizyaev
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TextField, Button } from '@reactackle/reactackle';
import { noop, returnArg } from '../../../../../utils/misc';
import { FieldNewStyled } from './styles/FieldNewStyled';
import { TitleRowStyled } from './styles/TitleRowStyled';
import { ContentStyled } from './styles/ContentStyled';
import { ButtonsRowStyled } from './styles/ButtonsRowStyled';

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
    const { onSave } = this.props;
    const { name } = this.state;

    onSave({ name });
  }
  
  render() {
    const { getLocalizedText, onCancel } = this.props;
    const { name } = this.state;
    
    const saveButtonIsDisabled = name === '';
    
    return (
      <FieldNewStyled>
        <TitleRowStyled>
          {getLocalizedText('valueEditor.addValueDialogTitle')}
        </TitleRowStyled>
    
        <ContentStyled>
          <TextField
            dense
            label={getLocalizedText('valueEditor.addValueNameInputLabel')}
            value={name}
            onChange={this._handleNameChange}
          />
        </ContentStyled>
    
        <ButtonsRowStyled>
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
        </ButtonsRowStyled>
      </FieldNewStyled>
    );
  }
}

AddNestedValueDialog.propTypes = propTypes;
AddNestedValueDialog.defaultProps = defaultProps;
AddNestedValueDialog.displayName = 'AddNestedValueDialog';
