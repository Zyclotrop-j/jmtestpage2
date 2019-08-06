import React, { Suspense } from 'react';
import styled from 'styled-components';
import LazyLoad from 'react-lazyload';
import { Spinning } from 'grommet-controls';
import { StaticQuery, graphql } from 'gatsby';
import { is } from "ramda";


const isString = is(String);
const toUpperFirst = str => str.charAt(0).toUpperCase() + str.slice(1);

interface Props {

}

export const uiSchema = {
  renderAs: {
    "ui:widget": "list",
    "ui:options": {
      "getList": () => ["canvas", "svg"]
    }
  },
  level: {
    "ui:widget": "list",
    "ui:options": {
      "getList": () => ['L', 'M', 'Q', 'H']
    }
  },
  value: {
    "ui:widget": "textarea"
  }
};

const schema = {
  "title": "componentqrcode",
  "type": "object",
  "properties": {
    "value": {
      "description": "The value of the QR code",
      "type": "string"
    },
    "renderAs": {
      "description": "Render method 'canvas' or 'svg'",
      "type": "string"
    },
    "size": {
      "description": "Size of the QR-code",
      "type": "number",
      "minimum": 128,
      "multipleOf": 64
    },
    "bgColor": {
      "description": "Background color of the QRCode",
      "type": "string",
      "default": "#FFFFFF"
    },
    "fgColor": {
      "description": "Forground color of the QRCode",
      "type": "string",
      "default": "#000000"
    },
    "level": {
      "description": "Redundancy level - 'L' > 'M' > 'Q' > 'H'",
      "type": "string",
      "default": "L"
    },
    "includeMargin": {
      "description": "Include a margin around the QR code",
      "type": "boolean",
      "default": false
    }
  }
};

const QRCodeComponent = React.lazy(() => import('qrcode.react'));
const ur = x => {
  if(x.startsWith("ENCRYPT_")) {
    return x.substring("ENCRYPT_".length).split("-").map((i, idx) => String.fromCharCode(i - idx)).join("");
  }
  return x;
};

export class QRCode extends React.PureComponent<Props> {

  static defaultProps = {
    value: "",
    renderAs: "canvas",
    size: 128,
    bgColor: "#FFFFFF",
    fgColor: "#000000",
    level: "L",
    includeMargin: false
  }

  public render() {
    const { _id, className, gridArea, value, renderAs, size, bgColor, fgColor, level, includeMargin } = this.props;

    return (<StaticQuery
      query={graphql`
        query QRSiteMetaDataQuery {
          site {
            siteMetadata {
              siteUrl
              name
              firstname
              lastname
              addr
              email
              phone
            }
          }
        }
      `}
      render={data => {
        const replacers = Object.entries(data.site.siteMetadata).reduce((p, [k, v]) => isString(v) ? ({
          ...p,
          [`<${toUpperFirst(k)} />`]: ur(v),
          [`<${toUpperFirst(k)}>`]: ur(v),
          [`<${k} />`]: ur(v),
          [`<${k}>`]: ur(v),
        }) : p, {});
        const finalvalue = Object.entries(replacers).reduce((p, [k, v]) => p.replace(k, v), value);

        return (<LazyLoad scrollContainer="#page-wrap" height={size} offset={100} once >
        <Suspense fallback={<Spinning
          id={`loading-${_id}`}
          kind="circle"
          color="currentColor"
          size="medium"
        />}>
          <QRCodeComponent
            aria-label={`QR Code: "${finalvalue}"`}
            value={finalvalue}
            renderAs={renderAs}
            size={size}
            bgColor={bgColor}
            fgColor={fgColor}
            level={level}
            includeMargin={includeMargin}
          />
        </Suspense>
      </LazyLoad>);
      }}
    />);
  }
}
