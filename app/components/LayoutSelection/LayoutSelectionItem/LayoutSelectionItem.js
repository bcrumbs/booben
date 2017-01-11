'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

const propTypes = {
  image: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

const defaultProps = {
  image: '',
  title: '',
  subtitle: '',
};

export const LayoutSelectionItem = props => {
  let subtitle = null;
  if (props.subtitle) {
    subtitle = (
      <div className="layout-item-subtitle">
        {props.subtitle}
      </div>
    );
  }

  return (
    <div className="layout-item">
      <div className="layout-item-image-box">
        <img src={props.image} alt="" role="presentation" />
      </div>
      <div className="layout-item-title-box">
        <div className="layout-item-title">{props.title}</div>
        {subtitle}
      </div>
    </div>
  );
};

LayoutSelectionItem.propTypes = propTypes;
LayoutSelectionItem.defaultProps = defaultProps;
LayoutSelectionItem.displayName = 'LayoutSelectionItem';
