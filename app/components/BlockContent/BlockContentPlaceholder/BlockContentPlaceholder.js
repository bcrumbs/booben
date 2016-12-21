import React, { PropTypes } from 'react';

export const BlockContentPlaceholder = props => {
  const className = 'block-content-placeholder';

  let text = null;
  if (props.text) {
    text = (
      <div className="block-content-placeholder-text">
        { props.text }
      </div>
        );
  }


  return (
    <div className={className}>
      <div className="block-content-placeholder-content">
        { text }
        { props.children }
      </div>
    </div>
  );
};

BlockContentPlaceholder.propTypes = {
  text: PropTypes.string,
};

BlockContentPlaceholder.defaultProps = {
  text: null,
};

BlockContentPlaceholder.displayName = 'BlockContentPlaceholder';
