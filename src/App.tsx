import * as go from "gojs";

import "./App.css";
import PaletteWrapper from "./components/PaletteWrapper";
import DiagramManager from "./components/DiagramManager";

// Importing the Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";

// ---------- Functions that generate the Logic Gate figures ----------------

var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);

go.Shape.defineFigureGenerator("AndGate", function (shape, w, h) {
  var geo = new go.Geometry();
  var cpOffset = KAPPA * 0.5;
  var fig = new go.PathFigure(0, 0, true);
  geo.add(fig);

  // The gate body
  fig.add(new go.PathSegment(go.PathSegment.Line, 0.5 * w, 0));
  fig.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      w,
      0.5 * h,
      (0.5 + cpOffset) * w,
      0,
      w,
      (0.5 - cpOffset) * h
    )
  );
  fig.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      0.5 * w,
      h,
      w,
      (0.5 + cpOffset) * h,
      (0.5 + cpOffset) * w,
      h
    )
  );
  fig.add(new go.PathSegment(go.PathSegment.Line, 0, h).close());
  geo.spot1 = go.Spot.TopLeft;
  geo.spot2 = new go.Spot(0.55, 1);
  return geo;
});

go.Shape.defineFigureGenerator("OrGate", function (shape, w, h) {
  var geo = new go.Geometry();
  var radius = 0.5;
  var cpOffset = KAPPA * radius;
  var centerx = 0;
  var centery = 0.5;
  var fig = new go.PathFigure(0, 0, true);
  geo.add(fig);

  fig.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      w,
      0.5 * h,
      (centerx + cpOffset + cpOffset) * w,
      (centery - radius) * h,
      0.8 * w,
      (centery - cpOffset) * h
    )
  );
  fig.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      0,
      h,
      0.8 * w,
      (centery + cpOffset) * h,
      (centerx + cpOffset + cpOffset) * w,
      (centery + radius) * h
    )
  );
  fig.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      0,
      0,
      0.25 * w,
      0.75 * h,
      0.25 * w,
      0.25 * h
    ).close()
  );
  geo.spot1 = new go.Spot(0.2, 0.25);
  geo.spot2 = new go.Spot(0.75, 0.75);
  return geo;
});

go.Shape.defineFigureGenerator("XorGate", function (shape, w, h) {
  var geo = new go.Geometry();
  var radius = 0.5;
  var cpOffset = KAPPA * radius;
  var centerx = 0.2;
  var centery = 0.5;
  var fig = new go.PathFigure(0.1 * w, 0, false);
  geo.add(fig);

  fig.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      0.1 * w,
      h,
      0.35 * w,
      0.25 * h,
      0.35 * w,
      0.75 * h
    )
  );
  var fig2 = new go.PathFigure(0.2 * w, 0, true);
  geo.add(fig2);
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      w,
      0.5 * h,
      (centerx + cpOffset) * w,
      (centery - radius) * h,
      0.9 * w,
      (centery - cpOffset) * h
    )
  );
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      0.2 * w,
      h,
      0.9 * w,
      (centery + cpOffset) * h,
      (centerx + cpOffset) * w,
      (centery + radius) * h
    )
  );
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      0.2 * w,
      0,
      0.45 * w,
      0.75 * h,
      0.45 * w,
      0.25 * h
    ).close()
  );
  geo.spot1 = new go.Spot(0.4, 0.25);
  geo.spot2 = new go.Spot(0.8, 0.75);
  return geo;
});

