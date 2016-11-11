/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import {
    BlockContentBox,
    BlockContentBoxItem
} from '../../components/BlockContent/BlockContent';

import {
    PropsItem
} from '../../components/PropsList/PropsList';

import ProjectRecord, { getComponentById } from '../../models/Project';

import { toggleComponentRegion } from '../../actions/project';

import { currentSelectedComponentIdsSelector } from '../../selectors';

import { getComponentMeta, getString } from '../../utils/meta';
import { getLocalizedText } from '../../utils';

//noinspection JSUnresolvedVariable
import defaultRegionIcon from '../../img/layout_default.svg';

class ComponentRegionsEditorComponent extends PureComponent {
    _handleRegionToggle(regionIdx, enable) {
        const componentId = this.props.selectedComponentIds.first();
        this.props.onToggleRegion(componentId, regionIdx, enable);
    }

    render() {
        if (this.props.selectedComponentIds.size !== 1) return null;

        const componentId = this.props.selectedComponentIds.first(),
            component = getComponentById(this.props.project, componentId),
            componentMeta = getComponentMeta(component.name, this.props.meta);

        if (componentMeta.kind !== 'composite') return null;

        const layoutMeta = componentMeta.layouts[component.layout];

        const items = layoutMeta.regions.map((region, idx) => (
            <PropsItem
                key={idx}
                type="toggle"
                image={region.icon || defaultRegionIcon}
                label={getString(componentMeta, region.textKey, this.props.language)}
                value={component.regionsEnabled.has(idx)}
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
    project: PropTypes.instanceOf(ProjectRecord),
    meta: PropTypes.object,
    selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number),
    language: PropTypes.string,

    getLocalizedText: PropTypes.func,
    onToggleRegion: PropTypes.func
};

ComponentRegionsEditorComponent.displayName = 'ComponentRegionsEditor';

const mapStateToProps = state => ({
    project: state.project.data,
    meta: state.project.meta,
    selectedComponentIds: currentSelectedComponentIdsSelector(state),
    language: state.app.language,
    getLocalizedText(...args) { return getLocalizedText(state.app.localization, state.app.language, ...args) }
});

const mapDispatchToProps = dispatch => ({
    onToggleRegion: (componentId, regionIdx, enable) =>
        void dispatch(toggleComponentRegion(componentId, regionIdx, enable))
});

export const ComponentRegionsEditor = connect(
    mapStateToProps,
    mapDispatchToProps
)(ComponentRegionsEditorComponent);
