/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { PropBase } from '../PropBase/PropBase';

export class PropEmpty extends PropBase {
  //noinspection JSUnusedGlobalSymbols
  /**
   *
   * @return {null}
   * @override
   * @private
   */
  _renderContent() {
    return null;
  }
}

PropEmpty.propTypes = PropBase.propTypes;
PropEmpty.defaultProps = PropBase.defaultProps;
PropEmpty.displayName = 'PropEmpty';