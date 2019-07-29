import React from 'react';
import styled from 'styled-components';
import { load } from 'recaptcha-v3'
import { Form, FormField, TextInput, TextArea, Button, MaskedInput } from "grommet";
import { Spinning } from 'grommet-controls';
import { tryCatch, identity } from "ramda";
import { StatusGood, Alert } from "grommet-icons";
import { OutboundLink } from 'gatsby-plugin-gtag';

interface Props {}

export const uiSchema = {
  to: {
    "ui:widget": "EncryptedEmail"
  }
};

const schema = {
  "title": "componentcontactform",
  "type": "object",
  "properties": {
    "receipiant": {
      "description": "Your name - will be displayed as receipiant of this form",
      "default": "",
      "type": "string"
    },
    "to": {
      "description": "Your email - will be encrypted and never be displayed client-side",
      "pattern": "^[^@]*$",
      "type": "string"
    },
    "text": {
      "description": "Will be appended to the email",
      "default": "",
      "type": "string"
    }
  }
};

const parseResult = tryCatch(result => JSON.parse(JSON.parse(result).data), identity);
const internationalCodes = [
  "+93",
  "+355",
  "+213",
  "+376",
  "+244",
  "+54",
  "+374",
  "+297",
  "+247",
  "+61",
  "+672",
  "+43",
  "+994",
  "+973",
  "+880",
  "+375",
  "+32",
  "+501",
  "+229",
  "+975",
  "+591",
  "+387",
  "+267",
  "+55",
  "+246",
  "+673",
  "+359",
  "+226",
  "+257",
  "+238",
  "+855",
  "+237",
  "+1",
  "+236",
  "+235",
  "+64",
  "+56",
  "+86",
  "+57",
  "+269",
  "+242",
  "+243",
  "+682",
  "+506",
  "+225",
  "+385",
  "+53",
  "+357",
  "+420",
  "+45",
  "+246",
  "+253",
  "+56",
  "+593",
  "+20",
  "+503",
  "+240",
  "+291",
  "+372",
  "+268",
  "+251",
  "+500",
  "+298",
  "+679",
  "+358",
  "+33",
  "+596",
  "+594",
  "+689",
  "+241",
  "+220",
  "+995",
  "+49",
  "+233",
  "+350",
  "+881",
  "+30",
  "+299",
  "+590",
  "+502",
  "+224",
  "+245",
  "+592",
  "+509",
  "+504",
  "+852",
  "+36",
  "+354",
  "+91",
  "+62",
  "+870",
  "+800",
  "+882",
  "+883",
  "+979",
  "+808",
  "+98",
  "+964",
  "+353",
  "+972",
  "+39",
  "+81",
  "+962",
  "+254",
  "+686",
  "+850",
  "+82",
  "+383",
  "+965",
  "+996",
  "+856",
  "+371",
  "+961",
  "+266",
  "+231",
  "+218",
  "+423",
  "+370",
  "+352",
  "+853",
  "+261",
  "+265",
  "+60",
  "+960",
  "+223",
  "+356",
  "+692",
  "+596",
  "+222",
  "+230",
  "+52",
  "+691",
  "+373",
  "+377",
  "+976",
  "+382",
  "+212",
  "+258",
  "+95",
  "+264",
  "+674",
  "+977",
  "+31",
  "+687",
  "+64",
  "+505",
  "+227",
  "+234",
  "+683",
  "+389",
  "+47",
  "+968",
  "+92",
  "+680",
  "+970",
  "+507",
  "+675",
  "+595",
  "+51",
  "+63",
  "+64",
  "+48",
  "+351",
  "+974",
  "+262",
  "+40",
  "+7",
  "+250",
  "+590",
  "+290",
  "+590",
  "+508",
  "+685",
  "+378",
  "+239",
  "+966",
  "+221",
  "+381",
  "+248",
  "+232",
  "+65",
  "+421",
  "+386",
  "+677",
  "+252",
  "+27",
  "+500",
  "+211",
  "+34",
  "+94",
  "+249",
  "+597",
  "+46",
  "+41",
  "+963",
  "+886",
  "+992",
  "+255",
  "+888",
  "+66",
  "+670",
  "+228",
  "+690",
  "+676",
  "+216",
  "+90",
  "+993",
  "+688",
  "+256",
  "+380",
  "+971",
  "+44",
  "+1",
  "+878",
  "+598",
  "+998",
  "+678",
  "+379",
  "+58",
  "+84",
  "+681",
  "+967",
  "+260",
  "+263"
].map(i => i.substring(1));


