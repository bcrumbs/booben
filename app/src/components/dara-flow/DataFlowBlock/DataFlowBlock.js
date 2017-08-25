import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@reactackle/reactackle';
import { Action } from './Action/Action';
import { Node } from './Node/Node';
import { BlockStyled } from './styles/BlockStyled';
import { HeaderBoxStyled } from './styles/HeaderBoxStyled';
import { TitleStyled } from './styles/TitleStyled';
import { SubtitleStyled } from './styles/SubtitleStyled';
import { SubtitleTextStyled } from './styles/SubtitleTextStyled';
import { ContentBoxStyled } from './styles/ContentBoxStyled';
import { ActionsStyled } from './styles/ActionsStyled';
import { DescriptionMarkStyled } from './styles/DescriptionMarkStyled';
import resizeable from '../../../hocs/resizeable';
import { on, off, stopPropagation } from '../../../utils/dom';

const propTypes = {
  positionX: PropTypes.number,
  positionY: PropTypes.number,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  outputType: PropTypes.oneOf([
    'default',
    'string',
    'bool',
    'number',
    'shape',
    'array',
  ]),
  typeDescription: PropTypes.string,
  actions: PropTypes.arrayOf(Action),
  endPoint: PropTypes.bool,
  disconnected: PropTypes.bool,
};

const defaultProps = {
  positionX: 0,
  positionY: 0,
  title: '',
  subtitle: '',
  outputType: '',
  typeDescription: '',
  actions: [],
  endPoint: false,
  disconnected: false,
};

class _DataFlowBlock extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this._rootElement = null;
    this._headerElement = null;
    
    this._positionX = props.positionX;
    this._positionY = props.positionY;
  
    this._moving = false;
    this._startX = 0;
    this._startY = 0;
    this._startPositionX = 0;
    this._startPositionY = 0;
    this._needRAF = false;
    this._animationFrameHandle = 0;
    
    this._saveRootRef = this._saveRootRef.bind(this);
    this._saveHeaderRef = this._saveHeaderRef.bind(this);
    
    this._animationFrame = this._animationFrame.bind(this);
    
    this._handleHeaderNativeMouseDown =
      this._handleHeaderNativeMouseDown.bind(this);
    this._handleHeaderNativeMouseMove =
      this._handleHeaderNativeMouseMove.bind(this);
    this._handleHeaderNativeMouseUp =
      this._handleHeaderNativeMouseUp.bind(this);
  }
  
  componentDidMount() {
    on(this._rootElement, 'mousedown', stopPropagation);
    on(this._headerElement, 'mousedown', this._handleHeaderNativeMouseDown);
  }
  
  componentWillUnmount() {
    off(this._rootElement, 'mousedown', stopPropagation);
    off(this._headerElement, 'mousedown', this._handleHeaderNativeMouseDown);
  
    if (this._animationFrameHandle !== 0) {
      this._cancelAnimationFrame();
    }
    
    if (this._moving) {
      off(window.document.body, 'mousemove', this._handleHeaderNativeMouseMove);
      off(
        window.document.body,
        'mouseup',
        this._handleHeaderNativeMouseUp,
        true,
      );
    }
  }
  
  _saveRootRef(ref) {
    this._rootElement = ref;
  }
  
  _saveHeaderRef(ref) {
    this._headerElement = ref;
  }
  
  _formatTransformValue() {
    return `translate(${this._positionX}px, ${this._positionY}px)`;
  }
  
  _updatePosition() {
    this._rootElement.style.transform = this._formatTransformValue();
  }
  
  _animationFrame() {
    this._animationFrameHandle = 0;
    this._needRAF = true;
    this._updatePosition();
  }
  
  _scheduleUpdate() {
    this._animationFrameHandle =
      window.requestAnimationFrame(this._animationFrame);
    
    this._needRAF = false;
  }
  
  _cancelAnimationFrame() {
    window.cancelAnimationFrame(this._animationFrameHandle);
    this._animationFrameHandle = 0;
  }
  
  _handleHeaderNativeMouseDown(event) {
    event.stopPropagation();
  
    this._moving = true;
    this._startX = event.pageX;
    this._startY = event.pageY;
    this._startPositionX = this._positionX;
    this._startPositionY = this._positionY;
    this._needRAF = true;
    
    on(window.document.body, 'mousemove', this._handleHeaderNativeMouseMove);
    on(window.document.body, 'mouseup', this._handleHeaderNativeMouseUp, true);
  }
  
  _handleHeaderNativeMouseMove(event) {
    event.preventDefault();
    
    const dx = event.pageX - this._startX;
    const dy = event.pageY - this._startY;
    
    this._positionX = this._startPositionX + dx;
    this._positionY = this._startPositionY + dy;
    
    if (this._needRAF) {
      this._scheduleUpdate();
    }
  }
  
  _handleHeaderNativeMouseUp() {
    off(window.document.body, 'mousemove', this._handleHeaderNativeMouseMove);
    off(window.document.body, 'mouseup', this._handleHeaderNativeMouseUp, true);
  
    if (this._animationFrameHandle !== 0) {
      this._cancelAnimationFrame();
    }
    
    this._moving = false;
    this._needRAF = false;
  }
  
  render() {
    const {
      title,
      subtitle,
      outputType,
      typeDescription,
      actions,
      endPoint,
      disconnected,
      children,
    } = this.props;
    
    let descriptionMark = null;
    if (typeDescription) {
      descriptionMark = (
        <DescriptionMarkStyled>
          <Icon name="arrow-circle-o-right" size="inherit" color="inherit" />
        </DescriptionMarkStyled>
      );
    }
  
    const actionElements = actions.map((item, idx) => (
      <Action {...item} key={String(idx)} />
    ));
  
    const actionsWrapper = actions.length > 0
      ? <ActionsStyled>{actionElements}</ActionsStyled>
      : null;
  
    return (
      <BlockStyled
        style={{ transform: this._formatTransformValue() }}
        disconnected={disconnected}
        innerRef={this._saveRootRef}
      >
        <HeaderBoxStyled
          colorScheme={outputType}
          innerRef={this._saveHeaderRef}
        >
          <TitleStyled>
            {title}
          </TitleStyled>
        
          <SubtitleStyled>
            <SubtitleTextStyled>
              {subtitle}
            </SubtitleTextStyled>
            {descriptionMark}
          </SubtitleStyled>
        
          <Node
            colorScheme={outputType}
            position={endPoint ? 'left' : 'right'}
          />
        </HeaderBoxStyled>
      
        <ContentBoxStyled>
          {children}
        </ContentBoxStyled>
      
        {actionsWrapper}
      </BlockStyled>
    );
  }
}

_DataFlowBlock.displayName = 'DataFlowBlock';
_DataFlowBlock.propTypes = propTypes;
_DataFlowBlock.defaultProps = defaultProps;

export const DataFlowBlock = resizeable(_DataFlowBlock);

export * from './DataFlowBlockHeading/DataFlowBlockHeading';
export * from './DataFlowBlockItem/DataFlowBlockItem';
