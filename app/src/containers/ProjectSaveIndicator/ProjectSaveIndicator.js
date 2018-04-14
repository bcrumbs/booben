import React, { PureComponent } from 'react';
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
  // eslint-disable-next-line react/no-unused-prop-types
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

class _ProjectSaveIndicator extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      savedTime: this._formatSavedTime(props),
    };

    this._handleShowTooltip = this._handleShowTooltip.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      savedTime: this._formatSavedTime(nextProps),
    });
  }

  _formatSavedTime(props) {
    const { lastSaveTimestamp } = props;
    return lastSaveTimestamp > 0 ? moment(lastSaveTimestamp).fromNow() : '';
  }

  _handleShowTooltip() {
    this.setState({
      savedTime: this._formatSavedTime(this.props),
    });
  }

  render() {
    const {
      saving,
      lastSaveError,
      lastSavedRevision,
      getLocalizedText,
    } = this.props;

    const { savedTime } = this.state;

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
        onShowTooltip={this._handleShowTooltip}
      />
    );
  }
}

_ProjectSaveIndicator.propTypes = propTypes;
_ProjectSaveIndicator.defaultProps = defaultProps;
_ProjectSaveIndicator.displayName = 'ProjectSaveIndicator';

export const ProjectSaveIndicator = wrap(_ProjectSaveIndicator);