export class ContactForm extends React.PureComponent<Props> {

  public constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.validate = this.validate.bind(this);
  }

  state = {
    result: "",
    loading: false,
    submitted: false
  };

  private static async sendMail({
    _id,
    to,
    subject,
    body,
    from,
    customer,
    domain,
    html
  }, cb) {
    const key = "6Lc6_Z0UAAAAAN2uttOYGZfmXntCLxW_y5S22sKd";
    try {
      const recaptcha = await load(key, {
        useRecaptchaNet: true,
        autoHideBadge: true
      });
      const token = await recaptcha.execute(`contactform`);
      const req = await fetch(
        `https://script.google.com/macros/s/AKfycbwAj7072jfxikYraJ7KYTTXBzQBDjlG42rsPg-4bFnagzRChJy8/exec?response=${token}&callback=&callbacke=`,
          {
              redirect: "follow",
              method: "POST",
              headers: {
                  'Content-Type': 'text/plain'
              },
      		    mode: "cors",
              body: JSON.stringify({
                operation: "send",
                data: to,
                subject: subject,
                text: body,
                from: from,
                tags: customer,
                html: html
              })
      });
      const res = await req.text();
      cb(null, res);
    } catch(e) {
      cb(null, e);
    }
  }

  public onSubmit() {
    this.setState({ loading: true, error: null, result: null });

    const f = (error, result) => {
      if(error) {
        return this.setState({
          error,
          submitted: true,
          loading: false
        });
      }
      const now = Date.now();
      localStorage.setItem(`contact-${this.props._id}-lastSubmission`, now);
      return this.setState({
        result,
        submitted: true,
        loading: false,
        lastSubmission: now
      });
    };
    ContactForm.sendMail({
      _id: this.props._id,
      to: this.props.to,
      subject: `New Contact Request | "${this.state.subject}"`,
      body: `
        # New Contact Request

        Name: "${this.state.name}"
        Email: "${this.state.from}"
        ${this.state.phone ? `Phone: "${this.state.phone}"`: ""}
        ${this.state.reach ? `Contact via: "${this.state.reach}"`: ""}

        ----------------------------
        ${this.state.subject}
        ${this.state.body}

        ----------------------------
        ${this.props.text}

        Form submitted at ${(new Date()).toISOString()}

        You are receiving this message, because of your website's contact form (${window.location}).
        All the content of this form is unfiltered, usergenerated.
        Please be reminded to safeguard the personal details this email contains.
        To discontinue receiving contact requests please contact websites.mingram.net.
      `,
      html: `
      <!doctype html>
      <html>
      <head>
      </head>
      <body>
        <h1>New Contact Request</h1>
        <br />
        <h2>Contact Details</h2>
        <dl>
        <dt>Name: </dt><dd><b>${this.state.name}</b></dd>
        <dt>Email: </dt><dd><b><a href="mailto:${this.state.from}"></a></b></dd>
        ${this.state.phone ? `<dt>Phone: </dt><dd><b><a href="tel:${this.state.phone}"></a></b></dd>`: ""}
        ${this.state.reach ? `<dt>Contact via: </dt><dd>${this.state.reach}</dd>`: ""}
        </dl>
        <br />
        <hr />
        <h2>Message</h2>
        <h3>${this.state.subject}</h3><br />
        <p>${this.state.body}</p><br />
        <br /><br />
        <p>${this.props.text}</p>
        <p>Form was submitted at ${(new Date()).toISOString()}</p>
        <p><small>
          You are receiving this message, because of your website's contact form (${window.location}).
          All the content of this form is unfiltered, usergenerated.
          Please be reminded to safeguard the personal details this email contains.
          To discontinue receiving contact requests please contact websites.mingram.net.
        </small></p>
      </body>
      </html>
      `,
      from: this.state.from,
      customer: this.props.customer || "demo" // to do: extract from website
    }, f);
  }

  public componentDidMount() {
    const previousSubmission = localStorage.getItem(`contact-${this.props._id}-lastSubmission`);
    this.setState({
      lastSubmission: previousSubmission
    });
  }

  public validate() {
    if(!this.state.subject) {
      return false;
    }
    if(!this.state.body) {
      return false;
    }
    if(!this.state.name) {
      return false;
    }
    const emailregex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
    if(!this.state.from || this.state.from.length < 5 || !emailregex.test(this.state.from)) {
      return false;
    }
    return true;
  }

  public render() {
    const {
      _id,
      to,
      text,
      receipiant
    } = this.props;

    console.log("THIS:PROPS", this.props, this);

    const setValue = field => event => this.setState({
      [field]: event.target.value
    });

    const lastSubmission = this.state.lastSubmission;
    if(lastSubmission && (Date.now() - lastSubmission) < (1000 * 60 * 60 * 12)) {
      return (<div>
        <StatusGood color='status-ok' size='xlarge' />
        <p>Your request was successfully submitted</p>
        <pre hidden style={{ display: "none" }} aria-hidden >{this.state.result}</pre>
      </div>);
    }

    if(this.state.submitted && !this.state.loading && this.state.error) {
      return (<div>
        <Alert color='status-error' size='xlarge' />
        <p>Something went wrong.</p>
        <Button label="Retry" onClick={() => {
          this.setState({
            error: null,
            result: null,
            loading: true,
            submitted: false
          });
          window.setTimeout(this.onSubmit, 500);
        }} />
        <pre>{this.state.error}</pre>
      </div>);
    }
    if(this.state.submitted && !this.state.loading) {

      return (<div>
        <StatusGood color='success' size='xlarge' />
        <p>Yor request was successfully submitted</p>
        <pre>{parseResult(this.state.result).id}</pre>
      </div>);
    }

    const req = <span aria-label="required field">{" "}*</span>;
    return (<div>
      {this.state.submitted}
      <Form onSubmit={this.onSubmit}>
        <FormField htmlFor={`${_id}-email`} aria-required label={<>Your email{req}</>}>
          <MaskedInput
            id={`${_id}-email`}
            placeholder="JonDoe@email.com"
            value={this.state.from}
            onChange={setValue("from")}
            mask={[
              {
                regexp: /^([a-z0-9.!#$%&'*+/=?^_`{|}~-])+$/
              },
              { fixed: '@' },
              {
                regexp: /^[a-z0-9-.]+$/
              }
            ]}
          />
        </FormField>
        <FormField htmlFor={`${_id}-name`} aria-required label={<>Your name{req}</>}>
          <TextInput
            id={`${_id}-name`}
            placeholder="Jon Doe"
            value={this.state.name}
            onChange={setValue("name")}
          />
        </FormField>
        <FormField htmlFor={`${_id}-phone`} label="Leave your phone if you like">
          <MaskedInput
            id={`${_id}-phone`}
            placeholder="+ 1 123456 78901234"
            value={this.state.phone}
            onChange={setValue("phone")}
            mask={[
              { fixed: '+' },
              {
                options: internationalCodes
              },
              { fixed: ' ' },
              {
                regexp: /^[ 0-9]{0,4}$/
              },
              { fixed: ' ' },
              {
                regexp: /^[ 0-9]{0,6}$/
              },
              { fixed: ' ' },
              {
                regexp: /^[ 0-9]*$/
              }
            ]}
          />
        </FormField>
        <FormField htmlFor={`${_id}-reach`} label="Other good ways to reach you?">
          <TextInput
            id={`${_id}-reach`}
            placeholder=" "
            value={this.state.reach}
            onChange={setValue("reach")}
          />
        </FormField>
        <FormField htmlFor={`${_id}-subject`} aria-required label={<>Subject{req}</>}>
          <TextInput
            id={`${_id}-subject`}
            placeholder=" "
            value={this.state.subject}
            onChange={setValue("subject")}
          />
        </FormField>
        <FormField htmlFor={`${_id}-body`} aria-required label={<>Your message{req}</>}>
          <TextArea
            id={`${_id}-body`}
            placeholder="Leave a message"
            value={this.state.body}
            onChange={setValue("body")}
            resize="vertical"
            size="large"
          />
        </FormField>
        <div aria-hidden >* = required</div>
        {this.state.loading && <Spinning
          id={`loading-${_id}`}
          kind="circle"
          color="currentColor"
          size="medium"
        />}
        <small>
          Your message is emailed directly to {receipiant}.
          The content of this message remains between you and the receipiant.
          Meta-data of this message may be logged for technical and accounting purposes.
          <br /><br />
          This form relies on reCAPTCHA to prevent spam and bots.<br />
          This site is protected by reCAPTCHA and the Google{" "}
          <OutboundLink rel="noreferrer nofollow noopener" href="https://policies.google.com/privacy">Privacy Policy</OutboundLink> and{" "}
          <OutboundLink rel="noreferrer nofollow noopener" href="https://policies.google.com/terms">Terms of Service</OutboundLink> apply.
        </small>
        <br />
        <Button type="submit" primary label="Submit" disabled={!this.validate() || this.state.loading || !to} />
      </Form>
    </div>);
  }
}
