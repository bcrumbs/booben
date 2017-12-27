/**
 * @author Dmitriy Bizyaev
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { ProjectSave } from '../../components/ProjectSave/ProjectSave';
import { getLocalizedTextFromState } from '../../selectors';
import { returnArg } from '../../utils/misc';

const propTypes = {
  saving: PropTypes.bool.isRequired,
  lastSaveError: PropTypes.object,
  lastSavedRevision: PropTypes.number.isRequired,
  lastSaveTimestamp: PropTypes.number.isRequired,
  getLocalizedText: PropTypes.func,
};

const defaultProps = {
  lastSaveError: null,
  getLocalizedText: returnArg,
};

const mapStateToProps = state => ({
  saving: state.project.saving,
  lastSaveError: state.project.lastSaveError,
  lastSavedRevision: state.project.lastSavedRevision,
  lastSaveTimestamp: state.project.lastSaveTimestamp,
  getLocalizedText: getLocalizedTextFromState(state),
});

const wrap = connect(mapStateToProps);

const _ProjectSaveIndicator = props => {
  const {
    saving,
    lastSaveError,
    lastSavedRevision,
    getLocalizedText,
    lastSaveTimestamp,
  } = props;

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
    const savedTime = lastSaveTimestamp > 0
      ? moment(lastSaveTimestamp).fromNow()
      : '';

    title = getLocalizedText('appHeader.saveIndicator.title.saved');
    tooltip = getLocalizedText('appHeader.saveIndicator.tooltip.saved', {
      savedTime,
    });

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
      tooltipText={tooltip}
    />
  );
};

_ProjectSaveIndicator.propTypes = propTypes;
_ProjectSaveIndicator.defaultProps = defaultProps;
_ProjectSaveIndicator.displayName = 'ProjectSaveIndicator';

export const ProjectSaveIndicator = wrap(_ProjectSaveIndicator);
