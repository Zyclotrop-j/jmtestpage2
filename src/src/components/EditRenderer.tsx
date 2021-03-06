import React from 'react';
import styled from 'styled-components';
import FocusLock from 'react-focus-lock';
import { renameKeysWith } from 'ramda-adjunct';
import { Box, Button } from "grommet";
import { Edit } from "grommet-icons";
import { observer } from 'mobx-react';
import { is, map } from "ramda";
import debounceRender from 'react-debounce-render';
import { schemas } from "../state/schemas";
import { current as currentpage } from "../state/pages";
import { components as allComponents, fetchComponent } from "../state/components";
import { Modal } from "../components/Modal";
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ComponentControlls } from "../components/ComponentControlls";
import { anyloading, anyerror } from "./pages/admin";
import { AddWidget } from "../components/AddWidget";
import { WidgetForm } from '../components/WidgetForm';
import components from '../Widget';
import { viewmode } from "../state/viewmode";

const availableComponents = renameKeysWith(key => `component${key.toLowerCase()}`, components);
const DebouncedPreview = debounceRender(({ children, ...props }) => children(props));

const SubtreeRenderer = observer(({ render, compo, addProps, page, website, components: xcomponents, loading, error, Layout }) => {
  if(!compo) return null;
  if(Array.isArray(compo)) {
    const a = (pos) => <AddWidget parentcomponent={addProps.___component || page.get() || website.get()} parentgroup={addProps.___parentid} addProps={addProps} pos={pos} area={addProps.___context} page={page.get()} __renderSubtree={render} />
    return compo.reduce((p, i, idx) => p.concat([render(i, { ...addProps, __pp: i }), a(idx + 1)]), [a(0)]);
  }
  if(is(String, compo)) {
    const group = xcomponents.get(compo)?.components?.map(i => xcomponents.get(i));
    if(!group) {
      console.error(`No group found for id ${compo}`, group, compo, xcomponents);
      return (<div>Group not available {compo}</div>);
    }
    const parentids = addProps.parentids ? addProps.parentids.concat([ compo ]) : [ compo ];
    return render(group, { ...addProps, ___parentid: compo, ___parentids: parentids, ___groupid: compo });
  }
  if(compo.content && is(String, compo.content) && !compo["x-type"]) {
    // Nested components like accordion, where subgroup-id is in comp.content
    const group = xcomponents.get(compo.content)?.components?.map(i => xcomponents.get(i));
    if(group) {
      const parentids = addProps.parentids ? addProps.parentids.concat([ compo ]) : [ compo ];
      return render(group, { ...addProps, ___parentid: compo, ___parentids: parentids, ___groupid: compo });
    }
  }

  const type = compo["x-type"];
  const Component = availableComponents[type];
  if(!Component) {
    console.warn(`Component of type ${compo["x-type"]} not found`, Component, compo);
  }
  const content = compo.content;

  console.log("Rendering ", type, Component, content)

  const WatchedComponentControlls = observer(ComponentControlls);
  const WatchedComponent = Component && observer(Component);

  return (<ComponentControlls
        dtype="EXISTING"
        dcomponenttype={type}
        did={compo._id}
        dparentid={addProps.___parentid}
        schemas={schemas}
        props={compo}
        addProps={addProps}
        __children={content}
        __renderSubtree={render} true
    >
      {({ props, addProps: xaddProps, __children }) => {
        return (<ErrorBoundary key={compo._id}>
          <DebouncedPreview {...props}  preview={viewmode.get() || true} __children={__children} __renderSubtree={render} {...xaddProps}>
            {(props) => <WatchedComponent {...props} key={props._modified} ___resolveid={id => {
              const resolved = xcomponents.get(id);
              if(!resolved) return;
              return resolved;
            }} ___editor={(q) => <WatchedComponentControlls
                  plain
                  dtype="EXISTING"
                  dcomponenttype={q.type || q["x-type"]}
                  did={q._id || q["x-id"]}
                  dparentid={compo._id}
                  schemas={schemas}
                  props={q}
                  customtitle={q.customtitle}
                  gridArea={q.gridArea}
                  addProps={{ ...xaddProps, ___parentid: compo._id, ___parentids: xaddProps.parentids ? xaddProps.parentids.concat([ compo._id ]) : [ compo._id ], ___groupid: null }}
                  __children={null}
                  __renderSubtree={render}
              >
                {() => q.children}
            </WatchedComponentControlls>} />}
          </DebouncedPreview>
        </ErrorBoundary>);
      }}
  </ComponentControlls>);
});

