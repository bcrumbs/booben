/**
  * @author Oleg Nosov <olegnosov1@gmail.com>
  *
  */
import { PropTypes } from 'react';
import { connect } from 'react-redux';
import { pointIsInCircle } from '../utils/misc';
import { constructComponent } from '../utils/meta';

import {
  startDragNewComponent,
  startDragExistingComponent
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

    onNewComponentStartDrag: PropTypes.func,
    onExistingComponentStartDrag: PropTypes.func,
  };

const mapStateToProps = ({ app, project }) => ({
  meta: project.meta,
  language: app.language,
});

const mapDispatchToProps = dispatch => ({
  onNewComponentStartDrag: components => void dispatch(startDragNewComponent(components)),
  onExistingComponentStartDrag: id => void dispatch(startDragExistingComponent(id)),
});


/**
  * @param {React.Component} WrappedComponent
  * @return {React.Component}
  */
export const dragHandler = (WrappedComponent) =>
  connect(mapStateToProps, mapDispatchToProps)(
    Object.assign(
      class extends WrappedComponent {
        constructor(props) {
          super(props);

          this.willTryStartDrag = false;
          this.dragStartX = 0;
          this.dragStartY = 0;
          this.draggedComponentData = null;
          this.draggedNewComponent = false;
          this.draggedComponentId = -1;

          this._handleStartDragNewComponent = this._handleStartDragNewComponent.bind(this);
          this._handleStartDragExistingComponent = this._handleStartDragExistingComponent.bind(this);
          this.__handleMouseMove = this.__handleMouseMove.bind(this);
          this.__handleMouseUp = this.__handleMouseUp.bind(this);
        }

        componentWillUnmount() {
          super.componentWillUnmount && super.componentWillUnmount();
          window.removeEventListener('mousemove', this.__handleMouseMove);
          window.removeEventListener('mouseup', this.__handleMouseUp);
        }

        /**
         *
         * @param {MouseEvent} event
         * @param {LibraryComponentData} componentData
         * @private
         */
        _handleStartDragNewComponent(event, componentData) {
          this._handleStartDragExistingComponent(event);
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
          event.preventDefault();
          window.addEventListener('mousemove', this.__handleMouseMove);
          window.addEventListener('mouseup', this.__handleMouseUp);
          this.willTryStartDrag = true;
          this.dragStartX = event.pageX;
          this.dragStartY = event.pageY;
          this.draggedComponentId = componentId;
          this.draggedComponentData = null,
          this.draggedNewComponent = false;
        }

        /**
         *
         * @param {MouseEvent} event
         * @private
         */
        __handleMouseUp(event) {
          event.preventDefault();
          window.removeEventListener('mousemove', this.__handleMouseMove);
          window.removeEventListener('mouseup', this.__handleMouseUp);
          this.willStartDrag = false;
        }

        /**
         *
         * @param {MouseEvent} event
         * @private
         */
        __handleMouseMove(event) {
          if (this.willTryStartDrag) {
              const willStartDrag = !pointIsInCircle(
                  event.pageX,
                  event.pageY,
                  this.dragStartX,
                  this.dragStartY,
                  START_DRAG_THRESHOLD
              );

              if (willStartDrag) {
                  this.willTryStartDrag = false;
                  window.removeEventListener('mousemove', this.__handleMouseMove);
                  window.removeEventListener('mouseup', this.__handleMouseUp);
                  this.draggedNewComponent
                  ?
                    this.props.onNewComponentStartDrag(constructComponent(
                        this.draggedComponentData.fullName,
                        0,
                        this.props.language,
                        this.props.meta
                    ))
                  :
                    this.props.onExistingComponentStartDrag(
                      this.draggedComponentId
                    );
              }
          }
        }
      },
      { propTypes: Object.assign({}, WrappedComponent.propTypes, propTypes) }
    )
  );
