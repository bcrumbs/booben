/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { BlockContentBox, BlockContentBoxItem } from '@jssy/common-ui';
import { PropsList } from '../../components/PropsList/PropsList';
import { PropToggle } from '../../components/props';
import { toggleComponentRegion } from '../../actions/project';

import {
  currentComponentsSelector,
  selectedComponentIdsSelector,
} from '../../selectors';

import { getComponentMeta, getString } from '../../lib/meta';
import * as JssyPropTypes from '../../constants/common-prop-types';
import defaultRegionIcon from '../../../assets/layout_default.svg';

const propTypes = {
  meta: PropTypes.object.isRequired,
  currentComponents: JssyPropTypes.components.isRequired,
  selectedComponentIds: JssyPropTypes.setOfIds.isRequired,
  language: PropTypes.string.isRequired,
  onToggleRegion: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  meta: state.project.meta,
  currentComponents: currentComponentsSelector(state),
  selectedComponentIds: selectedComponentIdsSelector(state),
  language: state.app.language,
});

const mapDispatchToProps = dispatch => ({
  onToggleRegion: (componentId, regionIdx, enable) =>
    void dispatch(toggleComponentRegion(componentId, regionIdx, enable)),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

class ComponentRegionsEditorComponent extends PureComponent {
  _handleRegionToggle(regionIdx, { value }) {
    const { selectedComponentIds, onToggleRegion } = this.props;
    
    const componentId = selectedComponentIds.first();
    onToggleRegion(componentId, regionIdx, value);
  }

  render() {
    const {
      meta,
      currentComponents,
      selectedComponentIds,
      language,
    } = this.props;
    
    if (selectedComponentIds.size !== 1) return null;

    const componentId = selectedComponentIds.first();
    const component = currentComponents.get(componentId);
    const componentMeta = getComponentMeta(component.name, meta);

    if (componentMeta.kind !== 'composite') return null;

    const layoutMeta = componentMeta.layouts[component.layout];

    /* eslint-disable react/jsx-no-bind */
    const items = layoutMeta.regions.map((region, idx) => (
      <PropToggle
        key={String(idx)}
        label={getString(componentMeta.strings, region.textKey, language)}
        image={region.icon || defaultRegionIcon}
        value={component.regionsEnabled.has(idx)}
        onChange={this._handleRegionToggle.bind(this, idx)}
      />
    ));
    /* eslint-enable react/jsx-no-bind */

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

ComponentRegionsEditorComponent.propTypes = propTypes;
ComponentRegionsEditorComponent.displayName = 'ComponentRegionsEditor';

export const ComponentRegionsEditor = wrap(ComponentRegionsEditorComponent);
