import { format, isValid, parse } from "date-fns";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ValueEditor as DefaultValueEditor,
  ValueEditorProps,
} from "react-querybuilder";

const ValueEditor = (props: ValueEditorProps) => {
  const { fieldData, handleOnChange, operator, value } = props;

  if (operator === "null" || operator === "notNull") {
    return null;
  }

  if (fieldData.datatype === "date") {
    return (
      <div style={{ display: "inline-block" }}>
        <ReactDatePicker
          onChange={(d: Date) => {
            handleOnChange(isValid(d) ? format(d, "yyyy-MM-dd") : null);
          }}
          value={value || ""}
          selected={value ? parse(value, "yyyy-MM-dd", new Date()) : new Date()}
        />
      </div>
    );
  }

  return <DefaultValueEditor {...props} />;
};

export default ValueEditor;
