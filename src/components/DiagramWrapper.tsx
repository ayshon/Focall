import React from "react";
import * as go from "gojs";
import { ReactDiagram } from "gojs-react";
import "../App.css";

interface DiagramProps {
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  skipsDiagramUpdate: boolean;
  onDiagramEvent: (e: go.DiagramEvent) => void;
  onModelChange: (e: go.IncrementalData) => void;
}

var red = "orangered"; // 0 or false
var green = "forestgreen"; // 1 or true

export class DiagramWrapper extends React.Component<DiagramProps, {}> {
  /**
   * Ref to keep a reference to the Diagram component, which provides access to the GoJS diagram via getDiagram().
   */
  private diagramRef: React.RefObject<ReactDiagram>;

  /** @internal */
  constructor(props: DiagramProps) {
    super(props);
    this.diagramRef = React.createRef();
  }

  /**
   * Get the diagram reference and add any desired diagram listeners.
   * Typically the same function will be used for each listener, with the function using a switch statement to handle the events.
   */
  public componentDidMount() {
    // if (!this.diagramRef.current) return;
    // const diagram = this.diagramRef.current.getDiagram();
    // if (diagram instanceof go.Diagram) {
    //   diagram.addDiagramListener('ChangedSelection', this.props.onDiagramEvent);
    // }
  }

  /**
   * Get the diagram reference and remove listeners that were added during mounting.
   */
  public componentWillUnmount() {
    // if (!this.diagramRef.current) return;
    // const diagram = this.diagramRef.current.getDiagram();
    // if (diagram instanceof go.Diagram) {
    //   diagram.removeDiagramListener('ChangedSelection', this.props.onDiagramEvent);
    // }
  }

  /**
   * Diagram initialization method, which is passed to the ReactDiagram component.
   * This method is responsible for making the diagram and initializing the model, any templates,
   * and maybe doing other initialization tasks like customizing tools.
   * The model's data should not be set here, as the ReactDiagram component handles that.
   */
  private initDiagram() {
    const $ = go.GraphObject.make;
    // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
    const myDiagram = $(go.Diagram, {
      "draggingTool.isGridSnapEnabled": true, // dragged nodes will snap to a grid of 10x10 cells
      "undoManager.isEnabled": true,
      "clickCreatingTool.archetypeNodeData": {
        text: "new node",
        color: "lightblue",
      },

      model: $(go.GraphLinksModel, {
        linkKeyProperty: "key", // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
        linkFromPortIdProperty: "fromPort",
        linkToPortIdProperty: "toPort",
        // positive keys for nodes
        // makeUniqueKeyFunction: (m: go.Model, data: any) => {
        //   let k = data.key || 1;
        //   while (m.findNodeDataForKey(k)) k++;
        //   data.key = k;
        //   return k;
        // },
        // // negative keys for links
        // makeUniqueLinkKeyFunction: (m: go.GraphLinksModel, data: any) => {
        //   let k = data.key || -1;
        //   while (m.findLinkDataForKey(k)) k--;
        //   data.key = k;
        //   return k;
        // },
      }),
    });

    // creates relinkable Links that will avoid crossing Nodes when possible and will jump over other Links in their paths
    myDiagram.linkTemplate = $(
      go.Link,
      {
        routing: go.Link.AvoidsNodes,
        curve: go.Link.JumpOver,
        corner: 3,
        relinkableFrom: true,
        relinkableTo: true,
        selectionAdorned: false, // Links are not adorned when selected so that their color remains visible.
        shadowOffset: new go.Point(0, 0),
        shadowBlur: 5,
        shadowColor: "blue",
      },
      new go.Binding("isShadowed", "isSelected").ofObject(),
      $(go.Shape, { name: "SHAPE", strokeWidth: 2, stroke: red })
    );

    // node template helpers
    var sharedToolTip = $(
      "ToolTip",
      { "Border.figure": "RoundedRectangle" },
      $(
        go.TextBlock,
        { margin: 2 },
        new go.Binding("text", "", (d) => d.category)
      )
    );

    // define some common property settings
    function nodeStyle() {
      return [
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
          go.Point.stringify
        ),
        new go.Binding("isShadowed", "isSelected").ofObject(),
        {
          selectionAdorned: false,
          shadowOffset: new go.Point(0, 0),
          shadowBlur: 15,
          shadowColor: "blue",
          toolTip: sharedToolTip,
        },
      ];
    }

    function shapeStyle() {
      return {
        name: "NODESHAPE",
        fill: "lightgray",
        stroke: "darkslategray",
        desiredSize: new go.Size(40, 40),
        strokeWidth: 2,
      };
    }

    function portStyle(input: any) {
      return {
        desiredSize: new go.Size(6, 6),
        fill: "black",
        fromSpot: go.Spot.Right,
        fromLinkable: !input,
        toSpot: go.Spot.Left,
        toLinkable: input,
        toMaxLinks: 1,
        cursor: "pointer",
      };
    }

    // define templates for each type of node
    var inputTemplate = $(
      go.Node,
      "Spot",
      nodeStyle(),
      $(go.Shape, "Circle", shapeStyle(), { fill: red }), // override the default fill (from shapeStyle()) to be red
      $(
        go.Shape,
        "Rectangle",
        portStyle(false), // the only port
        { portId: "", alignment: new go.Spot(1, 0.5) }
      ),
      {
        // // if double-clicked, an input node will change its value, represented by the color.
        // doubleClick: (e, obj) => {
        //   e.diagram.startTransaction("Toggle Input");
        //   var shp = obj.findObject("NODESHAPE");
        //   shp.fill = shp.fill === green ? red : green;
        //   updateStates();
        //   e.diagram.commitTransaction("Toggle Input");
        // },
      }
    );

