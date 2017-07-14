/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _forOwn from 'lodash.forown';

import {
  BlockContentBox,
  BlockContentBoxItem,
} from '@jssy/common-ui';

import { ComponentHandlers, ComponentHandler } from '../../components/actions';
import { ActionsList } from '../ActionsList/ActionsList';
import { ActionEditor } from '../ActionEditor/ActionEditor';

import {
  addAction,
  replaceAction,
  deleteAction,
} from '../../actions/project';

import {
  currentComponentsSelector,
  selectedComponentIdsSelector,
} from '../../selectors';

import { PathStartingPoints } from '../../reducers/project';

import {
  getComponentMeta,
  getString,
  isValidSourceForValue,
  getSourceConfig,
} from '../../lib/meta';

import * as JssyPropTypes from '../../constants/common-prop-types';

const propTypes = {
  meta: PropTypes.object.isRequired,
  currentComponents: JssyPropTypes.components.isRequired,
  selectedComponentIds: JssyPropTypes.setOfIds.isRequired,
  language: PropTypes.string.isRequired,
  onAddAction: PropTypes.func.isRequired,
  onReplaceAction: PropTypes.func.isRequired,
  onDeleteAction: PropTypes.func.isRequired,
};

const defaultProps = {
  schema: null,
};

const mapStateToProps = state => ({
  meta: state.project.meta,
  currentComponents: currentComponentsSelector(state),
  selectedComponentIds: selectedComponentIdsSelector(state),
  language: state.app.language,
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

const wrap = connect(mapStateToProps, mapDispatchToProps);

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
  
  _handleEditAction({ actionPath }) {
    this.setState({
      currentView: Views.EDIT_ACTION,
      editActionPath: actionPath,
    });
  }
  
  _handleDeleteAction({ actionPath }) {
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
          <ActionsList
            actions={value.sourceData.actions}
            onCreateAction={this._handleOpenNewActionForm}
            onEditAction={this._handleEditAction}
            onDeleteAction={this._handleDeleteAction}
          />
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
    const { meta, currentComponents, selectedComponentIds } = this.props;
    const { activeHandler } = this.state;
    
    const componentId = selectedComponentIds.first();
    const component = currentComponents.get(componentId);
    const componentMeta = getComponentMeta(component.name, meta);
    const propMeta = componentMeta.props[activeHandler];
    const actionArgsMeta =
      getSourceConfig(propMeta, 'actions', componentMeta.types).args;
    
    return (
      <ActionEditor
        actionArgsMeta={actionArgsMeta}
        actionComponentMeta={componentMeta}
        onSave={this._handleActionEditorSave}
        onCancel={this._handleActionEditorCancel}
      />
    );
  }
  
  _renderEditActionView() {
    const { meta, currentComponents, selectedComponentIds } = this.props;
    const { activeHandler, editActionPath } = this.state;
  
    const componentId = selectedComponentIds.first();
    const component = currentComponents.get(componentId);
    const componentMeta = getComponentMeta(component.name, meta);
    const propMeta = componentMeta.props[activeHandler];
    const actionArgsMeta =
      getSourceConfig(propMeta, 'actions', componentMeta.types).args;
    
    const propValue = component.props.get(activeHandler);
    const action = propValue.getActionByPath(editActionPath);
    
    return (
      <ActionEditor
        action={action}
        actionArgsMeta={actionArgsMeta}
        actionComponentMeta={componentMeta}
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
    if (currentView === Views.HANDLERS_LIST) {
      content = this._renderHandlersList();
    } else if (currentView === Views.NEW_ACTION) {
      content = this._renderNewActionView();
    } else if (currentView === Views.EDIT_ACTION) {
      content = this._renderEditActionView();
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

export const ComponentActionsEditor = wrap(ComponentActionsEditorComponent);
