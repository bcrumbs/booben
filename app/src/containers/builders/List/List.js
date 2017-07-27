/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import patchComponent from '../../../hocs/patchComponent';
import { returnNull } from '../../../utils/misc';

const propTypes = {
  data: PropTypes.array,
  component: PropTypes.func,
};

const defaultProps = {
  data: [],
  component: returnNull,
};

const _List = props => props.data.map((item, idx) => (
  <props.component key={String(idx)} item={item} />
));

_List.propTypes = propTypes;
_List.defaultProps = defaultProps;
_List.displayName = 'List';

export const List = patchComponent(_List);
