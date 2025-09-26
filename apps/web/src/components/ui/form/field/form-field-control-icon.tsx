import { buttonVariants } from "@/components/ui/button";
import { useFormFieldItemContext } from "@/components/ui/form/field/form-field-context";
import { cn } from "@/lib/utils";
import { Slot as SlotPrimitive } from "radix-ui";
import type React from "react";

type FormFieldControlIconProps = React.ComponentProps<"div"> & {
  icon: React.ReactNode;
};
const FormFieldControlIcon: React.FC<FormFieldControlIconProps> = ({
  className,
  children,
  icon,
  ...props
}) => {
  const { hasError, id, name } = useFormFieldItemContext();
  return (
    <div
      id={`${id}-${name}-control-icon`}
      className={cn("relative", className)}
      {...props}
    >
      <div
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "hover:bg-transparent",
          "absolute top-0 left-0 px-3 py-2 h-full inline-flex items-center justify-center",
          hasError && "text-destructive"
        )}
      >
        {icon}
      </div>
      <SlotPrimitive.Slot className="pl-9">{children}</SlotPrimitive.Slot>
    </div>
  );
};
export default FormFieldControlIcon;
