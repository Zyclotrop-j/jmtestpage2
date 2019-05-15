import * as React from 'react';
import { Content, Header, Layout, Wrapper } from '../components';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import config from '../../config/SiteConfig';
import { Link } from 'gatsby';
import { Box, Text, Grid, Heading, Anchor, Button, Select } from 'grommet';
import { Close } from 'grommet-icons';
import SplitPane from "react-split-pane";
import { renameKeysWith } from 'ramda-adjunct';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { DragSource } from 'react-dnd';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { notifications } from "../state/notifications";
import { fetchAllSchemas, componentschemas, loading as schemaloading, error as schemaerror } from "../state/schemas";
import { fetchAllComponents, components as allComponents, loading as componentloading, error as componenterror } from "../state/components";
import { pages, setCurrentPage, current as currentpage, loading as pageloading, error as pageerror } from "../state/pages";
import { fetchAllWebsites, setCurrentWebsite, websites, current as currentwebsite, loading as websiteloading, error as websiteerror } from "../state/websites";
import { auth } from "../utils/auth";
import { ModernLayout } from "../layouts/modern";
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Notificationbar } from "../components/Notificationbar";
import { ComponentControlls } from "../components/ComponentControlls";
import { WidgetForm } from "../components/WidgetForm";
import EditRenderer from "../components/EditRenderer";
import components from '../Widget';

const ItemTypes = {
  COMPONENT: 'component',
};

const availableComponents = renameKeysWith(key => `component${key.toLowerCase()}`, components);

export const anyloading = computed(() =>
  componentloading.get() || pageloading.get() || websiteloading.get() || schemaloading.get()
);

export const anyerror = computed(() =>
  componenterror.get() || pageerror.get() || websiteerror.get() || schemaerror.get()
);

const Page = styled.div`
  width: 100vw;
  height: 100vh;
`;
const StyledSplitPane = styled(SplitPane)`
    .Pane {
      height: inherit;
    }
    .Resizer {
        background: #000;
        opacity: .2;
        z-index: 1;
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        -moz-background-clip: padding;
        -webkit-background-clip: padding;
        background-clip: padding-box;
    }

     .Resizer:hover {
        -webkit-transition: all 2s ease;
        transition: all 2s ease;
    }

     .Resizer.horizontal {
        height: 11px;
        margin: -5px 0;
        border-top: 5px solid rgba(255, 255, 255, 0);
        border-bottom: 5px solid rgba(255, 255, 255, 0);
        cursor: row-resize;
        width: 100%;
    }

    .Resizer.horizontal:hover {
        border-top: 5px solid rgba(0, 0, 0, 0.5);
        border-bottom: 5px solid rgba(0, 0, 0, 0.5);
    }

    .Resizer.vertical {
        width: 11px;
        margin: 0 -5px;
        border-left: 5px solid rgba(255, 255, 255, 0);
        border-right: 5px solid rgba(255, 255, 255, 0);
        cursor: col-resize;
    }

    .Resizer.vertical:hover {
        border-left: 5px solid rgba(0, 0, 0, 0.5);
        border-right: 5px solid rgba(0, 0, 0, 0.5);
    }
    .Resizer.disabled {
      cursor: not-allowed;
    }
    .Resizer.disabled:hover {
      border-color: transparent;
    }`;

const Websitechooser = observer(({ loading, error, current, options, set }) => {
  return (
      loading.get() ? <Text gridArea="site">Loading website</Text> : (<>
      {error.get() && <div>{error.get()}</div>}
      <Select
        gridArea="site"
        options={options}
        placeholder="Please choose a site"
        labelKey={i => i && `${i.domain}`}
        valueKey={i => i && i._id}
        value={current.get()}
        onChange={({ option }) => set(option)}
      /></>)
  );
});



const Pagechooser = observer(({ website, loading, error, current, options, set }) => {
  console.log("Page", loading, error, current, options, set );
  return (
      loading.get() ? <Text gridArea="page">Loading pages</Text> : <>
      {error.get() && <Text gridArea="page">{error.get()}</Text>}
      <Select
        disabled={!website.get()}
        gridArea="page"
        options={options}
        placeholder={website.get() ? "Please choose a page" : "Please choose a website to edit"}
        labelKey={i => i && `${i.path} (${i.title})`}
        valueKey={i => i && i._id}
        value={current.get()}
        onChange={({ option }) => set(option)}
      /></>
    );
});

const makeDragSource = DragSource(
  ItemTypes.COMPONENT,
  {
    beginDrag: props => ({
      type: "NEW",
      componenttype: props.componenttype,
    }),
  },
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }),
);

const style = {
  border: '1px dashed gray',
  cursor: 'move',
};

const Dragger = makeDragSource(({ isDragging, connectDragSource, children }) => connectDragSource(<div
    style={Object.assign({}, style)}
  >
        {children({ isDragging })}
      </div>));

const Modals = observer(({ schemas, onSubmit, onError }) => {
  return (!schemas.get().length ?
    <div>Fetching Component</div> :
    <>{
      schemas.get().map((i) => {
        const Component = availableComponents[i.title];
        return <Dragger componenttype={i.title}>{({ isDragging }) => <Box>{i.title}</Box>}</Dragger>
      })
    }</>);
});

export default class IndexPage extends React.Component<any> {

  public constructor(props) {
    super(props);
  }

  public componentDidMount() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      auth.renewSession();
    }
    fetchAllSchemas();
    fetchAllWebsites();
  }

  public render() {

    const email = auth.getAuthResult()?.idTokenPayload?.email;

    return (
      <DragDropContextProvider backend={HTML5Backend}><Page>
        <Notificationbar notifications={notifications} />
        <StyledSplitPane split="vertical" minSize={250}>
            <Modals schemas={componentschemas} onSubmit={() => null} onError={() => null} />
            <StyledSplitPane split="horizontal" minSize={100}>
                <Grid
                  rows={['flex', 'flex']}
                  columns={['flex', 'small', 'flex', 'small', 'auto', 'small']}
                  fill="horizontal"
                  areas={[
                    { name: 'site', start: [0, 0], end: [1, 0] },
                    { name: 'page', start: [0, 1], end: [1, 1] },
                    { name: 'refresh', start: [3, 0], end: [3, 0] },
                    { name: 'user', start: [4, 1], end: [5, 1] },
                    { name: 'auth', start: [4, 0], end: [5, 0] }
                  ]}
                >
                  <Websitechooser loading={websiteloading} error={websiteerror} current={currentwebsite} options={websites} set={setCurrentWebsite} />
                  <Pagechooser loading={pageloading} error={pageerror} current={currentpage} options={pages} set={setCurrentPage} website={currentwebsite} />
                  <Button fill="horizontal" gridArea="refresh" label="Refresh" onClick={fetchAllComponents} disabled={!currentwebsite.get() || !currentpage.get() || schemaloading.get() || websiteloading.get() || pageloading.get() || componentloading.get()} />

                  {email && <Text gridArea="user">Logged in as {email}</Text>}
                  <Button fill="horizontal" gridArea="auth" label={auth.isAuthenticated() ? "Log out" : "Log in"} onClick={auth.isAuthenticated() ? auth.logout : auth.login} />

                </Grid>
                <Box fill overflow="auto" >
                  <EditRenderer page={currentpage} components={allComponents} loading={anyloading} error={anyerror} Layout={ModernLayout} />
                </Box>
            </StyledSplitPane>
        </StyledSplitPane>
      </Page></DragDropContextProvider>
    );
  }
};
