/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { PreviewIFrame } from '../components/PreviewIFrame/PreviewIFrame';
import store from '../store';
import { URL_APP_PREFIX } from '../../shared/constants';

const propTypes = {
  params: PropTypes.shape({
    projectName: PropTypes.string.isRequired,
  }).isRequired,
};

const PreviewRoute = ({ params }) => {
  const src = `${URL_APP_PREFIX}/${params.projectName}/preview.html`;
  
  return (
    <PreviewIFrame
      store={store}
      url={src}
    />
  );
};

PreviewRoute.propTypes = propTypes;
PreviewRoute.displayName = 'PreviewRoute';

export default PreviewRoute;
