require('source-map-support').install();
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    target: 'es2017',
  },
});

const config = require('./config/SiteConfig');
const pathPrefix = config.pathPrefix === '/' ? '' : config.pathPrefix;

module.exports = {
  pathPrefix: config.pathPrefix,
  siteMetadata: {
    siteUrl: config.siteUrl + pathPrefix,
  },
  plugins: [
    {
      resolve: "gatsby-source-graphql-universal",
      options: {
        // This type will contain remote schema Query type
        typeName: "DATA",
        // This is field under which it's accessible
        fieldName: "data",
        // Url to query from
        url: "https://zcmsapi.herokuapp.com/apig/graphql" // "http://localhost:4000/apig/graphql",
      },
    },
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-styled-components',
    'gatsby-plugin-offline',
    'gatsby-plugin-typescript',
    'gatsby-plugin-sass',
    'gatsby-plugin-manifest',
    'gatsby-plugin-catch-links',
    'gatsby-plugin-sitemap',
    'gatsby-plugin-lodash',
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    /*
    // can't use, because it breaks pre-load, see https://bugs.chromium.org/p/chromium/issues/detail?id=677022
    {
      resolve: 'gatsby-plugin-sri',
      options: {
        hash: 'sha512' // 'sha256', 'sha384' or 'sha512' ('sha512' = default)
      }
    }, */
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'post',
        path: `${__dirname}/blog`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'img',
        path: `${__dirname}/img`,
      },
    },
    {
      resolve: `gatsby-plugin-google-tagmanager`,
      options: {
        id: config.Google_Tag_Manager_ID,
        // Include GTM in development.
        // Defaults to false meaning GTM will only be loaded in production.
        includeInDevelopment: false,
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-external-links',
            options: {
              target: '_blank',
              rel: 'nofollow noopener noreferrer',
            },
          },
          'gatsby-remark-prismjs',
          'gatsby-remark-autolink-headers',
          {
            resolve: "gatsby-remark-smartypants",
            options: {
              dashes: "oldschool",
            },
          },
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: config.siteTitle,
        short_name: config.siteTitleAlt,
        description: config.siteDescription,
        start_url: config.pathPrefix,
        background_color: config.backgroundColor,
        theme_color: config.themeColor,
        display: 'standalone',
        icon: config.favicon,
      },
    },
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        host: config.siteUrl,
        sitemap: config.siteUrl + '/sitemap.xml',
        env: {
          development: {
            policy: [{ userAgent: '*', disallow: ['/'] }]
          },
          production: {
            policy: [{ userAgent: '*', allow: '/' }]
          }
        }
      }
    },
    {
      resolve: `gatsby-plugin-canonical-urls`,
      options: {
        siteUrl: config.siteUrl,
      },
    }
  ]
};
