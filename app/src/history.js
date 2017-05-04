/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import createHistory from 'history/es/createBrowserHistory';
import { URL_APP_PREFIX } from '../../shared/constants';

export default createHistory({
  basename: URL_APP_PREFIX,
});
