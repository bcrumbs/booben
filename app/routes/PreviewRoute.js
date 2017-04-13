/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
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
