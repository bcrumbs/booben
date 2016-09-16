/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PropTypes } from 'react';

import {
    PageDrawerContentArea
} from '../../../components/PageDrawer/PageDrawer';

import {
    BlockContent,
    BlockContentTitle,
    BlockContentActions,
    BlockContentActionsRegion
} from '../../../components/BlockContent/BlockContent';

import {
    Button
} from '@reactackle/reactackle'

export const ToolPanelContent = props => {
    const titleButtons = [];

    if (props.undockable) titleButtons.push({
        icon: 'arrows-alt',
        onPress: props.onUndock
    });

    titleButtons.push({
        icon: 'chevron-right',
        onPress: props.onCollapse
    });

    const sections = props.sections.map((section, idx) => {
        const SectionComponent = section.component;
        return <SectionComponent key={idx}/>
    });

    let actionsArea = null;
    if (props.mainButtons.length || props.secondaryButtons.length) {
        let mainActionsRegion = null;
        if (props.mainButtons.length) {
            const buttons = props.mainButtons.map((button, idx) => (
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
        if (props.secondaryButtons.length) {
            const buttons = props.secondaryButtons.map((button, idx) => (
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
                    title={props.title}
                    isEditable={props.titleEditable}
                    buttons={titleButtons}
                />

                {sections}

                {actionsArea}
            </BlockContent>
        </PageDrawerContentArea>
    );
};

const ButtonType = PropTypes.shape({
    icon: PropTypes.string,
    text: PropTypes.string,
    disabled: PropTypes.bool,
    onPress: PropTypes.func
});

ToolPanelContent.propTypes = {
    title: PropTypes.string,
    titleEditable: PropTypes.bool,
    onTitleChange: PropTypes.func,
    undockable: PropTypes.bool,
    onUndock: PropTypes.func,
    onCollapse: PropTypes.func,
    sections: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        component: PropTypes.func.isRequired
    })),
    mainButtons: PropTypes.arrayOf(ButtonType),
    secondaryButtons: PropTypes.arrayOf(ButtonType)
};

ToolPanelContent.defaultProps = {
    title: '',
    titleEditable: false,
    onTitleChange: /* istanbul ignore next */ () => {},
    undockable: true,
    onUndock: /* istanbul ignore next */ () => {},
    onCollapse: /* istanbul ignore next */ () => {},
    sections: [],
    mainButtons: [],
    secondaryButtons: []
};

ToolPanelContent.displayName = 'ToolPanelContent';
