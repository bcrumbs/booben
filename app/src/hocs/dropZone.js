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
  onDropZoneOpenDropMenu: PropTypes.func,
};

const defaultProps = {
  onDropZoneReady: noop,
  onDropZoneRemove: noop,
  onDropZoneSnap: noop,
  onDropZoneUnsnap: noop,
  onDropZoneOpenDropMenu: noop,
};

const IS_DROPZONE = Symbol('Is drop zone');

const makeDisplayName = displayName => `dropZone(${displayName})`;

const wrap = OriginalComponent => class extends OriginalComponent {
  componentWillReceiveProps(...args) {
    if (super.componentWillReceiveProps) {
      super.componentWillReceiveProps(...args);
    }

    const { dropZoneId } = this.props;
    const nextProps = args[0];

    if (nextProps.dropZoneId !== dropZoneId) {
      throw new Error('It is not allowed to change the dropZoneId');
    }
  }

  componentWillUnmount(...args) {
    if (super.componentWillUnmount) super.componentWillUnmount(...args);
    const { dropZoneId, onDropZoneRemove } = this.props;
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
