/**
 * @author Dmitriy Bizyaev
 */

import { List, Map, OrderedMap } from 'immutable';
import _forOwn from 'lodash.forown';
import LibraryComponentData from '../models/LibraryComponentData';
import LibraryGroupData from '../models/LibraryGroupData';
import HTMLMeta from '../meta/html';
import defaultComponentIcon from '../../assets/component_default.svg';

const GROUP_BUILTIN = new LibraryGroupData({
  name: '__builtin__',
  namespace: '',
  textIntlKey: 'componentGroups.builtin',
  descriptionIntlKey: 'componentGroups.builtin.desc',
  components: List([
    new LibraryComponentData({
      name: 'Outlet',
      fullName: 'Outlet',
      iconURL: defaultComponentIcon,
      textIntlKey: 'components.builtin.Outlet',
      descriptionIntlKey: 'components.builtin.Outlet.desc',
    }),

    new LibraryComponentData({
      name: 'List',
      fullName: 'List',
      iconURL: defaultComponentIcon,
      textIntlKey: 'components.builtin.List',
      descriptionIntlKey: 'components.builtin.List.desc',
    }),

    new LibraryComponentData({
      name: 'Text',
      fullName: 'Text',
      iconURL: defaultComponentIcon,
      textIntlKey: 'components.builtin.Text',
      descriptionIntlKey: 'components.builtin.Text.desc',
    }),
  ]),
});

export const extractGroupsDataFromMeta = (libsMeta, enableHTML) => {
  const meta = enableHTML ? { ...libsMeta, HTML: HTMLMeta } : libsMeta;

  let groups = OrderedMap();

  _forOwn(meta, libMeta => {
    _forOwn(libMeta.componentGroups, (groupData, groupName) => {
      const fullName = `${libMeta.namespace}.${groupName}`;
      const libraryGroup = new LibraryGroupData({
        name: fullName,
        namespace: libMeta.namespace,
        text: Map(libMeta.strings[groupData.textKey]),
        descriptionText: Map(libMeta.strings[groupData.descriptionTextKey]),
        isDefault: false,
      });

      groups = groups.set(fullName, libraryGroup);
    });

    _forOwn(libMeta.components, componentMeta => {
      if (componentMeta.hidden) return;

      let defaultGroup = false,
        groupName;

      if (!componentMeta.group) {
        defaultGroup = true;
        groupName = `${libMeta.namespace}.__default__`;
      } else {
        groupName = `${libMeta.namespace}.${componentMeta.group}`;
      }

      if (defaultGroup && !groups.has(groupName)) {
        const group = new LibraryGroupData({
          name: groupName,
          namespace: libMeta.namespace,
          isDefault: true,
        });

        groups = groups.set(groupName, group);
      }

      const text = componentMeta.strings[componentMeta.textKey];
      const description =
        componentMeta.strings[componentMeta.descriptionTextKey];

      const libraryComponent = new LibraryComponentData({
        name: componentMeta.displayName,
        fullName: `${libMeta.namespace}.${componentMeta.displayName}`,
        text: Map(text),
        descriptionText: Map(description),
        iconURL: componentMeta.icon || defaultComponentIcon,
      });

      groups = groups.updateIn(
        [groupName, 'components'],
        components => components.push(libraryComponent),
      );
    });
  });

  groups = groups.set('__builtin__', GROUP_BUILTIN);

  return groups.toList().filter(group => !group.components.isEmpty());
};

export const getComponentNameString = (
  componentData,
  language,
  getLocalizedText,
) => {
  if (componentData.text) {
    return componentData.text.get(language);
  }

  if (componentData.textIntlKey) {
    return getLocalizedText(componentData.textIntlKey);
  }

  return componentData.name;
};

export const getGroupNameString = (
  groupData,
  language,
  getLocalizedText,
) => {
  let name;

  if (groupData.isDefault) {
    name = getLocalizedText('library.uncategorizedComponents');
  } else if (groupData.text) {
    name = groupData.text.get(language);
  } else if (groupData.textIntlKey) {
    name = getLocalizedText(groupData.textIntlKey);
  } else {
    name = groupData.name;
  }

  return groupData.namespace
    ? `${groupData.namespace} - ${name}`
    : name;
};

export const compareComponents = (language, getLocalizedText) => (a, b) => {
  const aText = getComponentNameString(a, language, getLocalizedText);
  const bText = getComponentNameString(b, language, getLocalizedText);

  if (aText < bText) return -1;
  if (aText > bText) return 1;
  return 0;
};

export const filterGroupsAndComponents = (groups, includeComponent) => groups
  .map(
    group => group.update(
      'components',
      components => components.filter(includeComponent),
    ),
  )
  .filter(group => !group.components.isEmpty());
