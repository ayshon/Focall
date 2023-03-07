import React from "react";
import * as go from "gojs";
import { produce } from "immer";
import "../App.css";
import { DiagramWrapper } from "./DiagramWrapper";

/**
 * Use a linkDataArray since we'll be using a GraphLinksModel,
 * and modelData for demonstration purposes. Note, though, that
 * both are optional props in ReactDiagram.
 */
interface DiagramState {
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  selectedData: go.ObjectData | null;
  skipsDiagramUpdate: boolean;
  cachedNodeState: Array<go.ObjectData>;
  cachedLinkState: Array<go.ObjectData>;
}

interface DiagramProps {
  newNodeState: Array<go.ObjectData>;
  newLinkState: Array<go.ObjectData>;
  fromOther: boolean;
}

class DiagramContainer extends React.Component<DiagramProps, DiagramState> {
  // Maps key -> arr index for quick lookups
  // Maps are used to check if node (go.Key) is already in the array.
  private mapNodeKeyIdx: Map<go.Key, number>;
  private mapLinkKeyIdx: Map<go.Key, number>;

  constructor(props: DiagramProps) {
    super(props);
    this.state = {
      nodeDataArray: this.props.newNodeState,
      linkDataArray: this.props.newLinkState,
      modelData: {
        canRelink: true,
      },
      selectedData: null,
      skipsDiagramUpdate: false,
      cachedNodeState: [],
      cachedLinkState: [],
    };

    // initialize maps
    this.mapNodeKeyIdx = new Map<go.Key, number>();
    this.mapLinkKeyIdx = new Map<go.Key, number>();
    this.refreshNodeIndex(this.state.nodeDataArray);
    this.refreshLinkIndex(this.state.linkDataArray);

    // bind handler methods
    this.handleDiagramEvent = this.handleDiagramEvent.bind(this);
    this.handleModelChange = this.handleModelChange.bind(this);
  }

  /**
   * Updates Diagram state when DiagramManager receives new state from backend.
   * Should only update state when the state received from DiagramManager has changed.
   * @param props contains nodeDataArray that backend sent
   * @param state current state of Diagram
   * @returns new state that equals props, if props contained different data.
   */
  public static getDerivedStateFromProps(
    props: DiagramProps,
    state: DiagramState
  ) {
    console.log(
      "node state received from DiagramManager: ",
      props.newNodeState
    );
    console.log(
      "link state received from DiagramManager: ",
      props.newLinkState
    );
    if (
      state.cachedNodeState === props.newNodeState &&
      state.cachedLinkState === props.newLinkState
    ) {
      console.log("no new state from server.");
      return null;
    }

    console.log("updating state, with state received from Diagram Manager");
    // this.refreshNodeIndex(props.dataFromApp);
    return {
      cachedNodeState: props.newNodeState,
      nodeDataArray: props.newNodeState,
      cachedLinkState: props.newLinkState,
      linkDataArray: props.newLinkState,
      skipsDiagramUpdate: true,
    };
  }

  /**
   * Handle any relevant DiagramEvents, in this case just selection changes.
   * On ChangedSelection, find the corresponding data and set the selectedData state.
   * @param e a GoJS DiagramEvent
   */
  public handleDiagramEvent(event: go.DiagramEvent) {
    return;
  }

