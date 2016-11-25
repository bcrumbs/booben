/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 *
 * @type {{components: Object<string, ComponentMeta>}}
 * @const
 */
export default {
    components: {
        Text: {
            displayName: 'Text',
            textKey: 'name',
            descriptionTextKey: 'description',
            kind: 'atomic',
            props: {
                text: {
                    textKey: 'props_text',
                    descriptionTextKey: 'props_text_desc',
                    type: 'string',
                    source: ['static', 'data'],
                    sourceConfigs: {
                        static: {
                            defaultTextKey: 'default'
                        }
                    }
                }
            },
            strings: {
                'name': {
                    en: 'Text'
                },
                'description': {
                    en: ''
                },
                'props_text': {
                    en: 'Text'
                },
                'props_text_desc': {
                    en: ''
                },
                'default': {
                    en: 'Text'
                }
            }
        },

        Outlet: {
            displayName: 'Outlet',
            textKey: 'name',
            descriptionTextKey: 'description',
            kind: 'atomic',
            strings: {
                'name': {
                    en: 'Outlet'
                },
                'description': {
                    en: ''
                }
            }
        },

        List: {
            displayName: 'List',
            textKey: 'name',
            descriptionTextKey: 'description',
            kind: 'atomic',
            props: {
                data: {
                    textKey: 'props_data',
                    descriptionTextKey: 'props_data_desc',
                    type: 'array',
                    source: ['static', 'data'],
                    sourceConfigs: {
                        static: {
                            default: []
                        },
                        data: {
                            pushDataContext: 'item'
                        }
                    }
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
                                    dataContext: 'item'
                                }
                            }
                        }
                    }
                }
            },
            strings: {
                'name': {
                    en: 'List'
                },
                'description': {
                    en: ''
                },
                'props_data': {
                    en: 'Data'
                },
                'props_data_desc': {
                    en: ''
                },
                'props_component': {
                    en: 'Item component'
                },
                'props_component_desc': {
                    en: ''
                },
                'props_component_props_item': {
                    en: 'item'
                },
                'props_component_props_item_desc': {
                    en: ''
                }
            }
        }
    }
};
