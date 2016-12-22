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

import {
    PropsItem,
} from '../../components/PropsList/PropsList';

import ProjectComponent from '../../models/ProjectComponent';

import { toggleComponentRegion } from '../../actions/project';

import {
    currentComponentsSelector,
    currentSelectedComponentIdsSelector,
} from '../../selectors';

import { getComponentMeta, getString } from '../../utils/meta';
import { getLocalizedTextFromState } from '../../utils';

// noinspection JSUnresolvedVariable
import defaultRegionIcon from '../../img/layout_default.svg';

class ComponentRegionsEditorComponent extends PureComponent {
  _handleRegionToggle(regionIdx, enable) {
    const componentId = this.props.selectedComponentIds.first();
    this.props.onToggleRegion(componentId, regionIdx, enable);
  }

  render() {
    if (this.props.selectedComponentIds.size !== 1) return null;

    const componentId = this.props.selectedComponentIds.first(),
      component = this.props.currentComponents.get(componentId),
      componentMeta = getComponentMeta(component.name, this.props.meta);

    if (componentMeta.kind !== 'composite') return null;

    const layoutMeta = componentMeta.layouts[component.layout];

    const items = layoutMeta.regions.map((region, idx) => (
      <PropsItem
        key={idx}
        propType={{
          view: 'toggle',
          label: getString(componentMeta, region.textKey, this.props.language),
          image: region.icon || defaultRegionIcon,
          linkable: false,
        }}
        value={{
          value: component.regionsEnabled.has(idx),
          linked: false,
        }}
        onChange={this._handleRegionToggle.bind(this, idx)}
      />
        ));

    return (
      <BlockContentBox isBordered>
        <BlockContentBoxItem>
          {items}
        </BlockContentBoxItem>
      </BlockContentBox>
    );
  }
}

ComponentRegionsEditorComponent.propTypes = {
  meta: PropTypes.object,
  currentComponents: ImmutablePropTypes.mapOf(
        PropTypes.instanceOf(ProjectComponent),
        PropTypes.number,
    ),
  selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number),
  language: PropTypes.string,
  getLocalizedText: PropTypes.func,

  onToggleRegion: PropTypes.func,
};

ComponentRegionsEditorComponent.displayName = 'ComponentRegionsEditor';

const mapStateToProps = state => ({
  meta: state.project.meta,
  currentComponents: currentComponentsSelector(state),
  selectedComponentIds: currentSelectedComponentIdsSelector(state),
  language: state.app.language,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onToggleRegion: (componentId, regionIdx, enable) =>
        void dispatch(toggleComponentRegion(componentId, regionIdx, enable)),
});

export const ComponentRegionsEditor = connect(
    mapStateToProps,
    mapDispatchToProps,
)(ComponentRegionsEditorComponent);
