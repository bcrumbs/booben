'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import {
  linkPropCancel,
  updateComponentPropValue,
  linkWithOwnerProp,
} from '../../actions/project';

import {
  getCurrentComponentWithQueryArgs,
  getRootComponentWithQueryArgs,
  currentComponentsSelector,
  singleComponentSelectedSelector,
  topNestedConstructorSelector,
  topNestedConstructorComponentSelector,
  getAllPossibleNestedContexts,
} from '../../selectors';

import ProjectComponentRecord from '../../models/ProjectComponent';
import { NestedConstructor } from '../../reducers/project';

import {
  DataWindowDataLayout,
} from '../../components/DataWindow/Layouts/DataWindowDataLayout';

import {
  DataWindowQueryLayout,
} from '../../components/DataWindow/Layouts/DataWindowQueryLayout';

import {
  DataWindowOwnerComponentLayout,
} from '../../components/DataWindow/Layouts/DataWindowOwnerComponentLayout';

import {
  DataWindowContextLayout,
} from '../../components/DataWindow/Layouts/DataWindowContextLayout';

import { getLocalizedTextFromState } from '../../utils';
import '../../components/DataWindow/DataWindow.scss';

class DataWindowComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedPath: void 0,
      selectedPathProps: {},
    };
    this._setSelectedPath = this._setSelectedPath.bind(this);
    this._backToMainLayout = this._backToMainLayout.bind(this);
  }

  _setSelectedPath(selectedPath, selectedPathProps = {}) {
    this.setState({ selectedPath, selectedPathProps });
  }

  _backToMainLayout() {
    this.setState({ selectedPath: void 0, selectedPathProps: {} });
  }

  render() {
    const { selectedPathProps } = this.state;
    const component =
      this.state.selectedPath === 'Query'
      ? DataWindowQueryLayout
      : this.state.selectedPath === 'OwnerComponent'
        ? DataWindowOwnerComponentLayout
        : this.state.selectedPath === 'Context'
          ? DataWindowContextLayout
          : DataWindowDataLayout;


    return React.createElement(
      component,
      {
        ...this.props,
        backToMainLayout: this._backToMainLayout,
        setSelectedPath: this._setSelectedPath,
        ...selectedPathProps,
      },
    );
  }
}

DataWindowComponent.propTypes = {
  schema: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  linkingProp: PropTypes.bool.isRequired,
  linkingPropOfComponentId: PropTypes.number.isRequired,
  linkingPropName: PropTypes.string.isRequired,
  linkingPropPath: PropTypes.array.isRequired,
  language: PropTypes.string.isRequired,
  components: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectComponentRecord),
    PropTypes.number,
  ).isRequired,
  currentComponentWithQueryArgs: PropTypes.any.isRequired,
  rootComponentWithQueryArgs: PropTypes.any.isRequired,
  topNestedConstructor: PropTypes.instanceOf(NestedConstructor).isRequired,
  topNestedConstructorComponent: PropTypes.instanceOf(ProjectComponentRecord).isRequired,
  contexts: PropTypes.array.isRequired,
  getLocalizedText: PropTypes.func.isRequired,

  onLinkPropCancel: PropTypes.func.isRequired,
  onUpdateComponentPropValue: PropTypes.func.isRequired,
  onLinkWithOwnerProp: PropTypes.func.isRequired,
};

DataWindowComponent.displayName = 'DataWindow';

const mapStateToProps = state => ({
  schema: state.project.schema,
  meta: state.project.meta,
  linkingProp: state.project.linkingProp,
  linkingPropOfComponentId: state.project.linkingPropOfComponentId,
  linkingPropName: state.project.linkingPropName,
  linkingPropPath: state.project.linkingPropPath,
  language: state.app.language,
  components: currentComponentsSelector(state),
  currentComponentWithQueryArgs: getCurrentComponentWithQueryArgs(state),
  rootComponentWithQueryArgs: getRootComponentWithQueryArgs(state),
  singleComponentSelected: singleComponentSelectedSelector(state),
  topNestedConstructor: topNestedConstructorSelector(state),
  topNestedConstructorComponent: topNestedConstructorComponentSelector(state),
  contexts: getAllPossibleNestedContexts(state),
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onLinkPropCancel: () =>
    void dispatch(linkPropCancel()),
  onUpdateComponentPropValue: (...args) =>
    void dispatch(updateComponentPropValue(...args)),
  onLinkWithOwnerProp: ownerPropName =>
    void dispatch(linkWithOwnerProp(ownerPropName)),
});

export const DataWindow = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DataWindowComponent);
