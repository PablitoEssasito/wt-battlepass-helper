import React from "react";
import { Form } from "react-bootstrap";

interface Props {
  callback: React.Dispatch<React.SetStateAction<string>>;
  label: string;
  value: string;
  min?: string;
  max?: string;
}

function DateInput(props: Props) {
  return (
    <Form.Group>
      <Form.Label>{props.label}</Form.Label>
      <Form.Control
        type="date"
        lang="en-GB"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(e) => props.callback(e.target.value)}
      />
    </Form.Group>
  );
}

export default DateInput;
