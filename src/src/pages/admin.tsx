import * as React from 'react';
import { Content, Header, Layout, Wrapper } from '../components';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import config from '../../config/SiteConfig';
import { Link } from 'gatsby';
import { Box, Text, Grid, Heading, Anchor, Button, Select } from 'grommet';
import { New, Close, ChapterAdd, Edit, Deploy } from 'grommet-icons';
import SplitPane from "react-split-pane";
import { without, pick } from "ramda";
import { renameKeysWith } from 'ramda-adjunct';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { DragSource, DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { WidgetForm } from '../components/WidgetForm';
import { notifications } from "../state/notifications";
import { viewmode, viewmodes, setViewmode } from "../state/viewmode";
import { fetchAllSchemas, pageschema, websiteschema, componentschemas, loading as schemaloading, error as schemaerror } from "../state/schemas";
import { editComponent, addComponent, fetchAllComponents, components as allComponents, loading as componentloading, error as componenterror, request } from "../state/components";
import { pages, setCurrentPage, current as currentpage, loading as pageloading, error as pageerror } from "../state/pages";
import { addSite, addPage, fetchAllWebsites, setCurrentWebsite, websites, current as currentwebsite, loading as websiteloading, error as websiteerror } from "../state/websites";
import { auth } from "../utils/auth";
import { ModernLayout } from "../layouts/modern";
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Notificationbar } from "../components/Notificationbar";
import { ComponentControlls } from "../components/ComponentControlls";
import EditRenderer from "../components/EditRenderer";
import components from '../Widget';
import SEOPreview from "../components/SEOPreview";
import { deployment, isDeploying, doDeploy } from "../state/deployments";

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

const Viewmodechooser = observer(({ viewmode, set, options }) => {
  return (
      <Select
        gridArea="viewmode"
        options={options}
        placeholder="Please set a viewmode"
        value={viewmode.get()}
        onChange={({ option }) => set(option)}
      />);
});

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

const DeployButton = observer(({ status = {}, busy, deploy, website, loading }) => {
  if(loading && loading.get()) return <Text gridArea="deployment">Loading...</Text>;
  if(!website || !website.get()) return <Text gridArea="deployment">Please select a website to deploy</Text>;
  if(busy.get()) return (<Box gridArea="deployment" direction="row" pad="xsmall">
    <Text margin={{ horizontal: "xsmall" }}>Deploying ({Math.round(status.get()*100)/100}%)</Text>
  </Box>);
  return <Button gridArea="deployment" label="Deploy" margin={{horizontal: "medium"}} icon={<Deploy />} onClick={() => deploy({
    ...website.get(),
    customer: "Jannes Mingram Test"
  })}/>;
});

const NewWebsite = observer(({ schema }) => {
  if(!schema || !schema.get()) {
    return <Text gridArea="sitenew">No schema</Text>;
  }
  const gschema = schema.get();
  const submit = async ({ formData: idata }) => new Promise((res, rej) =>
    addComponent("website", {
      ...idata,
      pages: []
    }, res, rej, { skipClientCheck: true })
  );

  return (<WidgetForm
    Preview={(props) => <SEOPreview title="" domain="" path="/" description="" {...props} />}
    schema={gschema}
    initialValues={{ header: {}, footer: {} }}
    button={open => <Button margin={{horizontal: "medium"}} gridArea="sitenew" label="New Website" icon={<New />} plain onClick={open} />}
    title="page"
    onSubmit={submit}
    onError={i => Promise.resolve(console.log('error', i))}
  />);
});

