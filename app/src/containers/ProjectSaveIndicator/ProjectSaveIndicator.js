/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ProjectSave } from '../../components/ProjectSave/ProjectSave';
import { getLocalizedTextFromState } from '../../selectors';
import { returnArg } from '../../utils/misc';

const propTypes = {
  saving: PropTypes.bool.isRequired,
  lastSaveError: PropTypes.object,
  lastSaveTimestamp: PropTypes.number.isRequired,
  lastSavedRevision: PropTypes.number.isRequired,
  getLocalizedText: PropTypes.func,
};

const defaultProps = {
  lastSaveError: null,
  getLocalizedText: returnArg,
};

const mapStateToProps = state => ({
  saving: state.project.saving,
  lastSaveError: state.project.lastSaveError,
  lastSaveTimestamp: state.project.lastSaveTimestamp,
  lastSavedRevision: state.project.lastSavedRevision,
  getLocalizedText: getLocalizedTextFromState(state),
});

const wrap = connect(mapStateToProps);

const ProjectSaveIndicatorComponent = props => {
  const { saving, lastSaveError, lastSavedRevision, getLocalizedText } = props;
  
  let title = '';
  let tooltip = '';
  let status = '';
  
  if (saving) {
    title = getLocalizedText('appHeader.saveIndicator.title.saving');
    tooltip = getLocalizedText('appHeader.saveIndicator.tooltip.saving');
    status = 'progress';
  } else if (lastSaveError) {
    title = getLocalizedText('appHeader.saveIndicator.title.error');
    tooltip = getLocalizedText('appHeader.saveIndicator.tooltip.error');
    status = 'error';
  } else if (lastSavedRevision > 0) {
    title = getLocalizedText('appHeader.saveIndicator.title.saved');
    tooltip = getLocalizedText('appHeader.saveIndicator.tooltip.saved');
    status = 'success';
  } else {
    title = getLocalizedText('appHeader.saveIndicator.title.idle');
    tooltip = getLocalizedText('appHeader.saveIndicator.tooltip.idle');
    status = 'default';
  }
  
  return (
    <ProjectSave
      status={status}
      title={title}
      tooltip={tooltip}
    />
  );
};

ProjectSaveIndicatorComponent.propTypes = propTypes;
ProjectSaveIndicatorComponent.defaultProps = defaultProps;
ProjectSaveIndicatorComponent.displayName = 'ProjectSaveIndicator';

export const ProjectSaveIndicator = wrap(ProjectSaveIndicatorComponent);