export default observer(class EditRenderer extends React.Component<any> {

  public constructor(props) {
    super(props);
    this.renderSubtree = this.renderSubtree.bind(this);
  }

  public render() {
    const { page, loading, error, Layout, website } = this.props;

    const render = this.renderSubtree;
    const addwf = (arg, ___context) => Array.isArray(arg) ? { arg, ___context } : arg ? { arg, ___context } : { ___context, arg: [] };

    const {
      header,
      main,
      footer
    } = page.get() || {};
    const rootchildren = {
      header: { left: addwf(header?.left, ["page", ["header", "left"]]), center: addwf(header?.center, ["page", ["header", "center"]]), right: addwf(header?.right, ["page", ["header", "right"]]) },
      main: addwf(main, ["page", ["main"]]),
      footer: { left: addwf(footer?.left, ["page", ["footer", "left"]]), center: addwf(footer?.center, ["page", ["footer", "center"]]), right: addwf(footer?.right, ["page", ["footer", "right"]]) }
    };

    const topmenu = website.get()?.topmenu?.content;
    const sidemenu = website.get()?.sidemenu?.content;
    const bottommenu = website.get()?.bottommenu?.content;

    return (
      <>
        {loading.get()}
        {error.get() ? <pre>{JSON.stringify(error.get(), (___, value) => {
          if (value instanceof Error) {
            return Object.getOwnPropertyNames(value).reduce((p, key) => ({
                ...p,
                [key]: value[key]
            }), {});
          }
          return value; })}</pre> : ""}
        {loading.get() || !page.get() ?
          <span>
            Please select a page to edit a page
            <hr />
            {website.get() && <>
              <div><h2>Edit Menus</h2></div>
              <hr /><h3>Top Menu</h3><div>
                <Box direction="row">{topmenu && !(topmenu instanceof Error) && render(addwf(topmenu, ["website", ["topmenu"]]))}</Box>
              </div><hr /><h3>Side Menu</h3><div>
                <Box direction="column">{sidemenu && !(sidemenu instanceof Error) && render(addwf(sidemenu, ["website", ["sidemenu"]]))}</Box>
              </div><hr /><h3>Bottom Menu</h3><div>
                <Box direction="row">{bottommenu && !(bottommenu instanceof Error) && render(addwf(bottommenu, ["website", ["bottommenu"]]))}</Box>
              </div>
            </>}
          </span> :
          (<div>
            <Layout {...page.get()} {...rootchildren} __renderSubtree={render} />
          </div>)}
      </>
    );
  }

  private renderSubtree(compo, addProps = {}) {
    const render = this.renderSubtree;
    if(compo?.___context) {
      return <SubtreeRenderer
        compo={compo.arg}
        addProps={{ ...addProps, ___context: compo.___context || addProps.___context }}
        page={currentpage}
        components={allComponents}
        loading={anyloading}
        error={anyerror}
        Layout={this.props.Layout}
        render={render}
        website={this.props.website}
      />;
    }
    return <SubtreeRenderer
      compo={compo}
      addProps={addProps}
      page={currentpage}
      components={allComponents}
      loading={anyloading}
      error={anyerror}
      Layout={this.props.Layout}
      render={render}
      website={this.props.website}
    />;
  }
});
