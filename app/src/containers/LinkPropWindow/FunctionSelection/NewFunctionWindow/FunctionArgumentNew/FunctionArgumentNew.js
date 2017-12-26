import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TypeNames } from '@jssy/types';

import {
  Form,
  FormItem,
  TextField,
  SelectBox,
  Button,
} from '@reactackle/reactackle';

import {
  BlockContentBoxGroup,
  BlockContentBoxItem,
  BlockContentBoxHeading,
} from '../../../../../components/BlockContent';

import { returnArg, noop } from '../../../../../utils/misc';
import { ButtonRowStyled } from './styles/ButtonRowStyled';

const propTypes = {
  existingArgNames: PropTypes.arrayOf(PropTypes.string),
  getLocalizedText: PropTypes.func,
  onAdd: PropTypes.func,
  onCancel: PropTypes.func,
};

const defaultProps = {
  existingArgNames: [],
  getLocalizedText: returnArg,
  onAdd: noop,
  onCancel: noop,
};

const ARG_NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export class FunctionArgumentNew extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      name: '',
      type: TypeNames.STRING,
    };

    this._handleNameChange = this._handleNameChange.bind(this);
    this._handleTypeChange = this._handleTypeChange.bind(this);
    this._handleAddButtonPress = this._handleAddButtonPress.bind(this);
    this._handleCancelButtonPress = this._handleCancelButtonPress.bind(this);
  }
  
  /**
   *
   * @return {{ value: string, text: string }[]}
   * @private
   */
  _getTypeOptions() {
    const { getLocalizedText } = this.props;

    return [
      { value: TypeNames.STRING, text: getLocalizedText('types.string') },
      { value: TypeNames.INT, text: getLocalizedText('types.int') },
      { value: TypeNames.FLOAT, text: getLocalizedText('types.float') },
      { value: TypeNames.BOOL, text: getLocalizedText('types.bool') },
    ];
  }
  
  /**
   *
   * @param {string} value
   * @private
   */
  _handleNameChange({ value }) {
    this.setState({ name: value });
  }
  
  /**
   *
   * @param {string} value
   * @private
   */
  _handleTypeChange({ value }) {
    this.setState({ type: value });
  }
  
  /**
   *
   * @private
   */
  _handleAddButtonPress() {
    const { onAdd } = this.props;
    const { name, type } = this.state;

    onAdd({ name, type });
  }
  
  /**
   *
   * @private
   */
  _handleCancelButtonPress() {
    this.props.onCancel();
  }

  render() {
    const { existingArgNames, getLocalizedText } = this.props;
    const { name, type } = this.state;

    const typeOptions = this._getTypeOptions();
    const isButtonDisabled =
      !name || !type || existingArgNames.indexOf(name) !== -1;
    
    const nameLabel = getLocalizedText('linkDialog.function.new.newArg.name');
    const typeLabel = getLocalizedText('linkDialog.function.new.newArg.type');

    return (
      <BlockContentBoxGroup shading="editing" colorScheme="alt">
        <BlockContentBoxHeading>
          {getLocalizedText('linkDialog.function.new.newArg.heading')}
        </BlockContentBoxHeading>

        <BlockContentBoxItem>
          <Form>
            <FormItem>
              <TextField
                label={nameLabel}
                value={name}
                pattern={ARG_NAME_PATTERN}
                onChange={this._handleNameChange}
              />
            </FormItem>

            <FormItem>
              <SelectBox
                label={typeLabel}
                value={type}
                options={typeOptions}
                onChange={this._handleTypeChange}
              />
            </FormItem>
          </Form>

          <ButtonRowStyled>
            <Button
              text={getLocalizedText('common.cancel')}
              narrow
              onPress={this._handleCancelButtonPress}
            />

            <Button
              text={getLocalizedText('linkDialog.function.new.newArg.add')}
              narrow
              disabled={isButtonDisabled}
              onPress={this._handleAddButtonPress}
            />
          </ButtonRowStyled>
        </BlockContentBoxItem>
      </BlockContentBoxGroup>
    );
  }
}

FunctionArgumentNew.propTypes = propTypes;
FunctionArgumentNew.defaultProps = defaultProps;
FunctionArgumentNew.displayName = 'FunctionArgumentNew';
