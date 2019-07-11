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


export const uiSchema = {
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
  qrcode: qrcodeuiSchema
};
export const Calltoaction = CallToAction;
export { QRCode, List, Accordion, FlowChart, Menu, RichText, Headline, Picture, Text, Box, Grid, Group, Stage, CallToAction, Icon, Cards };
export default { QRCode, List, Accordion, FlowChart, Menu, RichText, Headline, Picture, Text, Box, Grid, Group, Stage, CallToAction, Calltoaction: CallToAction, Icon, Cards };
