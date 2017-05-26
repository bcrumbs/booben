/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _omit from 'lodash.omit';
import { Dialog } from '@reactackle/reactackle';

const propTypes = {
  pickingComponent: PropTypes.bool.isRequired,
  pickingComponentStateSlot: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  pickingComponent: state.project.pickingComponent,
  pickingComponentStateSlot: state.project.pickingComponentStateSlot,
});

const wrap = connect(mapStateToProps);

const omittedProps = [...Object.keys(propTypes), 'visible', 'children'];

const DesignDialogComponent = props => {
  const {
    pickingComponent,
    pickingComponentStateSlot,
    visible,
    children,
  } = props;
  
  const propsForDialog = _omit(props, omittedProps);
  const reallyVisible =
    !pickingComponent &&
    !pickingComponentStateSlot &&
    visible;
  
  return (
    <Dialog {...propsForDialog} visible={reallyVisible}>
      {children}
    </Dialog>
  );
};

DesignDialogComponent.propTypes = { ...Dialog.propTypes, ...propTypes };
DesignDialogComponent.defaultProps = Dialog.defaultProps;
DesignDialogComponent.displayName = 'DesignDialog';

export const DesignDialog = wrap(DesignDialogComponent);
