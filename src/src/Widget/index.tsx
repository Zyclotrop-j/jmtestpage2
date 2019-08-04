import { Picture, uiSchema as pictureuiSchema } from './Picture';
import { Headline } from './Headline';
import { RichText, uiSchema as richtextuiSchema } from './RichText';
import { Text, uiSchema as textuiSchema } from './Text';
import { Box, uiSchema as boxuiSchema } from './Box';
import { Grid } from './Grid';
import { Group } from './Group';
import { uiSchema as pageuiSchema } from "./Page";
import { Stage, uiSchema as stageuiSchema } from './Stage';
import { Icon, uiSchema as iconuiSchema } from "./Icon";
import { CallToAction, uiSchema as ctauiSchema } from "./CallToAction";
import { Cards, uiSchema as cardsuiSchema } from "./Cards";
import { Menu, uiSchema as menuuiSchema } from "./Menu";
import { FlowChart, uiSchema as flowchartuiSchema } from "./FlowChart";
import { Accordion, uiSchema as accordionuiSchema } from "./AccordionLazy";
import { List, uiSchema as listuiSchema } from "./List";
import { QRCode, uiSchema as qrcodeuiSchema } from "./QRCode";
import { VerticalTimeline, uiSchema as verticaltimelineuiSchema } from "./VerticalTimeline";
import { MediaQuery, uiSchema as mediaqueryuiSchema } from "./MediaQuery";
import { ShowMore, uiSchema as showmoreuiSchema } from "./ShowMore";
import { Map, uiSchema as mapuiSchema } from "./Map";
import { ContactForm, uiSchema as contactformuiSchema } from "./ContactForm";
import { Link, uiSchema as linkuiSchema } from "./Link";
import { JSONLDData, uiSchema as jsonlddatauiSchema } from "./JSONLDData";

import { BaseBox, uiSchema as baseboxuiSchema } from "./BaseBox";
import { Center, uiSchema as centeruiSchema } from "./Center";
import { Cluster, uiSchema as clusteruiSchema } from "./Cluster";
import { Cover, uiSchema as coveruiSchema } from "./Cover";
import { SGrid, uiSchema as sgriduiSchema } from "./SGrid";
import { Sidebar, uiSchema as sidebaruiSchema } from "./Sidebar";
import { Stack, uiSchema as stackuiSchema } from "./Stack";
import { Switcher, uiSchema as switcheruiSchema } from "./Switcher";
import { TagList, uiSchema as taglistuiSchema } from "./TagList";

export const uiSchema = {
  basebox: baseboxuiSchema,
  center: centeruiSchema,
  cluster: clusteruiSchema,
  cover: coveruiSchema,
  sgrid: sgriduiSchema,
  sidebar: sidebaruiSchema,
  stack: stackuiSchema,
  switcher: switcheruiSchema,
  taglist: taglistuiSchema,
  text: textuiSchema,
  page: pageuiSchema,
  picture: pictureuiSchema,
  box: boxuiSchema,
  stage: stageuiSchema,
  icon: iconuiSchema,
  calltoaction: ctauiSchema,
  cards: cardsuiSchema,
  menu: menuuiSchema,
  richtext: richtextuiSchema,
  flowchart: flowchartuiSchema,
  accordion: accordionuiSchema,
  list: listuiSchema,
  qrcode: qrcodeuiSchema,
  verticaltimeline: verticaltimelineuiSchema,
  mediaquery: mediaqueryuiSchema,
  showmore: showmoreuiSchema,
  map: mapuiSchema,
  contactform: contactformuiSchema,
  link: linkuiSchema,
  jsonlddata: jsonlddatauiSchema
};
export const Calltoaction = CallToAction;
export const JSONLD = JSONLDData;
export { BaseBox, Center, Cluster, Cover, SGrid, Sidebar, Stack, Switcher, TagList, JSONLDData, Link, ContactForm, Map, ShowMore, MediaQuery, VerticalTimeline, QRCode, List, Accordion, FlowChart, Menu, RichText, Headline, Picture, Text, Box, Grid, Group, Stage, CallToAction, Icon, Cards };
export default { BaseBox, Center, Cluster, Cover, SGrid, Sidebar, Stack, Switcher, TagList, JSONLD, JSONLDData, Link, ContactForm, Map, ShowMore, MediaQuery, VerticalTimeline, QRCode, List, Accordion, FlowChart, Menu, RichText, Headline, Picture, Text, Box, Grid, Group, Stage, CallToAction, Calltoaction: CallToAction, Icon, Cards };
