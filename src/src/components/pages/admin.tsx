import * as React from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import config from '../../../config/SiteConfig';
import { Link } from 'gatsby';
import { TextInput, Grommet, Box, Text, Grid, Heading, Anchor, Button, Select, Accordion, AccordionPanel } from 'grommet';
import { New, Close, ChapterAdd, Edit, Deploy, Trash } from 'grommet-icons';
import SplitPane from "react-split-pane";
import { without, pick, mergeDeepRight, groupBy, toLower, is } from "ramda";
import { renameKeysWith } from 'ramda-adjunct';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { DragSource, DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { WidgetForm } from '../../components/WidgetForm';
import { notifications } from "../../state/notifications";
import { viewmode, viewmodes, setViewmode } from "../../state/viewmode";
import { fetchAllSchemas, pageschema, websiteschema, componentschemas, loading as schemaloading, error as schemaerror } from "../../state/schemas";
import { deleteComponent, editComponent, addComponent, fetchAllComponents, components as allComponents, loading as componentloading, error as componenterror, request } from "../../state/components";
import { pages, setCurrentPage, current as currentpage, loading as pageloading, error as pageerror } from "../../state/pages";
import { entities, loading as entitiesloading, error as entitieserror, progress as entityprogress } from "../../state/entities";
import { themes, addSite, addPage, fetchAllWebsites, setCurrentWebsite, websites, current as currentwebsite, loading as websiteloading, error as websiteerror } from "../../state/websites";
import { auth } from "../../utils/auth";
import { ModernLayout } from "../../layouts/modern";
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { Notificationbar } from "../../components/Notificationbar";
import { ComponentControlls } from "../../components/ComponentControlls";
import EditRenderer from "../../components/EditRenderer";
import AssetManager from "../../components/AssetManager";
import EntityManager from "../../components/EntityManager";
import components from '../../Widget';
import SEOPreview from "../../components/SEOPreview";
import { deployment, isDeploying, doDeploy } from "../../state/deployments";

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
    .Pane.horizontal.Pane2 {
      overflow: auto;
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

const OGrommet = observer(({ themes, children }) => {
  const finalTheme = themes.reduce((p, i) => mergeDeepRight(i, p), {});
  console.log("mergeDeepRight(...themes)", finalTheme);
  return (
    <Grommet theme={finalTheme}>
      {children}
    </Grommet>)
});

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
      {error.get() && <div>{/*error.get()*/}</div>}
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
  const NONE = Symbol("NONE");
  return (
      loading.get() ? <Text gridArea="page">Loading pages</Text> : <>
      {error.get() && <Text gridArea="page">{/*error.get()*/}</Text>}
      <Select
        disabled={!website.get()}
        gridArea="page"
        options={[{ path: "Edit Menus", title: "Unset page", _id: NONE }].concat(options)}
        placeholder={website.get() ? "Please choose a page" : "Please choose a website to edit"}
        labelKey={i => i && `${i.path} (${i.title})`}
        valueKey={i => i && i._id}
        value={current.get()}
        onChange={({ option }) => set(option._id === NONE ? null : option)}
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
    customer: website.get().owner
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
    allComponents={allComponents}
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
  const csite = website.get();
  const gschema = schema.get();
  const keys = Object.keys(gschema.properties);
  const fkeys = [...keys, 'title'];
  const pickProperties = pick(fkeys);
  const submit = async ({ formData: idata }) => {
    const selectedProperties = pickProperties(idata);
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
    allComponents={allComponents}
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
    allComponents={allComponents}
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
    allComponents={allComponents}
    Preview={(props) => <SEOPreview title={csite.title} domain={csite.domain} path={"/"} description={csite.description} {...props} />}
    schema={gschema}
    initialValues={pickProperties(cpage)}
    button={open => <Button margin={{horizontal: "medium"}} gridArea="pageedit" label="Edit Page" icon={<Edit />} plain onClick={open} />}
    title="page"
    onSubmit={submit}
    onError={i => Promise.resolve(console.log('error', i))}
  />);
});

export const Authentication = observer(({ auth: authx }) => {
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
const StyledAccordion = styled(Accordion)`
  overflow: auto;
`;

const Dragger = makeDragSource(({ isDragging, connectDragSource, children }) => connectDragSource(<div
    style={Object.assign({}, style)}
  >
        {children({ isDragging })}
      </div>));

const makeDragSourceExisting = DragSource(
  ItemTypes.COMPONENT,
  {
    beginDrag: props => ({
      type: "EXISTING",
      componenttype: props.componenttype,
      id: props._id,
    }),
  },
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }),
);
const DraggerExisting = makeDragSourceExisting(({ isDragging, connectDragSource, children }) => connectDragSource(<div
  style={Object.assign({}, style)}
>
  {children({ isDragging })}
</div>));

const order = ["Layout", "Basic View", "Advanced View", "Text", "Graphic", "Form", "Other"];
const byGrade = groupBy(i => {
  const mapping = {
    BaseBox: ["Layout"],
    Center: ["Layout"],
    Cluster: ["Layout"],
    Cover: ["Layout"],
    SGrid: ["Layout"],
    SideBar: ["Layout"],
    Stack: ["Layout"],
    Switcher: ["Layout"],
    TagList: ["Basic View"],
    Link: ["Layout"],
    JSONLDData: ["Other"],
    ContactForm: ["Form"],
    Map: ["Graphic"],
    ShowMore: ["Basic View"],
    MediaQuery: ["Layout"],
    VerticalTimeline: ["Advanced View"],
    QRCode: ["Graphic"],
    List: ["Basic View"],
    Accordion: ["Basic View"],
    FlowChart: ["Graphic"],
    Menu: ["Basic View"],
    RichText: ["Text"],
    Headline: ["Text"],
    Picture: ["Graphic"],
    Text: ["Text"],
    Box: ["Basic View"],
    Grid: ["Layout"],
    Group: ["Other"],
    Stage: ["Advanced View"],
    CallToAction: ["Form"],
    Icon: ["Graphic"],
    Cards: ["Basic View"]
  };
  const u = Object.entries(mapping).find(([k, v]) => {
    return toLower(`Component${k}`) === toLower(`${i.o.title}`);
  });
  return (u && u[1][0]) || i.o.cat || i.imp.cat || "Other";
});

const SearchForWidgets = props => {
  const [value, setValue] = React.useState('');
  return (
    <>
      <TextInput
        placeholder="Search"
        value={value}
        onChange={event => setValue(event.target.value)}
      />
      {(value === "" || value.trim() === "") ? <div>{props.wnumber} components found.</div> : props.children(compon =>
        console.log("compon", compon) ||
        compon.title.indexOf(value) > -1 ||
        compon["x-type"].indexOf(value) > -1 ||
        compon._id.indexOf(value) > -1)
      }
    </>
  );
};
const Modals = observer(({ schemas, components, website, pages, onSubmit, onError }) => {
  if(!schemas.get().length) return <div>Fetching Component</div>;

  const objs = byGrade(schemas.get().map((i) => {
    const Component = availableComponents[i.title];
    return {
      component: <Dragger key={i.title} componenttype={i.title}>{({ isDragging }) => <Box pad="small" margin="none">{i.title}</Box>}</Dragger>,
      imp: Component,
      o: i
    };
  }));
  const {
    header,
    footer,
    sidemenu,
    topmenu,
    bottommenu,
    pages: pageids
  } = website.get() || {};
  const pagevalues = pages.map(i => ({
    _id: i._id,
    main: i.main,
    header: { right: i?.header?.right, left: i?.header.left, center: i?.header.center },
    footer: { right: i?.footer?.right, left: i?.footer.left, center: i?.footer.center }
  }));

  const componentsall = components;

  // components.get(website.get().sidemenu.content).components
  const usedids = [];
  const xpairs = [];
  const reg = /^[a-zA-Z0-9]{24}$/;
  const isArray = is(Array);
  const isObject = is(Object);
  const f = (id, path) => {
    if(!id || !reg.test(id) || !components.get(id)) return; // Not an id
    const c = components.get(id);
    xpairs.push({
      c,
      joined: path.join(),
    });
    if(usedids.includes(id)) return; // Already processed
    usedids.push(id);

    const dm = (p, dp) => {
      if(isArray(p)) {
        return p.map((o, idx) => dm(o, dp.concat([idx])));
      }
      if(isObject(p)) {
        return Object.entries(p).map(([k, o]) => dm(o, dp.concat([k])));
      }
      if(typeof p === 'string') return f(p, dp);
      if(typeof p === 'boolean') return;
      if(typeof p === 'number') return;
      console.log("property of weird type found", p, dp);
    };
    return Object.entries(c).map(([k, v]) => dm(v, path.concat([k])));
  };
  const startingids = pagevalues
    .filter(q => pageids.includes(q._id))
    .reduce((p, i) => p.concat([
    i.main,
    i.header.left,
    i.header.right,
    i.header.center,
    i.footer.left,
    i.footer.right,
    i.footer.center,
  ]), [
    sidemenu?.content,
    topmenu?.content,
    bottommenu?.content
  ]).map(id => f(id, []));
  const usedidscomponents = usedids.map(l => components.get(l));
  const unusedids = [...components.values()].map(i => i._id).filter(i => !usedids.includes(i));

  // fill the usedin property of the components
  /*
  window.setTimeout(() => {
    xpairs.forEach(({
      c,
      joined
    }) => {
      try {
        c.usedin = c.usedin || [];
        c.usedin.push(joined);
      } catch(e) {
        console.error(e);
      }
    });
  }, 200);
  */

  return (
    <StyledAccordion pad="none" margin="none">
      {Object.entries(objs).sort((a, b) => {
        const oa = order.findIndex(k => k === a[0]);
        const ob = order.findIndex(k => k === b[0]);
        return oa - ob;
      }).map(([key, val]) => (<AccordionPanel label={<Box pad="none" margin="none">{key}</Box>} pad="none" margin="none" >
          {val.map(q => q.component)}
        </AccordionPanel>))}
      <AccordionPanel label={<Box pad="none" margin="none">Spare</Box>} pad="none" margin="none" >
        {unusedids.filter(id => {
          const compo = components.get(id);
          return compo["x-type"].replace(/component/i, "") !== "group";
        }).map(id => {
          const compo = components.get(id);
          return (<DraggerExisting key={compo._id} {...compo} componenttype={compo["x-type"]}>
            {({ isDragging }) => isDragging ? null : <Box pad="small" margin="none">
              [{compo["x-type"].replace(/component/i, "")}] {compo.title}
              <Button icon={<Trash />} a11yTitle="Delete this component permanently" onClick={() => deleteComponent(compo["x-type"], compo._id, () => null, () => null, { optimistic: true })} />
            </Box>}
          </DraggerExisting>);
        })}
      </AccordionPanel>
      <AccordionPanel label={<Box pad="none" margin="none">Used</Box>} pad="none" margin="none" >
        <SearchForWidgets wnumber={usedids.length}>
          {fn => usedidscomponents.filter(q => q["x-type"] !== "group").filter(fn).map(compo => {
            return (<DraggerExisting key={compo._id} {...compo} componenttype={compo["x-type"]}>
              {({ isDragging }) => isDragging ? null : <Box pad="small" margin="none">
                [{compo["x-type"].replace(/component/i, "")}] {compo.title}
              </Box>}
            </DraggerExisting>);
          })}
        </SearchForWidgets>
      </AccordionPanel>
    </StyledAccordion>);
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
      <DndProvider  key="DragDropContextProvider" backend={HTML5Backend}><Page>
        <Notificationbar notifications={notifications} />
        <StyledSplitPane split="vertical" minSize={250}>
            <Grid
              rows={['auto', 'flex', 'auto', 'auto', 'auto', 'flex']}
              columns={['auto']}
              fill={true}
              areas={[
                { name: 'modals', start: [0, 0], end: [0, 0] },
                { name: 'viewmode', start: [0, 2], end: [0, 2] },
                { name: 'assetmanager', start: [0, 3], end: [0, 3] },
                { name: 'entitymanager', start: [0, 4], end: [0, 4] },
              ]}
            >
              <Box gridArea="modals">
                <Modals schemas={componentschemas} pages={pages} website={currentwebsite} components={allComponents} onSubmit={() => null} onError={() => null} />
              </Box>
              <Viewmodechooser viewmode={viewmode} set={setViewmode} options={viewmodes} />
              <Box gridArea="assetmanager">
                <AssetManager current={currentwebsite} auth={auth} />
              </Box>
              <Box gridArea="entitymanager">
                <EntityManager progress={entityprogress} current={currentwebsite} auth={auth} error={entitieserror} loading={entitiesloading} entities={entities} />
              </Box>
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
                <OGrommet themes={themes}>
                  <Box fill overflow="auto" >
                    <EditRenderer website={currentwebsite} page={currentpage} components={allComponents} loading={anyloading} error={anyerror} Layout={ModernLayout} />
                  </Box>
                </OGrommet>
            </StyledSplitPane>
        </StyledSplitPane>
      </Page></DndProvider>
    );
  }
};
