/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import _forOwn from 'lodash.forown';
import _startCase from 'lodash.startcase';

import {
  BlockContentBox,
  BlockContentBoxItem,
} from '../../components/BlockContent/BlockContent';

import {
  ComponentHandlers,
  ComponentHandler,
  ComponentActions,
  ComponentAction,
  ComponentActionCaseRow,
} from '../../components/actions';

import { deleteComponentAction } from '../../actions/project';

import {
  currentComponentsSelector,
  currentSelectedComponentIdsSelector,
} from '../../selectors';

import ProjectRoute from '../../models/ProjectRoute';
import ProjectComponent from '../../models/ProjectComponent';
import { getLocalizedTextFromState } from '../../utils';
import { getMutationField } from '../../utils/schema';

import {
  getComponentMeta,
  getString,
  isValidSourceForProp,
} from '../../utils/meta';

const propTypes = {
  meta: PropTypes.object.isRequired,
  schema: PropTypes.object,
  routes: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectRoute),
    PropTypes.number,
  ).isRequired,
  currentComponents: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectComponent),
    PropTypes.number,
  ).isRequired,
  selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number).isRequired,
  language: PropTypes.string.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onDeleteAction: PropTypes.func.isRequired,
};

const defaultProps = {
  schema: null,
};

const mapStateToProps = state => ({
  meta: state.project.meta,
  schema: state.project.schema,
  routes: state.project.data.routes,
  currentComponents: currentComponentsSelector(state),
  selectedComponentIds: currentSelectedComponentIdsSelector(state),
  language: state.app.language,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onDeleteAction: ({
    componentId,
    propName,
    isSystemProp,
    path,
    actionPath,
  }) => void dispatch(deleteComponentAction(
    componentId,
    propName,
    isSystemProp,
    path,
    actionPath,
  )),
});

class ComponentActionsEditorComponent extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      activeHandler: '',
      editingAction: false,
      editingActionIdx: 0,
    };
    
    this._handleExpandHandler = this._handleExpandHandler.bind(this);
    this._handleDeleteAction = this._handleDeleteAction.bind(this);
  }
  
  _handleExpandHandler({ handlerId }) {
    const { activeHandler } = this.state;
    
    this.setState({
      activeHandler: activeHandler === handlerId ? '' : handlerId,
    });
  }
  
  _handleDeleteAction({ actionId }) {
    const { selectedComponentIds, onDeleteAction } = this.props;
    const { activeHandler } = this.state;
  
    const componentId = selectedComponentIds.first();
    
    onDeleteAction({
      componentId,
      propName: activeHandler,
      isSystemProp: false,
      path: [],
      actionPath: actionId,
    });
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
        const methodName =
          getString(targetComponentMeta, methodMeta.textKey, language);
        
        return getLocalizedText('actionsEditor.actionTitle.method', {
          method: methodName,
          componentTitle: targetComponent.title || targetComponent.name,
        });
      }
      
      case 'prop': {
        const targetComponent =
          currentComponents.get(action.params.componentId);
        
        return getLocalizedText('actionsEditor.actionTitle.prop', {
          propName: action.params.propName,
          componentTitle: targetComponent.title || targetComponent.name,
        });
      }
      
      case 'navigate': {
        const targetRoute = routes.get(action.params.routeId);
        
        return getLocalizedText('actionsEditor.actionTitle.navigate', {
          routeName: targetRoute.title,
        });
      }
      
      case 'url': {
        return getLocalizedText('actionsEditor.actionTitle.url', {
          url: action.params.url,
        });
      }
      
      default:
        return 'Unknown action';
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
          targetComponentMeta,
          methodMeta.descriptionTextKey,
          language,
        );
      }
      
      default:
        return '';
    }
  }
  
  _renderActionsList(actions, path = null, branch = '') {
    const { getLocalizedText } = this.props;
    
    const addActionText = getLocalizedText('actionsEditor.addAction');
    const onSuccessText = getLocalizedText('actionsEditor.onSuccess');
    const onErrorText = getLocalizedText('actionsEditor.onError');
    const list = [];
  
    actions.forEach((action, idx) => {
      const actionPath = path
        ? [...path, { branch, index: idx }]
        : [{ index: idx }];
      
      const title = this._formatActionTitle(action);
      const description = this._getActionDescription(action);
      
      if (action.type === 'mutation') {
        const successActionsList = this._renderActionsList(
          action.params.successActions,
          actionPath,
          'success',
        );
        
        const errorActionsList = this._renderActionsList(
          action.params.errorActions,
          actionPath,
          'error',
        );
        
        list.push(
          <ComponentAction
            key={String(idx)}
            id={actionPath}
            title={title}
            description={description}
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
            onDelete={this._handleDeleteAction}
          />,
        );
      }
    });
    
    return (
      <ComponentActions addButtonText={addActionText}>
        {list}
      </ComponentActions>
    );
  }
  
  _renderHandlers() {
    const {
      meta,
      selectedComponentIds,
      currentComponents,
      language,
    } = this.props;
    
    const { activeHandler } = this.state;
    
    const componentId = selectedComponentIds.first();
    const component = currentComponents.get(componentId);
    const componentMeta = getComponentMeta(component.name, meta);
    
    const handlersList = [];
    
    _forOwn(componentMeta.props, (propMeta, propName) => {
      if (!isValidSourceForProp(propMeta, 'actions')) return;
      
      const value = component.props.get(propName);
      const title = getString(componentMeta, propMeta.textKey, language);
      const description = getString(
        componentMeta,
        propMeta.descriptionTextKey,
        language,
      );
      
      const hasActions = value.sourceData.actions.size > 0;
      const expanded = propName === activeHandler;
      const actions = this._renderActionsList(value.sourceData.actions);
      
      handlersList.push(
        <ComponentHandler
          id={propName}
          key={propName}
          title={title}
          description={description}
          hasActions={hasActions}
          expanded={expanded}
          onExpand={this._handleExpandHandler}
        >
          {actions}
        </ComponentHandler>,
      );
    });
    
    return (
      <ComponentHandlers>
        {handlersList}
      </ComponentHandlers>
    );
  }
  
  render() {
    const { selectedComponentIds } = this.props;
    const { editingAction } = this.state;
  
    if (selectedComponentIds.size !== 1) return null;
    
    let content = null;
    if (!editingAction) {
      const handlersList = this._renderHandlers();
      content = (
        <BlockContentBoxItem isBordered flexMain>
          {handlersList}
        </BlockContentBoxItem>
      );
    }
    
    return (
      <BlockContentBox isBordered flex>
        {content}
      </BlockContentBox>
    );
  }
}

ComponentActionsEditorComponent.propTypes = propTypes;
ComponentActionsEditorComponent.defaultProps = defaultProps;
ComponentActionsEditorComponent.displayName = 'ComponentActionsEditor';

export const ComponentActionsEditor = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ComponentActionsEditorComponent);
