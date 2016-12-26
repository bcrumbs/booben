/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Tag } from '@reactackle/reactackle';
import { PropBase } from '../PropBase/PropBase';
import { noop } from '../../../utils/misc';

const propTypes = {
  value: PropTypes.string,
  onUnlink: PropTypes.func,
};

const defaultProps = {
  value: '',
  onUnlink: noop,
};

export class PropLinked extends PropBase {
  /**
   *
   * @return {ReactElement}
   * @override
   * @private
   */
  _renderContent() {
    //noinspection JSValidateTypes
    return (
      <Tag
        text={this.props.value}
        bounded
        removable
        onRemove={this.props.onUnlink}
      />
    );
  }
}

PropLinked.propTypes = { ...PropBase.propTypes, ...propTypes };
PropLinked.defaultProps = { ...PropBase.defaultProps, ...defaultProps };
PropLinked.displayName = 'PropLinked';
