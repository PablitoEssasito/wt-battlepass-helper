import React, { useId } from "react";
import { setNumberInput } from "../helpers/setNumberInput";

interface Props {
  callback: React.Dispatch<React.SetStateAction<number>>;
  label: string;
  value: string;
  min?: number;
  max?: number;
}

function NumberInput(props: Props) {
  const id = useId();

  return (
    <div>
      <label className="text-light form-label" htmlFor={id}>{props.label}</label>
      <input
        id={id}
        className="form-control"
        type="number"
        step={1}
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(e) =>
          setNumberInput(props.callback, e.target.value, props.min, props.max)
        }
      />
    </div>
  );
}

export default NumberInput;
