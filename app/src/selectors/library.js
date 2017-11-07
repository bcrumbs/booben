/**
 * @author Dmitriy Bizyaev
 */

import { createSelector } from 'reselect';
import { getLocalizedTextFromState } from './index';
import { extractGroupsDataFromMeta, compareComponents } from '../lib/library';

export const libraryGroupsSelector = createSelector(
  state => state.project.meta,
  state => state.project.data.enableHTML,
  extractGroupsDataFromMeta,
);

export const libraryGroupsSortedByLanguageSelector = createSelector(
  libraryGroupsSelector,
  getLocalizedTextFromState,
  state => state.app.language,

  (groups, getLocalizedText, language) =>
    groups.map(group =>
      group.update('components', components =>
        components.sort(compareComponents(language, getLocalizedText)),
      ),
    ),
);
