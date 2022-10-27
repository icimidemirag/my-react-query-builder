import { Fragment } from "react";
import { ValueSelectorProps } from "react-querybuilder";

const CombinatorSelector = ({
  className,
  handleOnChange,
  options,
  title,
  value,
}: ValueSelectorProps) => (
  <form 
    className={className}
    style={{ display: "inline-block" }} 
    title={title}
  >
    {options.map((option: any) => {
      const key = `key=${option.id ?? option.name}`;
      return (
        <Fragment key={key}>
          <label>
            <input
              type="radio"
              name="combinatorSelector"
              checked={value === option.name}
              onChange={() => handleOnChange(option.name)}
            />{" "}
            {option.label}
          </label>{" "}
        </Fragment>
      );
    })}
  </form>
);

CombinatorSelector.displayName = "CombinatorSelector";

export default CombinatorSelector;
