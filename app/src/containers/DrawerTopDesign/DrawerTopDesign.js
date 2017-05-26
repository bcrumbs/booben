/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from '@reactackle/reactackle';
import { DrawerTop } from '../../components/DrawerTop/DrawerTop';

import {
  DrawerTopPickingContent,
} from '../../components/DrawerTopPickingContent/DrawerTopPickingContent';

import { pickComponentCancel } from '../../actions/project';
import { getLocalizedTextFromState } from '../../selectors';
import { returnArg } from '../../utils/misc';

const propTypes = {
  pickingComponent: PropTypes.bool.isRequired,
  pickingComponentStateSlot: PropTypes.bool.isRequired,
  getLocalizedText: PropTypes.func,
  onCancelPickComponent: PropTypes.func.isRequired,
};

const defaultProps = {
  getLocalizedText: returnArg,
};

const mapStateToProps = state => ({
  pickingComponent: state.project.pickingComponent,
  pickingComponentStateSlot: state.project.pickingComponentStateSlot,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onCancelPickComponent: () => void dispatch(pickComponentCancel()),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

const DrawerTopDesignComponent = props => {
  const {
    pickingComponent,
    pickingComponentStateSlot,
    getLocalizedText,
    onCancelPickComponent,
  } = props;
  
  if (pickingComponent || pickingComponentStateSlot) {
    return (
      <DrawerTop>
        <DrawerTopPickingContent
          title={getLocalizedText('design.pickComponent')}
        >
          <Button
            text={getLocalizedText('common.cancel')}
            kind="flat"
            light
            size="small"
            onPress={onCancelPickComponent}
          />
        </DrawerTopPickingContent>
      </DrawerTop>
    );
  }
  
  return null;
};

DrawerTopDesignComponent.propTypes = propTypes;
DrawerTopDesignComponent.defaultProps = defaultProps;
DrawerTopDesignComponent.displayName = 'DrawerTopDesign';

export const DrawerTopDesign = wrap(DrawerTopDesignComponent);
