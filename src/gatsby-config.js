const websiteid = process.env.WEBSITEID || "5d18639f49c4440004404d09";

require('source-map-support').install();
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    target: 'es2017',
  },
});

const R = require("ramda");

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
  retryDelay: 6000,
  maxRetries: 2
};

const srequest = R.tryCatch(request, () => ({ getBody: () => "{}" }));

const res = request('GET', 'https://zcmsapi.herokuapp.com/api/v1/website/'+websiteid, reqconfig);
console.log("Fetched website");
const websitedata = JSON.parse(res.getBody('utf8'));
const ownerraw = websitedata.data.owner && srequest('GET', 'https://zcmsapi.herokuapp.com/api/v1/person/'+websitedata.data.owner, reqconfig);
console.log("Fetched owner");
const owner = ownerraw && JSON.parse(ownerraw.getBody('utf8')).data || {};
const addressraw = owner.address && srequest('GET', 'https://zcmsapi.herokuapp.com/api/v1/postaladdress/'+owner.address, reqconfig);
console.log("Fetched address");
const address = addressraw && JSON.parse(addressraw.getBody('utf8')).data || {};
const countryraw = address.addressCountry && srequest('GET', 'https://zcmsapi.herokuapp.com/api/v1/country/'+address.addressCountry, reqconfig);
console.log("Fetched country");
const country = countryraw && JSON.parse(countryraw.getBody('utf8')).data || {};

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
    bodyFont = data.data.global.font.family.replace(/"/g, "");
    foundfontbody = true;
  }
  if(!foundfonthead && data.data && data.data.heading && data.data.heading.font && data.data.heading.font.family) {
    headFont = data.data.heading.font.family.replace(/"/g, "");
    foundfonthead = true;
  }
  if(foundThemeColor && foundfontbody && foundfonthead) {
    return true;
  }
});

if(!foundfontbody) {
  console.error("No body font", foundfontbody, websitedata.data.themes, "Using Sintony as fallback");
  bodyFont = "Sintony"
}
if(!foundfonthead) {
  console.error("No Headline font", foundfonthead, websitedata.data.themes, "Using Headland One as fallback");
  headFont = "Headland One"
}

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

const ga = {
  resolve: `gatsby-plugin-gtag`,
  options: {
    trackingId: websitedata.data.googleAnalytics || "UA-144040671-1",
    // Defines where to place the tracking script - `true` in the head and `false` in the body
    head: false,
    // Setting this parameter is optional
    anonymize: true,
    // Setting this parameter is also optional
    respectDNT: true,
    // Avoids sending pageview hits from custom paths
    exclude: ["/___/**", "/__/**", "/_/**", "/admin/", "/callback/", "/theme/"],
    // Delays sending pageview hits on route update (in milliseconds)
    pageTransitionDelay: 1000,
    // Enables Google Optimize using your container Id
    // optimizeId: "YOUR_GOOGLE_OPTIMIZE_TRACKING_ID",
    // Enables Google Optimize Experiment ID
    // experimentId: "YOUR_GOOGLE_EXPERIMENT_ID",
    // Set Variation ID. 0 for original 1,2,3....
    // variationId: "YOUR_GOOGLE_OPTIMIZE_VARIATION_ID",
    // Any additional create only fields (optional)
    name: "ℊÅ",
    sampleRate: 100,
    siteSpeedSampleRate: 10,
    cookieName: "ℊÅ",
    cookieDomain: (function() {
      const x = require("parse-domain")(websitedata.data.domain);
      return x.domain + "." + x.tld;
    })(),
    allowLinker: true,
    anonymizeIp: true,
    forceSSL: true,
    transport: 'beacon'
  },
};
const optPlugins = process.env.CI ? websitedata.data.googleAnalytics ? [ga] : [] : ["gatsby-plugin-webpack-bundle-analyser-v2"];

