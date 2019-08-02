import React from 'react';
import styled from 'styled-components';
import { AnnounceContext, Box, Button } from "grommet";
import LazyLoad from 'react-lazyload';
import { once } from "ramda";
import Observer from '@researchgate/react-intersection-observer';
import { Spinning } from 'grommet-controls';
import debounceRender from 'react-debounce-render';
import metadata from "grommet-icons/metadata";
import { forceCheck } from 'react-lazyload';

export const uiSchema = {
  objects: {
    items: {
      type: {
        "ui:widget": "list",
        "ui:options": {
          "getList": () => ["Marker", "CircleMarker", "Polyline", "Polygon", "Rectangle"]
        },
        "icon": {
          "ui:widget": "list",
          "ui:options": {
            "getList": () => Object.keys(metadata)
          }
        },
        "color": {
          "ui:widget": "grommet-color"
        },
        "background": {
          "ui:widget": "grommet-color"
        },
        "popup": {
          "ui:widget" : "markdown"
        }
      }
    }
  },
  value: {
    "ui:widget": "textarea"
  }
};

const schema = {
  "title": "componentmap",
  "type": "object",
  "properties": {
    "defaultView": {
      "description": "The initial state of the container. true means open",
      "default": {},
      "type": "object",
      "properties": {
        "lat": {
          "type": "number"
        },
        "lng": {
          "type": "number"
        }
      }
    },
    "defaultZoom": {
      "description": "Default zoom, 1 means zoomed out, 20 means very much zoomed in",
      "type": "number",
      "default": 13,
      "minimum": 1,
      "maximum": 20
    },
    "height": {
      "description": "Height of the map (width is always 100%). Any valid css height",
      "type": "string"
    },
    "objects": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": { "type": "string", "description": "The type of object" },
          "position": {
            "type": "array",
            "description": "A touple of [lat,lng]",
            "items": { "type": "number", "minItems": 2, "maxItems": 2 }
          },
          "icon": { "type": "string", "description": "Applies to Marker: the icon the marker uses" },
          "color": { "type": "string", "description": "Forground color" },
          "background": { "type": "string", "description": "Background color" },
          "size": { "type": "string", "description": "Applies to Marker: Size of the icon. small, medium, large or css-size" },
          "radius": { "type": "number", "description": "Applies to CircleMarker: Radius of the circle", "minimum": 1 },
          "popup": { "type": "string", "description": "Markdown. Adds a popup text to the object, showing on click" },
          "bounds": {
            "type": "array",
            "description": "Pairs of points (touples) fencing the object",
            "items": {
              "type": "array",
              "items": {
                "type": "number",
                "minItems": 2,
                "maxItems": 2
              }
            }
          }
        }
      }
    }
  }
};


const importComponent = (cb) => import('./MapComponent').then(c => cb(c.default));

const Tmp = (props) => {
  const {
    _id,
    defaultView,
  } = props;

  if(!defaultView) {
    console.warn("Mandatory props defaultView not found", defaultView, props)
  }

  const Placeholder = () => <div aria-label="Loading Map"><Spinning
    id={`loading-${_id}`}
    kind="circle"
    color="currentColor"
    size="medium"
  /></div>;
  // We Wrap the Component to avoid react doing reducer magic
  const [{ Component }, setContent] = React.useState({ Component: Placeholder });

  const f = event => {
    return Placeholder === Component && event.isIntersecting && importComponent(Component => setContent({
      Component: debounceRender(props => (<AnnounceContext.Consumer>
        {announce => {
          forceCheck();
          announce(
            "Map loaded",
            "polite",
            2000
          );
          return <Component {...props} defaultView={[defaultView?.lat, defaultView?.lng]} />;
        }}
      </AnnounceContext.Consumer>))
    }));
  };

  return (<Observer root={document.querySelector(".Pane.horizontal.Pane2") || document.querySelector("#page-wrap")} key={_id} onChange={f}>
    <div><Component {...props} /></div>
  </Observer>);
};

//
export const Map = props => <Tmp {...props} />;
Map.defaultProps = {
  defaultView: {
    lat: -35.308479,
    lng: 149.124400
  },
  defaultZoom: 13,
  height: "400px",
  objects: []
};
