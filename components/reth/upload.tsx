import Upload from "rc-upload";
import snackbarUtil from "utils/snackbarUtils";

type ValidatorKeyUploadProps = React.PropsWithChildren<{
  disabled?: boolean;
  mt?: string;
  checkValidatorKey?: (validatorKey: any) => void;
  onSuccess?: (validatorKeys: any[], fileName: string) => void;
}>;

export const ValidatorKeyUpload = (props: ValidatorKeyUploadProps) => {
  return (
    <div style={{ marginTop: props.mt || "0" }}>
      <Upload
        disabled={props.disabled}
        customRequest={(option: any) => {
          let reader = new FileReader();
          reader.readAsText(option.file, "UTF-8");
          reader.onload = (e) => {
            let fileContent: any = e?.target?.result;
            try {
              let validatorKeys = JSON.parse(fileContent);
              if (!Array.isArray(validatorKeys)) {
                throw new Error("Json content must be array!");
              }

              if (validatorKeys.length === 0) {
                throw new Error("Please upload at least only one key");
              }

              validatorKeys.forEach((validatorKey) => {
                props.checkValidatorKey &&
                  props.checkValidatorKey(validatorKey);
              });

              props.onSuccess &&
                props.onSuccess(validatorKeys, option.file.name);
            } catch (err: unknown) {
              if (err instanceof Error) {
                // console.error(err.message);
                snackbarUtil.error(
                  "File parse error, please upload valid json file"
                );
                // snackbarUtil.error(
                // "File format error, please upload valid json file"
                // );
              }
            }
          };
        }}
      >
        {props.children}
      </Upload>
    </div>
  );
};
