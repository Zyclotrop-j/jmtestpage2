import React from 'react';
import styled from 'styled-components';
import { observer } from "mobx-react";
import { decorate, observable } from "mobx"
import { memoizeWith, mergeDeepLeft, map as rmap, is } from "ramda";
import { Accordion, AccordionPanel, Box, Button, CheckBox, Layer, Grid, Heading } from "grommet";
import { PagingTable } from 'grommet-controls';
import { toJS } from 'mobx';
import Fuse from 'fuse.js';
import hash from "object-hash";
import { formatRelative, parseISO } from 'date-fns';
import { AddCircle } from "grommet-icons";
import ReactJson from 'react-json-view';
import { CustomIconForm, fields, widgets } from "./WidgetForm";
import { uiSchema } from '../Widget';
import { requests } from "../state/fetch";
import { components as allComponents } from "../state/components";
import { fetchEntity, fetchAllEntities, addEntity, editEntity, deleteEntity } from "../state/entities";


const emtpyToUndefined = o => {
  return is(Array)(o) ? o.map(i => {
    if(is(Object)(i) || is(Array)(i)) {
      return emtpyToUndefined(i);
    }
    return !i ? undefined : i;
  }) : Object.entries(o).reduce((p, [k, v], idx, obj) => {
    if(is(Object)(v) || is(Array)(v)) {
      return { ...p, [k]: emtpyToUndefined(v) };
    }
    return !v ? p : { ...p, [k]: v };
  }, {});
}

const StyledCheckBox = styled(CheckBox)`
  grid-area: ${props => props.gridArea};
`;
const CenterText = styled.div`
  text-align: center;
`;
const StyledLayer = styled(Layer)`
  width: 80vw;
  height: 80vh;
  position: relative;
`;
const OverflowBox = styled(Box)`
  overflow-y: auto;
  overflow-x: hidden;
`;
const StyledPagingTable = styled(PagingTable)`
  overflow: auto;
  height: 100%;
  grid-area: ${props => props.gridArea};
`;
const QuaresItem = styled.div``;
const Quares = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  grid-area: ${props => props.gridArea};
  ${QuaresItem} {
    padding: 1rem;
    border-radius: 1rem;
    background: #EEE;
  }
