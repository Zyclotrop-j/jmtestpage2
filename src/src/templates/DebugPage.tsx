import React from 'react';
import Link from 'gatsby-link';
import { graphql } from 'gatsby';
import Helmet from 'react-helmet';
import { Anchor, Box, Grid, ResponsiveContext, SkipLinks, SkipLink, SkipLinkTarget } from 'grommet';
import { memoizeWith , identity } from "ramda";
import Img from 'gatsby-image'; // Imports the fragments as well!
import config from '../../config/SiteConfig';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ModernLayout } from '../layouts/modern';
// import components from '../Widget';
import { Headline } from '../Widget/Headline';
import { RichText } from '../Widget/RichText';
import { Text as JText } from '../Widget/Text';
import { Group as JGroup } from '../Widget/Group';
import { Grid as JGrid } from '../Widget/Grid';
import { Box as JBox } from '../Widget/Box';
import { Picture } from '../Widget/Picture';
import { Stage } from '../Widget/Stage';

export default () => <div>Test debug 2</div>;
