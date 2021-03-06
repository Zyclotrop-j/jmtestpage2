import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Image, Carousel, Text, Box, Heading, Button, CheckBox, RadioButtonGroup, RangeInput, Select, TextInput, TextArea, ThemeContext } from 'grommet';
import { EmailInput, DateInput, ColorInput, PasswordInput, NumberInput, Colors } from 'grommet-controls';
import { Close, Search } from 'grommet-icons';
import chroma from "chroma-js";
import { when } from "mobx";
import { omit, map, compose, pipe, identity, tryCatch, dissocPath, hasPath, has, max, mergeDeepRight, mergeDeepLeft, memoizeWith, once } from "ramda";
import { noop } from 'ramda-adjunct';
import { observer } from 'mobx-react';
import Fuse from 'fuse.js';
import Unsplash, { toJson } from 'unsplash-js';
import { debounce } from "lodash";
import Form from 'react-jsonschema-form';
import debounceRender from 'react-debounce-render';
import MarkdownPreview from './MarkdownInput';
import { auth } from "../utils/auth";
import { request } from "../state/components";
import { uiSchema } from '../Widget';
import { Modal } from '../components/Modal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { IconChoose } from './IconChooser';
import { getGlobalAction } from "../utils/globalActions";

const dofetch = once(() => fetch("https://zcmsapi.herokuapp.com/api/v1/clientsidesecret", {
  cache: "no-cache",
  headers: {
    "authorization": `Bearer ${auth.idToken}`,
  }
}).then(i => i.json()));
const unsplash = new Promise((res, rej) => {
  when(() => auth.idToken).then(function(change) {
    dofetch().then(i => new Unsplash({
      applicationId: i.data.find(i => i.title === "unsplashaccess").secret,
      secret: i.data.find(i => i.title === "unsplashsecret").secret,
    })).then(i => res(i));
  });
});
const createemail = new Promise((res, rej) => {
  when(() => auth.idToken).then(function(change) {
    dofetch().then(i => ({
      createemail: i.data.find(i => i.title === "createemail").secret,
    })).then(i => res(i));
  });
});

const TransformInput = ({
  value,
  required,
  disabled,
  readonly,
  onChange,
  onBlur,
  onFocus,
  options,
  schema,
}) => {

  const transformations = {
    urlescaped: i => encodeURIComponent(i),
    b64: i => window.btoa(i),
  };
  const backtransformations = {
    urlescaped: tryCatch(decodeURIComponent, identity),
    b64: tryCatch(window.atob, identity)
  };
  const apfuncsTo = options.transform.map(i => transformations[i]);
  const apfuncsFrom = options.transform.map(i => backtransformations[i]);
  const toVal = compose(...apfuncsTo);
  const fromVal = pipe(...apfuncsFrom);

  return (<TextInput
    placeholder={schema.title}
    value={fromVal(value || "")}
    onBlur={onBlur}
    onFocus={onFocus}
    required={required}
    disabled={disabled || readonly}
    onChange={event => {
      return onChange(toVal(event.target.value));
    }}
  />);
};

const ConstantInput = ({
  value,
  onChange,
  options,
}) => {
  if(value !== options.constant) {
    // If sync, the change sometimes doesn't pick up :(
    window.setTimeout(() => onChange(options.constant), 1);
  }
  return <Text as="code" margin="small" weight="bold">{JSON.stringify(value, null, "  ")}</Text>;
};

const ListChoose = ({
  value,
  onChange,
  options,
  onBlur,
  onFocus,
  ...props
}) => {
  const xoptions = options.getList();
  return (<Select
    {...props}
    value={value}
    onBlur={onBlur && (event => onBlur(event.value))}
    onFocus={onFocus && (event => onFocus(event.value))}
    onChange={event => onChange(event?.value?.value || event?.value)}
    options={xoptions}
  />);
};

