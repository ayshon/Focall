import React from "react";
import "./App.css";
import { useState, useEffect } from "react";
import Checkbox from "./components/CheckboxComponent";


function App() {
    const INITIAL_STATE = [false, false, false, false, false]

    // TODO: set initial checkbox values based on server state
        // TODO: get server state
        // TODO: update INITIAL_STATE to have values from server

    
    const [checked_one, setOne] = React.useState(INITIAL_STATE[0]);
    const [checked_two, setTwo] = React.useState(INITIAL_STATE[1]);
    const [checked_three, setThree] = React.useState(INITIAL_STATE[2]);
    const [checked_four, setFour] = React.useState(INITIAL_STATE[3]);
    const [checked_five, setFive] = React.useState(INITIAL_STATE[4]);

    const handleChange = (num: number) => {
        switch(num){
            case 1:
                setOne(!checked_one);
                // TODO: write the new checked_one value to the backend
                break
            case 2:
                setTwo(!checked_two);
                // TODO: write the new checked_two value to the backend
                break
            case 3:
                setThree(!checked_three);
                // TODO: write the new checked_three value to the backend
                break
            case 4:
                setFour(!checked_four);
                // TODO: write the new checked_four value to the backend
                break
            case 5:
                setFive(!checked_five);
                // TODO: write the new checked_five value to the backend
                break
        }
    };

    return (
        <div className="App">
            <p>Learn React</p>

            <Checkbox
                onChange = {handleChange}
                value = {checked_one}
                box_num = {1}
            />
            <Checkbox
                onChange = {handleChange}
                value = {checked_two}
                box_num = {2}
            />
            <Checkbox
                onChange = {handleChange}
                value = {checked_three}
                box_num = {3}
            />
            <Checkbox
                onChange = {handleChange}
                value = {checked_four}
                box_num = {4}
            />
            <Checkbox
                onChange = {handleChange}
                value = {checked_five}
                box_num = {5}
            />

            <p>Checkbox state: {checked_one.toString()}</p>
        </div>
    );
}

export default App;