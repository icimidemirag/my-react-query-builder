import { format, isValid, parse } from "date-fns";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ValueEditor as DefaultValueEditor,
  ValueEditorProps,
} from "react-querybuilder";

const ValueEditorForBulkEdit = (props: ValueEditorProps) => {
  const { field, fieldData, operator, value, handleOnChange } = props;

  if (field === "date" || field === "order_date" || field === "ship_date") {
    if (operator === "extendBy") {
      return (
        <input
          type="number"
          onChange={(e) => handleOnChange(e.target.value)}
          value={value || ""}
        />
      );
    }
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
  } else if (fieldData.inputType === "number") {
    return (
      <input
        type="number"
        onChange={(e) => handleOnChange(e.target.value)}
        value={value || ""}
      />
    );
  }

  return <DefaultValueEditor {...props} />;
};

export default ValueEditorForBulkEdit;
