/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export const LIBRARY_EXPANDED_GROUPS = 'LIBRARY_EXPANDED_GROUPS';

export const setExpandedGroups = groups => ({
    type: LIBRARY_EXPANDED_GROUPS,
    groups
});
