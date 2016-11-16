import React, { PropTypes } from 'react';

import { Breadcrumbs } from '@reactackle/reactackle';

import { BlockContentBoxHeading } from '../../../BlockContent/BlockContentBox/BlockContentBoxHeading/BlockContentBoxHeading';
import { PropLabel } from '../PropLabel/PropLabel';
import { PropsItem } from '../PropsItem';
import { PropTreeList } from './PropTreeList/PropTreeList';
import { PropTreeBreadcrumbs } from './PropTreeBreadcrumbs/PropTreeBreadcrumbs';

export const PropTree = props => (
    <div className='prop-item-tree-wrapper'>
	    <BlockContentBoxHeading>
		    <PropLabel label={props.label} tooltip={props.tooltip}/>
	    </BlockContentBoxHeading>
	    /* FIRST LEVEL */
	    <PropTreeList>
		    <PropsItem label="buttons" view="object">
			    <PropTreeList>
				    <PropsItem label="button1" type="constructor" view="constructor" buttonText="Set component" />
				    <PropsItem label="button2" type="constructor" view="constructor" buttonText="Set component" />
			    </PropTreeList>
		    </PropsItem>
		    <PropsItem label="onClick" type="function" view="input" />
		    <PropsItem label="value" type="number" view="input" />
	    </PropTreeList>

	    /* INNER LEVELS
		    <PropTreeBreadcrumbs />
		    <PropTreeList addButton>
			    <PropsItem label="button1" type="constructor" view="constructor" buttonText="Set component" />
			    <PropsItem label="button2" type="constructor" view="constructor" buttonText="Set component" />
		    </PropTreeList>
	    */
    </div>
);

PropTree.propTypes = {
	label: PropTypes.string,
	tooltip: PropTypes.string
};

PropTree.defaultProps = {
	label: '',
	tooltip: ''
};
PropTree.displayName = 'PropTree';

export * from './PropTreeList/PropTreeList';

/* TREE EXAMPLE - DELETE THIS
	<PropTreeList>
		<PropTreeItem title="prop-1" opened>
			 <PropTreeList>
				 <PropTreeItem title="buttons" opened>
					 <PropTreeList addButton>
						 <PropTreeItem title="button1" type="constructor" valueType="constructor" />
						 <PropTreeItem title="button2" type="constructor" valueType="constructor" />
					 </PropTreeList>
				 </PropTreeItem>
				 <PropTreeItem title="onClick" type="function" valueType="input" />
				 <PropTreeItem title="value" type="number" valueType="input" />
				 <PropTreeItem title="some array">
					 <PropTreeList>
						 <PropTreeItem title='1' type="arrayItem" valueType="input" />
						 <PropTreeItem title='2' type="arrayItem" valueType="input" />
					 </PropTreeList>
				</PropTreeItem>
			 </PropTreeList>
		</PropTreeItem>
    </PropTreeList>
 */