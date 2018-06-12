import React from 'react';
import { TreeList } from '../../Tree';

const propTypes = {
  ...TreeList.propTypes,
};

const defaultProps = {
  ...TreeList.defaultProps,
};

export const ComponentsTreeList = props => <TreeList {...props} />;

ComponentsTreeList.propTypes = propTypes;
ComponentsTreeList.defaultProps = defaultProps;
