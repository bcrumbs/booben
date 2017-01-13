/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { createHistory } from 'history';
import { useRouterHistory } from 'react-router';
import { URL_APP_PREFIX } from '../common/shared-constants';

export default useRouterHistory(createHistory)({
  basename: URL_APP_PREFIX,
});
