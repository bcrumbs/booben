/**
 * @author Dmitriy Bizyaev
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import throttle from 'lodash.throttle';
import { Button, Tabs, IconCross } from '@reactackle/reactackle';

import {
  BlockContent,
  BlockContentTitle,
  BlockContentNavigation,
  BlockContentActions,
  BlockContentActionsRegion,
} from '../../../components/BlockContent';

import {
  DraggableWindow,
  DraggableWindowRegion,
} from '../../../components/DraggableWindow/DraggableWindow';

import resizeable from '../../../hocs/resizeable';
import ToolType from '../../../models/Tool';
import ToolStateType from '../../../models/ToolState';
import { noop } from '../../../utils/misc';
import { IconCollapse, IconDrag } from '../../../components/icons';

const propTypes = {
  tool: PropTypes.instanceOf(ToolType).isRequired,
  toolState: PropTypes.instanceOf(ToolStateType).isRequired,
  constrainPosition: PropTypes.bool,
  marginLeft: PropTypes.number,
  marginRight: PropTypes.number,
  marginTop: PropTypes.number,
  marginBottom: PropTypes.number,
  stickRegionLeft: PropTypes.number,
  stickRegionRight: PropTypes.number,
  stickRegionTop: PropTypes.number,
  stickRegionBottom: PropTypes.number,
  onTitleChange: PropTypes.func,
  onClose: PropTypes.func,
  onDock: PropTypes.func,
  onFocus: PropTypes.func,
  onStartDrag: PropTypes.func,
  onStopDrag: PropTypes.func,
  onStickRegionEnter: PropTypes.func,
  onStickRegionLeave: PropTypes.func,
  onActiveSectionChange: PropTypes.func,
};

const defaultProps = {
  constrainPosition: true,
  marginLeft: 0,
  marginRight: 0,
  marginTop: 0,
  marginBottom: 0,
  stickRegionLeft: 0,
  stickRegionRight: 0,
  stickRegionTop: 0,
  stickRegionBottom: 0,
  onTitleChange: noop,
  onClose: noop,
  onDock: noop,
  onFocus: noop,
  onStartDrag: noop,
  onStopDrag: noop,
  onStickRegionEnter: noop,
  onStickRegionLeave: noop,
  onActiveSectionChange: noop,
};

export const STICK_REGION_LEFT = 0;
export const STICK_REGION_RIGHT = 1;
export const STICK_REGION_TOP = 2;
export const STICK_REGION_BOTTOM = 3;

const START_Z_INDEX = 2000;

const ResizeableDraggableWindow = resizeable(DraggableWindow);

export class ToolWindow extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      dragging: false,
    };

    this._handleStartDrag = this._handleStartDrag.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleStopDrag = this._handleStopDrag.bind(this);
    this._handleAnimationFrame = this._handleAnimationFrame.bind(this);
    this._handleNavigation = this._handleNavigation.bind(this);
    this._updateStickRegion = throttle(this._updateStickRegion.bind(this), 100);
  }

  componentDidMount() {
    // eslint-disable-next-line react/no-find-dom-node
    this.domNode = ReactDOM.findDOMNode(this);
    this.container = this.domNode.parentNode;
    this.currentTranslateX = 0;
    this.currentTranslateY = 0;
    this.dragStartDiffX = 0;
    this.dragStartDiffY = 0;
    this.dx = 0;
    this.dy = 0;
    this.needRAF = true;
    this.inStickRegionLeft = false;
    this.inStickRegionRight = false;
    this.inStickRegionTop = false;
    this.inStickRegionBottom = false;
    this.animationFrame = null;
  }

  componentWillUnmount() {
    this.domNode = null;
  }

  _handleMouseMove(event) {
    event.preventDefault();

    this.dx = event.clientX + this.dragStartDiffX;
    this.dy = event.clientY + this.dragStartDiffY;

    if (this.props.constrainPosition) {
      if (this.dx > this.maxDx) this.dx = this.maxDx;
      if (this.dx < this.props.marginLeft) this.dx = this.props.marginLeft;
      if (this.dy > this.maxDy) this.dy = this.maxDy;
      if (this.dy < this.props.marginTop) this.dy = this.props.marginTop;
    }

    if (this.needRAF) {
      this.needRAF = false;
      this.animationFrame =
        window.requestAnimationFrame(this._handleAnimationFrame);
    }

    this._updateStickRegion();
  }

  _updateStickRegion() {
    const {
      dx,
      dy,
      width,
      height,
      containerWidth,
      containerHeight,
    } = this;

    const {
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      stickRegionLeft,
      stickRegionRight,
      stickRegionTop,
      stickRegionBottom,
      onStickRegionEnter,
      onStickRegionLeave,
    } = this.props;

    const isInStickRegion = {
      left: dx < marginLeft + stickRegionLeft,
      right: dx > containerWidth - width - marginRight - stickRegionRight,
      top: dy < marginTop + stickRegionTop,
      bottom: dy > containerHeight - height - marginBottom - stickRegionBottom,
    };

    if (this.inStickRegionLeft) {
      if (!isInStickRegion.left) onStickRegionLeave(STICK_REGION_LEFT);
    } else if (isInStickRegion.left) {
      onStickRegionEnter(STICK_REGION_LEFT);
    }

    if (this.inStickRegionRight) {
      if (!isInStickRegion.right) onStickRegionLeave(STICK_REGION_RIGHT);
    } else if (isInStickRegion.right) {
      onStickRegionEnter(STICK_REGION_RIGHT);
    }

    if (this.inStickRegionTop) {
      if (!isInStickRegion.top) onStickRegionLeave(STICK_REGION_TOP);
    } else if (isInStickRegion.top) {
      onStickRegionEnter(STICK_REGION_TOP);
    }

    if (this.inStickRegionBottom) {
      if (!isInStickRegion.bottom) onStickRegionLeave(STICK_REGION_BOTTOM);
    } else if (isInStickRegion.bottom) {
      onStickRegionEnter(STICK_REGION_BOTTOM);
    }

    this.inStickRegionLeft = isInStickRegion.left;
    this.inStickRegionRight = isInStickRegion.right;
    this.inStickRegionTop = isInStickRegion.top;
    this.inStickRegionBottom = isInStickRegion.bottom;
  }

  _handleStartDrag(event) {
    window.addEventListener('mouseup', this._handleStopDrag);
    window.addEventListener('mousemove', this._handleMouseMove);

    this.width = this.domNode.clientWidth;
    this.height = this.domNode.clientHeight;
    this.containerWidth = this.container.clientWidth;
    this.containerHeight = this.container.clientHeight;
    this.maxDx = this.containerWidth - this.width - this.props.marginRight;
    this.maxDy = this.containerHeight - this.height - this.props.marginBottom;

    this.setState({ dragging: true });

    this.dragStartDiffX = this.currentTranslateX - event.clientX;
    this.dragStartDiffY = this.currentTranslateY - event.clientY;
    this.needRAF = true;

    this.props.onStartDrag();
  }

  _handleStopDrag() {
    window.removeEventListener('mouseup', this._handleStopDrag);
    window.removeEventListener('mousemove', this._handleMouseMove);

    if (this.animationFrame !== null) {
      window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this.setState({ dragging: false });
    this.props.onStopDrag();
  }

  _handleAnimationFrame() {
    this.domNode.style.transform = `translate(${this.dx}px, ${this.dy}px)`;
    this.animationFrame = null;
    this.needRAF = true;
    this.currentTranslateX = this.dx;
    this.currentTranslateY = this.dy;
  }

  _handleNavigation({ value }) {
    this.props.onActiveSectionChange(value);
  }

  _renderButtons(buttons) {
    return buttons.map(({ icon, text, onPress }, idx) => (
      <Button
        key={String(idx)}
        icon={icon}
        text={text}
        onPress={onPress}
      />
    ));
  }

  render() {
    const {
      tool,
      toolState,
      onClose,
      onDock,
      onTitleChange,
      onFocus,
    } = this.props;

    const { dragging } = this.state;

    const sections = tool.sections;
    const sectionsNum = sections.size;

    let navArea = null;
    if (sectionsNum > 1) {
      const tabs = sections.map(section => ({ text: section.name }));

      navArea = (
        <BlockContentNavigation>
          <Tabs
            tabs={tabs}
            colorScheme="dark"
            selected={toolState.activeSection}
            onChange={this._handleNavigation}
          />
        </BlockContentNavigation>
      );
    }

    const mainButtons = tool.mainButtons;
    const secondaryButtons = tool.secondaryButtons;
    const mainButtonsNum = mainButtons.size;
    const secondaryButtonsNum = secondaryButtons.size;

    let actionsArea = null;
    if (mainButtonsNum > 0 || secondaryButtonsNum > 0) {
      let mainActionsRegion = null;
      if (mainButtonsNum > 0) {
        const buttons = this._renderButtons(mainButtons);

        mainActionsRegion = (
          <BlockContentActionsRegion type="main">
            {buttons}
          </BlockContentActionsRegion>
        );
      }

      let secondaryButtonsRegion = null;
      if (secondaryButtonsNum > 0) {
        const buttons = this._renderButtons(secondaryButtons);

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

    const titleButtons = [];

    if (tool.undockable) {
      titleButtons.push({
        icon: <IconCollapse />,
        onPress: onDock,
      });
    }

    if (tool.closable) {
      titleButtons.push({
        icon: <IconCross />,
        onPress: onClose,
      });
    }

    const activeSection = sections.get(toolState.activeSection) || null;
    const ContentComponent = activeSection !== null
      ? activeSection.component
      : null;

    const content = ContentComponent
      ? <ContentComponent {...activeSection.componentProps} />
      : null;

    const mainRegion = (
      <DraggableWindowRegion>
        <BlockContent>
          <BlockContentTitle
            title={tool.title}
            subtitle={tool.subtitle}
            isEditable={tool.titleEditable}
            titlePlaceHolder={tool.titlePlaceholder}
            iconLeft={<IconDrag />}
            buttons={titleButtons}
            onLeftIconMouseDown={this._handleStartDrag}
            onTitleChange={onTitleChange}
          />

          {navArea}
          {content}
          {actionsArea}
        </BlockContent>
      </DraggableWindowRegion>
    );

    let sideRegion = null;
    if (toolState.sideRegionIsVisible) {
      const SideRegionContentComponent = activeSection !== null
        ? activeSection.sideRegionComponent
        : null;

      if (SideRegionContentComponent !== null) {
        sideRegion = (
          <DraggableWindowRegion type="aside">
            <BlockContent>
              <SideRegionContentComponent />
            </BlockContent>
          </DraggableWindowRegion>
        );
      }
    }

    return (
      <ResizeableDraggableWindow
        resizeEnabled
        resizeSides={['right', 'bottom']}
        resizeMinWidth="original"
        resizeMaxWidth={Math.max(Math.round(window.innerWidth / 2) - 100, 100)}
        resizeMinHeight={300}
        resizeMaxHeight={Math.round(window.innerHeight * 0.8)}
        isDragged={dragging}
        maxHeight={tool.windowMaxHeight}
        minWidth={tool.windowMinWidth}
        zIndex={START_Z_INDEX + toolState.zIndex}
        onFocus={onFocus}
      >
        {mainRegion}
        {sideRegion}
      </ResizeableDraggableWindow>
    );
  }
}

ToolWindow.propTypes = propTypes;
ToolWindow.defaultProps = defaultProps;
ToolWindow.displayName = 'ToolWindow';
