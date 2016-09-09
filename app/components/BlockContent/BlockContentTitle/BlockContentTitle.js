import React, { Component, PropTypes } from 'react';
import { Icon } from '@reactackle/reactackle';
import { Button } from '@reactackle/reactackle';

const BlockContentButtonType = PropTypes.shape({
	icon: PropTypes.string.isRequired
});

export class BlockContentTitle extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const props = this.props,
			prefix = 'block-content';

		let className = `${prefix}-title-area`;
		let titleClassName = `${prefix}-title-box`;

		if(props.isEditable) titleClassName += ' ' + 'is-editable'
		if(props.editingOn) titleClassName += ' ' + 'editing-is-on'

		let iconLeft=null;
		if (props.iconLeft) {
			iconLeft =
				<div className={`${prefix}-icon ${prefix}-icon-left`}>
					<Icon name={props.iconLeft} />
				</div>;
		}


		let buttonsArea = null;
		if (props.buttons) {
			const buttons = props.buttons.map((button, idx) => {
				return (
					<Button icon={button.icon} key={idx} />
				);
			});

			buttonsArea =
				<div className={`${prefix}-title-actions-wrapper`}>
					{buttons}
				</div>
		}

		let title =
			<div className={titleClassName}>
				<span className={`${prefix}-title`} contentEditable={props.isEditable}>{ props.title }</span>
			</div>;

		let subtitle = null;
		if (props.subtitle) {
			subtitle =
				<div className={`${prefix}-subtitle-box`}>
					<span className={`${prefix}-subtitle`}>{ props.subtitle }</span>
				</div>;
		}

		return (
			<div className={className}>
				{ iconLeft }

				<div className={`${prefix}-title-content`}>
					{ title }
					{ subtitle }
				</div>

				{ buttonsArea }
			</div>
		);
	};
};

BlockContentTitle.propTypes = {
	isEditable: PropTypes.bool,
	editingOn: PropTypes.bool,
	title: PropTypes.string.isRequired,
	subtitle: PropTypes.string,
	iconLeft: PropTypes.string,
	buttons: PropTypes.arrayOf(BlockContentButtonType)
};

BlockContentTitle.defaultProps = {
	isEditable: false,
	editingOn: false,
	title: '',
	subtitle: null,
	iconLeft: null,
	buttons: null
};

BlockContentTitle.displayName = 'BlockContentTitle';