const TextWidgetHelper = ({ value, isValidId, onSelect, getSuggestions, schema, descField, ...props }) => {
  const [rawsuggestions, setSuggestions] = React.useState([]);
  const filter = (event => {
    setSuggestions(getSuggestions(event.target.value));
    onSelect(event.target.value);
  });
  const availFormatted = rawsuggestions.map(i => ({ label: `${i.title} (${i._id}): ${i[descField] || ""}`, value: i._id }));
  const suggestions = [
    ...availFormatted,
    {
      label: `New ${schema["x-$ref"]}`,
      value: `___NEW_${schema["x-$ref"]}`
    }
  ];
  const onSelectFn = (event) => {
    onSelect(event.suggestion.value);
  };
  const chooseFallback = () => {
    if(isValidId(value)) return;
    onSelect(rawsuggestions[0]?._id);
  };
  return <TextInput {...props} value={value} onSuggestionsClose={chooseFallback} onChange={filter} onSelect={onSelectFn} suggestions={suggestions} />;
};
const TextWidget = ({ onChange, schema, registry, value, ...props }) => {
  if(schema["x-$ref"] && registry.formContext?.allComponents) {
    // "componentgroup"
    // observer

    const [ddata, setData] = useState(null);
    useEffect(() => {
      if(!schema["x-$ref"].startsWith("component") && !ddata) {
        request(`https://zcmsapi.herokuapp.com/api/v1/${schema["x-$ref"]}`)
          .then(i => i.json())
          .then(i => i.data)
          .then(data => setData(data));
      }
    });

    const optioncomponents = Array.from(ddata || registry.formContext.allComponents?.values() || []);
    const descFields = ["description", "groupdesc"];
    const descfield = descFields.find(i => has(i, optioncomponents[0] || {})) || descFields[0];

    const options = {
      keys: [{
        name: '_id',
        weight: 0.05
      }, {
        name: 'title',
        weight: 0.45
      }, {
        name: descfield,
        weight: 0.4
      }, {
        name: '_author',
        weight: 0.025
      }, {
        name: '_lastModifiedBy',
        weight: 0.025
      }, {
        name: '_created',
        weight: 0.025
      }, {
        name: '_modified',
        weight: 0.025
      }]
    };
    const availableEntries = optioncomponents.filter(i => i["x-type"] === schema["x-$ref"]);
    const isValidId = id => availableEntries.some(i => i._id === id) || id === `___NEW_${schema["x-$ref"]}`;
    const fuse = new Fuse(availableEntries, options);
    return (<>
      <TextWidgetHelper {...props} value={value} isValidId={isValidId} descField={descfield} schema={schema}  onSelect={onChange} getSuggestions={fuse.search.bind(fuse)} />
      <Text>{availableEntries.find(({ _id }) => value === _id)?.title}</Text>
    </>);
  }
  if(schema["ui:widget"] && widgets[schema["ui:widget"]]) {
    const Widget = widgets[schema["ui:widget"]];
    return <Widget onChange={onChange} schema={schema} registry={registry} value={value} {...props} />;
  }
  return <TextInput {...props} value={value} onChange={event => onChange(event.target.value)} />;
};

const assembleColorCode = (theme, fallbacks) => (p, color) => ({
  ...p,
  [color]: theme?.global?.colors[color] || fallbacks[color]
});
const makeColors = (theme, fallbacks) => ({
  transparent: "rgba(255,255,255,0)",
  brand: theme?.global?.colors?.brand || "#7D4CDB",
  ...["dark-1", "accent-1", "neutral-1", "light-1"].reduce(assembleColorCode(theme, fallbacks), {}),
  ...["dark-2", "accent-2", "neutral-2", "light-2"].reduce(assembleColorCode(theme, fallbacks), {}),
  ...["dark-3", "accent-3", "neutral-3", "light-3"].reduce(assembleColorCode(theme, fallbacks), {}),
  ...["dark-4", "accent-4", "neutral-4", "light-4"].reduce(assembleColorCode(theme, fallbacks), {}),
  ...["statuscritical","statusdisabled","statusok","statusunknown","statuswarning"].reduce(assembleColorCode(theme, fallbacks), {}),
  black: theme?.global?.colors.black || "black",
  white: theme?.global?.colors.white || "white",
  ...(theme.palette || []).reduce((p, i) => ({ ...p, [i]: i }), {}),
});

