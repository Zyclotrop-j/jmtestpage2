/* eslint-disable react/require-default-props */
import React from 'react';
import Helmet from 'react-helmet';
import config from '../../config/SiteConfig';
import Post from '../models/Post';

interface SEO {
  postNode: Post;
  postPath: string;
  postSEO: boolean;
}

export const SEO = (props: SEO) => {
  const { postNode, postPath, postSEO } = props;
  const schemaOrgJSONLD = {
    '@context': 'http://schema.org',
    '@type': 'WebSite',
    '@id': domain,
    url: domain,
    name: title,
    alternateName: titleAlt ? titleAlt : '',
  };
  return (
    <Helmet>
      <html lang={lang} dir={dir} />
      <meta name="description" content={description} />
      <meta name="image" content={image} />
      <meta name="keywords" content={keywords || ''} />
      <script type="application/ld+json">{JSON.stringify(schemaOrgJSONLD)}</script>
      <meta property="og:locale" content={lang} />
      <meta property="og:site_name" content={title} />
      <meta property="og:type" content="website" /> {/* // profile or article - add to widgets to overwrite */}
      <meta property="og:image" content={image} /> {/* add to widgets to overwrite */}
      <meta property="fb:app_id" content={siteFBAppID} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={coorpTwitter} />
      <meta name="twitter:creator" content={userTwitter} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="index" content={`${domain}/`} />
      <meta name="alternate" type="application/json" content={jsonRepresentationOfWebsite} />
      {/* <meta name="canonical" content={description} /> */}
      <meta name="author" content={author} />
      <meta name="designer" content={designer} />
      <meta name="generator" content={generator} />
      <meta name="copyright" content={copyright} />
      {/* Add this to locality widgets */}
      <meta name="ICBM" content={`${place.geo.latitude}, ${geo.position.longitude}`} />
      <meta name="geo.position" content={`${place.geo.latitude};${place.geo.longitude}`} />
      <meta name="geo.placename" content={`${place.address.addressLocality}`} />
      <meta
        name="geo.region"
        content={
          place.address.addressRegion ? `${place.address.addressRegion}-${place.address.addressCountry}` : `${place.address.addressCountry}`
        }
      />
      <meta name="DC.title" content={title} />
      <meta name="target" content={aud.target || 'all'} />
      <meta name="audience" content={aud.audience || 'all'} />
      <meta name="coverage" content={aud.converage || 'Worldwide'} />
      <meta name="rating" content={aud.rating || 'safe for kids'} />
      <meta name="twitter:dnt" content="on" />
    </Helmet>
  );
};