const NewPage = observer(({ schema, website, page }) => {
  if(!schema || !schema.get()) {
    return <Text gridArea="pagenew">No schema</Text>;
  }
  if(!website.get()) {
    return <Text gridArea="pagenew">No website selected</Text>
  }
  const cpage = page.get() || {};
  const csite = website.get();
  const gschema = schema.get();
  const stripContentAreas = without(["main", "footer", "header", "_client"]);
  const keys = Object.keys(gschema.properties);
  const fkeys = without(['main'], [...keys, 'title']);
  const pickProperties = pick(fkeys);
  const submit = async ({ formData: idata }) => {
    // // TODO: Make widget to select header, footer group
    const makeNewGroup = area => new Promise((res, rej) => addComponent("componentgroup", {
      _draft: false,
      _client: csite._client,
      title: `${area} of ${idata.path} - ${idata.title} (${Math.floor(Math.random()*10e6)})`,
      groupdesc: `Autogenerated group for ${area} of page`,
      components: []
    }, res, rej));
    const { _id: mainid } = await makeNewGroup("main");
    const selectedProperties = pickProperties(idata);
    selectedProperties.footer = cpage.footer;
    selectedProperties.header = cpage.header;
    selectedProperties.main = mainid;
    const checkgroupprop = (a, b) => new Promise((res, rej) => {
      if(!selectedProperties?.[a]?.[b]) {
        return makeNewGroup(`${a}-${b}`).then(({ _id: sid }) => {
          if(!selectedProperties[a]) {
            selectedProperties[a] = {};
          }
          selectedProperties[a][b] = sid;
          res(sid);
        }).catch(rej);
      }
      res();
    });
    const promises = [
      checkgroupprop("footer", "left"),
      checkgroupprop("footer", "right"),
      checkgroupprop("footer", "center"),
      checkgroupprop("header", "left"),
      checkgroupprop("header", "right"),
      checkgroupprop("header", "center"),
    ];
    // Create groups if they're not present yet
    await Promise.all(promises);
    const { _id } = await new Promise((res, rej) =>
      addComponent("page", selectedProperties, res, rej)
    );
    await new Promise((res, rej) => addPage(_id, csite._id, res, rej,  {
      optimistic: true,
      switch: true,
    }));
    // fetchAllPages();
    return "OK";
  };

  return (<WidgetForm
    Preview={(props) => <SEOPreview title={csite.title} domain={csite.domain} path={"/"} description={csite.description} {...props} />}
    schema={gschema}
    initialValues={{ header: {}, footer: {} }}
    button={open => <Button margin={{horizontal: "medium"}} gridArea="pagenew" label="New Page" icon={<ChapterAdd />} plain onClick={open} />}
    title="page"
    onSubmit={submit}
    onError={i => Promise.resolve(console.log('error', i))}
  />);
});

const ConfigureSite = observer(({ schema, website }) => {
  if(!schema || !schema.get()) {
    return <Text gridArea="siteedit">No schema</Text>;
  }
  if(!website.get()) {
    return <Text gridArea="siteedit">No site selected</Text>
  }
  const csite = website.get();
  const gschema = schema.get();
  const keys = Object.keys(gschema.properties);
  const fkeys = without(['pages'], [...keys, 'title']);
  const pickProperties = pick(fkeys);
  const submit = ({ formData: idata }) => new Promise((res, rej) =>
    editComponent(csite._id, pickProperties(idata), res, rej, {
      optimistic: true
    })
  );
  return (<WidgetForm
    Preview={(props) => <SEOPreview title="" domain="" path="/" description="" {...props} />}
    schema={gschema}
    initialValues={pickProperties(csite)}
    button={open => <Button margin={{horizontal: "medium"}} gridArea="siteedit" label="Edit website" icon={<Edit />} plain onClick={open} />}
    title="site"
    onSubmit={submit}
    onError={i => Promise.resolve(console.log('error', i))}
  />);
});

