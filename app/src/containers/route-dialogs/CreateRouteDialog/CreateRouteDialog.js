/**
 * @author Nick Maltsev
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Dialog, Form, FormItem, TextField } from '@reactackle/reactackle';

import {
  BlockContent,
  BlockContentBox,
  BlockContentBoxItem,
} from '../../../components/BlockContent/index';

import { withFormState, formStatePropTypes } from '../../../hocs/withFormState';
import { RouteParams } from '../RouteParams/RouteParams';
import { getUpdatedParamValues, validatePath } from '../common';
import { getLocalizedTextFromState } from '../../../selectors/index';
import { INVALID_ID } from '../../../constants/misc';
import { returnSecondArg, isFalsy, objectToArray } from '../../../utils/misc';

const propTypes = {
  open: PropTypes.bool,
  parentRouteId: PropTypes.number.isRequired,
  project: PropTypes.object.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  ...formStatePropTypes,
};

const defaultProps = {
  open: false,
};

const withForm = withFormState({
  validateOnBlur: true,
  validateOnChange: true,
  mapPropsToValues: () => ({
    path: '',
    title: '',
    params: {},
  }),

  validators: {
    title: (value, props) => {
      const { getLocalizedText } = props;

      return {
        valid: !!value,
        message: value
          ? ''
          : getLocalizedText('structure.titleIsRequiredMessage'),
      };
    },

    path: (value, props) => {
      const { parentRouteId, project, editedRouteId, getLocalizedText } = props;

      return validatePath(
        value,
        parentRouteId,
        project,
        editedRouteId,
        getLocalizedText,
      );
    },

    params: value => {
      const invalidParams = objectToArray(value, returnSecondArg, isFalsy);
      return { valid: invalidParams.length === 0, invalidParams };
    },
  },

  onSubmit: (values, props) => {
    const ret = {
      createRouteParentId: props.parentRouteId,
      newRoutePath: values.path,
      newRouteTitle: values.title,
      newRouteParamValues: values.params,
    };

    props.onSubmit(ret);
  },
});

const mapStateToProps = state => ({
  project: state.project.data,
  getLocalizedText: getLocalizedTextFromState(state),
});

const wrap = compose(connect(mapStateToProps), withForm);

class _CreateRouteDialog extends Component {
  constructor(props, context) {
    super(props, context);

    this._handleTitleChange = this._handleTitleChange.bind(this);
    this._handleTitleBlur = this._handleTitleBlur.bind(this);
    this._handlePathChange = this._handlePathChange.bind(this);
    this._handlePathBlur = this._handlePathBlur.bind(this);
    this._handleClose = this._handleClose.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }

  _handleTitleChange({ value }) {
    this.props.onFieldChange({ title: value });
  }

  _handleTitleBlur() {
    this.props.onFieldBlur(['title']);
  }

  _handlePathChange({ value }) {
    const { formValues, onFieldChange } = this.props;

    onFieldChange({
      path: value,
      params: getUpdatedParamValues(
        formValues.path,
        value,
        formValues.params,
      ),
    });
  }

  _handlePathBlur() {
    this.props.onFieldBlur(['path']);
  }

  _handleClose(closeDialog) {
    const { onClose, onResetForm } = this.props;

    onClose(closeDialog);
    onResetForm();
  }

  _handleSubmit(closeDialog) {
    const { onFormSubmit, onResetForm } = this.props;

    onFormSubmit({
      postAction: () => {
        closeDialog();
        onResetForm();
      },
    });
  }

  render() {
    const {
      open,
      parentRouteId,
      isFormValid,
      formValues,
      formFieldsValidity,
      getLocalizedText,
      onFieldChange,
    } = this.props;

    const creatingRootRoute = parentRouteId === INVALID_ID;
    const dialogTitle = creatingRootRoute
      ? getLocalizedText('structure.createNewRootRoute')
      : getLocalizedText('structure.createNewRoute');

    const dialogButtons = [{
      text: getLocalizedText('common.create'),
      disabled: !isFormValid,
      onPress: this._handleSubmit,
    }, {
      text: getLocalizedText('common.cancel'),
      onPress: this._handleClose,
    }];

    return (
      <Dialog
        title={dialogTitle}
        buttons={dialogButtons}
        backdrop
        minWidth={400}
        open={open}
        closeOnEscape
        closeOnBackdropClick
        onEnterKeyPress={this._handleSubmit}
        onClose={this._handleClose}
      >
        <BlockContent>
          <BlockContentBox>
            <BlockContentBoxItem blank>
              <Form>
                <FormItem>
                  <TextField
                    label={getLocalizedText('structure.title')}
                    value={formValues.title}
                    message={formFieldsValidity.title.message || ''}
                    colorScheme={
                      formFieldsValidity.title.valid ? 'neutral' : 'error'
                    }
                    onChange={this._handleTitleChange}
                    onBlur={this._handleTitleBlur}
                  />
                </FormItem>

                <FormItem>
                  <TextField
                    label={getLocalizedText('structure.path')}
                    value={formValues.path}
                    message={
                      !formFieldsValidity.path.valid
                        ? formFieldsValidity.path.message
                        : getLocalizedText('structure.pathHelpMessage')
                    }
                    colorScheme={
                      formFieldsValidity.path.valid ? 'neutral' : 'error'
                    }
                    prefix={creatingRootRoute ? '/' : ''}
                    onChange={this._handlePathChange}
                    onBlur={this._handlePathBlur}
                  />
                </FormItem>
              </Form>
            </BlockContentBoxItem>
          </BlockContentBox>

          <RouteParams
            params={formValues.params}
            invalidParams={formFieldsValidity.params.invalidParams || []}
            getLocalizedText={getLocalizedText}
            onChange={onFieldChange}
          />
        </BlockContent>
      </Dialog>
    );
  }
}

_CreateRouteDialog.propTypes = propTypes;
_CreateRouteDialog.defaultProps = defaultProps;
_CreateRouteDialog.displayName = 'CreateRouteDialog';

export const CreateRouteDialog = wrap(_CreateRouteDialog);