  private sendBackendUpdates(modelChanges: go.IncrementalData) {
    console.log("Sending updates to backend");

    const insertedNodeKeys = modelChanges.insertedNodeKeys;
    const removedNodeKeys = modelChanges.removedNodeKeys;
    const modifiedNodeData = modelChanges.modifiedNodeData;

    const insertedLinkKeys = modelChanges.insertedLinkKeys;
    const removedLinkKeys = modelChanges.removedLinkKeys;
    const modifiedLinkData = modelChanges.modifiedLinkData;

    // node added or modified
    if (modifiedNodeData) {
      for (let nodeData of modifiedNodeData) {
        if (insertedNodeKeys && insertedNodeKeys.includes(nodeData["key"])) {
          console.log("node was inserted");
          console.log(nodeData);

          console.log("Sending POST request");
          fetch(
            "https://localhost:7009/graph/vertices?" +
              new URLSearchParams({
                key: nodeData["key"],
                category: nodeData["category"],
                loc: nodeData["loc"],
              }),
            { method: "POST" }
          )
            .then((response) => {
              if (response.ok) {
                console.log(`Successfully added node on backend`, nodeData);
              } else {
                throw new Error(
                  JSON.stringify({
                    status: response.status,
                    body: response.text(),
                  })
                );
              }
            })
            .catch((err) => console.log(err));
        }
        // node modified
        else {
          // TODO: update position with PUT request
        }
      }
    }

    // node removed
    if (removedNodeKeys) {
      for (let removedNodeKey of removedNodeKeys) {
        if (removedNodeKey === undefined) {
          continue;
        }

        fetch(
          "https://localhost:7009/graph/vertices?" +
            new URLSearchParams({
              key: removedNodeKey.toString(),
            }),
          { method: "DELETE" }
        )
          .then((response) => {
            if (response.ok) {
              console.log(
                `Successfully deleted key ${removedNodeKey} on backend`
              );
            } else {
              throw new Error(
                JSON.stringify({
                  status: response.status,
                  body: response.text(),
                })
              );
            }
          })
          .catch((err) => console.log(err));
      }
    }

    if (modifiedLinkData) {
      console.log(modifiedLinkData);

      for (let modifiedLink of modifiedLinkData) {
        if (
          insertedLinkKeys &&
          insertedLinkKeys.includes(modifiedLink["key"])
        ) {
          fetch(
            "https://localhost:7009/graph/edges?" +
              new URLSearchParams({
                srcKey: modifiedLink["from"].toString(),
                dstKey: modifiedLink["to"].toString(),
              }),
            { method: "POST" }
          )
            .then((response) => {
              if (response.ok) {
                console.log(`Successfully added edge on backend`);
                console.log(modifiedLink);
              } else {
                throw new Error(
                  JSON.stringify({
                    status: response.status,
                    body: response.text(),
                  })
                );
              }
            })
            .catch((err) => console.log(err));
        } else {
          // TODO: update link with PUT
          // or have to do delete then add (idk if the CRDT supports changing nodes)
        }
      }
    }

    if (removedLinkKeys) {
      // NOTE: this is O(n^2)
      // FIXME: keep an eye on this if its slow
      for (let removedLinkKey of removedLinkKeys) {
        for (let linkData of this.state.linkDataArray) {
          if (removedLinkKey !== linkData["key"]) {
            continue;
          }

          fetch(
            "https://localhost:7009/graph/edges?" +
              new URLSearchParams({
                srcKey: linkData["from"].toString(),
                dstKey: linkData["to"].toString(),
              }),
            { method: "DELETE" }
          )
            .then((response) => {
              if (response.ok) {
                console.log(`Successfully removed edge on backend`);
                console.log(linkData);
              } else {
                throw new Error(
                  JSON.stringify({
                    status: response.status,
                    body: response.text(),
                  })
                );
              }
            })
            .catch((err) => console.log(err));
          break;
        }
      }
    }

    console.log("==================================================");
  }

