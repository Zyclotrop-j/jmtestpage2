import React from 'react';
import { Spinning } from 'grommet-controls';

export const uiSchema = {
  color: {
    "ui:widget": "gromet-color"
  }
};

const schema = {
  "kind": {
    "enum": [
      "circle",
      "pulse",
      "threebounce",
      "cube-grid",
      "wave",
      "foldingcube",
      "doublebounce",
      "wanderingcubes",
      "chasingdots",
      "rotatingplane",
    ],
    "description": "Animation of the spinner"
  },
  "color": {
    "description": "Choose a (theme-) color.",
    "type": "string",
    "ui:widget": "grommet-color"
  },
  "size": {
    "type": "string",
    "description": "size of the spinner: xsmall, small, medium, large, xlarge"
  }
};

const typeMap = {
  circle: "circle",
  pulse: "pulse",
  threebounce: "three-bounce",
  cubegrid: "cube-grid",
  wave: "wave",
  foldingcube: "folding-cube",
  doublebounce: "double-bounce",
  wanderingcubes: "wandering-cubes",
  chasingdots: "chasing-dots",
  rotatingplane: "rotating-plane",
};

export class Spinner extends React.PureComponent<Props> {

  static defaultProps = {
    kind: "circle",
    color: "currentColor",
    size: "medium"
  }

  public render() {
    const {
      _id,
      kind,
      color,
      size,
      className
    } = this.props;

    return (
      <Spinning
        id={_id}
        className={className}
        kind={typeMap[kind.toLowerCase()] || "circle"}
        color={color}
        size={size}
      />
    );
  }
}
