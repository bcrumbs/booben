import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _startCase from 'lodash.startcase';
import { getMutationField } from 'booben-graphql-schema';

import {
  ComponentActions,
  ComponentAction,
  ComponentActionCaseRow,
} from '../../components/actions';

import {
  currentComponentsSelector,
  getLocalizedTextFromState,
} from '../../selectors';

import BoobenValue, { isAsyncAction } from '../../models/BoobenValue';
import { getComponentMeta, getString } from '../../lib/meta';
import { formatComponentTitle } from '../../lib/components';
import { noop } from '../../utils/misc';
import * as BoobenPropTypes from '../../constants/common-prop-types';

const propTypes = {
  actions: BoobenPropTypes.actions.isRequired,
  meta: PropTypes.object.isRequired, // state
  schema: PropTypes.object, // state
  routes: BoobenPropTypes.routes.isRequired, // state
  currentComponents: BoobenPropTypes.components.isRequired, // state
  language: PropTypes.string.isRequired, // state
  getLocalizedText: PropTypes.func.isRequired, // state
  onCreateAction: PropTypes.func,
  onEditAction: PropTypes.func,
  onDeleteAction: PropTypes.func,
};

const defaultProps = {
  schema: null,
  onCreateAction: noop,
  onEditAction: noop,
  onDeleteAction: noop,
};

const mapStateToProps = state => ({
  meta: state.project.meta,
  schema: state.project.schema,
  routes: state.project.data.routes,
  currentComponents: currentComponentsSelector(state),
  language: state.app.language,
  getLocalizedText: getLocalizedTextFromState(state),
});

const wrap = connect(mapStateToProps);

class _ActionsList extends Component {
  constructor(props, context) {
    super(props, context);

    this._handleCreateAction = this._handleCreateAction.bind(this);
    this._handleEditAction = this._handleEditAction.bind(this);
    this._handleDeleteAction = this._handleDeleteAction.bind(this);
  }

  _handleCreateAction({ pathToList }) {
    const { onCreateAction } = this.props;
    onCreateAction({ pathToList });
  }

  _handleEditAction({ actionId: actionPath }) {
    const { onEditAction } = this.props;
    onEditAction({ actionPath });
  }

  _handleDeleteAction({ actionId: actionPath }) {
    const { onDeleteAction } = this.props;
    onDeleteAction({ actionPath });
  }

  _formatActionTitle(action) {
    const {
      meta,
      routes,
      currentComponents,
      language,
      getLocalizedText,
    } = this.props;

    switch (action.type) {
      case 'mutation': {
        return getLocalizedText('actionsEditor.actionTitle.mutation', {
          mutationTitle: _startCase(action.params.mutation),
        });
      }

      case 'method': {
        const targetComponent =
          currentComponents.get(action.params.componentId);

        const targetComponentMeta =
          getComponentMeta(targetComponent.name, meta);

        const methodMeta = targetComponentMeta.methods[action.params.method];
        const methodName = getString(
          targetComponentMeta.strings,
          methodMeta.textKey,
          language,
        );

        return getLocalizedText('actionsEditor.actionTitle.method', {
          method: methodName,
          componentTitle: formatComponentTitle(targetComponent),
        });
      }

      case 'prop': {
        const targetComponent =
          currentComponents.get(action.params.componentId);

        const targetComponentMeta =
          getComponentMeta(targetComponent.name, meta);

        const isSystemProp = !!action.params.systemPropName;

        let nameString;
        if (isSystemProp) {
          const nameKey =
            `propsEditor.systemProps.${action.params.systemPropName}.name`;

          nameString = getLocalizedText(nameKey);

          if (!nameString) nameString = action.params.systemPropName;
        } else {
          const propMeta = targetComponentMeta.props[action.params.propName];

          nameString = getString(
            targetComponentMeta.strings,
            propMeta.textKey,
            language,
          );

          if (!nameString) nameString = action.params.propName;
        }

        return getLocalizedText('actionsEditor.actionTitle.prop', {
          propName: nameString,
          componentTitle: formatComponentTitle(targetComponent),
        });
      }

      case 'navigate': {
        const targetRoute = routes.get(action.params.routeId);

        return getLocalizedText('actionsEditor.actionTitle.navigate', {
          routeName: targetRoute.title,
        });
      }

      case 'url': {
        const key = action.params.newWindow
          ? 'actionsEditor.actionTitle.url.newWindow'
          : 'actionsEditor.actionTitle.url.sameWindow';

        return getLocalizedText(key, {
          url: action.params.url,
        });
      }

      case 'logout': {
        return getLocalizedText('actionsEditor.actionTitle.logout');
      }

      case 'ajax': {
        const haveURLString =
          action.params.url.sourceIs(BoobenValue.Source.STATIC);

        if (haveURLString) {
          return getLocalizedText('actionsEditor.actionTitle.ajax.withURL', {
            method: action.params.method,
            url: action.params.url.sourceData.value,
          });
        } else {
          return getLocalizedText('actionsEditor.actionTitle.ajax.noURL', {
            method: action.params.method,
          });
        }
      }

      case 'loadMoreData': {
        const targetComponent =
          currentComponents.get(action.params.componentId);

        const targetComponentTitle = formatComponentTitle(targetComponent);

        return getLocalizedText('actionsEditor.actionTitle.loadMoreData', {
          componentTitle: targetComponentTitle,
        });
      }

      default:
        return '';
    }
  }

