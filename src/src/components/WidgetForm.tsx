import * as React from 'react';
import { Box, Heading, Button, CheckBox, RadioButtonGroup, RangeInput, Select, TextInput, TextArea } from 'grommet';
import { EmailInput, DateInput, ColorInput, PasswordInput, NumberInput } from "grommet-controls";
import { Close } from 'grommet-icons';
import { noop } from "ramda-adjunct";
import Form from "react-jsonschema-form";
import { Modal } from "../components/Modal";
import { ErrorBoundary } from '../components/ErrorBoundary';

const widgets = {
  CheckboxWidget: ({value, onChange, ...props}) => <CheckBox {...props} checked={typeof value === "undefined" ? false : value} onChange={(event) => onChange(event.target.checked)} />,
  // CheckboxesWidget
  RadioWidget: ({ disabled, onChange, options: { enumOptions, enumDisabled, inline }, ...props }) => <RadioButtonGroup {...props}
    name={Math.random().toString()}
    options={enumOptions.map(i => ({
      value: i.value,
      name: i.label,
      disabled: disabled || (enumDisabled && enumDisabled.indexOf(i.value) != -1)
    }))}
    onChange={(event) => onChange(event.target.value)}
  />,
  RangeWidget: ({...props}) => <RangeInput {...props} />,
  PasswordWidget: ({onChange, ...props}) => <PasswordInput {...props}
    onChange={event => onChange(event.target.value)}
  />,
  SelectWidget: ({ schema, id, multiple, onChange, onBlur, onFocus, options: {enumOptions, enumDisabled}, ...props}) => <Select {...props}
    labelKey="label"
    valueKey="value"
    multiple={multiple}
    id={id}
    onBlur={
      onBlur &&
      (event => onBlur(event.value))
    }
    onFocus={
      onFocus &&
      (event => onFocus(event.value))
    }
    onChange={event => onChange(event.value)}
    options={enumOptions}
  />,
  TextWidget: ({ onChange, ...props}) => <TextInput {...props} onChange={event => onChange(event.target.value)} />,
  TextareaWidget: ({onChange, ...props}) => <TextArea {...props} onChange={event => onChange(event.target.value)} />,
  // URLWidget,
  UpDownWidget: ({onChange, ...props}) => <NumberInput {...props} onChange={event => onChange(event.target.value)} />,
  // FileWidget,
  EmailWidget: ({onChange, ...props}) => <EmailInput {...props} onChange={event => onChange(event.target.value)} />,
  DateWidget: ({onChange, ...props}) => <DateInput {...props} onChange={event => onChange(event.target.value)} />,
  // DateTimeWidget,
  ColorWidget: ({onChange, ...props}) => <ColorInput {...props} onChange={event => onChange(event.target.value)} />
};

export const WidgetForm = ({
  schema,
  initialValues,
  title,
  onSubmit,
  onError,
  Preview,
  button,
  focusgroup
}) => {
  const [currentProps, setCurrentProps] = React.useState(initialValues);
  return (<Modal focusgroup={focusgroup} box={{}} layer={{}} button={button || (open => (<Button label={`${title}`} onClick={open} />))} >
      {close => (<>
        <Box direction="row" justify="between">
          <Heading level={2} alignSelf="center">{title}</Heading>
          <Button icon={<Close />} alignSelf="center" a11yTitle="Close" onClick={close} />
        </Box>
        <Box>
            <Form schema={schema}
             widgets={widgets}
             onChange={v => setCurrentProps(v.formData)}
             onSubmit={(...args) => onSubmit(...args).then(close).catch(noop)}
             onError={(...args) => onError(...args).then(close).catch(noop)}
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
       </>)}
  </Modal>);
};
