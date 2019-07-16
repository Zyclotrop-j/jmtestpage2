import React from 'react';
import styled from 'styled-components';
import { Helmet } from "react-helmet";
import { identity, tryCatch, pipe } from "ramda";
const minifyJSON = pipe(
  tryCatch(JSON.parse, identity),
  tryCatch(JSON.stringify, identity)
);

interface Props {}

export const uiSchema = {
  text: {
    "ui:widget": "textarea"
  }
};

const schema = {
  "title": "componentjsonld",
  "type": "object",
  "properties": {
    "text": {
      "description": "Any JSON-LD that describes something on the page",
      "default": "{}",
      "type": "string"
    }
  }
};


export class JSONLDData extends React.PureComponent<Props> {

  public render() {
    const {
      _id,
      text
    } = this.props;

    return (<script key={_id} type="application/ld+json">{`${minifyJSON(text)}`}</script>);
  }
}
