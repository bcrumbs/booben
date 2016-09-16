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

        this._handleToolUndock = this._handleToolUndock.bind(this);
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

    render() {
        const windowedTools = [];
        this.props.toolGroups.forEach(toolGroup => {
            toolGroup.tools.forEach(tool => {
                if (!tool.docked && !tool.closed) windowedTools.push(tool);
            })
        });

        const dockedToolGroups = this.props.toolGroups
            .map(toolGroup => ({
                tools: toolGroup.tools.filter(tool => tool.docked)
            }))
            .filter(toolGroup => toolGroup.tools.length > 0);

        const windows = windowedTools.map((tool, idx) => (
            <ToolWindow
                key={idx}
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
