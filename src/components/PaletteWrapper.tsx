import React from "react";
import * as go from "gojs";
import { ReactPalette } from "gojs-react";

import "../App.css";

var red = "orangered"; // 0 or false
var green = "forestgreen"; // 1 or true

function initPalette() {
  const $ = go.GraphObject.make;

  var palette = new go.Palette(); // create a new Palette in the HTML DIV element "palette"

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

  // add the templates created above to palette
  palette.nodeTemplateMap.add("input", inputTemplate);
  palette.nodeTemplateMap.add("output", outputTemplate);
  palette.nodeTemplateMap.add("and", andTemplate);
  palette.nodeTemplateMap.add("or", orTemplate);
  palette.nodeTemplateMap.add("xor", xorTemplate);
  palette.nodeTemplateMap.add("not", notTemplate);
  palette.nodeTemplateMap.add("nand", nandTemplate);
  palette.nodeTemplateMap.add("nor", norTemplate);
  palette.nodeTemplateMap.add("xnor", xnorTemplate);

  return palette;
}

function PaletteWrapper() {
  return (
    <ReactPalette
      initPalette={initPalette}
      divClassName="palette-component"
      style={{ backgroundColor: "#eee" }}
      nodeDataArray={[
        { category: "input" },
        { category: "output" },
        { category: "and" },
        { category: "or" },
        { category: "xor" },
        { category: "not" },
        { category: "nand" },
        { category: "nor" },
        { category: "xnor" },
      ]}
    />
  );
}

export default PaletteWrapper;
