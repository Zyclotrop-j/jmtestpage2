import React, { createRef, Component } from 'react';
import styled from 'styled-components';
import { Box, Button, Drop } from 'grommet';
import { Notification } from 'grommet-controls';
import { observer } from 'mobx-react';
import { spring, presets, TransitionMotion } from 'react-motion';
import { removeNotification } from '../state/notifications';

const timeouts = {};
const getDefaultStyles = notifications => {
  return notifications.map(i => ({ data: i, style: { maxHeight: 0, opacity: 1 } }));
};

const getStyles = notifications => {
  return notifications.map((i, idx) => {
    return {
      data: i,
      style: {
        maxHeight: spring(1000, presets.gentle),
        opacity: spring(1, presets.gentle),
      },
    };
  });
};

const willLeave = () => ({
  maxHeight: spring(0),
  opacity: spring(0),
});

const willEnter = () => ({
  maxHeight: 0,
  opacity: 1,
});

const FixedArea = styled(Box)`
  position: absolute;
  top: 0;
  right: 0;
  width: 30vw;
  height: auto;
  z-index: 700;
`;

export const Notificationbar = observer(({ notifications }) => {
  notifications.get();
  return (
    <TransitionMotion
      defaultStyles={getDefaultStyles(notifications)}
      styles={getStyles(notifications)}
      willLeave={willLeave}
      willEnter={willEnter}
    >
      {interpolatedStyles => (
        <FixedArea key="FixedArea" role="log" aria-live="polite" aria-atomic="false">
          {interpolatedStyles.map(({ key, style, data }, idx) => {
            if (timeouts[idx]) {
              window.clearTimeout(timeouts[idx]);
            }
            const timeout = window.setTimeout(() => removeNotification({ ...data, idx }), 10000);
            timeouts[idx] = timeout;
            return (
              <div
                key={key}
                style={{ ...style, border: '1px solid' }}
              >
                {data.message}
              </div>
            );
          })}
        </FixedArea>
      )}
    </TransitionMotion>
  );
});
