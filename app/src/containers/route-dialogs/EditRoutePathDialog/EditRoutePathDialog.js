/**
 * @author Nick Maltsev
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Form, FormItem } from 'reactackle-form';
import { TextField } from 'reactackle-text-field';
import { Dialog } from '../../../components';

import {
  BlockContent,
  BlockContentBox,
  BlockContentBoxItem,
} from '../../../components/BlockContent/index';

import { RouteParams } from '../RouteParams/RouteParams';
import { withFormState, formStatePropTypes } from '../../../hocs/withFormState';
import { getUpdatedParamValues, validatePath } from '../common';
import { getLocalizedTextFromState } from '../../../selectors/index';
import { INVALID_ID } from '../../../constants/misc';
import { returnSecondArg, isFalsy, objectToArray } from '../../../utils/misc';

const propTypes = {
  open: PropTypes.bool,
  editingRouteId: PropTypes.number.isRequired,
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
  mapPropsToValues: ({ project, editingRouteId }) => {
    const { path, paramValues } = project.routes.get(editingRouteId);

    return {
      path: path.replace('/', ''),
      params: getUpdatedParamValues(path, path, paramValues.toJS() || {}),
    };
  },

  validators: {
    path: (value, props) => {
      const { project, editingRouteId, getLocalizedText } = props;
      const route = project.routes.get(editingRouteId);
      const parentRouteId = route.parentId;

      return validatePath(
        value,
        parentRouteId,
        project,
        editingRouteId,
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
      editingRouteId: props.editingRouteId,
      newRoutePath: values.path,
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

class _EditRoutePathDialog extends Component {
  constructor(props, context) {
    super(props, context);

    this._handlePathChange = this._handlePathChange.bind(this);
    this._handlePathBlur = this._handlePathBlur.bind(this);
    this._handleClose = this._handleClose.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
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
    const {
      onClose,
      onResetForm,
    } = this.props;

    onClose(closeDialog);
    onResetForm();
  }

  _handleSubmit(closeDialog) {
    const {
      onFormSubmit,
      onResetForm,
    } = this.props;

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
      editingRouteId,
      project,
      isFormValid,
      formValues,
      formFieldsValidity,
      getLocalizedText,
      onFieldChange,
    } = this.props;

    const route = project.routes.get(editingRouteId);
    const editingRootRoute = route.parentId === INVALID_ID;
    const dialogTitle = getLocalizedText('structure.editRoutePathDialogTitle');

    const dialogButtons = [{
      text: getLocalizedText('common.save'),
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
                    prefix={editingRootRoute ? '/' : ''}
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

_EditRoutePathDialog.propTypes = propTypes;
_EditRoutePathDialog.defaultProps = defaultProps;
_EditRoutePathDialog.displayName = 'EditRoutePathDialog';

export const EditRoutePathDialog = wrap(_EditRoutePathDialog);