  _getActionDescription(action) {
    const { meta, schema, currentComponents, language } = this.props;

    switch (action.type) {
      case 'mutation': {
        const mutationField = getMutationField(schema, action.params.mutation);
        return mutationField.description;
      }

      case 'method': {
        const targetComponent =
          currentComponents.get(action.params.componentId);

        const targetComponentMeta =
          getComponentMeta(targetComponent.name, meta);

        const methodMeta = targetComponentMeta.methods[action.params.method];

        return getString(
          targetComponentMeta.strings,
          methodMeta.descriptionTextKey,
          language,
        );
      }

      default:
        return '';
    }
  }

  _renderList(actions, pathToList = []) {
    const { getLocalizedText } = this.props;

    const addActionText = getLocalizedText('actionsEditor.addAction');
    const onSuccessText = getLocalizedText('actionsEditor.onSuccess');
    const onErrorText = getLocalizedText('actionsEditor.onError');
    const list = [];

    actions.forEach((action, idx) => {
      const actionPath = [...pathToList, idx];
      const title = this._formatActionTitle(action);
      const description = this._getActionDescription(action);

      if (isAsyncAction(action.type)) {
        const successActionsList = this._renderList(
          action.params.successActions,
          [...actionPath, 'successActions'],
        );

        const errorActionsList = this._renderList(
          action.params.errorActions,
          [...actionPath, 'errorActions'],
        );

        list.push(
          <ComponentAction
            key={String(idx)}
            id={actionPath}
            title={title}
            description={description}
            onEdit={this._handleEditAction}
            onDelete={this._handleDeleteAction}
          >
            <ComponentActionCaseRow type="success" title={onSuccessText}>
              {successActionsList}
            </ComponentActionCaseRow>

            <ComponentActionCaseRow type="error" title={onErrorText}>
              {errorActionsList}
            </ComponentActionCaseRow>
          </ComponentAction>,
        );
      } else {
        list.push(
          <ComponentAction
            key={String(idx)}
            id={actionPath}
            title={title}
            description={description}
            onEdit={this._handleEditAction}
            onDelete={this._handleDeleteAction}
          />,
        );
      }
    });

    return (
      <ComponentActions
        pathToList={pathToList}
        addButtonText={addActionText}
        onAdd={this._handleCreateAction}
      >
        {list}
      </ComponentActions>
    );
  }

  render() {
    const { actions } = this.props;
    return this._renderList(actions);
  }
}

_ActionsList.propTypes = propTypes;
_ActionsList.defaultProps = defaultProps;
_ActionsList.displayName = 'ActionsList';

export const ActionsList = wrap(_ActionsList);
