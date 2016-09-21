/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import {
    PageDrawerContentArea
} from '../../../../components/PageDrawer/PageDrawer';

import {
    BlockContent,
    BlockContentTitle,
    BlockContentActions,
    BlockContentActionsRegion
} from '../../../../components/BlockContent/BlockContent';

import {
    Button
} from '@reactackle/reactackle'

import { List } from 'immutable';

import ButtonType from '../../../../models/Button';
import ToolType from '../../../../models/Tool';
import ToolStateType from '../../../../models/ToolState';

import { noop } from '../../../../utils/misc';

export const ToolPanelContent = props => {
    const { tool } = props;

    let titleButtons = List([
        new ButtonType({
            icon: 'chevron-right',
            onPress: props.onCollapse
        })
    ]);

    if (tool.undockable) {
        titleButtons = titleButtons.unshift(new ButtonType({
            icon: 'arrows-alt',
            onPress: props.onUndock
        }));
    }

    const sections = tool.sections.map((section, idx) => {
        const SectionComponent = section.component;
        return <SectionComponent key={idx}/>
    });

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
                <BlockContentActionsRegion>
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
                    buttons={titleButtons}
                />

                {sections}
                {actionsArea}
            </BlockContent>
        </PageDrawerContentArea>
    );
};

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
