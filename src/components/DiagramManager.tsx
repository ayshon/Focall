import { useState, useEffect } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";

import * as go from "gojs";
import DiagramContainer from "./DiagramContainer";

function DiagramManager() {
  // --------------- Connection to Backend Setup ---------------

  const [backendListener, setBackendListener] = useState<any>(null);
  const [nodeDataArray, setNodeDataArray] = useState<go.ObjectData[]>([]);
  const [linkDataArray, setLinkDataArray] = useState<go.ObjectData[]>([]);

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
    fetch("https://localhost:7009/TPTPGraph/LookupNodes/1")
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
            // NOTE: currently message is just a list of nodes (not an object that contains a list, like what was done with lwwset)
            console.log("Diagram Manager: new state received: ", new_state);
            updateState(new_state);
          });
        })
        .catch((e: any) => console.log("Connection failed: ", e));
    }
  }, [backendListener]);

  // --------------- End of Connection to Backend Setup ---------------

  // TODO: rename res to more useful name
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