  /**
   * Handle GoJS model changes, which output an object of data changes via Model.toIncrementalData.
   * This method iterates over those changes and updates state to keep in sync with the GoJS model.
   * @param modelChanges a JSON-formatted string
   */
  public handleModelChange(modelChanges: go.IncrementalData) {
    const insertedNodeKeys = modelChanges.insertedNodeKeys;
    const removedNodeKeys = modelChanges.removedNodeKeys;
    const modifiedNodeData = modelChanges.modifiedNodeData;

    const insertedLinkKeys = modelChanges.insertedLinkKeys;
    const removedLinkKeys = modelChanges.removedLinkKeys;
    const modifiedLinkData = modelChanges.modifiedLinkData;

    const modifiedModelData = modelChanges.modelData;

    // maintain maps of modified data so insertions don't need slow lookups
    const modifiedNodeMap = new Map<go.Key, go.ObjectData>();
    const modifiedLinkMap = new Map<go.Key, go.ObjectData>();

    console.log("fromOther: ", this.props.fromOther);
    if (!this.props.fromOther) {
      this.sendBackendUpdates(modelChanges);
    }

    this.setState(
      produce((draft: DiagramState) => {
        console.log("Setting new state");
        let narr = draft.nodeDataArray;

        if (modifiedNodeData) {
          console.log("node data modified ", modifiedNodeData);

          modifiedNodeData.forEach((nd: go.ObjectData) => {
            modifiedNodeMap.set(nd.key, nd);

            const idx = this.mapNodeKeyIdx.get(nd.key);
            if (idx !== undefined && idx >= 0) {
              narr[idx] = nd;
            }
          });
          console.log("Modified node map", modifiedNodeMap);
        }

        if (insertedNodeKeys) {
          console.log("node(s) inserted", insertedNodeKeys);

          insertedNodeKeys.forEach((key: go.Key) => {
            // Check if multiple nodes were added at the same time
            // this can only happen when state is received from backend
            if (insertedNodeKeys.length > 1) {
              this.refreshNodeIndex(narr);
            }

            const nd = modifiedNodeMap.get(key);

            const idx = this.mapNodeKeyIdx.get(key);
            if (nd && idx === undefined) {
              console.log("adding node to mapnodeidx");
              this.mapNodeKeyIdx.set(nd.key, narr.length);
              console.log("narr length: ", narr.length);
              narr.push(nd);
            }
          });
        }

        if (removedNodeKeys) {
          console.log("node(s) removed", removedNodeKeys);
          narr = narr.filter(
            (nd: go.ObjectData) => !removedNodeKeys.includes(nd.key)
          );
          draft.nodeDataArray = narr;
          this.refreshNodeIndex(narr);
        }
        //Maps modified the data of modified nodes to their key for faster lookup when insertedLinkKeys are checked
        let larr = draft.linkDataArray;
        if (modifiedLinkData) {
          console.log("link data modified", modifiedLinkData);
          modifiedLinkData.forEach((ld: go.ObjectData) => {
            modifiedLinkMap.set(ld.key, ld);
            const idx = this.mapLinkKeyIdx.get(ld.key);
            if (idx !== undefined && idx >= 0) {
              larr[idx] = ld;
            }
          });
        }

        if (insertedLinkKeys) {
          console.log("link inserted", insertedLinkKeys);
          insertedLinkKeys.forEach((key: go.Key) => {
            const ld = modifiedLinkMap.get(key);
            const idx = this.mapLinkKeyIdx.get(key);
            if (ld && idx === undefined) {
              this.mapLinkKeyIdx.set(ld.key, larr.length);
              larr.push(ld);
            }
          });
        }

        if (removedLinkKeys) {
          console.log("link(s) removed", removedLinkKeys);
          larr = larr.filter(
            (ld: go.ObjectData) => !removedLinkKeys.includes(ld.key)
          );
          draft.linkDataArray = larr;
          this.refreshLinkIndex(larr);
        }

        if (modifiedModelData) {
          console.log("model data modified", modifiedModelData);
          draft.modelData = modifiedModelData;
        }

        draft.skipsDiagramUpdate = true; // the GoJS model already knows about these updates
        console.log("==================================================");
      })
    );
  }

  public render() {
    console.log("DiagramContainer rendering");
    console.log("node data array: ", this.state.nodeDataArray);
    console.log("link data array: ", this.state.linkDataArray);
    console.log("==================================================");
    return (
      <DiagramWrapper
        nodeDataArray={this.state.nodeDataArray}
        linkDataArray={this.state.linkDataArray}
        modelData={this.state.modelData}
        skipsDiagramUpdate={this.state.skipsDiagramUpdate}
        onDiagramEvent={this.handleDiagramEvent}
        onModelChange={this.handleModelChange}
      />
    );
  }

  /**
   * Update map of node keys to their index in the array.
   */
  private refreshNodeIndex(nodeArr: Array<go.ObjectData>) {
    this.mapNodeKeyIdx.clear();
    nodeArr.forEach((n: go.ObjectData, idx: number) => {
      this.mapNodeKeyIdx.set(n.key, idx);
    });
    // console.log('"nodeArr"', nodeArr);
    // console.log("Map node key idx", this.mapNodeKeyIdx);
    // console.log("==================================================");
  }

  /**
   * Update map of link keys to their index in the array.
   */
  private refreshLinkIndex(linkArr: Array<go.ObjectData>) {
    this.mapLinkKeyIdx.clear();
    linkArr.forEach((l: go.ObjectData, idx: number) => {
      this.mapLinkKeyIdx.set(l.key, idx);
    });
    // console.log('"linkArr"', linkArr);
    // console.log("Map link key idx", this.mapLinkKeyIdx);
    // console.log("==================================================");
  }
}

export default DiagramContainer;
