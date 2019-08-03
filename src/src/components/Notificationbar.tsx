import React, { createRef, Component } from 'react';
import styled from 'styled-components';
import { Box, Button, Drop } from 'grommet';
import { Notification } from 'grommet-controls';
import { observer } from 'mobx-react';
import { spring, presets, TransitionMotion } from 'react-motion';
import { removeNotification } from '../state/notifications';


export const Notificationbar = observer(({ notifications }) => {
  notifications.get();
  return <div />;
});
