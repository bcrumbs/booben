/**
 * @author Dmitriy Bizyaev
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';

import {
  BlockContentBox,
  BlockContentBoxItem,
} from '../../components/BlockContent';

import { ComponentHandlers, ComponentHandler } from '../../components/actions';
import { ActionsList } from '../ActionsList/ActionsList';
import { ActionEditor } from '../ActionEditor/ActionEditor';
import { addAction, replaceAction, deleteAction } from '../../actions/project';
import { singleSelectedComponentSelector } from '../../selectors';
import { PathStartingPoints } from '../../reducers/project';

import {
  getComponentMeta,
  getString,
  isValidSourceForValue,
  getSourceConfig,
} from '../../lib/meta';

import ProjectComponent from '../../models/ProjectComponent';

const Views = {
  HANDLERS_LIST: 0,
  NEW_ACTION: 1,
  EDIT_ACTION: 2,
};

const propTypes = {
  meta: PropTypes.object.isRequired,
  selectedComponent: PropTypes.instanceOf(ProjectComponent),
  language: PropTypes.string.isRequired,
  onAddAction: PropTypes.func.isRequired,
  onReplaceAction: PropTypes.func.isRequired,
  onDeleteAction: PropTypes.func.isRequired,
};

const defaultProps = {
  selectedComponent: null,
};

const mapStateToProps = state => ({
  meta: state.project.meta,
  selectedComponent: singleSelectedComponentSelector(state),
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

class ComponentActionsEditorComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.componentActionPropEntries = this._getActionPropEntries(props);
    const haveActions = this.componentActionPropEntries.length > 0;

    this.state = {
      currentView: Views.HANDLERS_LIST,

      // Handlers list
      activeHandler: haveActions ? this.componentActionPropEntries[0][0] : '',

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

  _getActionPropEntries(props) {
    if (props.selectedComponent === null) {
      return [];
    }

    const componentMeta = getComponentMeta(
      props.selectedComponent.name,
      props.meta,
    );

    return Object.entries(componentMeta.props)
      .filter(([, propMeta]) => isValidSourceForValue(propMeta, 'actions'));
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
    const { selectedComponent, onDeleteAction } = this.props;
    const { activeHandler } = this.state;

    const pathToList = actionPath.slice(0, -1);
    const index = actionPath[actionPath.length - 1];
    const fullPath = {
      startingPoint: PathStartingPoints.CURRENT_COMPONENTS,
      steps: [
        selectedComponent.id,
        'props',
        activeHandler,
        'actions',
        ...pathToList,
      ],
    };

    onDeleteAction({ path: fullPath, index });
  }

  _handleActionEditorSave({ action }) {
    const { selectedComponent, onAddAction, onReplaceAction } = this.props;

    const {
      currentView,
      activeHandler,
      newActionPathToList,
      editActionPath,
    } = this.state;

    // TODO: Create jssyValue if it doesn't exist

    if (currentView === Views.NEW_ACTION) {
      const path = {
        startingPoint: PathStartingPoints.CURRENT_COMPONENTS,
        steps: [
          selectedComponent.id,
          'props',
          activeHandler,
          'actions',
          ...newActionPathToList,
        ],
      };

      onAddAction({ path, action });
    } else if (currentView === Views.EDIT_ACTION) {
      const pathToList = editActionPath.slice(0, -1);
      const index = editActionPath[editActionPath.length - 1];

      const fullPath = {
        startingPoint: PathStartingPoints.CURRENT_COMPONENTS,
        steps: [
          selectedComponent.id,
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
    const { meta, selectedComponent, language } = this.props;
    const { activeHandler } = this.state;

    const componentMeta = getComponentMeta(selectedComponent.name, meta);
    const handlersList = this.componentActionPropEntries.map(entry => {
      const [propName, propMeta] = entry;
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

      const hasValue = selectedComponent.props.has(propName);
      const actions = hasValue
        ? selectedComponent.props.get(propName).sourceData.actions
        : List();

      const hasActions = actions.size > 0;
      const expanded = propName === activeHandler;

      return (
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
            actions={actions}
            onCreateAction={this._handleOpenNewActionForm}
            onEditAction={this._handleEditAction}
            onDeleteAction={this._handleDeleteAction}
          />
        </ComponentHandler>
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
    const { meta, selectedComponent } = this.props;
    const { activeHandler } = this.state;

    const componentMeta = getComponentMeta(selectedComponent.name, meta);
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
    const { meta, selectedComponent } = this.props;
    const { activeHandler, editActionPath } = this.state;

    const componentMeta = getComponentMeta(selectedComponent.name, meta);
    const propMeta = componentMeta.props[activeHandler];
    const actionArgsMeta =
      getSourceConfig(propMeta, 'actions', componentMeta.types).args;

    const propValue = selectedComponent.props.get(activeHandler);
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
    const { selectedComponent } = this.props;
    const { currentView } = this.state;

    if (selectedComponent === null) {
      return null;
    }

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
