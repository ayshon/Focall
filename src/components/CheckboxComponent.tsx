import React from "react";

type Props = {
  onChange: (num: number) => void;
  value: boolean;
  box_num: number;
};

function Checkbox({ onChange, value, box_num }: Props) {
  const grocery_list = ["apples", "oranges", "bananas", "milk", "ramen"];
  return (
    <div>
      <input
        type="checkbox"
        checked={value}
        onChange={() => onChange(box_num)}
      />
      {grocery_list[box_num]}
      <br></br>
    </div>
  );
}

export default Checkbox;
