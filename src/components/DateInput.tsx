import React, { useId } from "react";

interface Props {
  callback: React.Dispatch<React.SetStateAction<string>>;
  label: string;
  value: string;
  min?: string;
  max?: string;
}

function DateInput(props: Props) {
  const id = useId();

  return (
    <div>
      <label className="form-label" htmlFor={id}>{props.label}</label>
      <input
        id={id}
        className="form-control"
        type="date"
        lang="en-GB"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(e) => props.callback(e.target.value)}
      />
    </div>
  );
}

export default DateInput;
