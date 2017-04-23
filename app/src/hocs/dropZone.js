/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import PropTypes from 'prop-types';
import { toClassComponent } from '../utils/react';
import { noop } from '../utils/misc';

const propTypes = {
  dropZoneId: PropTypes.string.isRequired,
  onDropZoneReady: PropTypes.func,
  onDropZoneRemove: PropTypes.func,
  onDropZoneSnap: PropTypes.func,
  onDropZoneUnsnap: PropTypes.func,
};

const defaultProps = {
  onDropZoneReady: noop,
  onDropZoneRemove: noop,
  onDropZoneSnap: noop,
  onDropZoneUnsnap: noop,
};

const IS_DROPZONE = Symbol('Is drop zone');

const makeDisplayName = displayName => `dropZone(${displayName})`;

const wrap = OriginalComponent => class extends OriginalComponent {
  componentWillUnmount(...args) {
    const { dropZoneId, onDropZoneRemove } = this.props;
    if (super.componentWillUnmount) super.componentWillUnmount(...args);
    onDropZoneRemove({ id: dropZoneId });
  }
};

export default component => {
  const ret = wrap(toClassComponent(component));
  ret.propTypes = { ...component.propTypes, ...propTypes };
  ret.defaultProps = { ...component.defaultProps, ...defaultProps };
  ret.displayName = makeDisplayName(component.displayName);
  ret[IS_DROPZONE] = true;
  return ret;
};

export const isDropZoneComponent = component =>
!!component && !!component[IS_DROPZONE];
