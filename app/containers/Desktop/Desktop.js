/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component, PropTypes } from 'react';

import { MainRegion, Content } from '@reactackle/reactackle';
import { ToolWindow } from '../ToolWindow/ToolWindow';
import { ToolPanel } from '../ToolPanel/ToolPanel';

import ToolType from '../../prop-types/Tool';

const findWindowedTools = toolGroups => {
    const ret = [];
    toolGroups.forEach(toolGroup => {
        toolGroup.tools.forEach(tool => {
            if (!tool.docked && !tool.closed) ret.push(tool);
        })
    });

    return ret;
};

export class Desktop extends Component {
    constructor(props) {
        super(props);

        this.topTool = null;

        let nextZIndex = 0;
        props.toolGroups.forEach(toolGroup => {
            toolGroup.tools.forEach(tool => {
                tool.zIndex = nextZIndex++;
                this.topTool = tool;
            })
        });

        const windowedTools = findWindowedTools(props.toolGroups);

        this.state = {
            toolInStickRegion: null,
            windowedTools: windowedTools
        };

        this._handleToolUndock = this._handleToolUndock.bind(this);
        this._handleStickRegionLeave = this._handleStickRegionLeave.bind(this);
        this._handleStopDrag = this._handleStopDrag.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.toolGroups !== this.props.toolGroups) {
            this.topTool = null;

            let nextZIndex = 0;
            nextProps.toolGroups.forEach(toolGroup => {
                toolGroup.tools.forEach(tool => {
                    tool.zIndex = nextZIndex++;
                    this.topTool = tool;
                })
            });

            const nextWindowsTools = findWindowedTools(nextProps.toolGroups);

            this.setState({
                windowedTools: nextWindowsTools
            });
        }
    }

    _makeTopTool(tool) {
        tool.zIndex = this.topTool.zIndex + 1;
        this.topTool = tool;
    }

    _removeWindow(tool) {
        const idx = this.state.windowedTools.indexOf(tool);
        if (idx > -1) {
            this.state.windowedTools.splice(idx, 1);
            this.forceUpdate();
        }
    }

    _handleClose(tool) {
        tool.closed = true;
        tool.docked = true;
        this._removeWindow(tool);
    }

    _handleDock(tool) {
        tool.docked = true;
        this._removeWindow(tool);
    }

    _handleToolUndock(tool) {
        tool.docked = false;
        this.state.windowedTools.push(tool);
        this._makeTopTool(tool);
        this.forceUpdate();
    }

    _handleStickRegionEnter(tool) {
        this.setState({
            toolInStickRegion: tool
        });
    }

    _handleStickRegionLeave() {
        this.setState({
            toolInStickRegion: null
        });
    }

    _handleStopDrag() {
        if (this.state.toolInStickRegion) {
            const tool = this.state.toolInStickRegion;
            this.state.toolInStickRegion = null;
            this._handleDock(tool);
        }
    }

    _handleWindowFocus(tool) {
        this._makeTopTool(tool);
        this.forceUpdate();
    }

    render() {
        const dockedToolGroups = this.props.toolGroups
            .map(toolGroup => {
                const ret = { tools: [] };

                toolGroup.tools.forEach(tool => {
                    if (tool.docked)
                        ret.tools.push(tool);
                    else if (tool === this.state.toolInStickRegion)
                        ret.tools.push(null);
                });

                return ret;
            })
            .filter(toolGroup => toolGroup.tools.length > 0);

        const windows = this.state.windowedTools.map(tool => (
            <ToolWindow
                key={tool.id}
                title={tool.title}
                titleEditable={tool.titleEditable}
                subtitle={tool.subtitle}
                closable={tool.closable}
                onClose={this._handleClose.bind(this, tool)}
                dockable={tool.undockable}
                onDock={this._handleDock.bind(this, tool)}
                sections={tool.sections}
                mainButtons={tool.mainButtons}
                secondaryButtons={tool.secondaryButtons}
                maxHeight={tool.maxHeight}
                zIndex={tool.zIndex}
                constrainPosition
                marginRight={8}
                marginBottom={8}
                stickRegionRight={100}
                onStickRegionEnter={this._handleStickRegionEnter.bind(this, tool)}
                onStickRegionLeave={this._handleStickRegionLeave}
                onStopDrag={this._handleStopDrag}
                onFocus={this._handleWindowFocus.bind(this, tool)}
            />
        ));

        return (
            <MainRegion>
                <Content>
                    {this.props.children}
                    {windows}
                </Content>

                <ToolPanel
                    toolGroups={dockedToolGroups}
                    onToolUndock={this._handleToolUndock}
                />
            </MainRegion>
        );
    }
}

Desktop.propTypes = {
    toolGroups: PropTypes.arrayOf(PropTypes.shape({
        tools: PropTypes.arrayOf(ToolType)
    }))
};

Desktop.defaultProps = {
    toolGroups: []
};

Desktop.displayName = 'Desktop';
