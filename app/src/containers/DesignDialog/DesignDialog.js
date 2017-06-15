/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Dialog } from '@reactackle/reactackle';

const propTypes = {
  ...Dialog.propTypes,
  pickingComponent: PropTypes.bool.isRequired,
  pickingComponentStateSlot: PropTypes.bool.isRequired,
};

const defaultProps = Dialog.defaultProps;

const mapStateToProps = state => ({
  pickingComponent: state.project.pickingComponent,
  pickingComponentStateSlot: state.project.pickingComponentStateSlot,
});

const wrap = connect(mapStateToProps);

const DesignDialogComponent = props => {
  const { pickingComponent, pickingComponentStateSlot } = props;
  
  const visible = !pickingComponent && !pickingComponentStateSlot;
  
  return (
    <Dialog {...props} visible={visible} />
  );
};

DesignDialogComponent.propTypes = propTypes;
DesignDialogComponent.defaultProps = defaultProps;
DesignDialogComponent.displayName = 'DesignDialog';

export const DesignDialog = wrap(DesignDialogComponent);
