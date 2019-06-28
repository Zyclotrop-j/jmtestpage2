import React, { useImperativeHandle, useRef } from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource } from 'react-dnd';
import styled from 'styled-components';
import { Grid, Box, Button, Text } from 'grommet';
import { Edit, Pan, Trash } from 'grommet-icons';
import { pick, without } from 'ramda';
import { renameKeysWith } from 'ramda-adjunct';
import { observer } from 'mobx-react';
import { newNotification } from '../state/notifications';
import { viewmode } from "../state/viewmode";
import { removeComponentfromGroup, editComponent, components as allComponents } from '../state/components';
import { WidgetForm } from '../components/WidgetForm';
import { AddWidget } from '../components/AddWidget';
import components from '../Widget';

const ItemTypes = {
  COMPONENT: 'component',
};

const availableComponents = renameKeysWith(key => `component${key.toLowerCase()}`, components);

const HeaderGrid = styled(Grid)``;
const Pad = styled.div`
  margin: ${props => props.preview ? 0 : "2px"};
  border: ${props => props.preview ? 0 : "3px"} solid transparent;
  transition: border 0.5s;
  ${props => props.preview ? "" : "" /*"position: relative;"*/}
  *:hover > & {
    border: ${props => props.preview ? 0 : "3px"} solid rgba(192, 192, 192, 0.1);
  }
  *:hover > &:hover {
    border: ${props => props.preview ? 0 : "3px"} solid silver;
  }
`;
const Overlaybox = styled.div`
  position: relative;
  ${HeaderGrid} {
    position: relative;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9;
    background: rgba(0, 0, 0, 0.3);
    height: auto;
  }
`;
const RButton = styled(Button)`
  text-align: right;
  margin-right: 10px;
`;
const Mini = styled(Box)`
  max-height: 20px;
  transition: max-height 0.1s;
  &:hover {
    max-height: 150px;
  }
  overflow: hidden;
`;

