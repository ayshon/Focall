import React from "react";
import "./App.css";
import { useState, useEffect } from "react";
import Checkbox from "./components/CheckboxComponent";


function App() {
    const INITIAL_STATE = [false, false, false, false, false]

    // TODO: set initial checkbox values based on server state
        // TODO: get server state
        // TODO: update INITIAL_STATE to have values from server

    const buttons = [
        {
            "box_num": 11,
            "value": INITIAL_STATE[0]
        },
        {
            "box_num": 22,
            "value": INITIAL_STATE[1]
        },
        {
            "box_num": 33,
            "value": INITIAL_STATE[2]
        },
        {
            "box_num": 44,
            "value": INITIAL_STATE[3]
        },
        {
            "box_num": 55,
            "value": INITIAL_STATE[4]
        }
    ]

    const [check_bottons, setButtons] = React.useState(buttons);
    
    const changeHandler = (num: number) => {
        const newState = check_bottons.map(obj => {
            if (obj.box_num === num) {
              return {...obj, value: !obj.value};
            }
      
            return obj;
          });

        setButtons(newState);
    }

    return (
        <div className="App">
            <p>Learn React</p>
            <div>
                {check_bottons.map((item, i) => (<Checkbox onChange={changeHandler} value={item.value} box_num={item.box_num}/>))}
            </div>
            <p>Checkbox 11 state: {check_bottons[0].value.toString()}</p>
            <p>Checkbox 22 state: {check_bottons[1].value.toString()}</p>
            <p>Checkbox 33 state: {check_bottons[2].value.toString()}</p>
            <p>Checkbox 44 state: {check_bottons[3].value.toString()}</p>
            <p>Checkbox 55 state: {check_bottons[4].value.toString()}</p>

        </div>
    );
}

export default App;