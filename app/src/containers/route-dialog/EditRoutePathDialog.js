/**
 * @author Nick Maltsev
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import {
  Dialog,
  Form,
  FormItem,
  TextField,
} from '@reactackle/reactackle';

import {
  BlockContent,
  BlockContentBox,
  BlockContentBoxItem,
} from '../../components/BlockContent';

import {
  getLocalizedTextFromState,
} from '../../selectors';

import {
  withFormState,
  formStatePropTypes,
} from '../../hocs/withFormState';

import RouteParams from './RouteParams';

import { INVALID_ID } from '../../constants/misc';

import {
  getUpdatedParamValues,
  validatePath,
} from './common';

const propTypes = {
  open: PropTypes.bool.isRequired,
  editingRouteId: PropTypes.number.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  ...formStatePropTypes,
};

const withForm = withFormState({
  validateOnBlur: true,
  validateOnChage: true,
  mapPropsToValues: ({ project, editingRouteId }) => {
    const {
      path,
      paramValues,
    } = project.routes.get(editingRouteId);
    return {
      path: path.replace('/', ''),
      params: getUpdatedParamValues(
        path,
        path,
        paramValues.toJS() || {},
      ),
    };
  },

  validationConstructor: (values, props) => {
    const {
      getLocalizedText,
      project,
      editingRouteId,
    } = props;

    const route = project.routes.get(editingRouteId);
    const editedRouteId = route.id;
    const parentRouteId = route.parentId;

    return {
      path: () => {
        const { valid, message } = validatePath({
          path: values.path,
          getLocalizedText,
          parentRouteId,
          project,
          editedRouteId,
        });
        return valid
          ? null
          : message;
      },
    };
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

const wrap = compose(
  connect(mapStateToProps),
  withForm,
);

class _EditRoutePathDialog extends Component {
  constructor(props) {
    super(props);

    this.dialogTitle =
      this.props.getLocalizedText('structure.editRoutePathDialogTitle');

    this._handleClose = this._handleClose.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }

  get editingRootRoute() {
    return this.props.parentRouteId === INVALID_ID;
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
      getLocalizedText,
      isFormValid,
      formValues,
      formErrors,
      onFieldChange,
      onFieldBlur,
      open
    } = this.props;

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
        title={this.dialogTitle}
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
                    message={formErrors.path}
                    colorScheme={formErrors.path ? 'error' : 'neutral'}
                    prefix={this.editingRootRoute ? '/' : ''}
                    onChange={({ value }) => {
                      onFieldChange({
                        path: value,
                        params: getUpdatedParamValues(
                          formValues.path,
                          value,
                          formValues.params,
                        ),
                      });
                    }}
                    onBlur={() => {
                      onFieldBlur(['path']);
                    }}
                  />
                </FormItem>
              </Form>
            </BlockContentBoxItem>
          </BlockContentBox>

          <RouteParams
            getLocalizedText={getLocalizedText}
            handleChange={onFieldChange}
            params={formValues.params}
          />
        </BlockContent>
      </Dialog>
    );
  }
}

_EditRoutePathDialog.propTypes = propTypes;
_EditRoutePathDialog.displayName = 'EditRoutePathDialog';

export const EditRoutePathDialog = wrap(_EditRoutePathDialog);
