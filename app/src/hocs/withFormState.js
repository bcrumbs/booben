import React, { Component } from 'react';
import PropTypes from 'prop-types';
import mapValues from 'lodash.mapvalues';

import {
  returnTrue,
  returnEmptyObject,
  returnArg,
  noop,
  isFunction,
  objectSome,
  objectEvery,
  arrayToObject,
} from '../utils/misc';

export const formStatePropTypes = {
  formValues: PropTypes.object.isRequired,
  formFieldsValidity: PropTypes.object.isRequired,
  formTouchedFields: PropTypes.object.isRequired,
  isFormDirty: PropTypes.bool.isRequired,
  isFormValid: PropTypes.bool.isRequired,
  onFieldBlur: PropTypes.func.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onFormSubmit: PropTypes.func.isRequired,
  onResetForm: PropTypes.func.isRequired,
};

/**
 * @typedef {Object} FieldValidity
 * @property {boolean} valid
 */

/**
 *
 * @param {function(props: Object<string, *>): Object<string, *>} [mapPropsToValues]
 * @param {Object<string, function(value: *, props: Object<string, *>): FieldValidity>} [validators]
 * @param {boolean} [validateOnChange=true]
 * @param {boolean} [validateOnBlur=true]
 * @param {function(values: Object<string, *>, props: Object<string, *>): void} [onSubmit]
 * @return {function(WrappedComponent: Component): Component}
 */
export const withFormState = ({
  mapPropsToValues = returnEmptyObject,
  validators = {},
  validateOnChange = true,
  validateOnBlur = true,
  onSubmit = noop,
}) => WrappedComponent => {
  const ret = class extends Component {
    constructor(props, context) {
      super(props, context);

      const values = mapPropsToValues(props);

      this.state = {
        values,
        fieldsValidity: mapValues(values, () => ({ valid: true })),
        touched: {},
      };

      this._handleBlur = this._handleBlur.bind(this);
      this._handleChange = this._handleChange.bind(this);
      this._handleSubmit = this._handleSubmit.bind(this);
      this._handleResetForm = this._handleResetForm.bind(this);
    }

    /**
     *
     * @return {boolean}
     * @private
     */
    _isFormValid() {
      return objectEvery(
        this.state.fieldsValidity,
        fieldValidity => fieldValidity.valid,
      );
    }

    /**
     *
     * @param {Object<string, *>} values
     * @return {Object<string, FieldValidity>}
     * @private
     */
    _validate(values) {
      return mapValues(
        values,
        (value, field) => (
          isFunction(validators[field])
            ? validators[field](value, this.props)
            : { valid: true }
        ),
      );
    }

    /**
     *
     * @param {Object<string, *>} values
     * @private
     */
    _handleChange(values) {
      const newState = {
        values: { ...this.state.values, ...values },
      };

      if (validateOnChange) {
        newState.fieldsValidity = {
          ...this.state.fieldsValidity,
          ...this._validate(values),
        };
      }

      this.setState(newState);
    }

    /**
     *
     * @param {Array<string>} fields
     * @private
     */
    _handleBlur(fields) {
      const newState = {
        touched: {
          ...this.state.touched,
          ...arrayToObject(fields, returnArg, returnTrue),
        },
      };

      if (validateOnBlur) {
        newState.fieldsValidity = {
          ...this.state.fieldsValidity,
          ...this._validate(arrayToObject(
            fields,
            returnArg,
            field => this.state.values[field],
          )),
        };
      }

      this.setState(newState);
    }

    _handleSubmit({ postAction }) {
      const fieldsValidity = this._validate(this.state.values);

      this.setState({
        touched: mapValues(this.state.values, returnTrue),
        fieldsValidity,
      }, () => {
        if (this._isFormValid()) {
          onSubmit(this.state.values, this.props);
          if (postAction) postAction();
        }
      });
    }

    _handleResetForm() {
      this.setState({
        values: mapPropsToValues(this.props),
        fieldsValidity: {},
        touched: {},
      });
    }

    render() {
      const { values, fieldsValidity, touched } = this.state;

      const formProps = {
        formValues: values,
        formFieldsValidity: fieldsValidity,
        formTouchedFields: touched,
        isFormDirty: objectSome(touched, returnArg),
        isFormValid: this._isFormValid(),
        onFieldBlur: this._handleBlur,
        onFieldChange: this._handleChange,
        onFormSubmit: this._handleSubmit,
        onResetForm: this._handleResetForm,
      };

      return (
        <WrappedComponent {...this.props} {...formProps} />
      );
    }
  };

  ret.displayName = `withFormState(${WrappedComponent.displayName})`;

  return ret;
};
