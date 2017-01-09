/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
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

// noinspection JSUnresolvedVariable
import defaultRegionIcon from '../../img/layout_default.svg';

class ComponentRegionsEditorComponent extends PureComponent {
  _handleRegionToggle(regionIdx, { value }) {
    const componentId = this.props.selectedComponentIds.first();
    this.props.onToggleRegion(componentId, regionIdx, value);
  }

  render() {
    if (this.props.selectedComponentIds.size !== 1) return null;

    const componentId = this.props.selectedComponentIds.first(),
      component = this.props.currentComponents.get(componentId),
      componentMeta = getComponentMeta(component.name, this.props.meta);

    if (componentMeta.kind !== 'composite') return null;

    const layoutMeta = componentMeta.layouts[component.layout];

    /* eslint-disable react/jsx-no-bind */
    const items = layoutMeta.regions.map((region, idx) => (
      <PropToggle
        key={String(idx)}
        label={getString(componentMeta, region.textKey, this.props.language)}
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

ComponentRegionsEditorComponent.propTypes = {
  meta: PropTypes.object.isRequired,
  currentComponents: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectComponent),
    PropTypes.number,
  ).isRequired,
  selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number).isRequired,
  language: PropTypes.string.isRequired,

  onToggleRegion: PropTypes.func.isRequired,
};

ComponentRegionsEditorComponent.displayName = 'ComponentRegionsEditor';

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

export const ComponentRegionsEditor = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ComponentRegionsEditorComponent);