const GrommetColor =  ({ value, onChange, ...props }) => {
  const shapes = theme => (theme.shapes || []).reduce((p, row, rowdx) => ({
    ...p,
    ...row.reduce((p1, arr, arrdx) => ({
      ...p1,
      ...arr.reduce((p2, color) => ({
        ...p2,
        [color]: color
      }), {})
    }), {})
  }), {});
  return (<>
    <Box background={value} pad="small">
      <TextInput value={value} onChange={event => onChange(event.target.value)} />
    </Box>
    <ThemeContext.Consumer>
    {theme => {
      const defaultColors = {
        "accent-1": "#6FFFB0",
        "accent-2": "#FD6FFF",
        "accent-3": "#81FCED",
        "accent-4": "#FFCA58",
        "neutral-1": "#00873D",
        "neutral-2": "#3D138D",
        "neutral-3": "#00739D",
        "neutral-4": "#A2423D",
        "statuscritical": "#FF4040",
        "statuserror": "#FF4040",
        "statuswarning": "#FFAA15",
        "statusok": "#00C781",
        "statusunknown": "#CCCCCC",
        "statusdisabled": "#CCCCCC",
        "light-1": "#F8F8F8",
        "light-2": "#F2F2F2",
        "light-3": "#EDEDED",
        "light-4": "#DADADA",
        "light-5": "#DADADA",
        "light-6": "#DADADA",
        "dark-1": "#333333",
        "dark-2": "#555555",
        "dark-3": "#777777",
        "dark-4": "#999999",
        "dark-5": "#999999",
        "dark-6": "#999999"
      };
      const madeColors = makeColors(theme, defaultColors);
      const cromaobjs = map(x => chroma(x), madeColors);
      return (<Colors
      size='small'
      colors={{
        "4main": madeColors,
        "3alpha5": map(x => x.alpha(0.5).css(), cromaobjs),
        "2alpha1": map(x => x.alpha(0.1).css(), cromaobjs),
        "1alpha8": map(x => x.alpha(0.8).css(), cromaobjs),
      }}
      onSelect={(option) => { onChange(option.colorName) }}
      wrap
      columns={33}
      value={theme?.global?.colors[value] || value}
    />)}}
  </ThemeContext.Consumer></>)
}

class AttributedPicture extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      picContext: {}
    };
  }

  render() {
    const {
      onChange,
      schema,
      formData,
      registry,
      ...rest
    } = this.props;

    const { fields: { ObjectField } } = registry;
    const newschema = {
      ...schema,
      properties: {
        ...omit(["src", "image", "crossorigin"], schema.properties)
      }
    };
    const onContext = (
      context,
      { plattform, plattformname }
    ) => {
      const altSrc = str => `${str.startsWith("url(") ? "" : "url("}${str}${str.endsWith(")") ? "" : ")"}`;
      const picturesByUrl = {
        ...Object.fromEntries(context.map(json => [json.fileUrl || json.urls.full, json])),
        ...Object.fromEntries(context.map(json => [altSrc(json.fileUrl || json.urls.full), json]))
      };
      this.setState({
        plattform,
        plattformname,
        picContext: picturesByUrl
      });
    };
    const onChangeN = data => {
      const copy = mergeDeepLeft({}, formData);
      const imageToUse = this.state.picContext[data];
      const obj = {
        pingback: data,
        src: data,
        image: data,
        author: {
          plattform: this.state.plattform || "",
          plattformname: this.state.plattformname || "",
          name: imageToUse?.user?.name || "",
          username: imageToUse?.user?.username || "",
          profileurl: imageToUse?.user?.links?.html || "",
          portfolio_url: imageToUse?.user?.portfolio_url || ""
        },
        tags: imageToUse?.tags?.map(i => i.title) || [],
        location: {
          city: imageToUse?.location?.city || "",
          country: imageToUse?.location?.country || imageToUse?.user?.location || ""
        },
        width: imageToUse?.width,
        height: imageToUse?.height,
        crossorigin: " ",
        color: imageToUse?.color || "transparent",
        alt: imageToUse?.alt_description || imageToUse?.alt || imageToUse?.description,
        description: formData?.description || imageToUse?.description || imageToUse?.alt || imageToUse?.alt_description,
      };
      unsplash.then(unsplash => {
        tryCatch(unsplash.photos.downloadPhoto.bind(unsplash), () => "Not unspalsh")(imageToUse);
      });
      const newData = mergeDeepLeft(obj, copy);
      onChange(newData);
    };

    return (
      <>
        <ImageInput
          {...this.props}
          onContext={onContext}
          value={formData.src}
          schema={schema.properties.src || schema.properties.image}
          onChange={onChangeN}
        />
        <ObjectField {...this.props} schema={newschema} />
      </>
    );
  }
}