`;

const memo = (rows, keys) => `${hash(new Set(rows.map(i => i._id)))}${hash(new Set(keys))}`;
const createFuse = memoizeWith(
  memo,
  (rows, keys) =>
    new Fuse(rows, {
      keys,
      caseSensitive: true,
      threshold: 0.6,
      shouldSort: true,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
    }),
);

const Table = ({ tabledata, onSelect, gridArea }) => <StyledPagingTable
  gridArea={gridArea}
  filterable
  data={tabledata}
  resizable={false}
  defaultSorted={["_modified", "type"]}
  columns={[
    {
      id: 'type',
      Header: 'Type',
      accessor: row => row["x-type"],
    }, {
      id: '_id',
      Header: <AddCircle />,
      accessor: '_id',
      Cell: props => <Button plain a11yTitle="Edit this entity" icon={<AddCircle />} onClick={() => onSelect(props.value)} />,
      filterable: false,
      width: 25+2*6,
      sortable: false
    }, {
      Header: 'Title',
      accessor: 'title',
      filterMethod: (filter, rows) => createFuse(rows, ['title']).search(filter.value),
      filterAll: true
    }, {
      Header: 'Author',
      accessor: '_author',
    }, {
      id: '_created',
      Header: 'Created',
      // Cell: data => formatRelative(parseISO(data.value), new Date(), {}),
      accessor: '_created',
    },
    {
      id: '_modified',
      Header: 'Last modified',
      // Cell: data => formatRelative(parseISO(data.value), new Date(), {}),
      accessor: '_modified',
    },
  ]}
/>;

export default decorate(observer(class EntityManager extends React.Component {
  constructor(props) {
    super(props);
  }

  open = false
  entitytype=""
  itemid = ""
  showcomponents = false
  copy = {}
  todos = []

  render() {

    const { loading, entities, error, progress } = this.props;
    const showcomponents = this.showcomponents;

    const tabledata = Object.values(toJS(entities));
    const isloading = loading.get();
    const entityentries = entities.entries();
    const cschemas = showcomponents ? tabledata.filter(i => i["x-type"] === "schema") : tabledata.filter(i => i["x-type"] === "schema" &&
      (!["schema", "website", "page"].includes(i.title) && !i.title.startsWith("component"))
    );

    const fn = schema => mergeDeepLeft({
      properties: { title: { type: "string" }, description: { type: "string" } },
      format: undefined
    }, schema, {
      properties: { title: { type: "string" }, description: { type: "string" } },
      format: undefined
    });

    return <>
      <span>{requests.size}</span>
      <Button label={loading.get() ? `Loading... (${Math.round(progress*100)}%)` : "Manage Entities"} disabled={!entities.size || loading.get()} onClick={() => {
        this.open = !this.open;
      }} />
      {this.open && (
        <StyledLayer
          onEsc={() => { this.open = !this.open; }}
          onClickOutside={() => { this.open = !this.open; }}
        >
          <Grid
            fill
            columns={['auto', 'flex', 'auto']}
            rows={['auto', 'auto', 'flex', 'auto']}
            gap="small"
            areas={[
                { name: 'back', start: [0, 0], end: [0, 0] },
                { name: 'header', start: [1, 0], end: [1, 0] },
                { name: 'close', start: [2, 0], end: [2, 0] },
                { name: 'showcomponents', start: [2, 1], end: [2, 1] },
                { name: 'content', start: [0, 2], end: [2, 2] },
                { name: 'footer', start: [0, 3], end: [2, 3] },
            ]}
          >
            <Button gridArea="close" label="close" onClick={() => { this.open = !this.open; }} />
            {!this.itemid && !this.entitytype && (<StyledCheckBox
              gridArea="showcomponents"
              checked={showcomponents}
              label={showcomponents ? "Hide components" : "Show components"}
              onChange={(event) => { this.showcomponents = event.target.checked; }}
            />)}
            {(this.itemid || this.entitytype) && <Button gridArea="back" label={this.itemid && !this.itemid.startsWith("___NEW_") ? "Back to list" : "Back to components' overview"} onClick={() => {
              if(this.itemid && !this.itemid.startsWith("___NEW_")) {
                this.itemid = "";
                return;
              }
              this.itemid = "";
              this.copy = {};
              this.showcomponents = false;
              this.entitytype = "";
            }} />}
              {!this.itemid && !this.entitytype && <Quares gridArea="content">{cschemas.map(j => <QuaresItem>
                <CenterText>{j.title}</CenterText>
                <Button label="New" onClick={() => { this.entitytype = j.title; this.itemid = `___NEW_${j.title}`; this.copy = {}; }} />
                <Button label="Edit" onClick={() => { this.entitytype = j.title; }} />
              </QuaresItem>)}</Quares>}
              {!this.itemid && this.entitytype && <Table gridArea="content" onSelect={id => { this.itemid = id; this.copy = toJS(
                entities.get(this.itemid)
              ); }} tabledata={tabledata.filter(i => i["x-type"] === this.entitytype)} />}
              {this.entitytype && this.itemid && <OverflowBox gridArea="content">
              <Heading level={3} pad={0} margin={0}>Id: {this.itemid}</Heading>
              <p><b>{this.entitytype}</b></p>
              <Accordion>
                <AccordionPanel label="Edit">
                  <CustomIconForm
                    formContext={{
                      allComponents
                    }}

                    schema={fn(cschemas.find(i => i.title === this.entitytype))}
                    widgets={widgets}
                    fields={fields}
                    uiSchema={(uiSchema[entities.get(this.itemid)?.title?.startsWith("component") ? entities.get(this.itemid).title.substring("component".length) : entities.get(this.itemid)?.title]) || {}}
                    onChange={v => {
                      this.copy = emtpyToUndefined(v.formData);
                    }}
                    onSubmit={async (xdata, event) => {

                      const data = emtpyToUndefined(xdata.formData);
                      const prom = new Promise((resolve, reject) => {
                        if(this.itemid.startsWith("___NEW_")) {
                          return addEntity(this.entitytype, data, resolve, reject)
                        } else {
                          return editEntity(data._id, data, resolve, reject)
                        }
                      });
                      const rep = await prom;

                      // addEntity, editEntity, deleteEntity
                      // type, data, resolve, reject
                      // id, iidata, resolve, reject
                      // id, resolve, reject
                      console.log("args args", data, event, rep);
                      this.entitytype = "";
                      this.itemid = "";
                      this.copy = {};
                      this.todos.push(...rep.sub);
                      return rep;
                    }}
                    onError={(...args) => {
                      console.log("error args args", args);
                      return Promise.resolve();
                    }}
                    formData={this.copy}
                  >
                    <hr />
                    <Button type="submit" label="Submit" />
                    <Button type="button" label="Reset" />
                  </CustomIconForm>
                </AccordionPanel>
                <AccordionPanel label="Data">
                  <ReactJson
                    name={`${this.entitytype}`}
                    src={this.copy}
                    theme="monokai"
                    iconStyle="triangle"
                    onEdit={e => { this.copy = e.updated_src; }}
                    onAdd={e => { this.copy = e.updated_src; }}
                    onDelete={e => { this.copy = e.updated_src; }}
                  />
                </AccordionPanel>
                <AccordionPanel label="Schema">
                  <ReactJson
                    name={`${this.entitytype} schema`}
                    src={toJS(
                      cschemas.find(i => i.title === this.entitytype)
                    )}
                    theme="monokai"
                    iconStyle="triangle"
                  />
                </AccordionPanel>
              </Accordion>
            </OverflowBox>}
          </Grid>
        </StyledLayer>
      )}
    </>;
  }
}), {
  open: observable,
  entitytype: observable,
  itemid: observable,
  copy: observable,
  showcomponents: observable,
  todos: observable
});
