const websiteid = process.env.WEBSITEID || "5ccd2e75c358d60004ebe212";
const path = require('path');
const webpack = require("webpack");
const _ = require('lodash');
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);
const R = require("ramda");
const { memoizeWith, identity, groupBy } = R;
const config = require('./config/SiteConfig');

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
          return createRemoteFileNode({
            url: source.src,
            store,
            cache,
            createNode,
            createNodeId,
          })
        }
      }
    },
    DATA_ImageMod3M62O0U2Y0Tmp: {
      srcFile: {
        type: `File`,
        // projection: { url: true },
        async resolve(source, args, context, info) {
          return createRemoteFileNode({
            url: source.src,
            store,
            cache,
            createNode,
            createNodeId,
          })
        }
      }
    },
    DATA_BackgroundModZchwmkapX05D: {
      srcFile: {
        type: `File`,
        // projection: { url: true },
        async resolve(source, args, context, info) {
          return createRemoteFileNode({
            url: source.image,
            store,
            cache,
            createNode,
            createNodeId,
          })
        }
      }
    }
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
                               modules: [path.resolve(__dirname, 'src'), 'node_modules'],
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
const componentsWithChild = ["DATA_Componentgrid", "DATA_Componentbox"]
const componentsStandalone = ["DATA_Componentstage", , "DATA_Componenttext", "DATA_Componentpicture", "DATA_Componentrichtext", "DATA_Componentheadline"]
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
    return  new Promise(resolve => {
      const [query, discovered] = queryComponentgroup(id, graphql);
      console.log(`Dicovered ${id}, discovered before: ${discovered}, on ${page.path}`);

      const children = !subquerrySet[id] ?
        query.then(result => {
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

const execwebsitequery = memoizeWith(identity, (websiteid, graphql) => graphql(`{
  data {
    website(_id: "${websiteid}") {
      _client
      _id
      basethemes
      themes {
        _id
      }
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

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  return execwebsitequery(websiteid, graphql)
  .then(result => {
    /*
    {
      relativePath
      childImageSharp {
        fluid(maxWidth: 2000) {
          ...GatsbyImageSharpFluid_withWebp
        }
      }
    }
    */
    if (result.errors) {
      return Promise.reject(result.errors);
    }
    console.log("Page query finished!");
    const { pages } = result.data.data.website;
    const { discover, result: getresult } = makeRecursiveContext();
    return Promise.all([
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
          discover(page.footer.right && page.footer.right._id, graphql, page)
        ]).then(([
          main,
          hleft,
          hcenter,
          hright,
          bleft,
          bcenter,
          bright
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
          }
        }));
      })),
      Promise.resolve(getresult)
    ]);
  }).then(([website, discovery, getresult]) => {
    const { pages, ...other } = website;
    const groupdata = groupBy(i => i.__typename, getresult());
    return pages.map((i, idx) => {
      createPage({
         path: `${i.path}`,
         component: path.resolve('./src/templates/Page.tsx'),
         context: {
           website: other,
           pageid: i._id,
           page: i,
           tree: discovery[idx],
           ...components.reduce((p, i) => ({ ...p, [i]: [] }), {}),
           ...R.map(i => i.map(j => j._id), groupdata)
         }
       });
    });
  });
};