export const fields = {
  attributedpicture: AttributedPicture
};

const fetchOwnPictures = memoizeWith(
  () => Math.floor(Date.now() / 200000), (opts = {}) => request("https://zcmsapi.herokuapp.com/api/v1/remotefile", opts)
  .then(i => i.json())
  .then(i => new Promise(resolve => {
    const all = i.data.map(j => new Promise(res => {
      const url = j.fileUrl;
      const img = new window.Image();
      img.addEventListener("load", () => {
        console.log("Found image", url);
        res(i);
      });
      img.addEventListener("error", () => {
        console.warn("Failed to load image", url);
        res(i);
      });
      img.src = url;
    }));
    Promise.all(all).then(() => resolve(i));
  }))
);

const ImageWidthDimensions = props => {
  const [[x, y], setXY] = useState([0,0]);
  return <>
    <img onLoad={({ target: img }) => setXY([
      img.naturalWidth, img.naturalHeight
    ])} {...props} />
    {`${x} x ${y}`}
  </>
};

const ImageInput = ({ value, onChange: modonChange, onContext: modonContext, schema, ...props }) => {
  const modifiers = ({
    css: str => `${str.startsWith("url(") ? "" : "url("}${str}${str.endsWith(")") ? "" : ")"}`
  }[schema?.["ui:options"]?.type]) || identity;
  const onChange = pipe(modifiers, modonChange);
  const [options, setOptionsx] = React.useState([]);
  const [search, setSearch] = React.useState("");

  const onContext = modonContext || (() => null);
  const setOptions = (data, source) => {
    onContext(data, source);
    return setOptionsx(data);
  };

  const doSearch = () => {
    if(!search.trim()) {
      fetchOwnPictures()
        .then(json => {
          setOptions(json.data, { plattform: "", plattformname: "" });
        });
      return;
    }
    unsplash
      .then(unsplash => unsplash.search.photos(search, 1, 20))
      .then((...args) => {
        console.log("...args", args);
        return toJson(...args);
      })
      .then(json => {
        console.log(json);
        setOptions(json.results, { plattform: "https://unsplash.com", plattformname: "Unsplash" });
        // unsplash.photos.downloadPhoto(json["results"][0]);
      });
    }

    const app_name = "JannesWebsiteEditor";
    const buttonOptions = options.map(json => ({
      label: (<Box>
          <ImageWidthDimensions style={{ maxWidth: 120 }} src={json.fileUrl || json.urls.thumb} alt={json.alt_description || json.description} />
          {json.user && <>
            By <a target="_blank" rel="noreferrer noopener" href={`${json.user?.profileurl}?utm_source=${app_name}&utm_medium=referral`}>{json.user?.name}</a> on <a target="_blank" rel="noreferrer noopener" href={`https://unsplash.com/?utm_source=${app_name}&utm_medium=referral`}>Unsplash</a>
          </>}
        </Box>),
      value: json.id || json._id,
      onClick: () => onChange(json.fileUrl || json.urls.full),
    }));
    return (<>
      <Box direction={search.trim() ? "row" : "column"}>
        <TextInput
          css={`max-width: ${search.trim() ? "auto": "180px"}; transition: max-width 1s;`}
          placeholder="Search Unsplash"
          value={search}
          onChange={event => {
            setSearch(event.target.value);
          }}
        />
        <Button label={search.trim() ? "Search" : "Load your assets"} icon={<Search />} onClick={doSearch} />
      </Box>
      {buttonOptions.map(bprops => <Button
        {...bprops}
      />)}
      <TextInput
        {...props}
        placeholder="Image url"
        value={value}
        onChange={event => onChange(event.target.value)}
      />
    </>);
};

