import React, { Component, PropTypes } from 'react';

const
	propTypes = {
		fixedScrollingStep: PropTypes.number,
		scrollingStepTime: PropTypes.number,
		autoScrollUpDown: PropTypes.bool,
		additionalPixels: PropTypes.number,
		stepDiffDivider: PropTypes.number,
		createElementRef: PropTypes.func,
	},
	defaultProps = {
		scrollingStepTime: 10,
		autoScrollUpDown: false,
		additionalPixels: 40,
		stepDiffDivider: 4,
	};

const SCROLL_STATES = {
	UP: 'UP',
	DOWN: 'DOWN',
	NONE: 'NONE',
};

export const autoScrollUpDown = WrappedComponent =>
	Object.assign(
		class extends Component {
			constructor(props) {
				super(props);
				this._handleMouseMove = this._handleMouseMove.bind(this);
				this._createElementRef = this._createElementRef.bind(this);

				this.scrollInterval = null;
				this.scrollState = SCROLL_STATES.NONE;
				this.scrollStep = 0;
				this.requestedFrame = false;
			}

			componentDidMount() {
				document.addEventListener('mousemove', this._handleMouseMove);
			}

			componentWillUnmount() {
				document.removeEventListener('mousemove', this._handleMouseMove);
				this._stopSteppingScroll();
			}

			_startSteppingScroll() {
				this.scrollInterval = setInterval(
					() =>
						requestAnimationFrame(
							() =>
								this.element
							 	&&	this.element.scrollTop >= 0
								&& 	this.element.scrollTop <= this.element.scrollHeight
								&&	(
									this.element.scrollTop +=
										this.props.fixedScrollingStep || this.scrollStep
								)
						)
				, this.props.scrollingStepTime);
			}

			_stopSteppingScroll() {
				if (this.scrollInterval !== null) {
					clearInterval(this.scrollInterval);
					this.scrollInterval = null;
				}
			}

			_handleMouseMove(event) {
				if (
					!this.props.autoScrollUpDown
					||	!this.element.contains(event.target)
				) return void this._stopSteppingScroll();

				const { top, bottom } = this.element.getBoundingClientRect();
				const { pageY } = event;
				const { additionalPixels } = this.props;

				const diff = Math.min(pageY - top, bottom - pageY);


				const scrollState = SCROLL_STATES[
					diff < additionalPixels
						? ((top + bottom) / 2 < pageY ? 'DOWN': 'UP')
						: 'NONE'
				];

				const scrollStep =
					(scrollState === SCROLL_STATES.DOWN ? 1 : -1) *
					(additionalPixels - diff) / this.props.stepDiffDivider | 0;

				if (
					this.scrollState === scrollState
					&& this.scrollStep === scrollStep
				) return;

				this.scrollState = scrollState;
				this.scrollStep = scrollStep;



				this.scrollState === SCROLL_STATES.NONE
					?	this._stopSteppingScroll()
					:	this.scrollInterval === null && this._startSteppingScroll();

			}

			_createElementRef(ref) {
				this.element = ref;
				this.props.createElementRef && this.props.createElementRef(ref);
			}

			render() {
				return (
					<WrappedComponent
						{...this.props}
						createElementRef={this._createElementRef}
					/>
				);
			}

		},
		{
			propTypes:
			 	Object.assign({}, propTypes, WrappedComponent.propTypes),
			defaultProps:
				Object.assign({}, defaultProps, WrappedComponent.defaultProps)
		}
	);
