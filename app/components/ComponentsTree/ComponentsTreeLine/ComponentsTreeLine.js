import React from 'react';

export const ComponentsTreeLine = ({ createElementRef }) =>
    // TODO Create normal line please :C
  <div
    ref={createElementRef}
    className="components-tree-item"
    style={{ height: '4px', marginBottom: '-8px' }}
  >
    <div
      className="components-tree-item-content"
      style={{ height: 'inherit' }}
    >
      <div
        className="components-tree-item-title-wrapper"
        style={{ backgroundColor: 'red', height: 'inherit', width: '100%' }}
      />
    </div>
  </div>;

ComponentsTreeLine.PropTypes = {

};
ComponentsTreeLine.defaultProps = {

};
