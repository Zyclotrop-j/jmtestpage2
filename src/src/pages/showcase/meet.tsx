import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'gatsby';
import { Anchor, Form, Button, Paragraph, TextInput, FormField, TextArea, Heading } from 'grommet';
import { once } from "ramda";
import { Layout, Wrapper, Header, Button as CButton, Content, SectionTitle } from '../../components';

import config from '../../../config/SiteConfig';
import PageProps from '../../models/PageProps';

const key = "AIzaSyB-mLSM-qZv3x9uOGFuI5UvBFfzvJZPOZY";
const sheet = "1OGoGz7wJkQ8uGG_pmuq0LP8FtSqXiPUT7yjY7ZFFBIk";

const loadMaps = once(() => new Promise(res => {
  const node = document.createElement('script');
  const cbname = `map${Date.now()}`;
  window[cbname] = () => {
    res(window.google);
  };
  node.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=${cbname}`;
  node.async = true;
  node.defer = true;
  document.getElementsByTagName('head')[0].appendChild(node);
}))


export default class ContactPage extends React.Component<PageProps> {
  public constructor(props) {
    super(props);
    this.state = {
      form: {}
    };
    this.setValue = this.setValue.bind(this);
    this.send = this.send.bind(this);
  }

  private send() {
    const setValue = this.setValue;
    const getGeolocation = new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition((pos) => {
        const crd = pos.coords;
        console.log('Your current position is:');
        console.log(`Latitude : ${crd.latitude}`);
        console.log(`Longitude: ${crd.longitude}`);
        console.log(`More or less ${crd.accuracy} meters.`);
        this.setValue(`${crd.latitude},${crd.longitude};+-${crd.accuracy}`, "location");
        res(`${crd.latitude},${crd.longitude};+-${crd.accuracy}`);
      }, (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        setValue(`ERROR(${err.code}): ${err.message}`, "error");
        rej(`ERROR(${err.code}): ${err.message}`);
      }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      })
    );
    const myLocation = fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheet}?key=${key}&fields=sheets.data.rowData.values.effectiveValue`)
    .then(i => i.json())
    .then(data => data.sheets[0].data[0].rowData[0].values[0].effectiveValue.stringValue)
    .then(data => JSON.parse("["+data+"]"));
    const form = this.state.form;
    Promise.all([getGeolocation, myLocation, loadMaps()])
    .then(([geolocation, myloc, google]) => {
      const directionsService = new google.maps.DirectionsService;
      const directions = new Promise((res, rej) => {
        directionsService.route({
          origin: geolocation.split(";")[0],
          destination: myloc[0],
          travelMode: 'DRIVING'
        }, function(response, status) {
          if (status === 'OK') {
            res(response);
          } else {
            rej({ response, status })
          }
        })
      });
      return Promise.all([geolocation, myloc, directions]);
    })
    .then(([geolocation, myloc, directions]) => Promise.all([fetch("https://hooks.zapier.com/hooks/catch/2584025/a9wh9p/", {
        body: JSON.stringify({
          name: form.name,
          message: form.message,
          contact: form.contact,
          location: `${directions.routes[0].legs[0].start_address} (${geolocation})`,
          mylocation: `${directions.routes[0].legs[0].end_address} (${myloc.join(",")})`,
          distance: directions.routes[0].legs[0].distance.text,
          traveltime: directions.routes[0].legs[0].duration.text,
          mapslink: "https://www.google.com/maps/dir/?api=1&" + Object.entries({
            origin: encodeURIComponent(myloc.join(",")),
            origin_place_id: directions.geocoded_waypoints[1].place_id,
            destination: encodeURIComponent(geolocation),
            destination_place_id: directions.geocoded_waypoints[0].place_id
          }).reduce((p, [k, v]) => `${p}&${k}=${v}`, ""),
          mapspicture: "https://maps.googleapis.com/maps/api/staticmap?zoom=14&size=200x200&center="+encodeURIComponent(geolocation)
        }), // must match 'Content-Type' header
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, same-origin, *omit
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // *client, no-referrer
      }), "https://www.google.com/maps/dir/?api=1&" + Object.entries({
          origin: encodeURIComponent(myloc.join(",")),
          origin_place_id: directions.geocoded_waypoints[1].place_id,
          destination: encodeURIComponent(geolocation),
          destination_place_id: directions.geocoded_waypoints[0].place_id
        }).reduce((p, [k, v]) => `${p}&${k}=${v}`, ""),
        geolocation,
        directions
      ]))
      .then(([response, url, geolocation, directions]) => Promise.all([response.json(), url, geolocation, directions]))
      .then(([i, url, geolocation, directions]) => Promise.all([i, geolocation, myLocation, url, directions]))
      .then(([i, your, mine, url, directions]) => {
        console.log([i, your, mine, url, directions]);
        setValue({
          url,
          location: `${directions.routes[0].legs[0].start_address}`,
          mylocation: `${directions.routes[0].legs[0].end_address}`,
          distance: directions.routes[0].legs[0].distance.text,
          traveltime: directions.routes[0].legs[0].duration.text,
          copyrights: directions.routes[0].copyrights,
          seconds: directions.routes[0].legs[0].duration.value,
        }, "success");
      });
  }

  private setValue(data, field) {
    this.setState({ form: {
      ...this.state.form,
      [field]: data
    } });
  }

  public render() {
    const setValue = this.setValue;
    return (
      <>
        <Helmet title={`Meet | ${config.siteTitle}`} />
        <Header>
          <Anchor as={Link} href="/" to="/" state={{ toHome: true }}>
            {config.siteTitle}
          </Anchor>
          <SectionTitle uppercase={true}>Meet</SectionTitle>
        </Header>
        <Wrapper>
          <Content>
            {this.state.form.success ? <Paragraph margin="none">
              {this.state.form.success.seconds < 60 * 60 ? <>
                <Heading level={3}>Let's meet!</Heading><br />
                You seem to be close to <b>{this.state.form.success.location}</b> while
                I am near <b>{this.state.form.success.mylocation}</b> - which is about <b>{this.state.form.success.traveltime} ({this.state.form.success.distance})</b>
                away from each other. <a href={this.state.form.success.url}>Show me on Google Maps!</a><br />
              </> : <><Heading level={3}>Reach out!</Heading><br />
                It looks like it'd take longer than 1 hour ({this.state.form.success.traveltime} or {this.state.form.success.distance} to be exact) to meet up.
                <Anchor as={Link} href="/contact" to="/contact">
                  Contact me nevertheless!
                </Anchor><br />
              </>}
              <img src="/assets/powered_by_google_on_white.png" alt="powered by Google" />
            </Paragraph> : <Form errors={this.state.form.error} onSubmit={this.send}>
              <FormField label="What's your name?" >
                <TextInput
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={this.state.form.name || ""}
                  onChange={event => setValue(event.target.value, "name")}
                />
              </FormField>
              <FormField name="contact" label="How can I reach you?" >
                <TextInput
                  id="contact"
                  name="contact"
                  placeholder="Phone, Messenger, Email?"
                  value={this.state.form.contact || ""}
                  onChange={event => setValue(event.target.value, "contact")}
                  />
              </FormField>
              <FormField name="message" label="Leave me a message!" >
                <TextArea
                  id="message"
                  name="message"
                  placeholder="Your message"
                  value={this.state.form.message || ""}
                  onChange={event => setValue(event.target.value, "message")}
                />
              </FormField>
              <FormField name="location" label="Your location" >
                <TextInput
                  disabled
                  id="location"
                  name="location"
                  placeholder="Will be autofilled on submit"
                  value={this.state.form.location || ""}
                />
              </FormField>
              <p>
                <Heading level={3}>What will happen on pressing submit?</Heading><br />
                <ul>
                  <li>Your browser will ask you to allow the site to read <b>your geoposition</b>.</li>
                  <li>Afterwards the browser will load <b>my geoposition</b>.</li>
                  <li>Both will be send to the <b>google-maps api</b> to calculate the best way to get to each other.</li>
                  <li>All this data together with the data you entered will be <b>storred in a spreadsheet in my google drive</b> and</li>
                  <li><b>I am notified</b> on my phone that the spreadsheet was edited (it might take some minutes until the change is picked up).</li>
                  <li><b>You are shown the distance and time</b> between us together with <b>a link to start the navigation</b> using google maps.</li>
                </ul>
                With our positions and distance been exchanged, we can go forward and decide if we want to meet up.
                The data you enter will only be used for this purpose and
                I will delete the spread-sheet entry as we've clarified how to move forward.
                <br />As per Directions API Policies:<br />
                This site currently does not have Terms of Use or a Privacy Policy. Nevertheless be made aware that:<br />
                Using this application application (the meetup functionality), users (you) are bound by <a href="https://www.google.com/intl/en/policies/terms">Google’s Terms of Service</a>.<br />
                This application (the meetup functionality) uses Google Maps APIs and which adhere to <a href="https://www.google.com/policies/privacy">Google Privacy Policy</a>.
              </p>
              <Button type="submit" primary label="Submit" />
            </Form>}
          </Content>
        </Wrapper>
      </>
    );
  }
}
