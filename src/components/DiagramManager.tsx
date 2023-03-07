import { useState, useEffect } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";

import * as go from "gojs";
import DiagramContainer from "./DiagramContainer";
import { link } from "fs";

function DiagramManager() {
  // --------------- Connection to Backend Setup ---------------

  const [backendListener, setBackendListener] = useState<any>(null);
  const [nodeDataArray, setNodeDataArray] = useState<go.ObjectData[]>([]);
  const [linkDataArray, setLinkDataArray] = useState<go.ObjectData[]>([]);
  const [fromOther, setFromOther] = useState<boolean>(false);

  useEffect(() => {
    setBackendListener(
      new HubConnectionBuilder()
        .withUrl("https://localhost:7009/hubs/frontendmessage")
        .withAutomaticReconnect()
        .build()
    );
  }, []);

  useEffect(() => {
    console.log("Diagram Manager: fetching state");
    fetch("https://localhost:7009/Graph/")
      .then((res) => res.json())
      .then((res) => updateState(res))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (backendListener) {
      backendListener
        .start()
        .then((_: any) => {
          console.log("Connected to backend!");

          backendListener.on("ReceiveMessage", (new_state: any) => {
            updateState(new_state);
          });
        })
        .catch((e: any) => console.log("Connection failed: ", e));
    }
  }, [backendListener]);

  // --------------- End of Connection to Backend Setup ---------------

  // TODO: rename res to more useful name
  const updateState = (res: any) => {
    console.log("Updating DiagramManager state.");
    console.log("Diagram Manager: new state received:", res);
    setNodeDataArray(res.vertices);
    setLinkDataArray(res.edges);
    setFromOther(true);
  };

  useEffect(() => {
    setFromOther(false);
  });

  console.log(
    "Diagram Manager: Sending the following node state to Diagram Container: ",
    nodeDataArray
  );
  console.log(
    "Diagram Manager: Sending the following link state to Diagram Container: ",
    linkDataArray
  );

  return (
    <DiagramContainer
      newNodeState={nodeDataArray}
      newLinkState={linkDataArray}
      fromOther={fromOther}
    />
  );
}

export default DiagramManager;
