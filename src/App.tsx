import React from "react";
import "./App.css";
import { useState, useEffect } from "react";

import Chat from "./Chat/Chat";

type resultProps = {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
};

function App() {
  const [result, setResult] = useState<resultProps[]>([]);

  useEffect(() => {
    fetch("https://mergesharpwebapi.azurewebsites.net/weatherforecast")
      .then((response) => response.json())
      .then((res) => setResult(res))
      .catch((err) => console.log(err));
  }, []);

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
      <Chat />
    </div>
  );
}

export default App;
