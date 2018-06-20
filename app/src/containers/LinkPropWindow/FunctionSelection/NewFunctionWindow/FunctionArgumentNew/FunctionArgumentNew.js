import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TypeNames } from 'booben-types';
import { Form, FormItem } from 'reactackle-form';
import { TextField } from 'reactackle-text-field';
import { SelectBox } from 'reactackle-selectbox';
import { Button } from 'reactackle-button';
import { Checkbox } from 'reactackle-checkbox';

import {
  BlockContentBoxGroup,
  BlockContentBoxItem,
  BlockContentBoxHeading,
} from '../../../../../components/BlockContent';

import { returnArg, noop } from '../../../../../utils/misc';
import { ButtonRowStyled } from './styles/ButtonRowStyled';
import {
  withFormState,
  formStatePropTypes,
} from '../../../../../hocs/withFormState';

const propTypes = {
  existingArgNames: PropTypes.arrayOf(PropTypes.string),
  getLocalizedText: PropTypes.func,
  onAdd: PropTypes.func,
  onCancel: PropTypes.func,
  restArgDisabled: PropTypes.bool.isRequired,
  restArgChecked: PropTypes.bool.isRequired,
  onRestArgCheckToogle: PropTypes.func.isRequired,
  ...formStatePropTypes,
};

const defaultProps = {
  existingArgNames: [],
  getLocalizedText: returnArg,
  onAdd: noop,
  onCancel: noop,
};

const withForm = withFormState({
  mapPropsToValues: () => ({
    name: '',
    type: TypeNames.STRING,
  }),

  validators: {
    name: (value, { existingArgNames, getLocalizedText }) => {
      let message = '';
      if (!value) {
        message = getLocalizedText(
          'linkDialog.function.new.newArg.validation.required',
        );
      } else if (existingArgNames.indexOf(value) !== -1) {
        message = getLocalizedText(
          'linkDialog.function.new.newArg.validation.alreadyExist',
        );
      } else if (/\d/.test(value)) {
        message = getLocalizedText(
          'linkDialog.function.new.newArg.validation.noDigit',
        );
      } else if (!/[A-Za-z]/.test(value)) {
        message = getLocalizedText(
          'linkDialog.function.new.newArg.validation.onlyEnglish',
        );
      }

      return {
        valid: !message,
        message,
      };
    },
  },

  onSubmit: ({ name, type }, { onAdd }) => {
    onAdd({ name, type });
  },
});

class _FunctionArgumentNew extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._handleNameChange = this._handleNameChange.bind(this);
    this._handleTypeChange = this._handleTypeChange.bind(this);
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
    const { onFieldChange } = this.props;

    onFieldChange({
      name: value,
    });
  }

  /**
   *
   * @param {string} value
   * @private
   */
  _handleTypeChange({ value }) {
    const { onFieldChange } = this.props;

    onFieldChange({
      type: value,
    });
  }

  /**
   *
   * @private
   */
  _handleCancelButtonPress() {
    this.props.onCancel();
  }

  render() {
    const {
      getLocalizedText,
      restArgDisabled,
      restArgChecked,
      onRestArgCheckToogle,
      formFieldsValidity,
      formValues,
      isFormValid,
      onFormSubmit,
    } = this.props;
    const { name, type } = formValues;

    const typeOptions = this._getTypeOptions();

    const nameLabel = getLocalizedText('linkDialog.function.new.newArg.name');
    const typeLabel = getLocalizedText('linkDialog.function.new.newArg.type');

    return (
      <BlockContentBoxGroup shading="dim" colorScheme="alt">
        <BlockContentBoxHeading>
          {getLocalizedText('linkDialog.function.new.newArg.heading')}
        </BlockContentBoxHeading>

        <BlockContentBoxItem>
          <Form>
            <FormItem>
              <TextField
                label={nameLabel}
                value={name}
                onChange={this._handleNameChange}
                message={formFieldsValidity.name.message || ''}
                colorScheme={
                  formFieldsValidity.name.valid ? 'neutral' : 'error'
                }
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

            <FormItem>
              <Checkbox
                disabled={restArgDisabled}
                checked={restArgChecked}
                onChange={onRestArgCheckToogle}
                label={
                  getLocalizedText('linkDialog.function.new.restArg.enable')
                }
                tooltip={restArgDisabled
                  ? getLocalizedText(
                    'linkDialog.function.new.restArg.onlyOneWarning',
                  )
                  : ''
                }
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
              disabled={!isFormValid}
              onPress={onFormSubmit}
            />
          </ButtonRowStyled>
        </BlockContentBoxItem>
      </BlockContentBoxGroup>
    );
  }
}

_FunctionArgumentNew.propTypes = propTypes;
_FunctionArgumentNew.defaultProps = defaultProps;
_FunctionArgumentNew.displayName = 'FunctionArgumentNew';

export const FunctionArgumentNew = withForm(_FunctionArgumentNew);
