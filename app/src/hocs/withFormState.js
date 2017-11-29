/**
 * @author Nick Maltsev
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import mapValues from 'lodash.mapvalues';

import {
  returnTrue,
  objectSome,
} from '../utils/misc';

export const formStatePropTypes = {
  formValues: PropTypes.object.isRequired,
  formErrors: PropTypes.object.isRequired,
  formTouchedFields: PropTypes.object.isRequired,
  isFormDirty: PropTypes.bool.isRequired,
  isFormValid: PropTypes.bool.isRequired,
  onFieldBlur: PropTypes.func.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onFormSubmit: PropTypes.func.isRequired,
  onResetForm: PropTypes.func.isRequired,
};

export const withFormState = ({
  mapPropsToValues = () => {},
  ...config
}) => WrappedComponent => {
  class ret extends Component {
    constructor(props) {
      super(props);
      this.state = {
        values: mapPropsToValues(this.props),
        errors: {},
        touched: {},
      };

      this.runValidations = this.runValidations.bind(this);
      this.getIsValid = this.getIsValid.bind(this);
      this._handleBlur = this._handleBlur.bind(this);
      this._handleChange = this._handleChange.bind(this);
      this._handleSubmit = this._handleSubmit.bind(this);
      this._handleResetForm = this._handleResetForm.bind(this);
    }
   
    getIsValid() {
      return Object.values(this.state.errors)
        .filter(v => v.length > 0).length === 0;
    }

    runValidations(values, emptyReturn = () => {}) {
      if (!config.validationConstructor) return emptyReturn;

      const newValues = Array.isArray(values) || !values
        ? this.state.values
        : values;

      const fields = Array.isArray(values)
        ? values
        : !values
          ? Object.keys(this.state.values)
          : Object.keys(values);

      const validationFunctions =
        config.validationConstructor(newValues, this.props);
      
      if (Object.keys(validationFunctions)) {
        const getFieldError = field => {
          const onFieldValidation = validationFunctions[field];
          return typeof onFieldValidation === 'function'
            ? onFieldValidation()
            : null;
        };

        const errors = {};
        fields.forEach(key => {
          const fieldError = getFieldError(key);
          errors[key] = fieldError || '';
        });

        return errors;
      } else {
        return emptyReturn;
      }
    }

    _handleChange(values) {
      const newState = { values: { ...this.state.values, ...values } };
      if (config.validateOnChange) {
        newState.errors = {
          ...this.state.errors,
          ...this.runValidations(values),
        };
      }

      this.setState(newState);
    }

    _handleBlur(fields) {
      const touched = {};
      fields.forEach(field => {
        touched[field] = true;
      });

      const newState = { touched: { ...this.state.touched, touched } };
  
      if (config.validateOnBlur) {
        newState.errors = {
          ...this.state.errors,
          ...this.runValidations(fields),
        };
      }

      this.setState(newState);
    }

    _handleSubmit({ postAction }) {
      const errors = this.runValidations();
      this.setState({
        touched: mapValues(this.state.values, returnTrue),
        errors,
      }, () => {
        if (!config.onSubmit) return;

        const isValid = this.getIsValid();
        if (isValid) {
          config.onSubmit(this.state.values, this.props);
          postAction();
        }
      });
    }

    _handleResetForm() {
      this.setState({
        isSubmitting: false,
        errors: {},
        touched: {},
        error: null,
        status: null,
        values: mapPropsToValues(this.props),
      });
    }

    render() {
      const renderFormComponent = formProps =>
        <WrappedComponent {...this.props} {...formProps} />;

      const formProps = {
        formValues: this.state.values,
        formErrors: this.state.errors,
        formTouchedFields: this.state.touched,
        isFormDirty: objectSome(this.state.touched, val => val),
        isFormValid: this.getIsValid(),
        onFieldBlur: this._handleBlur,
        onFieldChange: this._handleChange,
        onFormSubmit: this._handleSubmit,
        onResetForm: this._handleResetForm,
      };

      return renderFormComponent(formProps);
    }
  }

  ret.displayName = `withFormState(${WrappedComponent.displayName})`;

  return ret;
};
