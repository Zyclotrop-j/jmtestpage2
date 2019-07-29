import React from 'react';
import styled from 'styled-components';
import { Box } from "grommet";
import { RichText } from "./RichText";
import {
    Map as LeafletMap,
    Marker,
    Popup,
    Circle,
    CircleMarker,
    Polygon,
    Polyline,
    Rectangle,
    TileLayer,
    ZoomControl
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ReactDOMServer from 'react-dom/server';
import * as icons from 'grommet-icons';
import Leaflet from 'leaflet';
import "leaflet/dist/images/marker-icon-2x.png"
import "leaflet/dist/images/marker-icon.png"
import "leaflet/dist/images/marker-shadow.png"
import "leaflet/dist/images/layers-2x.png"
import "leaflet/dist/images/layers.png"
Leaflet.Icon.Default.imagePath = "/";

const StyledBox = styled(Box)`
  position: relative;
  z-index: 0;
`;
const StyledCMap = styled(LeafletMap)`
  height: ${props => props.height};
  width: 100%;
`;

export default props => {
  const {
    _id,
    defaultView,
    defaultZoom,
    height = "400px",
    objects,
    gridArea,
    className,
  } = props;

  const DEFAULT_VIEWPORT = {
    center: defaultView || [-25.8446101, 125.7002782],
    zoom: defaultZoom || 4,
  };

  const [viewport, setViewport] = React.useState(DEFAULT_VIEWPORT);
  const [state , setPosition] = React.useState({
    lat: DEFAULT_VIEWPORT.center[0],
    lng: DEFAULT_VIEWPORT.center[1],
    zoom: DEFAULT_VIEWPORT.zoom,
  });

  const objectmakers = {
    Marker: (props, idx) => {
      const Icon = icons[props.icon];
      const custommarker = Leaflet.divIcon({
        html: ReactDOMServer.renderToStaticMarkup(<Icon color={props.color} size={props.size} />)
      });
      const pageAction = {
        action: `Focus-Map-${_id}-Marker-${props.icon}-${props.position.join("-")}`,
        exec: () => setViewport(props.position)
      };
      return <Marker position={props.position} icon={custommarker}>
        {props.popup && <Popup><RichText
            _id={`${_id}`}
            markdown={props.popup}
            urlescaped={false}
            escaped={false}
            b64={false}
          /></Popup>}
      </Marker>;
    },
    CircleMarker: (props, idx) => (<CircleMarker center={props.position} color={props.color} fillColor={props.background} radius={props.radius}>
      {props.popup && <Popup><RichText
          _id={`${_id}`}
          markdown={props.popup}
          urlescaped={false}
          escaped={false}
          b64={false}
        /></Popup>}
    </CircleMarker>),
    Polyline: (props, idx) => (<Polyline color={props.color} positions={props.bounds} fillColor={props.background}>
      {props.popup && <Popup><RichText
          _id={`${_id}`}
          markdown={props.popup}
          urlescaped={false}
          escaped={false}
          b64={false}
        /></Popup>}
    </Polyline>),
    Polygon: (props, idx) => (<Polygon color={props.color} positions={props.bounds} fillColor={props.background}>
      {props.popup && <Popup><RichText
          _id={`${_id}`}
          markdown={props.popup}
          urlescaped={false}
          escaped={false}
          b64={false}
        /></Popup>}
    </Polygon>),
    Rectangle: (props, idx) => (<Rectangle color={props.color} bounds={props.bounds} fillColor={props.background}>
      {props.popup && <Popup><RichText
          _id={`${_id}`}
          markdown={props.popup}
          urlescaped={false}
          escaped={false}
          b64={false}
        /></Popup>}
    </Rectangle>)
  };

  return <StyledBox plain gridArea={gridArea} className={className}>
      <StyledCMap
        height={height}
        center={[state.lat, state.lng]}
        zoom={state.zoom}
        onViewportChanged={setViewport}
        viewport={viewport}
        animate={!window?.matchMedia("(prefers-reduced-motion: reduce)")?.matches}
      >
        <TileLayer
          attribution='&copy; <a rel="noreferrer nofollow noopener" referrerpolicy="no-referrer" href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        {objects.map((i, idx) => objectmakers[i.type](i, idx))}
    </StyledCMap>
  </StyledBox>;
};
