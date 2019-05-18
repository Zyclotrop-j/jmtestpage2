import * as React from 'react';
import { Text, Box, Heading, Button, CheckBox, RadioButtonGroup, RangeInput, Select, TextInput, TextArea } from 'grommet';
import { EmailInput, DateInput, ColorInput, PasswordInput, NumberInput } from 'grommet-controls';
import { Close } from 'grommet-icons';
import { compose, pipe, identity, tryCatch, dissocPath } from "ramda";
import { noop } from 'ramda-adjunct';
import Form from 'react-jsonschema-form';
import { uiSchema } from '../Widget/index';
import { Modal } from '../components/Modal';
import { ErrorBoundary } from '../components/ErrorBoundary';


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
    onChange(options.constant)
  }
  return <Text as="code" margin="small" weight="bold">{JSON.stringify(value, null, "  ")}</Text>;
};

const widgets = {
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
  TextWidget: ({ onChange, ...props }) => <TextInput {...props} onChange={event => onChange(event.target.value)} />,
  TextareaWidget: ({ onChange, ...props }) => <TextArea resize="vertical" {...props} onChange={event => onChange(event.target.value)} />,
  // URLWidget,
  UpDownWidget: ({ onChange, ...props }) => <NumberInput {...props} onChange={event => onChange(event.target.value)} />,
  // FileWidget,
  EmailWidget: ({ onChange, ...props }) => <EmailInput {...props} onChange={event => onChange(event.target.value)} />,
  DateWidget: ({ onChange, ...props }) => <DateInput {...props} onChange={event => onChange(event.target.value)} />,
  // DateTimeWidget,
  ColorWidget: ({ onChange, ...props }) => <ColorInput {...props} onChange={event => onChange(event.target.value)} />,
};

export const WidgetForm = ({ schema, initialValues, title, onSubmit, onError, Preview, button, focusgroup }) => {
  const [currentProps, setCurrentProps] = React.useState(initialValues);
  const shorttitle = title.startsWith("component") ? title.substring("component".length) : title;
  const fn = pipe(
    dissocPath(["properties", "main"]),
    dissocPath(["properties", "footer"]),
    dissocPath(["properties", "header"]),
  );
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
              schema={fn(schema)}
              widgets={widgets}
              uiSchema={uiSchema[shorttitle] || {}}
              onChange={v => setCurrentProps(v.formData)}
              onSubmit={(...args) =>
                onSubmit(...args)
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
