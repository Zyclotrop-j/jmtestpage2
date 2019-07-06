const websiteid = process.env.WEBSITEID || "5d18639f49c4440004404d09";
const fs = require('fs');
const path = require('path');
const webpack = require("webpack");
const _ = require('lodash');
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);
const R = require("ramda");
const { memoizeWith, identity, groupBy } = R;
const validUrl = require('valid-url');
const config = require('./config/SiteConfig');
const util = require('util');

function runGC() {
  if( typeof global.gc != "undefined" ){
    console.log("Mem Usage Pre-GC " + util.inspect(process.memoryUsage()));
    global.gc();
    console.log("Mem Usage Post-GC " + util.inspect(process.memoryUsage()));
  }
}

const usedicons = [];
exports.createResolvers = ({
  actions,
  cache,
  createNodeId,
  createResolvers,
  store,
}) => {
  const { createNode } = actions;
  return createResolvers({
    DATA_Componentpicture: {
      srcFile: {
        type: `File`,
        // projection: { url: true },
        async resolve(source, args, context, info) {
          if(validUrl.isWebUri(source.src)) {
            return createRemoteFileNode({
              url: source.src,
              store,
              cache,
              createNode,
              createNodeId,
              // ext: ".md"
            })
          }
          return null;
        }
      }
    },
    DATA_ImageMod4AaS95Fedjwh: {
      srcFile: {
        type: `File`,
        // projection: { url: true },
        async resolve(source, args, context, info) {
          if(validUrl.isWebUri(source.src)) {
            return createRemoteFileNode({
              url: source.src,
              store,
              cache,
              createNode,
              createNodeId,
              // ext: ".md"
            })
          }
          return null;
        }
      }
    },
    DATA_BackgroundMod2K2J492P3Hngh: {
      srcFile: {
        type: `File`,
        // projection: { url: true },
        async resolve(source, args, context, info) {
          if(validUrl.isWebUri(source.image)) {
            return createRemoteFileNode({
              url: source.image,
              store,
              cache,
              createNode,
              createNodeId,
              // ext: ".md"
            })
          }
          return null;
        }
      }
    },
    DATA_Componenticon: {
      component: {
        type: `String`,
        // projection: { url: true },
        resolve(source, args, context, info) {
          if(!source.icon || !source.icon.trim()) {
            return null;
          }
          usedicons.push(source.icon);
          return null;
        }
      }
    },
  });
};

exports.onCreateWebpackConfig = ({ stage, actions, plugins, getConfig }) => {
  const hotloader = stage.startsWith('develop') ? { alias: { 'react-dom': '@hot-loader/react-dom'  } } : {};
  if(stage.startsWith('develop')) {
    const config = getConfig();
    config.output.globalObject = '(this)';
    actions.replaceWebpackConfig({
      ...config,
    });
  }
  actions.setWebpackConfig({
                             resolve: {
                               // modules: [path.resolve(__dirname, 'src'), 'node_modules'],
                               ...hotloader
                             },
                             node: {
                                // prevent webpack from injecting mocks to Node native modules
                                // that does not make sense for the client
                                dgram: 'empty',
                                fs: 'empty',
                                net: 'empty',
                                tls: 'empty',
                                child_process: 'empty',
                                // prevent webpack from injecting eval / new Function through global polyfill
                                global: stage.startsWith('develop')
                             },
                           });
};

