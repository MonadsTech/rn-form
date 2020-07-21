import React from 'react';
import {View, StyleSheet, Button, ViewStyle, StyleProp} from 'react-native';

import {FormContext} from './context';
import {FormInstance, Field} from './interface';
import {warning} from 'rc-util/lib/warning';

const FORM_ACTIONS = {
  SUBMIT: 'SUBMIT',
  RESET: 'RESET',
  VALIDATE: 'VALIDATE',
};

interface defaultButtonProps {
  title: string;
  onPress(): void;
}

export interface ButtonNewProps extends defaultButtonProps {
  fieldsValue?: unknown;
  form?: FormInstance;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const DefaultButtonChild = React.forwardRef(
  (props: defaultButtonProps, ref: any) => <Button {...props} ref={ref} />,
);

export interface FormActionProps {
  action: string | undefined;
  children: React.ReactNode;
  title: string;
  containerStyle?: StyleProp<ViewStyle>;
  onFormUpdate(form: FormInstance | undefined): void;
}

const FormAction = React.forwardRef((_props: FormActionProps, ref) => {
  const {
    action = FORM_ACTIONS.SUBMIT,
    title = 'Submit',
    containerStyle,
    children,
    onFormUpdate,
    ...props
  } = _props;
  // const {rules, initialValue = '', validateFirst = false} = options;

  const {form, onFinish} = React.useContext(FormContext);

  if (!form) {
    throw new Error('Form.Item must be wrapped under Form component');
  }
  // console.log('FormAction -> form', form);

  React.useEffect(() => {
    if (onFormUpdate) {
      onFormUpdate(form);
    }
  }, [form, onFormUpdate]);

  const onActionPress = React.useCallback(() => {
    if (action === FORM_ACTIONS.SUBMIT) {
      form.validateFields((error: unknown, value: Field[]) => {
        console.log(error, value);
        if (!error) {
          onFinish(value);
        }
      });
    }
    if (action === FORM_ACTIONS.VALIDATE) {
      form.validateFields();
    }
    if (action === FORM_ACTIONS.RESET) {
      form.resetFields();
    }
  }, [action, form, onFinish]);

  const _baseChildOriginal: JSX.Element = React.useMemo((): JSX.Element => {
    if (React.Children.count(children) > 1) {
      warning(false, 'FormAction accepts only one child');
    }

    const _firstChild: JSX.Element = children ? (
      (React.Children.only(children) as JSX.Element)
    ) : (
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      <DefaultButtonChild title="Submit" onPress={() => {}} />
    );

    return _firstChild;
  }, [children]);

  const baseChild = React.useMemo(() => {
    const newProps: ButtonNewProps = {
      onPress: onActionPress,
      title,
      ...props,
    };

    if (_baseChildOriginal.props.form) {
      newProps.form = form;
    }

    if (_baseChildOriginal.props.fieldsValue) {
      newProps.fieldsValue = form.getFieldsValue();
    }

    return React.cloneElement(_baseChildOriginal, newProps);
  }, [_baseChildOriginal, form, onActionPress, props, title]);

  return (
    <View style={containerStyle ? containerStyle : styles.container}>
      {baseChild}
    </View>
  );
});

export {FormAction, FORM_ACTIONS};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  buttons: {},
});