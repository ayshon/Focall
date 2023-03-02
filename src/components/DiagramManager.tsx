import React, { useState, useEffect } from "react";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";

import * as go from "gojs";
import DiagramContainer from "./DiagramContainer";

function DiagramManager() {
  // --------------- Connection to Backend Setup ---------------

  const [connection, setConnection] = useState<any>(null);
  const [nodeDataArray, setNodeDataArray] = useState<go.ObjectData[]>([]);
  const [linkDataArray, setLinkDataArray] = useState<go.ObjectData[]>([]);

  useEffect(() => {
    // connection is used for backend sending messages to frontend
    // when other clients update state
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7009/hubs/frontendmessage")
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
    console.log("Diagram Manager: fetching state");
    // api calls are used for frontend to exchange data with backend
    // when client initially connects or state is chnges
    fetch("https://localhost:7009/TPTPGraph/LookupNodes/1")
      .then((response) => response.json())
      .then((res) => updateState(res))
      .catch((err) => console.log(err));

    // fetch("https://localhost:7009/LWWSet/GetLWWSet/1")
    //   .then((response) => response.json())
    //   .then((res) => updateState(res.LwwSet))
    //   .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then((_: any) => {
          console.log("Connected!");

          connection.on("ReceiveMessage", (message: any) => {
            // updateState(message.lwwSet);
            // NOTE: currently message is just a list of nodes (not an object that contains a list, like what was done with lwwset)
            console.log("Diagram Manager: new state received! ", message);
            updateState(message);
          });
        })
        .catch((e: any) => console.log("Connection failed: ", e));
    }
  }, [connection]);

  // --------------- End of Connection to Backend Setup ---------------

  const updateState = (res: any) => {
    // TODO: Message will eventually contain both node data list and link data list, so updateState()
    // TODO cont.: will need to handle that message structure.

    console.log("Updating DiagramManager state.");
    // console.log("res = ", res);
    setNodeDataArray(res);
  };
  console.log(
    "Diagram Manager: Sending the following state to Diagram Container: ",
    nodeDataArray
  );
  return <DiagramContainer dataFromApp={nodeDataArray} />;
}

export default DiagramManager;
