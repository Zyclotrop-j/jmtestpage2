import * as React from 'react';
import { Image, Carousel, Text, Box, Heading, Button, CheckBox, RadioButtonGroup, RangeInput, Select, TextInput, TextArea, ThemeContext } from 'grommet';
import { EmailInput, DateInput, ColorInput, PasswordInput, NumberInput, Colors } from 'grommet-controls';
import { Close, Search } from 'grommet-icons';
import chroma from "chroma-js";
import { when } from "mobx";
import { map, compose, pipe, identity, tryCatch, dissocPath, hasPath, has, max, mergeDeepLeft, memoizeWith } from "ramda";
import { noop } from 'ramda-adjunct';
import { observer } from 'mobx-react';
import Fuse from 'fuse.js';
import Unsplash, { toJson } from 'unsplash-js';
import Form from 'react-jsonschema-form';
import { auth } from "../utils/auth";
import { uiSchema } from '../Widget/index';
import { Modal } from '../components/Modal';
import { ErrorBoundary } from '../components/ErrorBoundary';

const unsplash = new Promise((res, rej) => {
  when(() => auth.idToken).then(function(change) {
    fetch("https://zcmsapi.herokuapp.com/api/v1/clientsidesecret", {
      cache: "no-cache",
      headers: {
        "authorization": `Bearer ${auth.idToken}`,
      }
    }).then(i => i.json()).then(i => new Unsplash({
      applicationId: i.data.find(i => i.title === "unsplashaccess").secret,
      secret: i.data.find(i => i.title === "unsplashsecret").secret
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
    const optioncomponents = Array.from(registry.formContext.allComponents?.values() || []);
    const descFields = ["description", "groupdesc"];
    const descfield = descFields.find(i => has(i, optioncomponents[0])) || descFields[0];

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

const assembleColorCode = theme => (p, color) => ({
  ...p,
  [color]: theme?.global?.colors[color]
});
const makeColors = theme => ({
  transparent: "rgba(255,255,255,0)",
  brand: theme?.global?.colors?.brand,
  ...["dark1", "accent-1", "neutral1", "light1"].reduce(assembleColorCode(theme), {}),
  ...["dark2", "accent-2", "neutral2", "light2"].reduce(assembleColorCode(theme), {}),
  ...["dark3", "accent-3", "neutral3", "light3"].reduce(assembleColorCode(theme), {}),
  ...["dark4", "accent-4", "neutral4", "light4"].reduce(assembleColorCode(theme), {}),
  ...["statuscritical","statusdisabled","statusok","statusunknown","statuswarning"].reduce(assembleColorCode(theme), {}),
  black: theme?.global?.colors.black || "black",
  white: theme?.global?.colors.white || "white",
  ...theme.palette.reduce((p, i) => ({ ...p, [i]: i }), {}),
});

const GrommetColor =  ({ value, onChange, ...props }) => {
  const shapes = theme => theme.shapes.reduce((p, row, rowdx) => ({
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
    <Box background={value} pad="small">{value}</Box>
    <ThemeContext.Consumer>
    {theme => {
      const madeColors = makeColors(theme);
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

const ImageInput = ({ value, onChange: modonChange, schema, ...props }) => {
  const modifiers = ({
    css: str => `${str.startsWith("url(") ? "" : "url("}${str}${str.endsWith(")") ? "" : ")"}`
  }[schema?.["ui:options"]?.type]) || identity;
  const onChange = pipe(modifiers, modonChange);
  const [options, setOptions] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const doSearch = () => unsplash
      .then(unsplash => unsplash.search.photos(search, 1, 20))
      .then((...args) => {
        console.log("...args", args);
        return toJson(...args);
      })
      .then(json => {
        console.log(json);
        setOptions(json.results);
        // unsplash.photos.downloadPhoto(json["results"][0]);
      });

    const app_name = "JannesWebsiteEditor";
    const buttonOptions = options.map(json => ({
      label: (<Box>
          <img src={json.urls.thumb} alt={json.alt_description || json.description} />
          By <a target="_blank" rel="noreferrer" href={`${json.user?.profileurl}?utm_source=${app_name}&utm_medium=referral`}>{json.user?.name}</a> on <a target="_blank" rel="noreferrer" href={`https://unsplash.com/?utm_source=${app_name}&utm_medium=referral`}>Unsplash</a>
        </Box>),
      value: json.id,
      onClick: () => onChange(json.urls.full),
    }));
    console.log("!!!!props", props);
    // // TODO: Safe more properties
    /*
    description: json.description
    alt: json.alt_description
    author: json.user
    color: json.color
    crossorigin
    height
    width
    location: json.location
    src
    tags: json.tags.map(i => i.title)
    title
    */
    return (<>
      <Box direction="row">
        <TextInput
          placeholder="Search value"
          value={search}
          onChange={event => {
            setSearch(event.target.value);
          }}
        />
        <Button label="Search" icon={<Search />} onClick={doSearch} />
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

export const widgets = {
  image: ImageInput,
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

export const WidgetForm = ({ allComponents, schema, initialValues, title, onSubmit, onError, Preview, button, focusgroup }) => {
  const [currentProps, setCurrentProps] = React.useState(initialValues);
  const shorttitle = title.startsWith("component") ? title.substring("component".length) : title;
  const fn = schema => mergeDeepLeft({
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
            <Form
              formContext={{
                allComponents
              }}
              schema={fn(schema)}
              widgets={widgets}
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
                  <Preview {...currentProps} preview={true} />
                </ErrorBoundary>
              </Box>
              <hr />
              <Button type="submit" label="Submit" />
              <Button type="button" label="Reset" />
            </Form>
          </Box>
        </>
      )}
    </Modal>
  );
};
