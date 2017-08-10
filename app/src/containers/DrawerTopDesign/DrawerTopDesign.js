/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Button } from '@reactackle/reactackle';
import { DrawerTop } from '../../components/DrawerTop/DrawerTop';

import {
  DrawerTopContent,
} from '../../components/DrawerTopContent/DrawerTopContent';

import {
  pickComponentCancel,
  saveComponentForProp,
  cancelConstructComponentForProp,
} from '../../actions/project';

import {
  haveNestedConstructorsSelector,
  getLocalizedTextFromState,
  nestedConstructorBreadcrumbsSelector,
  currentComponentsSelector,
  rootDraggedComponentSelector,
} from '../../selectors';

import ProjectComponent from '../../models/ProjectComponent';
import { returnArg } from '../../utils/misc';
import * as JssyPropTypes from '../../constants/common-prop-types';
import { INVALID_ID } from '../../constants/misc';

const propTypes = {
  pickingComponent: PropTypes.bool.isRequired,
  pickingComponentData: PropTypes.bool.isRequired,
  haveNestedConstructor: PropTypes.bool.isRequired,
  nestedConstructorBreadcrumbs: ImmutablePropTypes.listOf(
    PropTypes.string,
  ).isRequired,
  currentComponents: JssyPropTypes.components.isRequired,
  rootDraggedComponent: PropTypes.instanceOf(ProjectComponent),
  draggingComponent: PropTypes.bool.isRequired,
  draggingOverPlaceholder: PropTypes.bool.isRequired,
  placeholderContainerId: PropTypes.number.isRequired,
  placeholderAfter: PropTypes.number.isRequired,
  getLocalizedText: PropTypes.func,
  onCancelPickComponent: PropTypes.func.isRequired,
  onSaveComponentForProp: PropTypes.func.isRequired,
  onCancelConstructComponentForProp: PropTypes.func.isRequired,
};

const defaultProps = {
  draggedComponents: null,
  rootDraggedComponent: null,
  getLocalizedText: returnArg,
};

const mapStateToProps = state => ({
  pickingComponent: state.project.pickingComponent,
  pickingComponentData: state.project.pickingComponentData,
  haveNestedConstructor: haveNestedConstructorsSelector(state),
  nestedConstructorBreadcrumbs: nestedConstructorBreadcrumbsSelector(state),
  currentComponents: currentComponentsSelector(state),
  rootDraggedComponent: rootDraggedComponentSelector(state),
  draggingComponent: state.project.draggingComponent,
  draggingOverPlaceholder: state.project.draggingOverPlaceholder,
  placeholderContainerId: state.project.placeholderContainerId,
  placeholderAfter: state.project.placeholderAfter,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onCancelPickComponent: () => void dispatch(pickComponentCancel()),
  
  onSaveComponentForProp: () =>
    void dispatch(saveComponentForProp()),
  
  onCancelConstructComponentForProp: () =>
    void dispatch(cancelConstructComponentForProp()),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

const DrawerTopDesignComponent = props => {
  const {
    pickingComponent,
    pickingComponentData,
    haveNestedConstructor,
    nestedConstructorBreadcrumbs,
    currentComponents,
    rootDraggedComponent,
    draggingComponent,
    draggingOverPlaceholder,
    placeholderContainerId,
    placeholderAfter,
    getLocalizedText,
    onCancelPickComponent,
    onCancelConstructComponentForProp,
    onSaveComponentForProp,
  } = props;
  
  if (pickingComponent || pickingComponentData) {
    return (
      <DrawerTop>
        <DrawerTopContent
          title={getLocalizedText('design.pickComponent')}
        >
          <Button
            text={getLocalizedText('common.cancel')}
            colorScheme="flatLight"
            size="small"
            onPress={onCancelPickComponent}
          />
        </DrawerTopContent>
      </DrawerTop>
    );
  }
  
  if (draggingComponent) {
    const draggedComponentTitle =
      rootDraggedComponent.title ||
      rootDraggedComponent.name;
    
    let title;
    
    if (draggingOverPlaceholder) {
      if (placeholderContainerId === INVALID_ID) {
        title = getLocalizedText('design.willDropRootComponentText', {
          componentTitle: draggedComponentTitle,
        });
      } else {
        const containerComponent =
          currentComponents.get(placeholderContainerId);
        
        const containerTitle =
          containerComponent.title ||
          containerComponent.name;
        
        if (placeholderAfter === -1) {
          title = getLocalizedText('design.willDropComponentText', {
            componentTitle: draggedComponentTitle,
            where: containerTitle,
          });
        } else {
          const afterComponentId =
            containerComponent.children.get(placeholderAfter);
          
          const afterComponent = currentComponents.get(afterComponentId);
          const afterComponentTitle =
            afterComponent.title ||
            afterComponent.name;
          
          title = getLocalizedText('design.willDropComponentAfterText', {
            componentTitle: draggedComponentTitle,
            where: containerTitle,
            after: afterComponentTitle,
          });
        }
      }
    } else {
      title = getLocalizedText('design.draggingComponentText', {
        componentTitle: draggedComponentTitle,
      });
    }
    
    return (
      <DrawerTop>
        <DrawerTopContent title={title} />
      </DrawerTop>
    );
  }
  
  if (haveNestedConstructor) {
    const title = nestedConstructorBreadcrumbs.toArray().join(' / ');
    
    return (
      <DrawerTop>
        <DrawerTopContent title={title}>
          <Button
            text={getLocalizedText('common.cancel')}
            colorScheme="flatLight"
            size="small"
            onPress={onCancelConstructComponentForProp}
          />
  
          <Button
            text={getLocalizedText('common.ok')}
            colorScheme="flatLight"
            size="small"
            onPress={onSaveComponentForProp}
          />
        </DrawerTopContent>
      </DrawerTop>
    );
  }
  
  return null;
};

DrawerTopDesignComponent.propTypes = propTypes;
DrawerTopDesignComponent.defaultProps = defaultProps;
DrawerTopDesignComponent.displayName = 'DrawerTopDesign';

export const DrawerTopDesign = wrap(DrawerTopDesignComponent);