go.Shape.defineFigureGenerator("NorGate", function (shape, w, h) {
  var geo = new go.Geometry();
  var radius = 0.5;
  var cpOffset = KAPPA * radius;
  var centerx = 0;
  var centery = 0.5;
  var fig = new go.PathFigure(0.8 * w, 0.5 * h, true);
  geo.add(fig);

  // Normal
  fig.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      0,
      h,
      0.7 * w,
      (centery + cpOffset) * h,
      (centerx + cpOffset) * w,
      (centery + radius) * h
    )
  );
  fig.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      0,
      0,
      0.25 * w,
      0.75 * h,
      0.25 * w,
      0.25 * h
    )
  );
  fig.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      0.8 * w,
      0.5 * h,
      (centerx + cpOffset) * w,
      (centery - radius) * h,
      0.7 * w,
      (centery - cpOffset) * h
    )
  );
  radius = 0.1;
  cpOffset = KAPPA * 0.1;
  centerx = 0.9;
  centery = 0.5;
  var fig2 = new go.PathFigure((centerx - radius) * w, centery * h, true);
  geo.add(fig2);
  // Inversion
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      centerx * w,
      (centery - radius) * h,
      (centerx - radius) * w,
      (centery - cpOffset) * h,
      (centerx - cpOffset) * w,
      (centery - radius) * h
    )
  );
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      (centerx + radius) * w,
      centery * h,
      (centerx + cpOffset) * w,
      (centery - radius) * h,
      (centerx + radius) * w,
      (centery - cpOffset) * h
    )
  );
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      centerx * w,
      (centery + radius) * h,
      (centerx + radius) * w,
      (centery + cpOffset) * h,
      (centerx + cpOffset) * w,
      (centery + radius) * h
    )
  );
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      (centerx - radius) * w,
      centery * h,
      (centerx - cpOffset) * w,
      (centery + radius) * h,
      (centerx - radius) * w,
      (centery + cpOffset) * h
    )
  );
  geo.spot1 = new go.Spot(0.2, 0.25);
  geo.spot2 = new go.Spot(0.6, 0.75);
  return geo;
});

go.Shape.defineFigureGenerator("XnorGate", function (shape, w, h) {
  var geo = new go.Geometry();
  var radius = 0.5;
  var cpOffset = KAPPA * radius;
  var centerx = 0.2;
  var centery = 0.5;
  var fig = new go.PathFigure(0.1 * w, 0, false);
  geo.add(fig);

  // Normal
  fig.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      0.1 * w,
      h,
      0.35 * w,
      0.25 * h,
      0.35 * w,
      0.75 * h
    )
  );
  var fig2 = new go.PathFigure(0.8 * w, 0.5 * h, true);
  geo.add(fig2);
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      0.2 * w,
      h,
      0.7 * w,
      (centery + cpOffset) * h,
      (centerx + cpOffset) * w,
      (centery + radius) * h
    )
  );
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      0.2 * w,
      0,
      0.45 * w,
      0.75 * h,
      0.45 * w,
      0.25 * h
    )
  );
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      0.8 * w,
      0.5 * h,
      (centerx + cpOffset) * w,
      (centery - radius) * h,
      0.7 * w,
      (centery - cpOffset) * h
    )
  );
  radius = 0.1;
  cpOffset = KAPPA * 0.1;
  centerx = 0.9;
  centery = 0.5;
  var fig3 = new go.PathFigure((centerx - radius) * w, centery * h, true);
  geo.add(fig3);
  // Inversion
  fig3.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      centerx * w,
      (centery - radius) * h,
      (centerx - radius) * w,
      (centery - cpOffset) * h,
      (centerx - cpOffset) * w,
      (centery - radius) * h
    )
  );
  fig3.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      (centerx + radius) * w,
      centery * h,
      (centerx + cpOffset) * w,
      (centery - radius) * h,
      (centerx + radius) * w,
      (centery - cpOffset) * h
    )
  );
  fig3.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      centerx * w,
      (centery + radius) * h,
      (centerx + radius) * w,
      (centery + cpOffset) * h,
      (centerx + cpOffset) * w,
      (centery + radius) * h
    )
  );
  fig3.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      (centerx - radius) * w,
      centery * h,
      (centerx - cpOffset) * w,
      (centery + radius) * h,
      (centerx - radius) * w,
      (centery + cpOffset) * h
    )
  );
  geo.spot1 = new go.Spot(0.4, 0.25);
  geo.spot2 = new go.Spot(0.65, 0.75);
  return geo;
});