const queryCache = {};
exports.createPages = ({ actions, graphql }) => {
  runGC();
  const componentsWithChild = ["DATA_Componentgrid", "DATA_Componentbox"]
  const componentsStandalone = ["DATA_Componentmenu", "DATA_Componentcards", "DATA_Componentcalltoaction", "DATA_Componenticon", "DATA_Componentstage", , "DATA_Componenttext", "DATA_Componentpicture", "DATA_Componentrichtext", "DATA_Componentheadline"]
  const components = [].concat(componentsStandalone, componentsWithChild);
  const makeRecursiveContext = () => {
    const componentgroups = new Set();
    const componentgroupQuery = memoizeWith(identity, (componentgroupid, graphql) => {
      return graphql(`{
        data {
            componentgroup(_id: "${componentgroupid}") {
              groupdesc
              componentgroupid: _id
              components {
                __typename
                ${componentsStandalone.map(q => `... on ${q} {
                  _id
                }
                `).join("")}
                ... on DATA_Componentgrid {
                  _id
                  gridcontent: content {
                    _id
                  }
                }
                ... on DATA_Componentbox {
                  _id
                  boxcontent: content {
                    _id
                  }
                }
              }
            }
        }
      }`);
    });
    const queryComponentgroup = (componentgroupid, graphql) => {
      const query = queryCache[componentgroupid] || componentgroupQuery(componentgroupid, graphql);
      const alreadyQuerried = componentgroups.has(componentgroupid);
      componentgroups.add(componentgroupid);
      queryCache[componentgroupid] = query;
      return [query, alreadyQuerried];
    };

    const buildtree = (group, children) => {
      if(!group) {
        console.log("WARNING!!!! No group", group, children)
        return [];
      }
      return (group.components || []).map(i => {
        const { _id: id, __typename: type } = i;
        if(type === "DATA_Componentbox") {
          const { _id: childid } = i.boxcontent || {};
          const child = children.find(childt => childt.find(j => j.componentgroupid === childid));
          return { id, type, child, componentgroupid: group.componentgroupid };
        }
        if(type === "DATA_Componentgrid") {
          const childids = (i.gridcontent || []).map(i => i._id);
          const rchildren = childids.map(childid => children.find(childt => childt.find(j => j.componentgroupid === childid)));
          return { id, type, children: rchildren, componentgroupid: group.componentgroupid };
        }
        return { id, type, componentgroupid: group.componentgroupid };
      });
    };

    const resultset = [];
    const subquerrySet = {};
    const discover = (id, graphql, page) => {
      if(!id) return Promise.resolve([]);
      runGC();
      return  new Promise(resolve => {
        const [query, discovered] = queryComponentgroup(id, graphql);
        console.log(`Dicovered ${id}, discovered before: ${discovered}, on ${page.path}`);

        const children = !subquerrySet[id] ?
          query.then(result => {
            runGC();
            if(!result || !result.data || !result.data.data) {
              console.log("ERROR",result)
            }
            const tmp = result.data.data.componentgroup;
            console.log(`Query done; ${page.path}:`, tmp && tmp.componentgroupid, tmp && tmp.components);
            const data = result.data.data.componentgroup && result.data.data.componentgroup.components || [];
            resultset.push(...data);
            const subquerries = data
              .filter(({ __typename }) => [
                "DATA_Componentgrid",
                "DATA_Componentbox"
              ].includes(__typename))
              .map(i => i.gridcontent || i.boxcontent || [])
              .map(i => (i._id && [i._id]) || i.map(i => i._id))
              .filter(i => i.length)
              .reduce((p, i) => p.concat(i.map(id => discover(id, graphql, page))), []);
            return Promise.all(subquerries);
          }) : subquerrySet[id];
        subquerrySet[id] = children;
        resolve(Promise.all([query, children]).then(([ query, children ]) => (buildtree(query.data.data.componentgroup, children))));
      });
    };
    return { discover, result: () => resultset };
  }

  const themeQuery = `themes {
    meter {
      _id
      color
      extend
    }
    drop {
      _id
      extend
      maxHeight
    }
    formField {
      _id
      border {
        _id
        color
        error {
          _id
          color {
            _id
            dark
            light
          }
        }
        position
        side
      }
      content {
        _id
        pad {
          _id
          bottom
          horizontal
        }
      }
      error {
        _id
        color {
          _id
          dark
          light
        }
        margin {
          _id
          horizontal
          vertical
        }
      }
      extend
      help {
        _id
        color {
          _id
          dark
          light
        }
        margin {
          _id
          left
        }
      }
      label {
        _id
        margin {
          _id
          horizontal
          vertical
        }
      }
      margin {
        _id
        bottom
      }
    }
    rangeInput {
      _id
      extend
      thumb {
        _id
        color {
          _id
          dark
          light
        }
        extend
      }
      track {
        _id
        color {
          _id
          dark
          light
        }
        extend
        height
      }
    }
    worldMap {
      _id
      color
      continent {
        _id
        active
        base
      }
      extend
      hover {
        _id
        color
      }
      place {
        _id
        active
        base
      }
    }
    menu {
      _id
      background
      extend
      icons {
        _id
        down
      }
    }
    stack {
      _id
      extend
    }
    textArea {
      _id
      disabled {
        _id
        opacity
      }
      extend
    }
    select {
      _id
      background
      container {
        _id
        extend
      }
      control {
        _id
        extend
      }
      icons {
        _id
        color {
          _id
          dark
          light
        }
        down
        margin {
          _id
          horizontal
        }
      }
      options {
        _id
        box {
          _id
          align
          pad
        }
        container {
          _id
          align
          alignContent
          alignSelf
          animation
          background
          basis
          border {
            _id
            color
            side
            size
            style
          }
          direction
          elevation
          fill
          flex
          gap
          height
          justify
          margin {
            _id
            bottom
            left
            right
            top
          }
          overflow
          pad {
            _id
            bottom
            left
            right
            top
          }
          responsive
          round {
            _id
            corner
            size
          }
          width
          wrap
        }
        text {
          _id
          margin
        }
      }
      searchInput
      step
    }
    textInput {
      _id
      disabled {
        _id
        opacity
      }
      extend
      placeholder {
        _id
        extend
      }
      suggestions {
        _id
        extend
      }
    }
    chart {
      _id
      extend
    }
    tab {
      _id
      active {
        _id
        background
        color
      }
      background
      border {
        _id
        active {
          _id
          color {
            _id
            dark
            light
          }
        }
        color {
          _id
          dark
          light
        }
        hover {
          _id
          color {
            _id
            dark
            light
          }
          extend
        }
        side
        size
      }
      color
      extend
      hover {
        _id
        background
        color {
          _id
          dark
          light
        }
        extend
      }
      margin {
        _id
        horizontal
        vertical
      }
      pad {
        _id
        bottom
      }
    }
    accordion {
      _id
      border {
        _id
        color
        side
      }
      heading {
        _id
        level
      }
      icons {
        _id
        collapse
        color {
          _id
          dark
          light
        }
        expand
      }
    }
    global {
      _id
      active {
        _id
        background {
          _id
          color
          opacity
        }
        color {
          _id
          dark
          light
        }
      }
      animation {
        _id
        duration
        jiggle {
          _id
          duration
        }
      }
      borderSize {
        _id
        large
        medium
        small
        xlarge
        xsmall
      }
      breakpoints {
        _id
        large {
          _id
          borderSize {
            _id
            large
            medium
            small
            xlarge
            xsmall
          }
          edgeSize {
            _id
            hair
            large
            medium
            none
            small
            xlarge
            xsmall
            xxsmall
          }
          size {
            _id
            full
            large
            medium
            small
            xlarge
            xsmall
            xxsmall
          }
        }
        medium {
          _id
          borderSize {
            _id
            large
            medium
            small
            xlarge
            xsmall
          }
          edgeSize {
            _id
            hair
            large
            medium
            none
            small
            xlarge
            xsmall
            xxsmall
          }
          size {
            _id
            full
            large
            medium
            small
            xlarge
            xsmall
            xxsmall
          }
          value
        }
        small {
          _id
          borderSize {
            _id
            large
            medium
            small
            xlarge
            xsmall
          }
          edgeSize {
            _id
            hair
            large
            medium
            none
            small
            xlarge
            xsmall
            xxsmall
          }
          size {
            _id
            full
            hair
            large
            medium
            none
            small
            xlarge
            xsmall
            xxsmall
          }
          value
        }
      }
      colors {
        brand
        light1
        control {
          _id
          dark
          light
        }
        border {
          _id
          dark
          light
        }
        accent1
        neutral2
        dark1
        accent2
        dark2
        light5
        focus
        neutral3
        black
        dark3
        selected
        accent4
        statusok
        neutral4
        statuserror
        light4
        neutral1
        _id
        light2
        placeholder
        neutral5
        light6
        background
        white
        dark6
        accent3
        dark5
        active {
          _id
          dark
          light
        }
        dark4
        statuscritical
        statusdisabled
        text {
          _id
          dark
          light
        }
        statuswarning
        icon {
          _id
          dark
          light
        }
        light3
        statusunknown
      }
      control {
        _id
        border {
          _id
          color
          radius
          width
        }
        disabled {
          _id
          opacity
        }
      }
      debounceDelay
      deviceBreakpoints {
        _id
        computer
        phone
        tablet
      }
      drop {
        _id
        background
        border {
          _id
          radius
          width
        }
        extend
        shadowSize
        zIndex
      }
      edgeSize {
        _id
        hair
        large
        medium
        none
        responsiveBreakpoint
        small
        xlarge
        xsmall
        xxsmall
      }
      elevation {
        _id
        dark {
          _id
          large
          medium
          none
          small
          xlarge
          xsmall
        }
        light {
          _id
          large
          medium
          none
          small
          xlarge
          xsmall
        }
      }
      focus {
        _id
        border {
          _id
          color {
            _id
            dark
            light
          }
          width
        }
      }
      font {
        _id
        face
        family
        height
        maxWidth
        size
      }
      hover {
        _id
        background {
          _id
          color
          dark
          light
          opacity
        }
        color {
          _id
          dark
          light
        }
        text {
          _id
          dark
          light
        }
      }
      input {
        _id
        padding
        weight
      }
      opacity {
        _id
        medium
        strong
        weak
      }
      selected {
        _id
        background
        color
      }
      size {
        _id
        full
        large
        medium
        small
        xlarge
        xsmall
        xxlarge
        xxsmall
      }
      spacing
    }
    calendar {
      _id
      icons {
        _id
        next
        previous
        small {
          _id
          next
          previous
        }
      }
      large {
        _id
        daySize
        fontSize
        lineHeight
        slideDuration
      }
      medium {
        _id
        daySize
        fontSize
        lineHeight
        slideDuration
      }
      small {
        _id
        daySize
        fontSize
        lineHeight
        slideDuration
      }
    }
    grid {
      _id
      extend
    }
    layer {
      _id
      background
      backgroundColor
      border {
        _id
        radius
      }
      container {
        _id
        zIndex
      }
      extend
      overlay {
        _id
        background
      }
      responsiveBreakpoint
      zIndex
    }
    _id
    paragraph {
      _id
      large {
        _id
        height
        maxWidth
        size
      }
      medium {
        _id
        height
        maxWidth
        size
      }
      small {
        _id
        height
        maxWidth
        size
      }
      xlarge {
        _id
        height
        maxWidth
        size
      }
      xxlarge {
        _id
        height
        maxWidth
        size
      }
    }
    table {
      _id
      body {
        _id
        align
        extend
        pad {
          _id
          horizontal
          vertical
        }
      }
      footer {
        _id
        align
        border
        extend
        fill
        pad {
          _id
          horizontal
          vertical
        }
        verticalAlign
      }
      header {
        _id
        align
        background
        border
        extend
        fill
        pad {
          _id
          horizontal
          vertical
        }
        verticalAlign
      }
    }
    image {
      _id
      extend
    }
    anchor {
      _id
      color {
        _id
        dark
        light
      }
      extend
      fontWeight
      hover {
        _id
        extend
        fontWeight
        textDecoration
      }
      textDecoration
    }
    carousel {
      _id
      icons {
        _id
        color
        current
        next
        previous
      }
    }
    radioButton {
      _id
      border {
        _id
        color {
          _id
          dark
          light
        }
        width
      }
      check {
        _id
        color {
          _id
          dark
          light
        }
        extend
        radius
      }
      gap
      hover {
        _id
        border {
          _id
          color {
            _id
            dark
            light
          }
        }
      }
      icon {
        _id
        extend
        size
      }
      icons {
        _id
        circle
      }
      size
    }
    maskedInput {
      _id
      extend
    }
    diagram {
      _id
      extend
      line {
        _id
        color
      }
    }
    button {
      _id
      border {
        _id
        color {
          _id
          dark
          light
        }
        radius
        width
      }
      color {
        _id
        dark
        light
      }
      colors {
        _id
        accent
        secondary
      }
      disabled {
        _id
        opacity
      }
      extend
      padding {
        _id
        horizontal
        vertical
      }
      primary {
        _id
        color {
          _id
          dark
          light
        }
      }
    }
    dataTable {
      _id
      groupHeader {
        _id
        background {
          _id
          dark
          light
        }
        border {
          _id
          side
          size
        }
        fill
        pad {
          _id
          horizontal
          vertical
        }
      }
      header
      icons {
        _id
        ascending
        contract
        descending
        expand
      }
      primary {
        _id
        weight
      }
      resize {
        _id
        border {
          _id
          color
          side
        }
      }
    }
    video {
      _id
      captions {
        _id
        background
      }
      controls {
        _id
        background
      }
      extend
      icons {
        _id
        closedCaption
        color {
          _id
          dark
          light
        }
        configure
        fullScreen
        pause
        play
        reduceVolume
        volume
      }
      scrubber {
        _id
        color
        track {
          _id
          color
        }
      }
    }
    tabs {
      _id
      background
      extend
      gap
      panel {
        _id
        extend
      }
      tabsheader {
        _id
        background
        extend
      }
    }
    checkBox {
      _id
      border {
        _id
        color {
          _id
          dark
          light
        }
        width
      }
      check {
        _id
        extend
        radius
        thickness
      }
      color {
        _id
        dark
        light
      }
      extend
      gap
      hover {
        _id
        border {
          _id
          color {
            _id
            dark
            light
          }
        }
      }
      icon {
        _id
        extend
        size
      }
      icons {
        _id
        checked
        indeterminate
      }
      size
      toggle {
        _id
        background {
          _id
          dark
          light
        }
        color {
          _id
          dark
          light
        }
        extend
        knob {
          _id
          extend {
            _id
            dark
            light
          }
        }
        radius
        size
      }
    }
    grommet
    text {
      _id
      large {
        _id
        height
        maxWidth
        size
      }
      medium {
        _id
        height
        maxWidth
        size
      }
      small {
        _id
        height
        maxWidth
        size
      }
      xlarge {
        _id
        height
        maxWidth
        size
      }
      xsmall {
        _id
        height
        maxWidth
        size
      }
      xxlarge {
        _id
        height
        maxWidth
        size
      }
    }
    collapsible {
      _id
      baseline
      minSpeed
    }
    box {
      _id
      extend
      responsiveBreakpoint
    }
    rangeSelector {
      _id
      background {
        _id
        invert {
          _id
          color
        }
      }
      edge {
        _id
        type
      }
    }
    icon {
      _id
      colors {
        _id
        accent1
        accent2
        accent3
        accent4
        active {
          _id
          dark
          light
        }
        background
        brand
        control {
          _id
          dark
          light
        }
        focus
        neutral1
        neutral2
        neutral3
        neutral4
        neutral5
        statuscritical
        statusdisabled
        statuserror
        statusok
        statusunknown
        statuswarning
      }
      size {
        _id
        large
        medium
        small
        xlarge
        xsmall
      }
    }
    heading {
      _id
      extend
      font {
        family
      }
      level {
        _id
        level1 {
          _id
          font {
            _id
            family
            weight
          }
          large {
            _id
            height
            maxWidth
            size
          }
          medium {
            _id
            height
            maxWidth
            size
          }
          small {
            _id
            height
            maxWidth
            size
          }
          xlarge {
            _id
            height
            maxWidth
            size
          }
        }
        level2 {
          _id
          font {
            _id
            family
            weight
          }
          large {
            _id
            height
            maxWidth
            size
          }
          medium {
            _id
            height
            maxWidth
            size
          }
          small {
            _id
            height
            maxWidth
            size
          }
          xlarge {
            _id
            height
            maxWidth
            size
          }
        }
        level3 {
          _id
          font {
            _id
            family
            weight
          }
          large {
            _id
            height
            maxWidth
            size
          }
          medium {
            _id
            height
            maxWidth
            size
          }
          small {
            _id
            height
            maxWidth
            size
          }
          xlarge {
            _id
            height
            maxWidth
            size
          }
        }
        level4 {
          _id
          font {
            _id
            family
            weight
          }
          large {
            _id
            height
            maxWidth
            size
          }
          medium {
            _id
            height
            maxWidth
            size
          }
          small {
            _id
            height
            maxWidth
            size
          }
          xlarge {
            _id
            height
            maxWidth
            size
          }
        }
        level5 {
          _id
          font {
            _id
            family
            weight
          }
          large {
            _id
            height
            maxWidth
            size
          }
          medium {
            _id
            height
            maxWidth
            size
          }
          small {
            _id
            height
            maxWidth
            size
          }
          xlarge {
            _id
            height
            maxWidth
            size
          }
        }
        level6 {
          _id
          font {
            _id
            family
            weight
          }
          large {
            _id
            height
            maxWidth
            size
          }
          medium {
            _id
            height
            maxWidth
            size
          }
          small {
            _id
            height
            maxWidth
            size
          }
          xlarge {
            _id
            height
            maxWidth
            size
          }
        }
      }
      responsiveBreakpoint
      weight
    }
    clock {
      _id
      analog {
        _id
        extend
        hour {
          _id
          color {
            _id
            dark
            light
          }
          shape
          size
          width
        }
        minute {
          _id
          color {
            _id
            dark
            light
          }
          shape
          size
          width
        }
        second {
          _id
          color {
            _id
            dark
            light
          }
          shape
          size
          width
        }
        size {
          _id
          huge
          large
          medium
          small
          xlarge
        }
      }
      digital {
        _id
        text {
          _id
          large {
            _id
            height
            size
          }
          medium {
            _id
            height
            size
          }
          small {
            _id
            height
            size
          }
          xlarge {
            _id
            height
            size
          }
          xsmall {
            _id
            height
            size
          }
          xxlarge {
            _id
            height
            size
          }
        }
      }
    }
  }`;

  // const parseGraphQLMeta = ({ name }, allTypes) => { const f = allTypes.data.__schema.types.find(i => i.name === name).fields; if(!f) { return null; } return f.reduce((p, i) => ({ ...p, [i.name]: x(i.type, allTypes) || i.type.name }), {}) };
  // parseGraphQLMeta({ name: "DATA_Theme" }, { /* all types query result goes here */ });

  const execwebsitequery = memoizeWith(identity, (websiteid, graphql) => graphql(`{
    data {
      website(_id: "${websiteid}") {
        _client
        _id
        basethemes
        ${themeQuery}
        domain
        pages {
          main {
            _id
          }
          header {
            left {
              _id
            }
            right {
              _id
            }
            center {
              _id
            }
          }
          footer {
            left {
              _id
            }
            right {
              _id
            }
            center {
              _id
            }
          }
          _client
          _id
          path
          tabname
          title
          dir
          lang
          keywords
        }
      }
    }
  }`));

  const { createPage } = actions;

  return execwebsitequery(websiteid, graphql)
  .then(result => {
    runGC();
    if (result.errors) {
      console.error(result.errors);
      return Promise.reject(result.errors);
    }

    const menuquery = graphql(`{
      data {
        website(_id: "${websiteid}") {
          favicon
          topmenu {
            content {
              _id
            }
            type
          }
          bottommenu {
            content {
              _id
            }
            type
          }
          sidemenu {
            content {
              _id
            }
            type
          }
        }
      }
    }`);

    console.log("Page query finished!");
    const { pages } = result.data.data.website;
    const { discover, result: getresult } = makeRecursiveContext();
    runGC();
    return menuquery.then(xmenudata => {
      const menudata = xmenudata.data.data.website;
      runGC();
      return Promise.all([
        menuquery,
        Promise.resolve(result.data.data.website),
        Promise.all(pages.map(page => {
          console.log("Discovering page "+page.path+"....");
          return Promise.all([
            discover(page.main._id, graphql, page),
            discover(page.header.left && page.header.left._id, graphql, page),
            discover(page.header.center && page.header.center._id, graphql, page),
            discover(page.header.right && page.header.right._id, graphql, page),
            discover(page.footer.left && page.footer.left._id, graphql, page),
            discover(page.footer.center && page.footer.center._id, graphql, page),
            discover(page.footer.right && page.footer.right._id, graphql, page),
            discover(menudata.topmenu && menudata.topmenu.content && menudata.topmenu.content._id, graphql, { path: "topmenu" }),
            discover(menudata.bottommenu && menudata.bottommenu.content && menudata.bottommenu.content._id, graphql, { path: "bottommenu" }),
            discover(menudata.sidemenu && menudata.sidemenu.content && menudata.sidemenu.content._id, graphql, { path: "sidemenu" })
          ]).then(([
            main,
            hleft,
            hcenter,
            hright,
            bleft,
            bcenter,
            bright,
            topmenu,
            bottommenu,
            sidemenu
          ]) => ({
            main,
            header: {
              left: hleft,
              center: hcenter,
              right: hright
            },
            footer: {
              left: bleft,
              center: bcenter,
              right: bright
            },
            topmenu,
            bottommenu,
            sidemenu
          }));
        })),
        Promise.resolve(getresult)
      ]);
    });
  }).then(([menudata, website, discovery, getresult]) => {
    runGC();
    return new Promise(res => {
      const { pages, ...other } = website;
      const groupdata = groupBy(i => i.__typename, getresult());
      const targetobj = {
        ...components.reduce((p, i) => ({ ...p, [i]: [] }), {}),
        ...R.map(i => i.map(j => j._id), groupdata)
      };
      runGC();
      pages.map((i, idx) => {
        runGC();
        createPage({
           path: `${i.path}`,
           component: path.resolve('./src/templates/Page.tsx'),
           context: {
             website: other,
             menudata: menudata,
             pageid: i._id,
             page: i,
             tree: discovery[idx],
             pageids: pages.map(q => q._id),
             ...targetobj
           }
         });
      });
      res();
    })
  });
};

