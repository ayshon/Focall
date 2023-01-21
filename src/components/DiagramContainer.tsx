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
}

class DiagramContainer extends React.Component<{}, DiagramState> {
  // Maps to store key -> arr index for quick lookups
  private mapNodeKeyIdx: Map<go.Key, number>;
  private mapLinkKeyIdx: Map<go.Key, number>;

  constructor(props: object) {
    super(props);
    this.state = {
      nodeDataArray: [
        { category: "input", key: "input1", loc: "-150 -80" },
        { category: "or", key: "or1", loc: "-70 0" },
        { category: "not", key: "not1", loc: "10 0" },
        { category: "xor", key: "xor1", loc: "100 0" },
        { category: "or", key: "or2", loc: "200 0" },
        { category: "output", key: "output1", loc: "200 -100" },
      ],
      linkDataArray: [
        { key: -1, from: "input1", fromPort: "out", to: "or1", toPort: "in1" },
        { key: -2, from: "or1", fromPort: "out", to: "not1", toPort: "in" },
        { key: -3, from: "not1", fromPort: "out", to: "or1", toPort: "in2" },
        { key: -4, from: "not1", fromPort: "out", to: "xor1", toPort: "in1" },
        { key: -5, from: "xor1", fromPort: "out", to: "or2", toPort: "in1" },
        { key: -6, from: "or2", fromPort: "out", to: "xor1", toPort: "in2" },
        { key: -7, from: "xor1", fromPort: "out", to: "output1", toPort: "" },
      ],
      modelData: {
        canRelink: true,
      },
      selectedData: null,
      skipsDiagramUpdate: false,
    };
    // init maps
    this.mapNodeKeyIdx = new Map<go.Key, number>();
    this.mapLinkKeyIdx = new Map<go.Key, number>();
    this.refreshNodeIndex(this.state.nodeDataArray);
    this.refreshLinkIndex(this.state.linkDataArray);
    // bind handler methods
    this.handleDiagramEvent = this.handleDiagramEvent.bind(this);
    this.handleModelChange = this.handleModelChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  /**
   * Update map of node keys to their index in the array.
   */
  private refreshNodeIndex(nodeArr: Array<go.ObjectData>) {
    this.mapNodeKeyIdx.clear();
    nodeArr.forEach((n: go.ObjectData, idx: number) => {
      this.mapNodeKeyIdx.set(n.key, idx);
    });
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
  }

  /**
   * Handle any relevant DiagramEvents, in this case just selection changes.
   * On ChangedSelection, find the corresponding data and set the selectedData state.
   * @param e a GoJS DiagramEvent
   */
  public handleDiagramEvent(e: go.DiagramEvent) {
    const name = e.name;
    switch (name) {
      // case "ChangedSelection": {
      //   const sel = e.subject.first();
      //   this.setState(
      //     produce((draft: AppState) => {
      //       if (sel) {
      //         if (sel instanceof go.Node) {
      //           const idx = this.mapNodeKeyIdx.get(sel.key);
      //           if (idx !== undefined && idx >= 0) {
      //             const nd = draft.nodeDataArray[idx];
      //             draft.selectedData = nd;
      //           }
      //         } else if (sel instanceof go.Link) {
      //           const idx = this.mapLinkKeyIdx.get(sel.key);
      //           if (idx !== undefined && idx >= 0) {
      //             const ld = draft.linkDataArray[idx];
      //             draft.selectedData = ld;
      //           }
      //         }
      //       } else {
      //         draft.selectedData = null;
      //       }
      //     })
      //   );
      //   break;
      // }
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
        let narr = draft.nodeDataArray;
        //Maps modified the data of modified nodes to their key for faster lookup when insertedNodeKeys are checked
        if (modifiedNodeData) {
          console.log("node data modified ", modifiedNodeData);
          modifiedNodeData.forEach((nd: go.ObjectData) => {
            modifiedNodeMap.set(nd.key, nd);
            const idx = this.mapNodeKeyIdx.get(nd.key);
            if (idx !== undefined && idx >= 0) {
              narr[idx] = nd;
              if (draft.selectedData && draft.selectedData.key === nd.key) {
                draft.selectedData = nd;
              }
            }
          });
          //   console.log("Modified node map", modifiedNodeMap);
        }
        // Checks if the inserted nodes were added to mapNodeKeyIdx.
        // If not, the nodes are added to the map.
        if (insertedNodeKeys) {
          console.log("node inserted", insertedNodeKeys);
          insertedNodeKeys.forEach((key: go.Key) => {
            const nd = modifiedNodeMap.get(key);
            const idx = this.mapNodeKeyIdx.get(key);
            if (nd && idx === undefined) {
              // nodes won't be added if they already exist
              this.mapNodeKeyIdx.set(nd.key, narr.length);
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
        //Maps modified the data of modified nodes to their key for faster lookup when insertedLinkKeys are checked
        let larr = draft.linkDataArray;
        if (modifiedLinkData) {
          console.log("link data modified", modifiedLinkData);
          modifiedLinkData.forEach((ld: go.ObjectData) => {
            modifiedLinkMap.set(ld.key, ld);
            const idx = this.mapLinkKeyIdx.get(ld.key);
            if (idx !== undefined && idx >= 0) {
              larr[idx] = ld;
              if (draft.selectedData && draft.selectedData.key === ld.key) {
                draft.selectedData = ld;
              }
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
      })
    );
  }

  /**
   * Handle inspector changes, and on input field blurs, update node/link data state.
   * @param path the path to the property being modified
   * @param value the new value of that property
   * @param isBlur whether the input event was a blur, indicating the edit is complete
   */
  public handleInputChange(path: string, value: string, isBlur: boolean) {
    this.setState(
      produce((draft: DiagramState) => {
        const data = draft.selectedData as go.ObjectData; // only reached if selectedData isn't null
        data[path] = value;
        if (isBlur) {
          const key = data.key;
          if (key < 0) {
            // negative keys are links
            const idx = this.mapLinkKeyIdx.get(key);
            if (idx !== undefined && idx >= 0) {
              draft.linkDataArray[idx] = data;
              draft.skipsDiagramUpdate = false;
            }
          } else {
            const idx = this.mapNodeKeyIdx.get(key);
            if (idx !== undefined && idx >= 0) {
              draft.nodeDataArray[idx] = data;
              draft.skipsDiagramUpdate = false;
            }
          }
        }
      })
    );
  }

  public render() {
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
}

export default DiagramContainer;
