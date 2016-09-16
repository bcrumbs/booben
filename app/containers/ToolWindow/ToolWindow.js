/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import {
    DraggableWindow,
    DraggableWindowRegion
} from '../../components/DraggableWindow/DraggableWindow';

import {
    BlockContent,
    BlockContentTitle,
    BlockContentNavigation,
    BlockContentActions,
    BlockContentActionsRegion
} from '../../components/BlockContent/BlockContent';

import {
    Button,
    Tabs,
    Tab
} from '@reactackle/reactackle';

import ButtonType from '../../prop-types/Button';


let draggedWindow = null,
    windowsNum = 0;

const mouseUpListener = () => {
    if (draggedWindow === null) return;

    draggedWindow.setState({
        dragging: false
    });

    draggedWindow = null;
};

const updateWindowElement = () => {
    if (draggedWindow === null) return;
    draggedWindow.needRAF = true;

    const { dx, dy } = draggedWindow;
    draggedWindow.currentTranslateX = dx;
    draggedWindow.currentTranslateY = dy;
    draggedWindow.domNode.style.transform = `translate(${dx}px, ${dy}px)`;
};

const mouseMoveListener = event => {
    if (draggedWindow === null) return;

    draggedWindow.dx =
        event.clientX - draggedWindow.startX + draggedWindow.dragStartTranslateX;

    draggedWindow.dy =
        event.clientY - draggedWindow.startY + draggedWindow.dragStartTranslateY;

    if (draggedWindow.needRAF) {
        draggedWindow.needRAF = false;
        window.requestAnimationFrame(updateWindowElement);
    }
};

export class ToolWindow extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dragging: false,
            activeSection: 0,
            actionsAreaHasBorder: false
        };

        this._haveActionsArea = false;

        this._handleDragIconMouseDown = this._handleDragIconMouseDown.bind(this);
        this._handleNavigation = this._handleNavigation.bind(this);
    }

    componentDidMount() {
        if (windowsNum === 0) {
            window.addEventListener('mouseup', mouseUpListener);
            window.addEventListener('mousemove', mouseMoveListener);
        }

        windowsNum++;

        this.domNode = ReactDOM.findDOMNode(this);
        this.currentTranslateX = 0;
        this.currentTranslateY = 0;
        this.dragStartTranslateX = 0;
        this.dragStartTranslateY = 0;
        this.startX = 0;
        this.startY = 0;
        this.dx = 0;
        this.dy = 0;
        this.needRAF = true;

        this._updateActionsAreaBorder();
    }

    componentWillUnmount() {
        windowsNum--;

        if (windowsNum === 0) {
            window.removeEventListener('mouseup', mouseUpListener);
            window.removeEventListener('mousemove', mouseMoveListener);
        }

        this.domNode = null;
    }

    componentDidUpdate() {
        this._updateActionsAreaBorder();
    }

    _updateActionsAreaBorder() {
        let needBorder = false;

        if (this._haveActionsArea) {
            // Ugly hack
            const el = ReactDOM.findDOMNode(this),
                actionsAreaEl = el.querySelector('.block-content-actions-area');

            if (actionsAreaEl) {
                const contentAreaEl = actionsAreaEl.previousElementSibling;

                if (contentAreaEl)
                    needBorder = contentAreaEl.scrollHeight > contentAreaEl.clientHeight;
            }
        }

        if (this.state.actionsAreaHasBorder !== needBorder) {
            this.setState({
                actionsAreaHasBorder: needBorder
            });
        }
    }

    _handleDragIconMouseDown(event) {
        draggedWindow = this;

        this.setState({
            dragging: true
        });

        this.dragStartTranslateX = this.currentTranslateX;
        this.dragStartTranslateY = this.currentTranslateY;
        this.startX = event.clientX;
        this.startY = event.clientY;
        this.needRAF = true;
    }

    _handleNavigation(newActiveSection) {
        this.setState({
            activeSection: newActiveSection
        });
    }

    render() {
        const titleButtons = [];

        if (this.props.dockable)
            titleButtons.push({
                icon: 'compress',
                disabled: false,
                onPress: this.props.onDock
            });

        if (this.props.closable)
            titleButtons.push({
                icon: 'times',
                disabled: false,
                onPress: this.props.onClose
            });

        let navArea = null;
        if (this.props.sections.length > 1) {
            const tabs = this.props.sections.map((section, idx) => (
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

        let ContentComponent = null;
        if (this.state.activeSection < this.props.sections.length)
            ContentComponent = this.props.sections[this.state.activeSection].component;

        let actionsArea = null;
        if (this.props.mainButtons.length || this.props.secondaryButtons.length) {
            let mainActionsRegion = null;
            if (this.props.mainButtons.length) {
                const buttons = this.props.mainButtons.map((button, idx) => (
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
            if (this.props.secondaryButtons.length) {
                const buttons = this.props.secondaryButtons.map((button, idx) => (
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
                <BlockContentActions isBordered={this.state.actionsAreaHasBorder}>
                    {secondaryButtonsRegion}
                    {mainActionsRegion}
                </BlockContentActions>
            );

            this._haveActionsArea = true;
        }

        const mainRegion = (
            <DraggableWindowRegion>
                <BlockContent>
                    <BlockContentTitle
                        title={this.props.title}
                        subtitle={this.props.subtitle}
                        isEditable={this.props.titleEditable}
                        iconLeft="ellipsis-v"
                        buttons={titleButtons}
                        onLeftIconMouseDown={this._handleDragIconMouseDown}
                    />

                    {navArea}

                    <ContentComponent />

                    {actionsArea}
                </BlockContent>
            </DraggableWindowRegion>
        );

        let sideRegion = null;
        if (this.props.showSideRegion) {
            let SideRegionContentComponent = null;
            if (this.state.activeSection < this.props.sections.length) {
                SideRegionContentComponent =
                    this.props.sections[this.state.activeSection].sideRegionComponent;
            }

            if (SideRegionContentComponent) {
                sideRegion = (
                    <DraggableWindowRegion type="aside">
                        <BlockContent>
                            <SideRegionContentComponent/>
                        </BlockContent>
                    </DraggableWindowRegion>
                );
            }
        }

        return (
            <DraggableWindow
                isDragged={this.state.dragging}
                maxHeight={this.props.maxHeight}
            >
                {mainRegion}
                {sideRegion}
            </DraggableWindow>
        );
    }
}

ToolWindow.propTypes = {
    title: PropTypes.string,
    titleEditable: PropTypes.bool,
    onTitleChange: PropTypes.func,
    subtitle: PropTypes.string,
    showSideRegion: PropTypes.bool,
    closable: PropTypes.bool,
    onClose: PropTypes.func,
    dockable: PropTypes.bool,
    onDock: PropTypes.func,
    sections: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        component: PropTypes.func.isRequired,
        sideRegionComponent: PropTypes.func
    })),
    mainButtons: PropTypes.arrayOf(ButtonType),
    secondaryButtons: PropTypes.arrayOf(ButtonType),
    maxHeight: PropTypes.number
};

ToolWindow.defaultProps = {
    title: '',
    titleEditable: false,
    onTitleChange: /* istanbul ignore next*/ () => {},
    subtitle: '',
    showSideRegion: false,
    closable: true,
    onClose: /* istanbul ignore next*/ () => {},
    dockable: true,
    onDock: /* istanbul ignore next*/ () => {},
    sections: [],
    mainButtons: [],
    secondaryButtons: [],
    maxHeight: 0
};

ToolWindow.displayName = 'ToolWindow';
