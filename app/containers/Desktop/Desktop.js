/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component, PropTypes } from 'react';

import { MainRegion, Content } from '@reactackle/reactackle';
import { ToolWindow } from '../ToolWindow/ToolWindow';
import { ToolPanel } from '../ToolPanel/ToolPanel';

import ToolType from '../../prop-types/Tool';

export class Desktop extends Component {
    constructor(props) {
        super(props);

        this.state = {
            toolInStickRegion: null
        };

        this._handleToolUndock = this._handleToolUndock.bind(this);
        this._handleStickRegionLeave = this._handleStickRegionLeave.bind(this);
        this._handleStopDrag = this._handleStopDrag.bind(this);
    }

    _handleClose(tool) {
        tool.closed = true;
        tool.docked = true;
        this.forceUpdate();
    }

    _handleDock(tool) {
        tool.docked = true;
        this.forceUpdate();
    }

    _handleToolUndock(tool) {
        tool.docked = false;
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
            this.state.toolInStickRegion.docked = true;
            this.state.toolInStickRegion = null;
            this.forceUpdate();
        }
    }

    render() {
        const windowedTools = [];
        this.props.toolGroups.forEach(toolGroup => {
            toolGroup.tools.forEach(tool => {
                if (!tool.docked && !tool.closed) windowedTools.push(tool);
            })
        });

        const dockedToolGroups = this.props.toolGroups
            .map(toolGroup => {
                const ret = { tools: [] };

                toolGroup.tools.forEach(tool => {
                    if (tool.docked)
                        ret.tools.push(tool);
                    else if (tool === this.state.toolInStickRegion)
                        ret.tools.push('placeholder');
                });

                return ret;
            })
            .filter(toolGroup => toolGroup.tools.length > 0);

        const windows = windowedTools.map(tool => (
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
                constrainPosition
                marginRight={8}
                marginBottom={8}
                stickRegionRight={100}
                onStickRegionEnter={this._handleStickRegionEnter.bind(this, tool)}
                onStickRegionLeave={this._handleStickRegionLeave}
                onStopDrag={this._handleStopDrag}
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
