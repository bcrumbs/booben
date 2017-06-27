/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const propTypes = {
};

const mapStateToProps = state => ({
});

const wrap = connect(mapStateToProps);

class CreateComponentFloatingMenuComponent extends PureComponent {
  render() {

  }
}

CreateComponentFloatingMenuComponent.propTypes = propTypes;
CreateComponentFloatingMenuComponent.displayName =
  'CreateComponentFloatingMenu';

export const CreateComponentFloatingMenu =
  wrap(CreateComponentFloatingMenuComponent);
