import React from 'react';
import { TreeList } from '../Tree';

const propTypes = {
  ...TreeList.propTypes,
};

const defaultProps = {
  ...TreeList.defaultProps,
};

export const RouteTreeList = props => <TreeList {...props} />;

RouteTreeList.propTypes = propTypes;
RouteTreeList.defaultProps = defaultProps;