const ConfigurePage = observer(({ schema, current, website }) => {
  if(!schema || !schema.get()) {
    return <Text gridArea="pageedit">No schema</Text>;
  }
  if(!current.get()) {
    return <Text gridArea="pageedit">No page selected</Text>
  }
  const csite = website.get();
  const cpage = current.get();
  const gschema = schema.get();
  const keys = Object.keys(gschema.properties);
  const fkeys = without(['content'], [...keys, 'title']);
  const pickProperties = pick(fkeys);
  const submit = ({ formData: idata }) => new Promise((res, rej) =>
    editComponent(cpage._id, pickProperties(idata), res, rej, {
      optimistic: true
    })
  );
  return (<WidgetForm
    Preview={(props) => <SEOPreview title={csite.title} domain={csite.domain} path={"/"} description={csite.description} {...props} />}
    schema={gschema}
    initialValues={pickProperties(cpage)}
    button={open => <Button margin={{horizontal: "medium"}} gridArea="pageedit" label="Edit Page" icon={<Edit />} plain onClick={open} />}
    title="page"
    onSubmit={submit}
    onError={i => Promise.resolve(console.log('error', i))}
  />);
});

const Authentication = observer(({ auth: authx }) => {
  if(!authx.initialized) {
    return <Text gridArea="auth">Loading....</Text>;
  }
  const email = authx.authResult?.idTokenPayload?.email;
  return (<>
    {email && <Text gridArea="user">Logged in as {email}</Text>}
    <Button fill="horizontal" gridArea="auth" label={authx.isAuthenticated() ? "Log out" : "Log in"} onClick={authx.isAuthenticated() ? authx.logout : authx.login} />
  </>);
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
        return <Dragger key={i.title} componenttype={i.title}>{({ isDragging }) => <Box >{i.title}</Box>}</Dragger>
      })
    }</>);
});

export default class IndexPage extends React.Component<any> {

  public constructor(props) {
    super(props);
  }

  public componentDidMount() {
    auth.renewSession();
    fetchAllSchemas();
    fetchAllWebsites();
  }

  public render() {

    return (
      <DragDropContextProvider backend={HTML5Backend}><Page>
        <Notificationbar notifications={notifications} />
        <StyledSplitPane split="vertical" minSize={250}>
            <Grid
              rows={['auto', 'flex', 'auto', 'xsmall']}
              columns={['auto']}
              fill={true}
              areas={[
                { name: 'modals', start: [0, 0], end: [0, 0] },
                { name: 'viewmode', start: [0, 2], end: [0, 2] },
              ]}
            >
              <Box gridArea="modals">
                <Modals schemas={componentschemas} onSubmit={() => null} onError={() => null} />
              </Box>
              <Viewmodechooser viewmode={viewmode} set={setViewmode} options={viewmodes} />
            </Grid>
            <StyledSplitPane split="horizontal" minSize={150}>
                <Grid
                  rows={['auto', 'flex', 'flex']}
                  columns={['flex', 'small', 'auto', 'auto', 'auto', 'small']}
                  fill="horizontal"
                  areas={[
                    { name: 'deployment', start: [0, 0], end: [5, 0] },
                    { name: 'site', start: [0, 1], end: [1, 1] },
                    { name: 'siteedit', start: [2, 1], end: [2, 1] },
                    { name: 'sitenew', start: [3, 1], end: [3, 1] },
                    { name: 'page', start: [0, 2], end: [1, 2] },
                    { name: 'pageedit', start: [2, 2], end: [2, 2] },
                    { name: 'pagenew', start: [3, 2], end: [3, 2] },
                    { name: 'user', start: [4, 2], end: [5, 2] },
                    { name: 'auth', start: [4, 1], end: [5, 1] }
                  ]}
                >
                  <Websitechooser loading={anyloading} error={websiteerror} current={currentwebsite} options={websites} set={setCurrentWebsite} />
                  <Pagechooser loading={pageloading} error={pageerror} current={currentpage} options={pages} set={setCurrentPage} website={currentwebsite} />
                  <ConfigurePage schema={pageschema} website={currentwebsite} current={currentpage} />
                  <ConfigureSite schema={websiteschema} website={currentwebsite} />
                  <NewPage schema={pageschema} website={currentwebsite} page={currentpage} />
                  <NewWebsite schema={websiteschema} />
                  <Authentication auth={auth} />
                  <DeployButton status={deployment} busy={isDeploying} deploy={doDeploy} website={currentwebsite} loading={anyloading} />

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
