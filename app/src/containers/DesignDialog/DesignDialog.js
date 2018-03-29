import React from 'react';
import PropTypes from 'prop-types';
import { Theme } from 'reactackle-core';
import { connect } from 'react-redux';
import { Dialog } from 'reactackle-dialog';
import reactackleThemeMixin from './styles/reactackle-theme-mixin';

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
    <Theme mixin={reactackleThemeMixin}>
      <Dialog {...props} visible={visible} />
    </Theme>
  );
};

DesignDialogComponent.propTypes = propTypes;
DesignDialogComponent.defaultProps = defaultProps;
DesignDialogComponent.displayName = 'DesignDialog';

export const DesignDialog = wrap(DesignDialogComponent);
