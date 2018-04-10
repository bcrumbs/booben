import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Dialog } from '../../components';

const propTypes = {
  ...Dialog.propTypes,
  pickingComponent: PropTypes.bool.isRequired,
  pickingComponentData: PropTypes.bool.isRequired,
};

const defaultProps = Dialog.defaultProps;

const mapStateToProps = state => ({
  pickingComponent: state.project.pickingComponent,
  pickingComponentData: state.project.pickingComponentData,
});

const wrap = connect(mapStateToProps);

const DesignDialogComponent = props => {
  const { pickingComponent, pickingComponentData } = props;

  const visible = !pickingComponent && !pickingComponentData;

  return (
    <Dialog {...props} visible={visible} />
  );
};

DesignDialogComponent.propTypes = propTypes;
DesignDialogComponent.defaultProps = defaultProps;
DesignDialogComponent.displayName = 'DesignDialog';

export const DesignDialog = wrap(DesignDialogComponent);
