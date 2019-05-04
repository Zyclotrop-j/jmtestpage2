const websiteid = process.env.WEBSITEID;
if(!websiteid) throw new Error("env.WEBSITEID not defined");
const path = require('path');
const _ = require('lodash');
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);
const config = require('./config/SiteConfig');

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === 'MarkdownRemark' && _.has(node, 'frontmatter') && _.has(node.frontmatter, 'title')) {
    const slug = `${_.kebabCase(node.frontmatter.title)}`;
    createNodeField({ node, name: 'slug', value: slug });
  }
};

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
    }
  });
};

exports.onCreateWebpackConfig = ({ stage, actions }) => {
  actions.setWebpackConfig({
                             resolve: {
                               modules: [path.resolve(__dirname, 'src'), 'node_modules'],
                             },
                           });
};

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;
  return graphql(`{
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
  }`)
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
    console.log("Finished query!")
    const { pages, ...other } = result.data.data.website;
    pages.map(i => {
      console.log("PATH", i.path);
      createPage({
         path: `${i.path}`,
         component: path.resolve('./src/templates/Page.tsx'),
         context: {
           ...other,
           pageid: i._id,
           data: i,
         }
       });
    });
  });
};
