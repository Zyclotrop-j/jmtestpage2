import { Picture, uiSchema as pictureuiSchema } from './Picture';
import { Headline } from './Headline';
import { RichText } from './RichText';
import { Text, uiSchema as textuiSchema } from './Text';
import { Box, uiSchema as boxuiSchema } from './Box';
import { Grid } from './Grid';
import { Group } from './Group';
import { uiSchema as pageuiSchema } from "./Page";
import { Stage, uiSchema as stageuiSchema } from './Stage';

export const uiSchema = {
  text: textuiSchema,
  page: pageuiSchema,
  picture: pictureuiSchema,
  box: boxuiSchema,
  stage: stageuiSchema
};
export { RichText, Headline, Picture, Text, Box, Grid, Group, Stage };
export default { RichText, Headline, Picture, Text, Box, Grid, Group, Stage };
