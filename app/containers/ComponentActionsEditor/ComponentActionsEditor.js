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

import { ActionEditor } from './ActionEditor/ActionEditor';

import {
  addAction,
  replaceAction,
  deleteAction,
} from '../../actions/project';

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
  isValidSourceForValue,
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
  onAddAction: PropTypes.func.isRequired,
  onReplaceAction: PropTypes.func.isRequired,
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
  onAddAction: ({
    componentId,
    propName,
    isSystemProp,
    path,
    actionPath,
    branch,
    action,
  }) => void dispatch(addAction(
    componentId,
    propName,
    isSystemProp,
    path,
    actionPath,
    branch,
    action,
  )),
  
  onReplaceAction: ({
    componentId,
    propName,
    isSystemProp,
    path,
    actionPath,
    newAction,
  }) => void dispatch(replaceAction(
    componentId,
    propName,
    isSystemProp,
    path,
    actionPath,
    newAction,
  )),
  
  onDeleteAction: ({
    componentId,
    propName,
    isSystemProp,
    path,
    actionPath,
  }) => void dispatch(deleteAction(
    componentId,
    propName,
    isSystemProp,
    path,
    actionPath,
  )),
});

const Views = {
  HANDLERS_LIST: 0,
  NEW_ACTION: 1,
  EDIT_ACTION: 2,
};

class ComponentActionsEditorComponent extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      currentView: Views.HANDLERS_LIST,
      
      // Handle list
      activeHandler: '',
      
      // New action
      newActionPath: [],
      newActionBranch: '',
      
      // Edit action
      editActionPath: [],
    };
    
    this._handleExpandHandler = this._handleExpandHandler.bind(this);
    this._handleOpenNewActionForm = this._handleOpenNewActionForm.bind(this);
    this._handleEditAction = this._handleEditAction.bind(this);
    this._handleDeleteAction = this._handleDeleteAction.bind(this);
    this._handleActionEditorSave = this._handleActionEditorSave.bind(this);
    this._handleActionEditorCancel = this._handleActionEditorCancel.bind(this);
  }
  
  _handleExpandHandler({ handlerId }) {
    const { activeHandler } = this.state;
    
    this.setState({
      activeHandler: activeHandler === handlerId ? '' : handlerId,
    });
  }
  
  _handleOpenNewActionForm({ actionPath, branch }) {
    this.setState({
      currentView: Views.NEW_ACTION,
      newActionPath: actionPath,
      newActionBranch: branch,
    });
  }
  
  _handleEditAction({ actionId: actionPath }) {
    this.setState({
      currentView: Views.EDIT_ACTION,
      editActionPath: actionPath,
    });
  }
  
  _handleDeleteAction({ actionId: actionPath }) {
    const { selectedComponentIds, onDeleteAction } = this.props;
    const { activeHandler } = this.state;
  
    const componentId = selectedComponentIds.first();
    
    onDeleteAction({
      componentId,
      propName: activeHandler,
      isSystemProp: false,
      path: [],
      actionPath,
    });
  }
  
  _handleActionEditorSave({ action }) {
    const { selectedComponentIds, onAddAction, onReplaceAction } = this.props;
    
    const {
      currentView,
      activeHandler,
      newActionPath,
      newActionBranch,
      editActionPath,
    } = this.state;
  
    const componentId = selectedComponentIds.first();
    
    if (currentView === Views.NEW_ACTION) {
      onAddAction({
        componentId,
        propName: activeHandler,
        isSystemProp: false,
        path: [],
        actionPath: newActionPath,
        branch: newActionBranch,
        action,
      });
    } else if (currentView === Views.EDIT_ACTION) {
      onReplaceAction({
        componentId,
        propName: activeHandler,
        isSystemProp: false,
        path: [],
        actionPath: editActionPath,
        newAction: action,
      });
    }
    
    this.setState({
      currentView: Views.HANDLERS_LIST,
    });
  }
  
  _handleActionEditorCancel() {
    this.setState({
      currentView: Views.HANDLERS_LIST,
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
        const methodName = getString(
          targetComponentMeta.strings,
          methodMeta.textKey,
          language,
        );
        
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
        const key = action.params.newWindow
          ? 'actionsEditor.actionTitle.url.newWindow'
          : 'actionsEditor.actionTitle.url.sameWindow';
        
        return getLocalizedText(key, {
          url: action.params.url,
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
        actionPath={path || []}
        branch={branch}
        addButtonText={addActionText}
        onAdd={this._handleOpenNewActionForm}
      >
        {list}
      </ComponentActions>
    );
  }
  
  _renderHandlersList() {
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
      if (!isValidSourceForValue(propMeta, 'actions')) return;
      
      const value = component.props.get(propName);
      const title = getString(
        componentMeta.strings,
        propMeta.textKey,
        language,
      );
      
      const description = getString(
        componentMeta.strings,
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
      <BlockContentBoxItem isBordered flexMain>
        <ComponentHandlers>
          {handlersList}
        </ComponentHandlers>
      </BlockContentBoxItem>
    );
  }
  
  _renderNewActionView() {
    return (
      <ActionEditor
        onSave={this._handleActionEditorSave}
        onCancel={this._handleActionEditorCancel}
      />
    );
  }
  
  _renderEditActionView() {
    const { currentComponents, selectedComponentIds } = this.props;
    const { activeHandler, editActionPath } = this.state;
  
    const componentId = selectedComponentIds.first();
    const component = currentComponents.get(componentId);
    const propValue = component.props.get(activeHandler);
    const action = propValue.getActionByPath(editActionPath);
    
    return (
      <ActionEditor
        action={action}
        onSave={this._handleActionEditorSave}
        onCancel={this._handleActionEditorCancel}
      />
    );
  }
  
  render() {
    const { selectedComponentIds } = this.props;
    const { currentView } = this.state;
  
    if (selectedComponentIds.size !== 1) return null;
    
    let content = null;
    if (currentView === Views.HANDLERS_LIST)
      content = this._renderHandlersList();
    else if (currentView === Views.NEW_ACTION)
      content = this._renderNewActionView();
    else if (currentView === Views.EDIT_ACTION)
      content = this._renderEditActionView();
    
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
