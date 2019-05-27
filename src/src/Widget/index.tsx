import { Picture } from './Picture';
import { Headline } from './Headline';
import { RichText } from './RichText';
import { Text, uiSchema as textuiSchema } from './Text';
import { Box } from './Box';
import { Grid } from './Grid';
import { Group } from './Group';
import { uiSchema as pageuiSchema } from "./Page";

export const uiSchema = {
  text: textuiSchema,
  page: pageuiSchema
};
export { RichText, Headline, Picture, Text, Box, Grid, Group };
export default { RichText, Headline, Picture, Text, Box, Grid, Group };
