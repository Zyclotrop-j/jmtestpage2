import React from 'react';
import styled from 'styled-components';
import FocusLock from 'react-focus-lock';
import { Box, Button, Heading, Layer, Grid } from 'grommet';
import { ChapterAdd, Clone, Close, Document, AddCircle } from 'grommet-icons';
import { observer } from 'mobx-react';
import { path, memoizeWith } from 'ramda';
import { renameKeysWith } from 'ramda-adjunct';
import { PagingTable } from 'grommet-controls';
import { toJS } from 'mobx';
import { formatRelative, parseISO } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { DropTarget } from 'react-dnd';
import { addComponent, addComponenttoGroup, removeComponentfromGroup, components } from '../state/components';
import { componentschemas } from '../state/schemas';
import { newNotification } from '../state/notifications';
import Tooltip from '../components/Tooltip';
import { Modal } from '../components/Modal';
import { default as allComponents } from '../Widget';

const availableComponents = renameKeysWith(key => `component${key.toLowerCase()}`, allComponents);
const ItemTypes = {
  COMPONENT: 'component',
};

const StyledLayer = styled(Layer)`
  width: 80vw;
  height: 90vh;
  overflow: auto;
`;

const addComp = props => {
  const [show, setShow] = React.useState();
  const typename = props.parentcomponent['x-type'].split('component').pop();
  const where = props.area[1].join('->');
  const connectDropTarget = props.connectDropTarget;
  const background = props.isOverCurrent ? 'rgba(0,0,0,.8)' : undefined;
  const height = props.isDragging ? '30px' : '0';
  return connectDropTarget(
    <div
      style={{
        background,
        height,
        overflow: 'hidden',
        transition: 'height 0.1s',
      }}
    >
      <ChapterAdd />
    </div>,
  );
};

const inject = (Comp, observables) => {
  const Fn = observer(props => <Comp {...props} />);
  return props => <Fn {...observables} {...props} />;
};

// connectDropTarget(elementRef);
export const AddWidget = DropTarget(
  ItemTypes.COMPONENT,
  {
    canDrop(props, monitor) {
      // TODO: Disallow dropping on its own children
      // Only allow dropping if there's no target above/top this one
      return monitor.isOver({ shallow: true });
    },
    drop(props, monitor, component) {
      const opid = `opid${Math.floor(Math.random() * 10e8)}`;
      const doSideEffects = async () => {
        newNotification({
          message: 'Adding content',
          nid: opid,
          status: 'info',
        });
        try {
          const awaiters = [];
          const { type, id, parentid, componenttype } = monitor.getItem();
          let insertid = id;
          if (type === 'EXISTING') {
            awaiters.push(
              new Promise((res, rej) =>
                removeComponentfromGroup(id, parentid, res, rej, {
                  optimistic: true,
                  parent: props.parent,
                  parentpath: props.area[1],
                }),
              ),
            );
          } else if (type === 'NEW') {
            // todo: data
            const data = {};
            const { _id } = await new Promise((res, rej) => addComponent(componenttype, data, res, rej));
            insertid = _id;
          } else {
            throw new Error(`No case for type ${type}!`);
          }
          // TODO: Use props.pos to insert in the right position
          await new Promise((res, rej) =>
            addComponenttoGroup(insertid, props.parentgroup, res, rej, {
              optimistic: true,
              pos: props.pos,
              parent: props.parentcomponent,
              parentpath: props.area[1],
            }),
          );
          // add monitor.getItem().componenttype to props.parentgroup
          await Promise.all(awaiters);
          newNotification({
            message: 'Added content',
            nid: opid,
            state: `Type: ${type}`,
            status: 'ok',
          });
          return;
        } catch (e) {
          console.error('Something went wrong dropping', e);
          newNotification({
            message: 'Failed adding content',
            nid: opid,
            status: 'error',
          });
          return;
        }
      };
      doSideEffects();
      return;
    },
    hover(props, monitor, component) {
      return;
    },
  },
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    isDragging: !!monitor.getInitialClientOffset(),
    draggedItem: monitor.getItem(),
  }),
)(inject(addComp, { components, componentschemas }));