const debouncedChange = debounce((v, onChange) => createemail.then(secret =>
  fetch("https://script.google.com/macros/s/AKfycbwAj7072jfxikYraJ7KYTTXBzQBDjlG42rsPg-4bFnagzRChJy8/exec?callback=&callbacke=", {
    redirect: "follow",
    method: "POST",
    mode: "cors",
    body: JSON.stringify({
      passcode: secret.createemail,
      operation: "encypt",
      data: v
    })
})).then(i => i.text()).then(onChange), 1800, {
  'leading': false,
  'trailing': true,
  'maxWait': 30000
});
const decrypt = debounce((v, onChange) => createemail.then(secret =>
  fetch("https://script.google.com/macros/s/AKfycbwAj7072jfxikYraJ7KYTTXBzQBDjlG42rsPg-4bFnagzRChJy8/exec?callback=&callbacke=", {
    redirect: "follow",
    method: "POST",
    mode: "cors",
    body: JSON.stringify({
      passcode: secret.createemail,
      operation: "decypt",
      data: v
    })
})).then(i => i.text()).then(onChange), 1800, {
  'leading': false,
  'trailing': true,
  'maxWait': 30000
});
const emailregex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

const EncryptedEmail = ({
  value,
  onChange,
  options,
  onBlur,
  onFocus,
  ...props
}) => {
  const [plaintext, setplaintext] = React.useState();
  const [working, setworking] = React.useState(false);
  const [decrypting, setdecrypting] = React.useState(false);
  if(!plaintext && !decrypting) {
    setdecrypting(true);
    decrypt(value, (x) => {
      setplaintext(x);
      setdecrypting(false);
    });
  }

  const valueChanged = (v, event) => {
    if(emailregex.test(v)) {
      debouncedChange(v, q => {
        onChange(q);
        setworking(false);
      });
      setworking(true);
    }
    setplaintext(v);
  };
  return (<>
    <TextInput
      {...props}
      disabled={props.disabled || decrypting}
      placeholder={`Your email${decrypting ? " is being decrypted": ""}`}
      value={plaintext}
      onBlur={onBlur && (event => onBlur(event.value))}
      onFocus={onFocus && (event => onFocus(event.value))}
      onChange={event => valueChanged(event?.target?.value || event?.value, event)}
    />
    <TextInput
      {...props}
      placeholder="Encrypted email"
      readonly
      disabled
      value={working ? "... encrypting ..." : value}
      onBlur={onBlur && (event => onBlur(event.value))}
      onFocus={onFocus && (event => onFocus(event.value))}
      onChange={() => null}
    />
  </>);
};

const MarkdownInput = MarkdownPreview;

const PageAction = ({
  value,
  onChange,
  options,
  onBlur,
  onFocus,
  ...props
}) => {
  const [action, setaction] = React.useState("");
  const [params, setparams] = React.useState([]);
  const [rawparams, setrawparams] = React.useState([]);
  console.log("getGlobalAction.actions", getGlobalAction.actions, getGlobalAction.actionconfigurations);
  return <>
    <Select
      {...props}
      labelKey="key"
      valueKey="value"
      multiple={false}
      onBlur={onBlur && (event => onBlur(event.value))}
      onFocus={onFocus && (event => onFocus(event.value))}
      onChange={event => {
        const v = event?.value?.value || event?.value;
        setaction(v);
        onChange(JSON.stringify([v, ...params]));
      }}
      options={getGlobalAction.actions.map(i => ({ key: i, value: i })).concat([{key: "None", value: ""}])}
      value={action}
    />
    <pre>{JSON.stringify(getGlobalAction.actionconfigurations[action]?.params)}</pre>
    <TextArea
      {...props}
      resize="vertical"
      placeholder="Enter the parameters described above as JSON"
      value={rawparams}
      onBlur={onBlur && (event => onBlur(event.value))}
      onFocus={onFocus && (event => onFocus(event.value))}
      onChange={event => {
        const vv = event.target.value;
        setrawparams(vv);
        try {
          const v = JSON.parse(vv);
          if(!Array.isArray(v)) return;
          setparams(v);
          onChange(JSON.stringify([action, ...v]));
        } catch(e) {
          console.warn(e);
        }
      }}
    />
    <TextInput
      disabled
      readonly
      value={JSON.stringify([action, ...params])}
      onChange={() => null}
    />
  </>;
};

