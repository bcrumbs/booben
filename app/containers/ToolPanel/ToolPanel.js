/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component, PropTypes } from 'react';

import {
    PageDrawer,
    PageDrawerActionsArea,
    PageDrawerActionsGroup,
    PageDrawerActionItem
} from '../../components/PageDrawer/PageDrawer';

import { ToolPanelContent } from './ToolPanelContent/ToolPanelContent';

import ToolType from '../../prop-types/Tool';

export class ToolPanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isExpanded: props.isExpanded,
            activeGroup: 0,
            activeTool: 0
        };

        this._handleCollapse = this._handleCollapse.bind(this);
        this._handleUndockActiveTool = this._handleUndockActiveTool.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const newState = {};
        let willSetState = false;

        if (nextProps.isExpanded !== this.state.isExpanded) {
            newState.isExpanded = nextProps.isExpanded;
            willSetState = true;
        }

        if (nextProps.toolGroups !== this.props.toolGroups) {
            newState.activeGroup = 0;
            newState.activeTool = 0;
            willSetState = true;
        }

        if (willSetState) this.setState(newState);
    }

    _handlePanelSelect(groupIdx, panelIdx) {
        this.setState({
            activeGroup: groupIdx,
            activeTool: panelIdx,
            isExpanded: true
        });
    }

    _handleCollapse() {
        this.setState({
            isExpanded: false
        });
    }

    _handleUndockActiveTool() {
        const activeTool =
            this.props.toolGroups[this.state.activeGroup].tools[this.state.activeTool];

        this.props.onToolUndock(activeTool);
    }

    render() {
        const haveTools = this.props.toolGroups.some(group => group.tools.length > 0);

        if (!haveTools) {
            return (
                <PageDrawer>
                    <PageDrawerActionsArea/>
                </PageDrawer>
            )
        }

        const panelSwitcherGroups = this.props.toolGroups
            .filter(group => group.tools.length > 0)
            .map((group, groupIdx) => {
                const icons = group.tools.map((panel, panelIdx) => {
                    const isActive =
                        groupIdx === this.state.activeGroup &&
                        panelIdx === this.state.activeTool;

                    const onPress =
                        this._handlePanelSelect.bind(this, groupIdx, panelIdx);

                    return (
                        <PageDrawerActionItem
                            icon={panel.icon}
                            title={panel.name}
                            isActive={isActive}
                            key={panelIdx}
                            onPress={onPress}
                        />
                    );
                });

                return (
                    <PageDrawerActionsGroup key={groupIdx}>
                        {icons}
                    </PageDrawerActionsGroup>
                );
            });

        const activeTool =
            this.props.toolGroups[this.state.activeGroup].tools[this.state.activeTool];

        return (
            <PageDrawer isExpanded={this.state.isExpanded}>
                <PageDrawerActionsArea>
                    {panelSwitcherGroups}
                </PageDrawerActionsArea>

                <ToolPanelContent
                    title={activeTool.title}
                    titleEditable={activeTool.titleEditable}
                    onTitleChange={activeTool.onTitleChange}
                    undockable={activeTool.undockable}
                    onUndock={this._handleUndockActiveTool}
                    onCollapse={this._handleCollapse}
                    sections={activeTool.sections}
                    mainButtons={activeTool.mainButtons}
                    secondaryButtons={activeTool.secondaryButtons}
                />
            </PageDrawer>
        );
    }
}

ToolPanel.propTypes = {
    isExpanded: PropTypes.bool,
    toolGroups: PropTypes.arrayOf(PropTypes.shape({
        tools: PropTypes.arrayOf(ToolType)
    })),
    onToolUndock: PropTypes.func
};

ToolPanel.defaultProps = {
    isExpanded: false,
    toolGroups: [],
    onToolUndock: /* istanbul ignore next */ () => {}
};

ToolPanel.displayName = 'ToolPanel';