go.Shape.defineFigureGenerator("NandGate", function (shape, w, h) {
  var geo = new go.Geometry();
  var cpxOffset = KAPPA * 0.5;
  var cpyOffset = KAPPA * 0.4;
  var cpOffset = KAPPA * 0.1;
  var radius = 0.1;
  var centerx = 0.9;
  var centery = 0.5;
  var fig = new go.PathFigure(0.8 * w, 0.5 * h, true);
  geo.add(fig);

  // The gate body
  fig.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      0.4 * w,
      h,
      0.8 * w,
      (0.5 + cpyOffset) * h,
      (0.4 + cpxOffset) * w,
      h
    )
  );
  fig.add(new go.PathSegment(go.PathSegment.Line, 0, h));
  fig.add(new go.PathSegment(go.PathSegment.Line, 0, 0));
  fig.add(new go.PathSegment(go.PathSegment.Line, 0.4 * w, 0));
  fig.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      0.8 * w,
      0.5 * h,
      (0.4 + cpxOffset) * w,
      0,
      0.8 * w,
      (0.5 - cpyOffset) * h
    )
  );
  var fig2 = new go.PathFigure((centerx + radius) * w, centery * h, true);
  geo.add(fig2);
  // Inversion
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      centerx * w,
      (centery + radius) * h,
      (centerx + radius) * w,
      (centery + cpOffset) * h,
      (centerx + cpOffset) * w,
      (centery + radius) * h
    )
  );
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      (centerx - radius) * w,
      centery * h,
      (centerx - cpOffset) * w,
      (centery + radius) * h,
      (centerx - radius) * w,
      (centery + cpOffset) * h
    )
  );
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      centerx * w,
      (centery - radius) * h,
      (centerx - radius) * w,
      (centery - cpOffset) * h,
      (centerx - cpOffset) * w,
      (centery - radius) * h
    )
  );
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      (centerx + radius) * w,
      centery * h,
      (centerx + cpOffset) * w,
      (centery - radius) * h,
      (centerx + radius) * w,
      (centery - cpOffset) * h
    )
  );
  geo.spot1 = new go.Spot(0, 0.05);
  geo.spot2 = new go.Spot(0.55, 0.95);
  return geo;
});

go.Shape.defineFigureGenerator("Inverter", function (shape, w, h) {
  var geo = new go.Geometry();
  var cpOffset = KAPPA * 0.1;
  var radius = 0.1;
  var centerx = 0.9;
  var centery = 0.5;
  var fig = new go.PathFigure(0.8 * w, 0.5 * h, true);
  geo.add(fig);

  fig.add(new go.PathSegment(go.PathSegment.Line, 0, h));
  fig.add(new go.PathSegment(go.PathSegment.Line, 0, 0));
  fig.add(new go.PathSegment(go.PathSegment.Line, 0.8 * w, 0.5 * h));
  var fig2 = new go.PathFigure((centerx + radius) * w, centery * h, true);
  geo.add(fig2);
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      centerx * w,
      (centery + radius) * h,
      (centerx + radius) * w,
      (centery + cpOffset) * h,
      (centerx + cpOffset) * w,
      (centery + radius) * h
    )
  );
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      (centerx - radius) * w,
      centery * h,
      (centerx - cpOffset) * w,
      (centery + radius) * h,
      (centerx - radius) * w,
      (centery + cpOffset) * h
    )
  );
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      centerx * w,
      (centery - radius) * h,
      (centerx - radius) * w,
      (centery - cpOffset) * h,
      (centerx - cpOffset) * w,
      (centery - radius) * h
    )
  );
  fig2.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      (centerx + radius) * w,
      centery * h,
      (centerx + cpOffset) * w,
      (centery - radius) * h,
      (centerx + radius) * w,
      (centery - cpOffset) * h
    )
  );
  geo.spot1 = new go.Spot(0, 0.25);
  geo.spot2 = new go.Spot(0.4, 0.75);
  return geo;
});

// --------------- end of functions that generate logic gate figures ----------------------------

function App() {
  return (
    <div className="app">
      <Navbar bg="light">
        <Container>
          <Navbar.Brand>
            <img
              alt=""
              src="plus.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{" "}
            Focall - Collaborative Digital Logic Circuit Diagram Editor
          </Navbar.Brand>
        </Container>
      </Navbar>
      <div className="gojs-container">
        <PaletteWrapper />
        <DiagramManager />
      </div>
      <Navbar bg="light">
        <Container className="justify-content-center">
          <div>
            Created using Conflict-Free Replicated Data Types (CRDTs). See the
            source code{" "}
            <a href="https://github.com/ayshon/Focall" target="_blank">
              here
            </a>
            .
          </div>
        </Container>
      </Navbar>
    </div>
  );
}

export default App;