export const widgets = {
  EncryptedEmail,
  list: ListChoose,
  icon: IconChoose,
  markdown: MarkdownInput,
  image: ImageInput,
  pageaction: PageAction,
  "grommet-color": GrommetColor,
  constantInput: ConstantInput,
  transformInput: TransformInput,
  CheckboxWidget: ({ value, onChange, ...props }) => (
    <CheckBox {...props} checked={typeof value === 'undefined' ? false : value} onChange={event => onChange(event.target.checked)} />
  ),
  // CheckboxesWidget
  RadioWidget: ({ disabled, onChange, options: { enumOptions, enumDisabled, inline }, ...props }) => (
    <RadioButtonGroup
      {...props}
      name={Math.random().toString()}
      options={enumOptions.map(i => ({
        value: i.value,
        name: i.label,
        disabled: disabled || (enumDisabled && enumDisabled.indexOf(i.value) !== -1),
      }))}
      onChange={event => onChange(event.target.value)}
    />
  ),
  RangeWidget: ({ ...props }) => <RangeInput {...props} />,
  PasswordWidget: ({ onChange, ...props }) => <PasswordInput {...props} onChange={event => onChange(event.target.value)} />,
  SelectWidget: ({ schema, id, multiple, onChange, onBlur, onFocus, options: { enumOptions, enumDisabled }, ...props }) => (
    <Select
      {...props}
      labelKey="label"
      valueKey="value"
      multiple={multiple}
      id={id}
      onBlur={onBlur && (event => onBlur(event.value))}
      onFocus={onFocus && (event => onFocus(event.value))}
      onChange={event => onChange(event?.value?.value || event?.value)}
      options={enumOptions}
    />
  ),
  TextWidget,
  TextareaWidget: ({ onChange, ...props }) => <TextArea resize="vertical" {...props} onChange={event => onChange(event.target.value)} />,
  // URLWidget,
  UpDownWidget: ({ onChange, ...props }) => <NumberInput {...props} onChange={event => onChange(event.target.value)} />,
  // FileWidget,
  EmailWidget: ({ onChange, ...props }) => <EmailInput {...props} onChange={event => onChange(event.target.value)} />,
  DateWidget: ({ onChange, ...props }) => <DateInput {...props} onChange={event => onChange(event.target.value)} />,
  // DateTimeWidget,
  ColorWidget: ({ onChange, ...props }) => <ColorInput {...props} onChange={event => onChange(event.target.value)} />,
};

export const CustomIconForm = styled(Form)`
  i.glyphicon { display: none; }
  .btn-add::after { content: 'Add'; }
  .array-item-move-up::after { content: 'Move Up'; }
  .array-item-move-down::after { content: 'Move Down'; }
  .array-item-remove::after { content: 'Remove'; }
`;

const DebouncedPreview = debounceRender(({ children, ...props }) => children(props));

export const WidgetForm = ({ allComponents, schema, initialValues, title, onSubmit, onError, Preview, button, focusgroup }) => {
  const [currentProps, setCurrentProps] = React.useState(initialValues);
  const shorttitle = title.startsWith("component") ? title.substring("component".length) : title;
  const fn = schema => mergeDeepRight({
    properties: { title: { type: "string" }, description: { type: "string" } }
  }, schema);

  return (
    <Modal focusgroup={focusgroup} box={{}} layer={{}} button={button || (open => <Button label={`${title}`} onClick={open} />)}>
      {close => (
        <>
          <Box direction="row" justify="between">
            <Heading level={2} alignSelf="center">
              {title}
            </Heading>
            <Button icon={<Close />} alignSelf="center" a11yTitle="Close" onClick={close} />
          </Box>
          <Box>
            <CustomIconForm
              formContext={{
                allComponents
              }}
              schema={fn(schema)}
              widgets={widgets}
              fields={fields}
              uiSchema={uiSchema[shorttitle] || {}}
              onChange={v => setCurrentProps(v.formData)}
              onSubmit={(...args) => onSubmit(...args)
                  .then(close)
                  .catch(noop)
              }
              onError={(...args) =>
                onError(...args)
                  .then(close)
                  .catch(noop)
              }
              formData={currentProps}
            >
              <Heading level={3}>Preview</Heading>
              <Box pad="medium" border={{ color: 'brand', size: 'small' }}>
                <ErrorBoundary>
                  <DebouncedPreview {...currentProps} >
                    {(props) => <Preview {...props}  preview={true} />}
                  </DebouncedPreview>
                </ErrorBoundary>
              </Box>
              <hr />
              <Button type="submit" label="Submit" />
              <Button type="button" label="Reset" />
            </CustomIconForm>
          </Box>
        </>
      )}
    </Modal>
  );
};
