import React, { Suspense } from 'react';
import styled from 'styled-components';
import LazyLoad from 'react-lazyload';
import { Spinning } from 'grommet-controls';

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

    return (<LazyLoad scrollContainer="#page-wrap" height={size} offset={100} once >
      <Suspense fallback={<Spinning
        id={`loading-${_id}`}
        kind="circle"
        color="currentColor"
        size="medium"
      />}>
        <QRCodeComponent
          aria-label={`QR Code: "${value}"`}
          value={value}
          renderAs={renderAs}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level={level}
          includeMargin={includeMargin}
        />
      </Suspense>
    </LazyLoad>);
  }
}
