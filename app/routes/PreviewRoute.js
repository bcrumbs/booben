/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { PreviewIFrame } from '../components/PreviewIFrame/PreviewIFrame';
import store from '../store';

const propTypes = {
  params: PropTypes.shape({
    projectName: PropTypes.string.isRequired,
  }).isRequired,
};

const PreviewRoute = ({ params }) => (
  <PreviewIFrame
    store={store}
    url={`/preview/${params.projectName}/index.html`}
  />
);

PreviewRoute.propTypes = propTypes;
PreviewRoute.displayName = 'PreviewRoute';

export default PreviewRoute;
