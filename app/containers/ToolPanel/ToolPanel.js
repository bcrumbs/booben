/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component, PropTypes } from 'react';

import {
    PageDrawer,
    PageDrawerActionsArea,
    PageDrawerActionsGroup,
    PageDrawerActionItem,
    PageDrawerActionPlaceholder
} from '../../components/PageDrawer/PageDrawer';

import { ToolPanelContent } from './ToolPanelContent/ToolPanelContent';

import ToolType from '../../prop-types/Tool';

const getFirstTool = toolGroups => {
    for (let i = 0, l = toolGroups.length; i < l; i++)
        for (let j = 0, m = toolGroups[i].tools.length; j < m; j++)
            if (toolGroups[i].tools[j] !== 'placeholder')
                return toolGroups[i].tools[j];

    return null;
};

export class ToolPanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isExpanded: props.isExpanded,
            activeTool: getFirstTool(props.toolGroups)
        };

        this._handleCollapse = this._handleCollapse.bind(this);
        this._handleUndockActiveTool = this._handleUndockActiveTool.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.toolGroups !== this.props.toolGroups) {
            let foundActiveTool = false;

            for (let i = 0, l = nextProps.toolGroups.length; i < l; i++) {
                for (let j = 0, m = nextProps.toolGroups[i].tools.length; j < m; j++) {
                    if (nextProps.toolGroups[i].tools[j] === this.state.activeTool) {
                        foundActiveTool = true;
                        break;
                    }
                }

                if (foundActiveTool) break;
            }

            if (!foundActiveTool) {
                this.setState({
                    activeTool: getFirstTool(nextProps.toolGroups)
                });
            }
        }
    }

    _handlePanelSelect(tool) {
        this.setState({
            activeTool: tool,
            isExpanded: true
        });
    }

    _handleCollapse() {
        this.setState({
            isExpanded: false
        });
    }

    _handleUndockActiveTool() {
        this.props.onToolUndock(this.state.activeTool);
    }

    render() {
        const activeTool = this.state.activeTool;

        const panelSwitcherGroups = this.props.toolGroups
            .filter(group => group.tools.length > 0)
            .map((group, groupIdx) => {
                const icons = group.tools.map((tool, toolIdx) => {
                    if (tool === null)
                        return <PageDrawerActionPlaceholder key={toolIdx}/>;

                    return (
                        <PageDrawerActionItem
                            icon={tool.icon}
                            title={tool.name}
                            isActive={tool === activeTool}
                            key={toolIdx}
                            onPress={this._handlePanelSelect.bind(this, tool)}
                        />
                    );
                });

                return (
                    <PageDrawerActionsGroup key={groupIdx}>
                        {icons}
                    </PageDrawerActionsGroup>
                );
            });

        let panelContent = null,
            isExpanded = false;

        if (activeTool !== null) {
            panelContent = (
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
            );

            isExpanded = this.state.isExpanded;
        }

        return (
            <PageDrawer isExpanded={isExpanded}>
                <PageDrawerActionsArea>
                    {panelSwitcherGroups}
                </PageDrawerActionsArea>

                {panelContent}
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
