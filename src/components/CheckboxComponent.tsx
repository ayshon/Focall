import React from "react";

type Props = {
    onChange: (num: number) => void;
    value: boolean;
    box_num: number;
};

function Checkbox({ onChange, value, box_num }: Props) {
    return (
        <label>
          <input type="checkbox" checked={value} onChange={() => onChange(box_num)} />
          <br></br>
          Box {box_num}
          <br></br>
        </label>
      );
}

export default Checkbox;