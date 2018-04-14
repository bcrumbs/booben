/**
 * @type {ComponentMeta}
 */
export default {
  displayName: 'List',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'atomic',
  hidden: true,
  props: {
    data: {
      textKey: 'props_data',
      descriptionTextKey: 'props_data_desc',
      type: 'array',
      source: ['data'],
      sourceConfigs: {
        data: {
          pushDataContext: 'item',
        },
      },
    },
    component: {
      textKey: 'props_component',
      descriptionTextKey: 'props_component_desc',
      type: 'component',
      source: ['designer'],
      sourceConfigs: {
        designer: {
          props: {
            item: {
              textKey: 'props_component_props_item',
              descriptionTextKey: 'props_component_props_item_desc',
              dataContext: 'item',
            },
          },
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: 'List',
    },
    description: {
      en: '',
    },
    props_data: {
      en: 'Data',
    },
    props_data_desc: {
      en: '',
    },
    props_component: {
      en: 'Item component',
    },
    props_component_desc: {
      en: '',
    },
    props_component_props_item: {
      en: 'item',
    },
    props_component_props_item_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