const dr = x => x && x.split("").map((i, idx) => i.charCodeAt(0) + idx).join("-");
module.exports = {
  siteMetadata: {
    siteUrl: `https://${websitedata.data.domain}`,
    name: `ENCRYPT_${dr(owner && owner.name)}`,
    firstname: `ENCRYPT_${dr(owner && owner.givenName && owner.givenName[0])}`,
    lastname: `ENCRYPT_${dr(owner && owner.familyName)}`,
    addr: `ENCRYPT_${dr(`
      ${owner && owner.name}
      ${address && address.streetAddress}
      ${address && address.postalCode} ${address && address.addressLocality}
      ${address && address.addressRegion}
      ${country && country.name}
    `)}`,
    email: `ENCRYPT_${dr(owner.email && owner.email[0] || address.email && address.email[0])}`,
    phone: `ENCRYPT_${dr(owner.telephone || address.telephone)}`,
    websitename: `"${websitedata.data.title}"`,
    website: websitedata.data.domain
  },
  plugins: [
    ...optPlugins,
    { // &display=swap see https://github.com/typekit/webfontloader/issues/409
      // Add https://fonts.gstatic.com to connect-src
      resolve: 'gatsby-plugin-web-font-loader',
      options: {
        classes: false,
        events: false,
        google: {
          families: [bodyFont, headFont]
        }
      }
    },
    {
      resolve: `gatsby-plugin-nprogress`,
      options: {
        // Setting a color is optional.
        color: `themeColor`,
        // Disable the loading spinner.
        showSpinner: false,
      },
    },
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
        links:  [
          // about
          // preview
          {
            "href": "/_/privacy",
            "type": "text/html",
            "rel": "privacy-policy"
          },
          {
            "href": "/_/terms",
            "type": "text/html",
            "rel": "terms-of-service"
          }
        ],
      },
    },
    {
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
    },
    "gatsby-plugin-remove-trailing-slashes", // re-enable
    /*{
      resolve: `gatsby-plugin-csp`,
      options: {
        disableOnDev: true,
        reportOnly: false, // Changes header to Content-Security-Policy-Report-Only for csp testing purposes
        mergeScriptHashes: true, // you can disable scripts sha256 hashes
        mergeStyleHashes: false, // you can disable styles sha256 hashes
        mergeDefaultDirectives: true,
        directives: {
          "default-src": "'none'",
          "script-src": "'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://www.google-analytics.com https://www.googletagmanager.com https://www.youtube.com https://s.ytimg.com",
          "base-uri": "'none'",
          "frame-ancestors": "'none'",
          "form-action": "'none'",
          "child-src": "'self' https://www.google.com/recaptcha/ https://www.youtube.com",
          "frame-src": "'self' https://www.google.com/recaptcha/",
          "object-src": "'self'",
          "style-src": "'self' 'unsafe-inline' https: https://fonts.googleapis.com/css",
          "connect-src": "'self' https://uppycompanion.herokuapp.com/ https://fonts.googleapis.com https://zcmsapi.herokuapp.com/ https://circleci.com/api/v1.1/ https://usjdilkblg.execute-api.eu-central-1.amazonaws.com/ https://script.google.com/macros/s/AKfycbwAj7072jfxikYraJ7KYTTXBzQBDjlG42rsPg-4bFnagzRChJy8/ https://www.google-analytics.com https://stats.g.doubleclick.net https://www.google.com",
          "font-src": "'self' data: https://fonts.gstatic.com",
          "img-src": "'self' data: blob: https://*.unsplash.com https://s3.eu-central-1.amazonaws.com https://assets-au.s3.ap-southeast-2.amazonaws.com https://usjdilkblg.execute-api.eu-central-1.amazonaws.com https://www.google-analytics.com https://stats.g.doubleclick.net https://www.google.com",
          "media-src": "'self' data: blob: ",
          "worker-src": "'self' data: blob: ",
          "manifest-src": "'self'",
          "prefetch-src": "'self' *",
          "block-all-mixed-content": "",
          "report-uri": "https://mingram.report-uri.com/r/d/csp/enforce",
          "report-to": "cspenforce"
        }
      }
    }*/
  ]
};
