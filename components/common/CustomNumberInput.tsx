import classNames from "classnames";

interface CustomInputProps {
  disabled?: boolean;
  placeholder?: string;
  fontSize?: string;
  bold?: boolean;
  value: string;
  primary?: boolean;
  light?: boolean;
  handleValueChange?: (value: string) => void;
}

export const CustomNumberInput = (props: CustomInputProps) => {
  return (
    <input
      disabled={props.disabled}
      className={classNames(
        "w-full bg-transparent border-none outline-none",
        props.light
          ? "text-text-black1 placeholder:text-text2"
          : props.primary
          ? "text-primary placeholder:text-placdholder-primary"
          : "text-white placeholder:text-text2"
      )}
      style={{
        fontSize: props.fontSize ? `${props.fontSize}` : ".2rem",
        fontWeight: props.bold ? "bold" : "400",
      }}
      value={props.value}
      placeholder={props.placeholder}
      onChange={(e) => {
        let value = e.target.value.replace(/[^\d.]/g, "");
        // value = value.replace(/^\./g, "");
        value = value.replace(/\.{2,}/g, ".");
        value = value
          .replace(".", "$#$")
          .replace(/\./g, "")
          .replace("$#$", ".");
        const regexTemplate = /^(-)*(\d*)\.(\d\d\d\d\d\d).*$/;
        value = value.replace(regexTemplate, "$1$2.$3");
        props.handleValueChange && props.handleValueChange(value);
      }}
    />
  );
};
