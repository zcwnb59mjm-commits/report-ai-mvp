import type { ReactNode } from "react";

type FieldLabelProps = {
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  optionalText?: string;
  children: ReactNode;
};

export function FieldLabel({
  htmlFor,
  required = false,
  optional = false,
  optionalText = "任意",
  children,
}: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className="field-label">
      {children}
      {required ? (
        <span className="ml-1 text-black" aria-hidden="true">
          *
        </span>
      ) : null}
      {optional ? (
        <span className="ml-2 text-[12px] font-normal text-neutral-400">
          {optionalText}
        </span>
      ) : null}
    </label>
  );
}
