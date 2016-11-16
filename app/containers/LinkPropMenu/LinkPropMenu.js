/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import {
    DataList,
    DataItem
} from '../../components/DataList/DataList';

import {
    currentComponentsSelector,
    singleComponentSelectedSelector,
    topNestedConstructorSelector,
    topNestedConstructorComponentSelector
} from '../../selectors';

import { linkWithOwnerProp } from '../../actions/project';

import ProjectComponentRecord from '../../models/ProjectComponent';
import { NestedConstructor } from '../../reducers/project';

import { getComponentMeta, getString } from '../../utils/meta';

class LinkPropMenuComponent extends PureComponent {
    render() {
        if (!this.props.singleComponentSelected || !this.props.linkingProp) return null;

        const ownerComponent = this.props.topNestedConstructorComponent;

        if (ownerComponent) {
            // We're in a nested constructor
            // so we can link with owner component props
            const ownerComponentMeta = getComponentMeta(
                ownerComponent.name,
                this.props.meta
            );

            const ownerComponentPropName = this.props.topNestedConstructor.prop,
                ownerComponentPropMeta = ownerComponentMeta.props[ownerComponentPropName],
                ownerProps = ownerComponentPropMeta.sourceConfigs.designer.props;

            const linkTargetComponent =
                this.props.components.get(this.props.linkingPropOfComponentId);

            const linkTargetComponentMeta = getComponentMeta(
                linkTargetComponent.name,
                this.props.meta
            );

            const linkTargetPropMeta =
                linkTargetComponentMeta.props[this.props.linkingPropName];

            // TODO: Improve type check
            const items = Object.keys(ownerProps)
                .filter(ownerPropName =>
                    ownerProps[ownerPropName].type === linkTargetPropMeta.type
                )
                .map((ownerPropName, idx) => {
                    const prop = ownerProps[ownerPropName];

                    const title = getString(
                        ownerComponentMeta,
                        prop.textKey,
                        this.props.language
                    );

                    const subtitle = getString(
                        ownerComponentMeta,
                        prop.descriptionTextKey,
                        this.props.language
                    );

                    return (
                        <DataItem
                            key={idx}
                            title={title || ownerPropName}
                            subtitle={subtitle}
                            type={prop.type}
                            clickable
                            arg={ownerPropName}
                            onClick={this.props.onLinkWithOwnerProp}
                        />
                    );
                });

            return (
                <DataList>
                    {items}
                </DataList>
            );
        }
        else {
            // TODO: Add UI for linking with server data
            return null;
        }
    }
}

LinkPropMenuComponent.propTypes = {
    components: ImmutablePropTypes.mapOf(
        PropTypes.instanceOf(ProjectComponentRecord),
        PropTypes.number
    ),
    meta: PropTypes.object,
    singleComponentSelected: PropTypes.bool,
    linkingProp: PropTypes.bool,
    linkingPropOfComponentId: PropTypes.number,
    linkingPropName: PropTypes.string,
    topNestedConstructor: PropTypes.instanceOf(NestedConstructor),
    topNestedConstructorComponent: PropTypes.instanceOf(ProjectComponentRecord),
    language: PropTypes.string,

    onLinkWithOwnerProp: PropTypes.func
};

LinkPropMenuComponent.displayName = 'LinkPropMenu';

const mapStateToProps = state => ({
    components: currentComponentsSelector(state),
    meta: state.project.meta,
    singleComponentSelected: singleComponentSelectedSelector(state),
    linkingProp: state.project.linkingProp,
    linkingPropOfComponentId: state.project.linkingPropOfComponentId,
    linkingPropName: state.project.linkingPropName,
    topNestedConstructor: topNestedConstructorSelector(state),
    topNestedConstructorComponent: topNestedConstructorComponentSelector(state),
    language: state.project.languageForComponentProps
});

const mapDispatchToProps = dispatch => ({
    onLinkWithOwnerProp: ownerPropName =>
        void dispatch(linkWithOwnerProp(ownerPropName))
});

export const LinkPropMenu = connect(
    mapStateToProps,
    mapDispatchToProps
)(LinkPropMenuComponent);
