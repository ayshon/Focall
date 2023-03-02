import React from "react";
import * as go from "gojs";
import { produce } from "immer";

import "../App.css";
import { DiagramWrapper } from "./DiagramWrapper";
import { HubConnection } from "@microsoft/signalr";

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
  cachedState: Array<go.ObjectData>;
}

interface DiagramProps {
  dataFromApp: Array<go.ObjectData>;
}

class DiagramContainer extends React.Component<DiagramProps, DiagramState> {
  // Maps key -> arr index for quick lookups
  // Maps are used to check if node (go.Key) is already in the array.
  private mapNodeKeyIdx: Map<go.Key, number>;
  private mapLinkKeyIdx: Map<go.Key, number>;

  constructor(props: DiagramProps) {
    super(props);
    this.state = {
      nodeDataArray: this.props.dataFromApp,
      // TODO: linkDataArray will need to depend on data from app as well
      linkDataArray: [],
      modelData: {
        canRelink: true,
      },
      selectedData: null,
      skipsDiagramUpdate: false,
      cachedState: [],
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
    console.log("state received from Diagram Manager: ", props.dataFromApp);
    if (state.cachedState != props.dataFromApp) {
      console.log("updating state, with state received from Diagram Manager");
      // this.refreshNodeIndex(props.dataFromApp);
      return {
        cachedState: props.dataFromApp,
        nodeDataArray: props.dataFromApp,
        skipsDiagramUpdate: true,
      };
    }
  }

  /**
   * Handle any relevant DiagramEvents, in this case just selection changes.
   * On ChangedSelection, find the corresponding data and set the selectedData state.
   * @param e a GoJS DiagramEvent
   */
  public handleDiagramEvent(e: go.DiagramEvent) {
    const name = e.name;
    switch (name) {
      default:
        break;
    }
  }

  /**
   * Handle GoJS model changes, which output an object of data changes via Model.toIncrementalData.
   * This method iterates over those changes and updates state to keep in sync with the GoJS model.
   * @param obj a JSON-formatted string
   */
  public handleModelChange(obj: go.IncrementalData) {
    const insertedNodeKeys = obj.insertedNodeKeys;
    const modifiedNodeData = obj.modifiedNodeData;
    const removedNodeKeys = obj.removedNodeKeys;
    const insertedLinkKeys = obj.insertedLinkKeys;
    const modifiedLinkData = obj.modifiedLinkData;
    const removedLinkKeys = obj.removedLinkKeys;
    const modifiedModelData = obj.modelData;

    // maintain maps of modified data so insertions don't need slow lookups
    const modifiedNodeMap = new Map<go.Key, go.ObjectData>();
    const modifiedLinkMap = new Map<go.Key, go.ObjectData>();
    this.setState(
      produce((draft: DiagramState) => {
        console.log("MAPNODEKEYIDX:", this.mapNodeKeyIdx);
        let narr = draft.nodeDataArray;

        //Maps the data of modified nodes to their key for faster node data lookup when insertedNodeKeys are checked
        if (modifiedNodeData) {
          console.log("node data modified ", modifiedNodeData);
          modifiedNodeData.forEach((nd: go.ObjectData) => {
            modifiedNodeMap.set(nd.key, nd);
            const idx = this.mapNodeKeyIdx.get(nd.key);
            // check if node exists
            if (idx !== undefined && idx >= 0) {
              narr[idx] = nd;
            }
          });
          console.log("Modified node map", modifiedNodeMap);
        }
        // Checks if the inserted nodes were added to mapNodeKeyIdx (i.e. check if node is already in array).
        // If not, the nodes are added to the map and nodeDatAarray.
        if (insertedNodeKeys) {
          console.log("node(s) inserted", insertedNodeKeys);
          insertedNodeKeys.forEach((key: go.Key) => {
            // Check if multiple nodes were added at the same time
            // this can only happen when state is received from backend
            if (insertedNodeKeys.length > 1) {
              this.refreshNodeIndex(narr);
            }
            const nd = modifiedNodeMap.get(key);
            // Check if node with this key already exists
            const idx = this.mapNodeKeyIdx.get(key);
            if (nd && idx === undefined) {
              console.log("adding node to mapnodeidx");
              // nodes won't be added to mapNodeKeyIdx if they already exist
              this.mapNodeKeyIdx.set(nd.key, narr.length);
              console.log("narr length: ", narr.length);
              narr.push(nd);
            }
          });
        }
        // Removes the removed nodes' data from state and updates mapNodeKeyIdx
        if (removedNodeKeys) {
          console.log("node(s) removed", removedNodeKeys);
          narr = narr.filter((nd: go.ObjectData) => {
            if (removedNodeKeys.includes(nd.key)) {
              return false;
            }
            return true;
          });
          draft.nodeDataArray = narr;
          this.refreshNodeIndex(narr);
        }
        // Maps modified the data of modified nodes to their key for faster lookup when insertedLinkKeys are checked
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
        // Checks if the inserted links were added to mapLinkKeyIdx.
        // If not, the links are added to the map.
        if (insertedLinkKeys) {
          console.log("link inserted", insertedLinkKeys);
          insertedLinkKeys.forEach((key: go.Key) => {
            const ld = modifiedLinkMap.get(key);
            const idx = this.mapLinkKeyIdx.get(key);
            if (ld && idx === undefined) {
              // links won't be added if they already exist
              this.mapLinkKeyIdx.set(ld.key, larr.length);
              larr.push(ld);
            }
          });
        }
        // Removes the removed links' data from state and updates mapLinkKeyIdx
        if (removedLinkKeys) {
          console.log("link(s) removed", removedLinkKeys);
          larr = larr.filter((ld: go.ObjectData) => {
            if (removedLinkKeys.includes(ld.key)) {
              return false;
            }
            return true;
          });
          draft.linkDataArray = larr;
          this.refreshLinkIndex(larr);
        }
        // handle model data changes, for now just replacing with the supplied object
        if (modifiedModelData) {
          console.log("model data modified", modifiedModelData);
          draft.modelData = modifiedModelData;
        }
        draft.skipsDiagramUpdate = true; // the GoJS model already knows about these updates
        console.log("------------------");
      })
    );
  }

  public render() {
    console.log("Diagram Container reloaded");
    console.log("node data array: ", this.state.nodeDataArray);
    console.log("=========================");
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
    console.log("=========================");
    console.log('"nodeArr"', nodeArr);
    console.log("Map node key idx", this.mapNodeKeyIdx);
  }

  /**
   * Update map of link keys to their index in the array.
   */
  private refreshLinkIndex(linkArr: Array<go.ObjectData>) {
    this.mapLinkKeyIdx.clear();
    linkArr.forEach((l: go.ObjectData, idx: number) => {
      this.mapLinkKeyIdx.set(l.key, idx);
    });
    console.log('"linkArr"', linkArr);
    console.log("Map link key idx", this.mapLinkKeyIdx);
    console.log("=========================");
  }
}

export default DiagramContainer;
