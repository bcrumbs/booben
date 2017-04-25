/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import {
  BlockContentBox,
  BlockContentBoxItem,
} from '../../components/BlockContent/BlockContent';

import { PropsList } from '../../components/PropsList/PropsList';
import { PropToggle } from '../../components/props';
import ProjectComponent from '../../models/ProjectComponent';
import { toggleComponentRegion } from '../../actions/project';

import {
  currentComponentsSelector,
  currentSelectedComponentIdsSelector,
} from '../../selectors';

import { getComponentMeta, getString } from '../../utils/meta';

//noinspection JSUnresolvedVariable
import defaultRegionIcon from '../../../assets/layout_default.svg';

const propTypes = {
  meta: PropTypes.object.isRequired,
  currentComponents: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectComponent),
    PropTypes.number,
  ).isRequired,
  selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number).isRequired,
  language: PropTypes.string.isRequired,
  onToggleRegion: PropTypes.func.isRequired,
};

const defaultProps = {};

const mapStateToProps = state => ({
  meta: state.project.meta,
  currentComponents: currentComponentsSelector(state),
  selectedComponentIds: currentSelectedComponentIdsSelector(state),
  language: state.app.language,
});

const mapDispatchToProps = dispatch => ({
  onToggleRegion: (componentId, regionIdx, enable) =>
    void dispatch(toggleComponentRegion(componentId, regionIdx, enable)),
});

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

//noinspection JSUnresolvedVariable
ComponentRegionsEditorComponent.propTypes = propTypes;
ComponentRegionsEditorComponent.defaultProps = defaultProps;
ComponentRegionsEditorComponent.displayName = 'ComponentRegionsEditor';

export const ComponentRegionsEditor = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ComponentRegionsEditorComponent);
