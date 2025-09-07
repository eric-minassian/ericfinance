import FormFieldControl from "@/components/ui/form/field/form-field-control";
import FormFieldControlIcon from "@/components/ui/form/field/form-field-control-icon";
import FormFieldDescription from "@/components/ui/form/field/form-field-description";
import FormFieldItem from "@/components/ui/form/field/form-field-item";
import FormFieldLabel from "@/components/ui/form/field/form-field-label";
import FormFieldMessage from "@/components/ui/form/field/form-field-message";
import FormButton from "@/components/ui/form/form-button";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

const fieldComponents = {
  FormFieldItem,
  FormFieldLabel,
  FormFieldControl,
  FormFieldControlIcon,
  FormFieldDescription,
  FormFieldMessage,
};
const formComponents = {
  FormButton,
};

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { withForm, useAppForm } = createFormHook({
  fieldComponents,
  formComponents,
  fieldContext,
  formContext,
});
