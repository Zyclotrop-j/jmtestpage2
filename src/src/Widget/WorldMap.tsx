import React from 'react';
import styled from 'styled-components';
import { WorldMap as GWorldMap } from "grommet";
import { getGlobalAction } from "../utils/globalActions";

interface Props {}

export const uiSchema = {
  continents: {
    items: {
      name: {
        "ui:widget": "list",
        "ui:options": {
          "getList": () => ["Africa", "Asia", "Australia", "Europe", "North America", "South America"]
        }
      }
    }
  }
};

const schema = {
  "title": "componentworldmap",
  "type": "object",
  "properties": {
    "a11yTitle": {
      "description": "Custom title to be used by screen readers.",
      "default": "World map",
      "type": "string"
    },
    "color": {
      "description": "Main color of the map",
      "default": "World map",
      "type": "string",
      "ui:widget": "grommet-color"
    },
    "continents": {
      "description": "Continent details.",
      "default": [],
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "color": {
            "type": "string",
            "description": "The color of that continent",
            "ui:widget": "grommet-color"
          },
          "name": {
            "type": "string",
            "description": "Any of Africa, Asia, Australia, Europe, North America, South America"
          },
          "onClick": {
            "type": "string",
            "description": "What happens when you click that continent",
            "ui:widget": "pageaction"
          }
        }
      }
    },
    "hoverColor": {
      "description": "Main color of the map",
      "default": "World map",
      "type": "string",
      "ui:widget": "grommet-color"
    },
    "places": {
      "description": "Continent details.",
      "default": [],
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "color": {
            "type": "string",
            "description": "The color of that dot where that place is",
            "ui:widget": "grommet-color"
          },
          "name": {
            "type": "string",
            "description": "Name of the place, e.g Sydney"
          },
          "onClick": {
            "type": "string",
            "description": "What happens when you click that place",
            "ui:widget": "pageaction"
          },
          "location": {
            "description": "location of that place as 'lat,lng', eg '-33.8830555556, 151.216666667'",
            "type": "string"
          }
        }
      }
    }
  }
};

const latlng = /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/;
const continentNames = [
  "Africa",
  "Asia",
  "Australia",
  "Europe",
  "North America",
  "South America"
];

export class WorldMap extends React.PureComponent<Props> {

  public render() {
    const {
      a11yTitle,
      color,
      continents,
      hoverColor,
      places,
      _id,
      gridArea,
      alignSelf
    } = this.props;

    return (<GWorldMap
      gridArea={gridArea}
      alignSelf={alignSelf}
      a11yTitle={a11yTitle}
      color={color}
      hoverColor={hoverColor}
      continents={continents.filter(({ name }) => continentNames.includes(name)).map(({
        name,
        color,
        onClick
      }) => ({
        name,
        color,
        onClick: getGlobalAction(onClick)
      }))}
      places={places.filter(({ location }) =>
        location.split(",").length === 2 &&
        latlng.test(location)
      ).map(({
        name,
        color,
        onClick,
        location
      }) => ({
        name,
        color,
        onClick: getGlobalAction(onClick),
        location: location.split(",").map(i => i.trim())
      }))}
    />);
  }
}

WorldMap.defaultProps = {
  "a11yTitle": "",
  "color": "",
  "hoverColor": "",
  "continents": [{
    "color": "light-1",
    "name": "Australia",
    "onClick": ""
  }, {
    "color": "light-2",
    "name": "Europe",
    "onClick": ""
  }],
  "places": [{
    "color": "accent-1",
    "name": "Sydney",
    "onClick": "",
    "location": "-33.8830555556, 151.216666667"
  }]
};
