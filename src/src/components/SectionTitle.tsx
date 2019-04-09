import React from 'react';
import styled from 'styled-components';
import { Heading } from 'grommet';

const SectionHeading: any = styled(Heading)`
  display: inline-block;
  font-size: ${props => props.theme.fontSize.big};
  text-transform: ${(props: any) => (props.uppercase ? 'uppercase' : 'normal')};
  text-align: center;
  color: ${props => props.theme.colors.white};
`;

export const SectionTitle = props => (
  <div>
    <SectionHeading level={2} {...props} />
  </div>
);
