import React from 'react';
import { TextField } from 'reactackle-text-field';
import { Column, Row } from 'reactackle-grid';
import { DataRowStyled } from './styles/DataRowStyled';
import { DataAdditionalStyled } from './styles/DataAdditionalStyled';

export const ConstructionTool = () => (
  <div>
    <Row layoutDirection="horizontal">
      <Column layoutDirection="vertical" size={{ xsmall: 6 }}>
        <TextField label="Width" value="300px" />
        
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
        <TextField label="Height" value="300px" />
        
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