exports.onPreBuild = () => {
  runGC();
};

exports.onPreBootstrap = () => {
  runGC();
};

exports.onPostBootstrap = () => {
  runGC();
  const sources = {
    de: icons => `import { ${icons.join(", ")} } from "grommet-icons";`,

    // import {AccountCircle, Lock} from 'styled-icons/material'
    bl: icons => `import { ${icons.join(", ")} } from "styled-icons/boxicons-logos";`,
    br: icons => `import { ${icons.join(", ")} } from "styled-icons/boxicons-regular";`,
    bs: icons => `import { ${icons.join(", ")} } from "styled-icons/boxicons-solid";`,
    cr: icons => `import { ${icons.join(", ")} } from "styled-icons/crypto";`,
    ev: icons => `import { ${icons.join(", ")} } from "styled-icons/evil";`,
    im: icons => `import { ${icons.join(", ")} } from "styled-icons/icomoon";`,

    fa: icons => icons.map(i => `import { ${i} } from "react-icons-kit/fa/${i}";`).join("\n"),
    io: icons => icons.map(i => `import { ${i} } from "react-icons-kit/iconic/${i}";`).join("\n"),
    ia: icons => icons.map(i => `import { ${i} } from "react-icons-kit/ionicons/${i}";`).join("\n"),
    md: icons => icons.map(i => `import { ${i} } from "react-icons-kit/md/${i}";`).join("\n"),
    ti: icons => icons.map(i => `import { ${i} } from "react-icons-kit/typicons/${i}";`).join("\n"),
    go: icons => icons.map(i => `import { ${i} } from "react-icons-kit/oct/${i}";`).join("\n"),
    fi: icons => icons.map(i => `import { ${i} } from "react-icons-kit/feather/${i}";`).join("\n"),

    // import { icon } from "react-icons-kit/ikons/icon"
    ik: icons => icons.map(i => `import { ${i} } from "react-icons-kit/ikons/${i}";`).join("\n"),
    li: icons => icons.map(i => `import { ${i} } from "react-icons-kit/linea/${i}";`).join("\n"),
    me: icons => icons.map(i => `import { ${i} } from "react-icons-kit/metrize/${i}";`).join("\n"),
    ty: icons => icons.map(i => `import { ${i} } from "react-icons-kit/entypo/${i}";`).join("\n"),
    no: icons => icons.map(i => `import { ${i} } from "react-icons-kit/noto_emoji_regular/${i}";`).join("\n")
  };
  const createdIconfile = new Promise((res, rej) => {
    const filteredIcons = usedicons.filter((i, idx, arr) => arr.indexOf(i) === idx);
    const xicon = filteredIcons.map(source => source.split("/")).reduce((p, [lib, ico]) => ({
      ...p,
      [lib]: (p[lib] || []).concat([ico])
    }), {});
    const importstring = Object.entries(xicon).map(
      ([lib, ico]) => sources[lib] ? sources[lib](ico) : ""
    );
    fs.writeFile("./src/utils/usedIcons.ts", `
/* GENERATED CONTENT - DO NOT EDIT */
/* ${JSON.stringify(usedicons)} */
${importstring.join("\n")};

export default { ${Object.values(xicon).map(i => i.join(", ")).join(", ")} };
    `, function(err) {
        if(err) {
            console.log(err);
            rej(err);
        }
        console.log("Wrote icon file");
        return res(null);
    });
  });
  return createdIconfile;
};
