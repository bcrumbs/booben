'use strict';

import React from 'react';
import { Column, Input, Row } from '@reactackle/reactackle';
import './ConstructionTool.scss';

export const ConstructionTool = () => (
  <div className="construction-tool">
    <Row layoutDirection="horizontal">
      <Column layoutDirection="vertical" size={{ xsmall: 6 }}>
        <Input label="Width" value="300px" />
        
        <div className="construction-tool_data-row">
          <div className="construction-tool_data-item-additional">
            min-width: 0
          </div>
          
          <div className="construction-tool_data-item-additional">
            max-width: 100%
          </div>
        </div>
      </Column>
      
      <Column layoutDirection="vertical" size={{ xsmall: 6 }}>
        <Input label="Height" value="300px" />
        
        <div className="construction-tool_data-row">
          <div className="construction-tool_data-item-additional">
            min-width: 0
          </div>
          
          <div className="construction-tool_data-item-additional">
            max-width: 100%
          </div>
        </div>
      </Column>
    </Row>
  </div>
);

ConstructionTool.displayName = 'ConstructionTool';
