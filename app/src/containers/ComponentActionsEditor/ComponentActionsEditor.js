/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { compose } from 'redux';
import _forOwn from 'lodash.forown';
import _startCase from 'lodash.startcase';

import {
  BlockContentBox,
  BlockContentBoxItem,
} from '../../components/BlockContent/BlockContent';

import withPermanentState from '../../hocs/withPermanentState';

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
  getLocalizedTextFromState,
} from '../../selectors';

import { PathStartingPoints } from '../../reducers/project';
import ProjectRoute from '../../models/ProjectRoute';
import ProjectComponent from '../../models/ProjectComponent';
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
  onAddAction: ({ path, action }) => void dispatch(addAction(path, action)),
  
  onReplaceAction: ({ path, index, newAction }) => void dispatch(replaceAction(
    path,
    index,
    newAction,
  )),
  
  onDeleteAction: ({ path, index }) => void dispatch(deleteAction(path, index)),
});

const wrap = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withPermanentState,
);

const Views = {
  HANDLERS_LIST: 0,
  NEW_ACTION: 1,
  EDIT_ACTION: 2,
};

class ComponentActionsEditorComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this.state = {
      currentView: Views.HANDLERS_LIST,
      
      // Handlers list
      activeHandler: '',
      
      // New action
      newActionPathToList: [],
      
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
  
  _handleOpenNewActionForm({ pathToList }) {
    this.setState({
      currentView: Views.NEW_ACTION,
      newActionPathToList: pathToList,
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
    const pathToList = actionPath.slice(0, -1);
    const index = actionPath[actionPath.length - 1];
    
    const fullPath = {
      startingPoint: PathStartingPoints.CURRENT_COMPONENTS,
      steps: [
        componentId,
        'props',
        activeHandler,
        'actions',
        ...pathToList,
      ],
    };
    
    onDeleteAction({ path: fullPath, index });
  }
  
  _handleActionEditorSave({ action }) {
    const { selectedComponentIds, onAddAction, onReplaceAction } = this.props;
    
    const {
      currentView,
      activeHandler,
      newActionPathToList,
      editActionPath,
    } = this.state;
  
    const componentId = selectedComponentIds.first();
    
    if (currentView === Views.NEW_ACTION) {
      const path = {
        startingPoint: PathStartingPoints.CURRENT_COMPONENTS,
        steps: [
          componentId,
          'props',
          activeHandler,
          'actions',
          ...newActionPathToList,
        ],
      };
      
      onAddAction({
        path,
        action,
      });
    } else if (currentView === Views.EDIT_ACTION) {
      const pathToList = editActionPath.slice(0, -1);
      const index = editActionPath[editActionPath.length - 1];
  
      const fullPath = {
        startingPoint: PathStartingPoints.CURRENT_COMPONENTS,
        steps: [
          componentId,
          'props',
          activeHandler,
          'actions',
          ...pathToList,
        ],
      };
      
      onReplaceAction({
        path: fullPath,
        index,
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
      
      case 'logout': {
        return getLocalizedText('actionsEditor.actionTitle.logout');
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
  
  _renderActionsList(actions, pathToList = []) {
    const { getLocalizedText } = this.props;
    
    const addActionText = getLocalizedText('actionsEditor.addAction');
    const onSuccessText = getLocalizedText('actionsEditor.onSuccess');
    const onErrorText = getLocalizedText('actionsEditor.onError');
    const list = [];
  
    actions.forEach((action, idx) => {
      const actionPath = [...pathToList, idx];
      const title = this._formatActionTitle(action);
      const description = this._getActionDescription(action);
      
      if (action.type === 'mutation') {
        const successActionsList = this._renderActionsList(
          action.params.successActions,
          [...actionPath, 'successActions'],
        );
        
        const errorActionsList = this._renderActionsList(
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
    const { selectedComponentIds } = this.props;
    const { activeHandler, editActionPath } = this.state;
  
    const componentId = selectedComponentIds.first();
    const stateKey =
      `new-action-editor-${componentId}-${activeHandler}` +
      `${editActionPath.length ? `-${editActionPath.join('/')}` : ''}`;
    
    return (
      <ActionEditor
        key={stateKey}
        stateKey={stateKey}
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
    const stateKey =
      `action-editor-${componentId}-${activeHandler}` +
      `${editActionPath.length ? `-${editActionPath.join('/')}` : ''}`;
    
    return (
      <ActionEditor
        key={stateKey}
        stateKey={stateKey}
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

export const ComponentActionsEditor = wrap(ComponentActionsEditorComponent);
