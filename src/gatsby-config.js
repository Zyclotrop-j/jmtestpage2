const websiteid = process.env.WEBSITEID || "5ccd2e75c358d60004ebe212";

require('source-map-support').install();
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    target: 'es2017',
  },
});

const config = require('./config/SiteConfig');

var request = require('sync-request');
var fs = require('fs');
const reqconfig = {
  headers: {
    "Accept": "application/json",
    "Accept-Encoding": "gzip",
    "Accept-Language": "en-US,en;q=0.9,de-DE;q=0.8,de;q=0.7",
    "User-Agent": "JM CI"
  },
  retry: true,
  retryDelay: 60000,
  maxRetries: 2
};


const res = request('GET', 'https://zcmsapi.herokuapp.com/api/v1/website/'+websiteid, reqconfig);

const websitedata = JSON.parse(res.getBody('utf8'));

let themeColor = "#FFFFFF";
let bodyFont = "";
let headFont = "";
let foundThemeColor = false;
let foundfonthead = false;
let foundfontbody = false;
websitedata.data.themes.reverse().some(id => {
  const res = request('GET', 'https://zcmsapi.herokuapp.com/api/v1/theme/'+id, reqconfig);
  const data = JSON.parse(res.getBody('utf8')) || {};
  if(!foundThemeColor && data.data && data.data.global && data.data.global.colors && data.data.global.colors.brand) {
    themeColor = data.data.global.colors.brand;
    foundThemeColor = true;
  }
  if(!foundfontbody && data.data && data.data.global && data.data.global.font && data.data.global.font.family) {
    bodyFont = data.data.global.font.family;
    foundfontbody = true;
  }
  if(!foundfonthead && data.data && data.data.heading && data.data.heading.font && data.data.heading.font.family) {
    headFont = data.data.heading.font.family;
    foundfonthead = true;
  }
  if(foundThemeColor && foundfontbody && foundfonthead) {
    return true;
  }
});

const getShortName = domain => {
  let _shortname = domain;
  while(_shortname.length > 12) {
    const split = _shortname.match(/^(.+)\..+$/);
    if(split && split[1]) {
      _shortname = split[1];
    } else {
      break;
    }
  }
  return _shortname;
};
const shortname = getShortName(websitedata.data.domain);


// Write fav-icon to tmp-file
const defaultIcon = "https://www.publicdomainpictures.net/download-picture.php?id=192129&check=67b46c92d7ab00c7cf8b2206c8864068";
const faviconres = request('GET', websitedata.data.favicon || defaultIcon);
const tmp = require('tmp');
const tmpobj = tmp.fileSync();
var wstream = fs.createWriteStream(tmpobj.name);
wstream.write(faviconres.body);
wstream.end();
const favicon = tmpobj.name;
// Fav-icon end

const optPlugins = process.env.CI ? [] : ["gatsby-plugin-webpack-bundle-analyser-v2"];

// console.log("Created config for "+websitedata.data.domain);

module.exports = {
  siteMetadata: {
    siteUrl: config.siteUrl,
  },
  plugins: [
    ...optPlugins,
    {
      resolve: 'gatsby-plugin-web-font-loader',
      options: {
        classes: false,
        events: false,
        google: {
          families: [bodyFont, headFont]
        }
      }
    },
    /*{
      resolve: `gatsby-plugin-nprogress`,
      options: {
        // Setting a color is optional.
        color: `themeColor`,
        // Disable the loading spinner.
        showSpinner: false,
      },
    },*/
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
    'gatsby-plugin-typescript',
    'gatsby-plugin-sass', // re-enable
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
    /* {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'post',
        path: `${__dirname}/blog`,
      },
    },*/
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'img',
        path: `${__dirname}/img`,
      },
    },
    /*{
      resolve: `gatsby-plugin-google-tagmanager`,
      options: {
        id: config.Google_Tag_Manager_ID,
        // Include GTM in development.
        // Defaults to false meaning GTM will only be loaded in production.
        includeInDevelopment: false,
      },
    },*/
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
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        host: config.siteUrl,
        sitemap: config.siteUrl + '/sitemap.xml',
        env: {
          development: {
            policy: [{ userAgent: '*', disallow: ['/'] }]
          },
          production: {
            policy: [{ userAgent: '*', allow: '/', disallow: ["/admin", "/theme"] }]
          }
        }
      }
    },
    {
      resolve: `gatsby-plugin-canonical-urls`,
      options: {
        siteUrl: "https://"+websitedata.data.domain,
      },
    },
    'gatsby-plugin-styled-components', // re-enable
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: websitedata.data.title,
        short_name: shortname,
        description: websitedata.data.description,
        start_url: "/?source=pwa",
        background_color: themeColor,
        theme_color: themeColor,
        display: 'standalone',
        icon: favicon,
      },
    },
    'gatsby-plugin-offline',
    /*{
      resolve: "gatsby-plugin-offline",
      options: {
        // importScripts: ['@uppy/golden-retriever/lib/ServiceWorker'],
        // offlineGoogleAnalytics: true
        runtimeCaching: [
          {
            // Use cacheFirst since these don't need to be revalidated (same RegExp
            // and same reason as above)
            urlPattern: /(\.js$|\.css$|static\/)/,
            handler: `cacheFirst`,
          },
          {
            // Add runtime caching of various other page resources
            urlPattern: /^https?:.*\.(png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css)$/,
            handler: `staleWhileRevalidate`,
          },
          {
            // Google Fonts CSS (doesn't end in .css so we need to specify it)
            urlPattern: /^https?:\/\/fonts\.googleapis\.com\/css/,
            handler: `staleWhileRevalidate`,
          },
          {
            urlPattern: /^https:\/\/zcmsapi.herokuapp.com\/api\/v1\//,
            handler: `networkFirst`,
            options: {
              cacheName: 'rest-api-cache',
              expiration: {
                maxAgeSeconds: 60*60*24*31 // on month
              },
              backgroundSync: {
                name: 'rest-api-queue',
                options: {
                  maxRetentionTime: 60*60*24*31,
                },
              },
            },
          },
          {
            urlPattern: /^https:\/\/zcmsapi.herokuapp.com\/apig\/graphql/,
            handler: `networkFirst`,
            options: {
              cacheName: 'graphql-api-cache',
              expiration: {
                maxAgeSeconds: 60*60*24*31 // on month
              },
              backgroundSync: {
                name: 'graphql-api-queue',
                options: {
                  maxRetentionTime: 60*60*24*31,
                },
              },
            },
          },

        ],
      }
    }, */
    "gatsby-plugin-remove-trailing-slashes" // re-enable
  ]
};
