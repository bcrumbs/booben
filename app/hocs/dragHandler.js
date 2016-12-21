/**
  * @author Oleg Nosov <olegnosov1@gmail.com>
  *
  */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { pointIsInCircle } from '../utils/misc';
import { constructComponent } from '../utils/meta';

import {
  startDragNewComponent,
  startDragExistingComponent,
} from '../actions/preview';

/**
 *
 * @type {number}
 * @const
 */
const START_DRAG_THRESHOLD = 10;


const
  propTypes = {
    meta: PropTypes.object,
    language: PropTypes.string,
    draggingComponent: PropTypes.bool,

    onNewComponentStartDrag: PropTypes.func,
    onExistingComponentStartDrag: PropTypes.func,
  };

const mapStateToProps = ({ app, project }) => ({
  meta: project.meta,
  language: app.language,
  draggingComponent: project.draggingComponent,
});

const mapDispatchToProps = dispatch => ({
  onNewComponentStartDrag: components => void dispatch(startDragNewComponent(components)),
  onExistingComponentStartDrag: id => void dispatch(startDragExistingComponent(id)),
});


/**
  * @param {React.Component} WrappedComponent
  * @return {connect(React.Component)}
  */
export const dragHandler = WrappedComponent =>
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(Object.assign(
    class DragHandler extends Component {
      constructor(props) {
        super(props);

        this.willTryStartDrag = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.draggedComponentData = null;
        this.draggedNewComponent = false;
        this.draggedComponentId = -1;

        this._handleStartDragNewComponent
          = this._handleStartDragNewComponent.bind(this);
        this._handleStartDragExistingComponent
          = this._handleStartDragExistingComponent.bind(this);
        this._handleStartDragComponent
          = this._handleStartDragComponent.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
      }

      componentWillUnmount() {
        super.componentWillUnmount && super.componentWillUnmount();
        window.removeEventListener('mousemove', this._handleMouseMove);
        window.removeEventListener('mouseup', this._handleMouseUp);
      }

          /**
           *
           * @param {MouseEvent} event
           * @param {LibraryComponentData} componentData
           * @private
           */
      _handleStartDragNewComponent(event, componentData) {
        this._handleStartDragComponent(event);
        this.draggedComponentData = componentData;
        this.draggedNewComponent = true;
      }

          /**
           *
           * @param {MouseEvent} event
           * @param {number} componentId
           * @private
           */
      _handleStartDragExistingComponent(event, componentId) {
        this._handleStartDragComponent(event);
        this.draggedComponentId = componentId;
        this.draggedNewComponent = false;
      }

          /**
           *
           * @param {MouseEvent} event
           * @private
           */
      _handleStartDragComponent(event) {
        event.preventDefault();
        window.addEventListener('mousemove', this._handleMouseMove);
        window.addEventListener('mouseup', this._handleMouseUp);
        this.willTryStartDrag = true;
        this.dragStartX = event.pageX;
        this.dragStartY = event.pageY;
      }

          /**
           *
           * @param {MouseEvent} event
           * @private
           */
      _handleMouseUp(event) {
        event.preventDefault();
        window.removeEventListener('mousemove', this._handleMouseMove);
        window.removeEventListener('mouseup', this._handleMouseUp);
        this.willStartDrag = false;
      }

          /**
           *
           * @param {MouseEvent} event
           * @private
           */
      _handleMouseMove(event) {
        if (this.willTryStartDrag) {
          const willStartDrag = !pointIsInCircle(
              event.pageX,
              event.pageY,
              this.dragStartX,
              this.dragStartY,
              START_DRAG_THRESHOLD,
          );

          if (willStartDrag) {
            this.willTryStartDrag = false;
            window.removeEventListener('mousemove', this._handleMouseMove);
            window.removeEventListener('mouseup', this._handleMouseUp);
            this.draggedNewComponent
              ?
                this.props.onNewComponentStartDrag(constructComponent(
                    this.draggedComponentData.fullName,
                    0,
                    this.props.language,
                    this.props.meta,
                ))
              :
                this.props.onExistingComponentStartDrag(
                  this.draggedComponentId,
                );
          }
        }
      }

      render() {
        return (
          <WrappedComponent
            {...this.props}
            handleStartDragNewComponent={this._handleStartDragNewComponent}
            handleStartDragExistingComponent={
              this._handleStartDragExistingComponent
            }
          />
        );
      }
        },
      { propTypes: Object.assign({}, WrappedComponent.propTypes, propTypes) },
  ),
);
