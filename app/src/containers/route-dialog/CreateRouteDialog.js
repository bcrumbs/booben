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
} from '@jssy/common-ui';

import { INVALID_ID } from '../../constants/misc';

import {
  getLocalizedTextFromState,
} from '../../selectors';

import {
  withFormState,
  formStatePropTypes,
} from '../../hocs/withFormState';

import {
  getUpdatedParamValues,
  validatePath,
} from './common';

import RouteParams from './RouteParams';

const propTypes = {
  open: PropTypes.bool.isRequired,
  parentRouteId: PropTypes.number.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  ...formStatePropTypes,
};

const withForm = withFormState({
  validateOnBlur: true,
  validateOnChange: true,
  mapPropsToValues: () => ({
    path: '',
    title: '',
    params: {},
  }),

  validationConstructor: (values, props) => {
    const {
      getLocalizedText,
      parentRouteId,
      project,
      editedRouteId,
    } = props;

    const validateTitle = () => {
      if (!values.title) {
        return 'Required';
      } else {
        return '';
      }
    };

    return {
      title: validateTitle,
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

const wrap = compose(
  connect(mapStateToProps),
  withForm,
);

class _CreateRouteDialog extends Component {
  constructor(props) {
    super(props);

    this.dialogTitle = this.props.getLocalizedText(
      this.creatingRootRoute
        ? 'structure.createNewRootRoute'
        : 'structure.createNewRoute',
    );
  

    this._handleClose = this._handleClose.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }

  get creatingRootRoute() {
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
      open,
    } = this.props;

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
                    label={getLocalizedText('structure.title')}
                    value={formValues.title}
                    message={formErrors.title}
                    colorScheme={formErrors.title ? 'error' : 'neutral'}
                    onChange={({ value }) => {
                      onFieldChange({
                        title: value,
                      });
                    }}
                    onBlur={() => {
                      onFieldBlur(['title']);
                    }}
                  />
                </FormItem>
    
                <FormItem>
                  <TextField
                    label={getLocalizedText('structure.path')}
                    value={formValues.path}
                    message={formErrors.path}
                    colorScheme={formErrors.path ? 'error' : 'neutral'}
                    prefix={this.creatingRootRoute ? '/' : ''}
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

_CreateRouteDialog.propTypes = propTypes;
_CreateRouteDialog.displayName = 'CreateRouteDialog';

export const CreateRouteDialog = wrap(_CreateRouteDialog);
