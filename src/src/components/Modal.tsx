import React from 'react';
import styled, { css } from 'styled-components';
import FocusLock from 'react-focus-lock';
import { Box, Button, Layer } from 'grommet';

const StyledLayer = styled(Layer)`
  width: 80vw;
  height: 90vh;
  overflow: auto;
`;

export const Modal = ({ children, box = {}, layer = {}, button, focusgroup }) => {
  const [show, setShow] = React.useState();
  return (
    <>
      {button(() => setShow(true))}
      {show && (
        <FocusLock returnFocus group={focusgroup}>
          <StyledLayer {...layer} onEsc={() => setShow(false)} onClickOutside={() => setShow(false)}>
            {children(() => setShow(false))}
          </StyledLayer>
        </FocusLock>
      )}
    </>
  );
}
