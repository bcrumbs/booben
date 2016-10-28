/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';

import {
    PageDrawerContentArea
} from '../../../../components/PageDrawer/PageDrawer';

import {
    BlockContent,
    BlockContentTitle,
    BlockContentActions,
    BlockContentActionsRegion,
    BlockContentNavigation
} from '../../../../components/BlockContent/BlockContent';

import {
    Button,
    Tabs,
    Tab
} from '@reactackle/reactackle'

import { List } from 'immutable';

import ButtonType from '../../../../models/Button';
import ToolType from '../../../../models/Tool';
import ToolStateType from '../../../../models/ToolState';

import { noop } from '../../../../utils/misc';

export class ToolPanelContent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeSection: 0
        };

        this._handleNavigation = this._handleNavigation.bind(this);
    }

    _handleNavigation(newActiveSection) {
        this.setState({
            activeSection: newActiveSection
        });
    }

    render() {
        const { tool } = this.props;

        let titleButtons = List([
            new ButtonType({
                icon: 'chevron-right',
                onPress: this.props.onCollapse
            })
        ]);

        if (tool.undockable) {
            titleButtons = titleButtons.unshift(new ButtonType({
                icon: 'arrows-alt',
                onPress: this.props.onUndock
            }));
        }

        let navArea = null;
        const sections = tool.sections,
            sectionsNum = sections.size;

        if (sectionsNum > 1) {
            const tabs = sections.map((section, idx) => (
                <Tab key={idx} text={section.name} />
            ));

            navArea = (
                <BlockContentNavigation>
                    <Tabs
                        colorMode="dark"
                        selected={this.state.activeSection}
                        onSelectTab={this._handleNavigation}
                    >
                        {tabs}
                    </Tabs>
                </BlockContentNavigation>
            );
        }

        const activeSection = sections.get(this.state.activeSection) || null;

        const ContentComponent = activeSection !== null
            ? activeSection.component
            : null;

        const content = ContentComponent ? <ContentComponent/> : null;

        let actionsArea = null;
        const mainButtons = tool.mainButtons,
            secondaryButtons = tool.secondaryButtons,
            mainButtonsNum = mainButtons.size,
            secondaryButtonsNum = secondaryButtons.size;

        if (mainButtonsNum > 0 || secondaryButtonsNum > 0) {
            let mainActionsRegion = null;
            if (mainButtonsNum > 0) {
                const buttons = mainButtons.map((button, idx) => (
                    <Button
                        key={idx}
                        icon={button.icon}
                        text={button.text}
                        onPress={button.onPress}
                    />
                ));

                mainActionsRegion = (
                    <BlockContentActionsRegion type="main">
                        {buttons}
                    </BlockContentActionsRegion>
                );
            }

            let secondaryButtonsRegion = null;
            if (secondaryButtonsNum > 0) {
                const buttons = secondaryButtons.map((button, idx) => (
                    <Button
                        key={idx}
                        icon={button.icon}
                        text={button.text}
                        onPress={button.onPress}
                    />
                ));

                secondaryButtonsRegion = (
                    <BlockContentActionsRegion type="secondary">
                        {buttons}
                    </BlockContentActionsRegion>
                );
            }

            actionsArea = (
                <BlockContentActions>
                    {secondaryButtonsRegion}
                    {mainActionsRegion}
                </BlockContentActions>
            );
        }

        return (
            <PageDrawerContentArea>
                <BlockContent>
                    <BlockContentTitle
                        title={tool.title}
                        isEditable={tool.titleEditable}
                        titlePlaceHolder={tool.titlePlaceholder}
                        buttons={titleButtons}
                        onTitleChange={this.props.onTitleChange}
                    />

                    {navArea}
                    {content}
                    {actionsArea}
                </BlockContent>
            </PageDrawerContentArea>
        );
    }
}

ToolPanelContent.propTypes = {
    tool: PropTypes.instanceOf(ToolType).isRequired,
    toolState: PropTypes.instanceOf(ToolStateType).isRequired,
    onTitleChange: PropTypes.func,
    onUndock: PropTypes.func,
    onCollapse: PropTypes.func
};

ToolPanelContent.defaultProps = {
    onTitleChange: noop,
    onUndock: noop,
    onCollapse: noop,
};

ToolPanelContent.displayName = 'ToolPanelContent';