    var outputTemplate = $(
      go.Node,
      "Spot",
      nodeStyle(),
      $(go.Shape, "Rectangle", shapeStyle(), { fill: green }), // override the default fill (from shapeStyle()) to be green
      $(
        go.Shape,
        "Rectangle",
        portStyle(true), // the only port
        { portId: "", alignment: new go.Spot(0, 0.5) }
      )
    );

    var andTemplate = $(
      go.Node,
      "Spot",
      nodeStyle(),
      $(go.Shape, "AndGate", shapeStyle()),
      $(go.Shape, "Rectangle", portStyle(true), {
        portId: "in1",
        alignment: new go.Spot(0, 0.3),
      }),
      $(go.Shape, "Rectangle", portStyle(true), {
        portId: "in2",
        alignment: new go.Spot(0, 0.7),
      }),
      $(go.Shape, "Rectangle", portStyle(false), {
        portId: "out",
        alignment: new go.Spot(1, 0.5),
      })
    );

    var orTemplate = $(
      go.Node,
      "Spot",
      nodeStyle(),
      $(go.Shape, "OrGate", shapeStyle()),
      $(go.Shape, "Rectangle", portStyle(true), {
        portId: "in1",
        alignment: new go.Spot(0.16, 0.3),
      }),
      $(go.Shape, "Rectangle", portStyle(true), {
        portId: "in2",
        alignment: new go.Spot(0.16, 0.7),
      }),
      $(go.Shape, "Rectangle", portStyle(false), {
        portId: "out",
        alignment: new go.Spot(1, 0.5),
      })
    );

    var xorTemplate = $(
      go.Node,
      "Spot",
      nodeStyle(),
      $(go.Shape, "XorGate", shapeStyle()),
      $(go.Shape, "Rectangle", portStyle(true), {
        portId: "in1",
        alignment: new go.Spot(0.26, 0.3),
      }),
      $(go.Shape, "Rectangle", portStyle(true), {
        portId: "in2",
        alignment: new go.Spot(0.26, 0.7),
      }),
      $(go.Shape, "Rectangle", portStyle(false), {
        portId: "out",
        alignment: new go.Spot(1, 0.5),
      })
    );

    var norTemplate = $(
      go.Node,
      "Spot",
      nodeStyle(),
      $(go.Shape, "NorGate", shapeStyle()),
      $(go.Shape, "Rectangle", portStyle(true), {
        portId: "in1",
        alignment: new go.Spot(0.16, 0.3),
      }),
      $(go.Shape, "Rectangle", portStyle(true), {
        portId: "in2",
        alignment: new go.Spot(0.16, 0.7),
      }),
      $(go.Shape, "Rectangle", portStyle(false), {
        portId: "out",
        alignment: new go.Spot(1, 0.5),
      })
    );

    var xnorTemplate = $(
      go.Node,
      "Spot",
      nodeStyle(),
      $(go.Shape, "XnorGate", shapeStyle()),
      $(go.Shape, "Rectangle", portStyle(true), {
        portId: "in1",
        alignment: new go.Spot(0.26, 0.3),
      }),
      $(go.Shape, "Rectangle", portStyle(true), {
        portId: "in2",
        alignment: new go.Spot(0.26, 0.7),
      }),
      $(go.Shape, "Rectangle", portStyle(false), {
        portId: "out",
        alignment: new go.Spot(1, 0.5),
      })
    );

    var nandTemplate = $(
      go.Node,
      "Spot",
      nodeStyle(),
      $(go.Shape, "NandGate", shapeStyle()),
      $(go.Shape, "Rectangle", portStyle(true), {
        portId: "in1",
        alignment: new go.Spot(0, 0.3),
      }),
      $(go.Shape, "Rectangle", portStyle(true), {
        portId: "in2",
        alignment: new go.Spot(0, 0.7),
      }),
      $(go.Shape, "Rectangle", portStyle(false), {
        portId: "out",
        alignment: new go.Spot(1, 0.5),
      })
    );

    var notTemplate = $(
      go.Node,
      "Spot",
      nodeStyle(),
      $(go.Shape, "Inverter", shapeStyle()),
      $(go.Shape, "Rectangle", portStyle(true), {
        portId: "in1",
        alignment: new go.Spot(0, 0.5),
      }),
      $(go.Shape, "Rectangle", portStyle(false), {
        portId: "out",
        alignment: new go.Spot(1, 0.5),
      })
    );

    // add the templates created above to myDiagram
    myDiagram.nodeTemplateMap.add("input", inputTemplate);
    myDiagram.nodeTemplateMap.add("output", outputTemplate);
    myDiagram.nodeTemplateMap.add("and", andTemplate);
    myDiagram.nodeTemplateMap.add("or", orTemplate);
    myDiagram.nodeTemplateMap.add("xor", xorTemplate);
    myDiagram.nodeTemplateMap.add("not", notTemplate);
    myDiagram.nodeTemplateMap.add("nand", nandTemplate);
    myDiagram.nodeTemplateMap.add("nor", norTemplate);
    myDiagram.nodeTemplateMap.add("xnor", xnorTemplate);

    return myDiagram;
  }

  public render() {
    return (
      <ReactDiagram
        ref={this.diagramRef}
        divClassName="diagram-component"
        style={{ backgroundColor: "#eee" }}
        initDiagram={this.initDiagram}
        nodeDataArray={this.props.nodeDataArray}
        linkDataArray={this.props.linkDataArray}
        modelData={this.props.modelData}
        onModelChange={this.props.onModelChange}
        skipsDiagramUpdate={this.props.skipsDiagramUpdate}
      />
    );
  }
}
