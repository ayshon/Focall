import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

import "../App.css";
import Checkbox from "./CheckboxComponent";


function Checkboxes() {
    const buttons = [
        {
            "box_num": 11,
            "value": false
        },
        {
            "box_num": 22,
            "value": false
        },
        {
            "box_num": 33,
            "value": false
        },
        {
            "box_num": 44,
            "value": false
        },
        {
            "box_num": 55,
            "value": false
        }
    ]

    const [check_bottons, setButtons] = useState(buttons);
    const [connection, setConnection ] = useState<any>(null);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl('https://localhost:7009/hubs/frontendmessage')
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
        
        fetch("https://localhost:7009/LWWSet/GetLWWSet/1")
          .then((response) => response.json())
          .then((res) => updateState(res.LwwSet))
          .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then( (_: any) => {
                    console.log('Connected!');
    
                    connection.on('ReceiveMessage', (message: any) => {
                        updateState(message.lwwSet);
                    });
                })
                .catch((e: any) => console.log('Connection failed: ', e));
        }
    }, [connection]);

    const updateState = (lwwset: number[]) => {
        console.log("updating state...")
        const newState = check_bottons.map(obj => {
            if (lwwset.includes(obj.box_num)) {
              return {...obj, value: true};
            } else {
              return {...obj, value: false};
            }
          });

          setButtons(newState);
    }

    const changeHandler = (num: number) => {
        const newState = check_bottons.map(obj => {
            if (obj.box_num === num) {
                // PUT request using fetch inside useEffect React hook
                const requestOptions = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: obj.box_num.toString()
                };
                if(!obj.value){
                    fetch('https://localhost:7009/LWWSet/AddElement/1', requestOptions)
                } else {
                    fetch('https://localhost:7009/LWWSet/RemoveElement/1', requestOptions)
                }
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

export default Checkboxes;
