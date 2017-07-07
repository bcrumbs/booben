'use strict';

import React from 'react';
import { Column, Input, Row } from '@reactackle/reactackle';
import { DataRowStyled } from './styles/DataRowStyled';
import { DataAdditionalStyled } from './styles/DataAdditionalStyled';

export const ConstructionTool = () => (
  <div>
    <Row layoutDirection="horizontal">
      <Column layoutDirection="vertical" size={{ xsmall: 6 }}>
        <Input label="Width" value="300px" />
        
        <DataRowStyled>
          <DataAdditionalStyled>
            min-width: 0
          </DataAdditionalStyled>
          <DataAdditionalStyled>
            max-width: 100%
          </DataAdditionalStyled>
        </DataRowStyled>
      </Column>
      
      <Column layoutDirection="vertical" size={{ xsmall: 6 }}>
        <Input label="Height" value="300px" />
        
        <DataRowStyled>
          <DataAdditionalStyled>
            min-width: 0
          </DataAdditionalStyled>
          <DataAdditionalStyled>
            max-width: 100%
          </DataAdditionalStyled>
        </DataRowStyled>
      </Column>
    </Row>
  </div>
);

ConstructionTool.displayName = 'ConstructionTool';
