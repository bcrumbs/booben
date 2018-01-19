import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  BlockContentBox,
  BlockContentBoxItem,
} from '../../components/BlockContent';

import { PropsList } from '../../components/PropsList/PropsList';
import { PropToggle } from '../../components/props';
import { toggleComponentRegion } from '../../actions/project';
import { singleSelectedComponentSelector } from '../../selectors';
import { getComponentMeta, getString } from '../../lib/meta';
import ProjectComponent from '../../models/ProjectComponent';
import defaultRegionIcon from '../../../assets/layout_default.svg';

const propTypes = {
  meta: PropTypes.object.isRequired, // state
  selectedComponent: PropTypes.instanceOf(ProjectComponent), // state
  language: PropTypes.string.isRequired, // state
  onToggleRegion: PropTypes.func.isRequired, // dispatch
};

const defaultProps = {
  selectedComponent: null,
};

const mapStateToProps = state => ({
  meta: state.project.meta,
  selectedComponent: singleSelectedComponentSelector(state),
  language: state.app.language,
});

const mapDispatchToProps = dispatch => ({
  onToggleRegion: (componentId, regionIdx, enable) =>
    void dispatch(toggleComponentRegion(componentId, regionIdx, enable)),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

class _ComponentRegionsEditor extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this._handleRegionToggleBinds = [];
  }

  _handleRegionToggle(regionIdx, { value }) {
    const { selectedComponent, onToggleRegion } = this.props;
    onToggleRegion(selectedComponent.id, regionIdx, value);
  }

  _getRegionToggleHandler(regionIdx) {
    if (!this._handleRegionToggleBinds[regionIdx]) {
      this._handleRegionToggleBinds[regionIdx] =
        this._handleRegionToggle.bind(this, regionIdx);
    }

    return this._handleRegionToggleBinds[regionIdx];
  }

  render() {
    const { meta, selectedComponent, language } = this.props;

    if (selectedComponent === null) {
      return null;
    }

    const componentMeta = getComponentMeta(selectedComponent.name, meta);
    if (componentMeta.kind !== 'composite') {
      return null;
    }

    const layoutMeta = componentMeta.layouts[selectedComponent.layout];
    const items = layoutMeta.regions.map((region, idx) => (
      <PropToggle
        key={String(idx)}
        label={getString(componentMeta.strings, region.textKey, language)}
        image={region.icon || defaultRegionIcon}
        value={selectedComponent.regionsEnabled.has(idx)}
        onChange={this._getRegionToggleHandler(idx)}
      />
    ));

    return (
      <BlockContentBox isBordered>
        <BlockContentBoxItem>
          <PropsList>
            {items}
          </PropsList>
        </BlockContentBoxItem>
      </BlockContentBox>
    );
  }
}

_ComponentRegionsEditor.propTypes = propTypes;
_ComponentRegionsEditor.defaultProps = defaultProps;
_ComponentRegionsEditor.displayName = 'ComponentRegionsEditor';

export const ComponentRegionsEditor = wrap(_ComponentRegionsEditor);