const RawComponentControlls = observer(({ connectDragSource, schemas, __renderSubtree, props, addProps, __children, children, plain = false, customtitle }) => {
  const type = props['x-type'];
  if (!type) {
    if (React.isValidElement(props)) {
      return props;
    }
    console.error(props, children, __children);
    throw new Error('Type not defined - widgets need a type to be rendered!');
  }

  const minimize = viewmode.get() === "minimize" && !['componentbox', 'componentgrid'].includes(type);
  const preview = viewmode.get() === "preview";

  const enhancedChildren = Array.isArray(__children)
    ? {
        children: [...__children].map((i, idx) => [
          __renderSubtree(i, { ...addProps, ___component: props, ___context: ['children', ['content', idx]] }),
        ]),
      } :
      { child: [__renderSubtree(__children, { ...addProps, ___component: props, ___context: ['children', ['content']] })] };

  const addPropsN = {
    ...addProps,
    __renderSubtree: i => (i ? <Pad preview={preview}>{i}</Pad> : null),
  };
  const nprops = {
    ...props,
    __children: {
      child: [<span key="Demo">Demo Content</span>],
      children: [[<span key="Demo">Demo Content</span>]],
    },
    __renderSubtree: i => i,
  };
  const del = () => {
    const opid = `opid${Math.floor(Math.random() * 10e8)}`;
    newNotification({
      message: 'Deleting...',
      nid: opid,
      status: 'info',
    });
    const { ___groupid: groupid } = addProps;
    const { _id: componentid } = props;
    const hasDeleted = new Promise((res, rej) =>
      removeComponentfromGroup(componentid, groupid, res, rej, {
        optimistic: true,
      }),
    );
    hasDeleted
      .then(() => {
        newNotification({
          message: 'Deleted content',
          nid: opid,
          status: 'ok',
        });
      })
      .catch(() => {
        newNotification({
          message: 'Error deleting content',
          nid: opid,
          status: 'error',
        });
      });
  };

  const onSubmit = ({ formData, schema: xschema }) => {
    const { _id } = formData;
    const keys = Object.keys(xschema.properties);
    const fkeys = [...keys, 'title'];
    const collectedData = pick(fkeys, formData);
    const opid = `opid${Math.floor(Math.random() * 10e8)}`;
    newNotification({
      message: 'Editing...',
      nid: opid,
      status: 'info',
    });
    const componentedited = new Promise((res, rej) =>
      editComponent(_id, collectedData, res, rej, {
        optimistic: true,
      }),
    );
    componentedited
      .then(() => {
        newNotification({
          message: 'Edited content',
          nid: opid,
          status: 'ok',
        });
      })
      .catch(() => {
        newNotification({
          message: 'Error editing content',
          nid: opid,
          status: 'error',
        });
      });
    return componentedited;
  };

  const inner = children({
    props,
    addProps: addPropsN,
    __children: enhancedChildren,
  });

  if(preview) return inner;

  const schema = schemas.find(x => x.title === type);
  return (
    <React.Fragment key={nprops._modified}>
      <Overlaybox>
        <HeaderGrid
          rows={['full']}
          columns={['auto', 'flex', 'flex', 'flex']}
          fill={true}
          areas={[
            { name: 'title', start: [0, 0], end: [0, 0] },
            { name: 'icon1', start: [1, 0], end: [1, 0] },
            { name: 'icon2', start: [2, 0], end: [2, 0] },
            { name: 'icon3', start: [3, 0], end: [3, 0] },
          ]}
          alignContent="between"
          justifyContent="between"
        >
          <Box gridArea="title" overflow="hidden">
            <Text color="white">{customtitle || type}</Text>
          </Box>
          {!plain && <Box gridArea="icon1" overflow="hidden">
            {connectDragSource && connectDragSource(
              <div style={{ cursor: 'move', paddingLeft: 10, paddingRight: 10 }}>
                <Pan size="medium" />
              </div>,
            )}
          </Box>}
          <WidgetForm
            Preview={availableComponents[schema.title]}
            schema={schema}
            initialValues={nprops}
            button={open => <RButton gridArea="icon2" a11yTitle="Edit" icon={<Edit color="white" />} plain onClick={open} />}
            title={schema.title}
            onSubmit={onSubmit}
            onError={i => Promise.resolve(console.log('error', i))}
            allComponents={allComponents}
          />
          {!plain && <RButton gridArea="icon3" a11yTitle="Delete" icon={<Trash color="white" />} plain onClick={del} />}
        </HeaderGrid>
      </Overlaybox>
      {minimize ? <Mini>{inner}</Mini> : inner}
    </React.Fragment>
  );
});

const style = {
  border: '1px dashed gray',
};
const ConnectedComponentControlls = React.forwardRef(
  ({ isDragging, connectDragSource, connectDragPreview, isOverCurrent, gridArea, ...rest }, ref) => {
    const elementRef = useRef(null);
    connectDragPreview(elementRef);
    const opacity = isDragging ? 0.3 : 1;
    const height = isDragging ? '18px' : undefined;
    const overflow = isDragging ? 'hidden' : undefined;
    const content = isDragging ? <div>Original Position</div> : <RawComponentControlls viewmode={viewmode} connectDragSource={connectDragSource} {...rest} />;
    useImperativeHandle(ref, () => ({
      getNode: () => elementRef.current,
      ...rest,
    }));
    return (
      <Box gridArea={gridArea} ref={elementRef} style={Object.assign({}, style, { opacity, height, overflow })}>
        {content}
      </Box>
    );
  },
);

export const ComponentControlls = DragSource(
  ItemTypes.COMPONENT,
  {
    beginDrag: props => ({
      type: props.dtype,
      componenttype: props.dcomponenttype,
      id: props.did,
      parentid: props.dparentid,
    }),
  },
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  }),
)(ConnectedComponentControlls);
