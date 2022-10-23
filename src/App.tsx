import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

type resultProps = {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}


function App() {
    const [result, setResult] = useState<resultProps[]>([]);


    useEffect(() => {
        fetch('https://mergesharpwebapi.azurewebsites.net/weatherforecast')
            .then(response => response.json())
            .then(res => setResult(res))
            .catch(err => console.log(err))
    }, []);

    const result2 = [{ "date": "2022-10-23T22:27:55.9961759-04:00", "temperatureC": 52, "temperatureF": 125, "summary": "Chilly" }, { "date": "2022-10-24T22:27:55.9961963-04:00", "temperatureC": 33, "temperatureF": 91, "summary": "Scorching" }, { "date": "2022-10-25T22:27:55.9961975-04:00", "temperatureC": 38, "temperatureF": 100, "summary": "Chilly" }, { "date": "2022-10-26T22:27:55.9961983-04:00", "temperatureC": 33, "temperatureF": 91, "summary": "Warm" }, { "date": "2022-10-27T22:27:55.9961991-04:00", "temperatureC": -7, "temperatureF": 20, "summary": "Mild" }]

    return (
        <div className="App">
            <table>
                {result.map((value) => {
                    return (
                        <tbody>
                            <tr>
                                <td>{value.date}</td>
                                <td>{value.temperatureC}</td>
                                <td>{value.temperatureF}</td>
                                <td>{value.summary}</td>
                            </tr>
                        </tbody>
                    );
                })}
            </table>
        </div>
    );
}

export default App;
