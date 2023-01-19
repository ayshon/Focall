import React from "react";
import * as go from "gojs";
import { ReactDiagram } from "gojs-react";
import "../App.css";

var red = "orangered"; // 0 or false
var green = "forestgreen"; // 1 or true

/**
 * Diagram initialization method, which is passed to the ReactDiagram component.
 * This method is responsible for making the diagram and initializing the model and any templates.
 * The model's data should not be set here, as the ReactDiagram component handles that via the other props.
 */
function initDiagram() {
  const $ = go.GraphObject.make;
  // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
  const myDiagram = $(go.Diagram, {
    "draggingTool.isGridSnapEnabled": true, // dragged nodes will snap to a grid of 10x10 cells
    "undoManager.isEnabled": true,
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
      portId: "in",
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

// // update the diagram every 250 milliseconds
// function loop() {
//   setTimeout(() => {
//     updateStates();
//     loop();
//   }, 250);
// }

// // update the value and appearance of each node according to its type and input values
// function updateStates() {
//   var oldskip = myDiagram.skipsUndoManager;
//   myDiagram.skipsUndoManager = true;
//   // do all "input" nodes first
//   myDiagram.nodes.each((node: any) => {
//     if (node.category === "input") {
//       doInput(node);
//     }
//   });
//   // now we can do all other kinds of nodes
//   myDiagram.nodes.each((node: any) => {
//     switch (node.category) {
//       case "and":
//         doAnd(node);
//         break;
//       case "or":
//         doOr(node);
//         break;
//       case "xor":
//         doXor(node);
//         break;
//       case "not":
//         doNot(node);
//         break;
//       case "nand":
//         doNand(node);
//         break;
//       case "nor":
//         doNor(node);
//         break;
//       case "xnor":
//         doXnor(node);
//         break;
//       case "output":
//         doOutput(node);
//         break;
//       case "input":
//         break; // doInput already called, above
//     }
//   });
//   myDiagram.skipsUndoManager = oldskip;
// }

// // helper predicate
// function linkIsTrue(link: any) {
//   // assume the given Link has a Shape named "SHAPE"
//   return link.findObject("SHAPE").stroke === green;
// }

// // helper function for propagating results
// function setOutputLinks(node: any, color: any) {
//   node
//     .findLinksOutOf()
//     .each((link: any) => (link.findObject("SHAPE").stroke = color));
// }

// // update nodes by the specific function for its type
// // determine the color of links coming out of this node based on those coming in and node type

// function doInput(node: any) {
//   // the output is just the node's Shape.fill
//   setOutputLinks(node, node.findObject("NODESHAPE").fill);
// }

// function doAnd(node: any) {
//   var color = node.findLinksInto().all(linkIsTrue) ? green : red;
//   setOutputLinks(node, color);
// }
// function doNand(node: any) {
//   var color = !node.findLinksInto().all(linkIsTrue) ? green : red;
//   setOutputLinks(node, color);
// }
// function doNot(node: any) {
//   var color = !node.findLinksInto().all(linkIsTrue) ? green : red;
//   setOutputLinks(node, color);
// }

// function doOr(node: any) {
//   var color = node.findLinksInto().any(linkIsTrue) ? green : red;
//   setOutputLinks(node, color);
// }
// function doNor(node: any) {
//   var color = !node.findLinksInto().any(linkIsTrue) ? green : red;
//   setOutputLinks(node, color);
// }

// function doXor(node: any) {
//   var truecount = 0;
//   node.findLinksInto().each((link: any) => {
//     if (linkIsTrue(link)) truecount++;
//   });
//   var color = truecount % 2 !== 0 ? green : red;
//   setOutputLinks(node, color);
// }
// function doXnor(node: any) {
//   var truecount = 0;
//   node.findLinksInto().each((link: any) => {
//     if (linkIsTrue(link)) truecount++;
//   });
//   var color = truecount % 2 === 0 ? green : red;
//   setOutputLinks(node, color);
// }

// function  (node: any) {
//   // assume there is just one input link
//   // we just need to update the node's Shape.fill
//   node.linksConnected.each((link: any) => {
//     node.findObject("NODESHAPE").fill = link.findObject("SHAPE").stroke;
//   });
// }

// // save a model to and load a model from JSON text, displayed below the Diagram
// function save() {
//   document.getElementById("mySavedModel").value = myDiagram.model.toJson();
//   myDiagram.isModified = false;
// }
// function load() {
//   myDiagram.model = go.Model.fromJson(
//     document.getElementById("mySavedModel").value
//   );
// }
// window.addEventListener("DOMContentLoaded", init);

function DiagramWrapper() {
  return (
    <div>
      {/* <Checkboxes /> */}
      <ReactDiagram
        initDiagram={initDiagram}
        divClassName="myDiagramDiv"
        nodeDataArray={[
          { category: "input", key: "input1", loc: "-150 -80" },
          { category: "or", key: "or1", loc: "-70 0" },
          { category: "not", key: "not1", loc: "10 0" },
          { category: "xor", key: "xor1", loc: "100 0" },
          { category: "or", key: "or2", loc: "200 0" },
          { category: "output", key: "output1", loc: "200 -100" },
        ]}
        linkDataArray={[
          { from: "input1", fromPort: "out", to: "or1", toPort: "in1" },
          { from: "or1", fromPort: "out", to: "not1", toPort: "in" },
          { from: "not1", fromPort: "out", to: "or1", toPort: "in2" },
          { from: "not1", fromPort: "out", to: "xor1", toPort: "in1" },
          { from: "xor1", fromPort: "out", to: "or2", toPort: "in1" },
          { from: "or2", fromPort: "out", to: "xor1", toPort: "in2" },
          { from: "xor1", fromPort: "out", to: "output1", toPort: "" },
        ]}
      />
    </div>
  );
}

export default DiagramWrapper;
