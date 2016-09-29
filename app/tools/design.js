/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { List } from 'immutable';

import ToolSectionRecord from '../models/ToolSection';
import ToolRecord from '../models/Tool';

import { ComponentsLibrary } from '../containers/ComponentsLibrary/ComponentsLibrary';

export default List([
    List([
        new ToolRecord({
            id: 'componentsLibrary',
            icon: 'cubes',
            name: 'Components Library',
            title: 'Components Library',
            undockable: true,
            closable: false,
            sections: List([
                new ToolSectionRecord({
                    name: '',
                    component: ComponentsLibrary
                })
            ]),
            mainButtons: List(),
            secondaryButtons: List(),
            windowMinWidth: 360
        })
    ])
]);
