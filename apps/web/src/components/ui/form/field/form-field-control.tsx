import { Slot as SlotPrimitive } from "radix-ui";
import type React from "react";
import { useFormFieldItemContext } from "./form-field-context";

type FormFieldControlProps = React.ComponentProps<typeof SlotPrimitive.Slot>;
const FormFieldControl: React.FC<FormFieldControlProps> = ({ ...props }) => {
  const { hasError, formFieldItemId } = useFormFieldItemContext();

  return (
    <SlotPrimitive.Slot
      id={formFieldItemId}
      aria-describedby={hasError ? `${formFieldItemId}-error` : formFieldItemId}
      aria-invalid={hasError}
      {...props}
    />
  );
};

export default FormFieldControl;
