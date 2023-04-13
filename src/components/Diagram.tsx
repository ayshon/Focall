import { useState, useEffect } from "react";

import DiagramManager from "./DiagramManager";

// Importing the Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";

function Diagram() {
  const [doPrint, setDoPrint] = useState<boolean>(false);

  useEffect(() => {
    setDoPrint(false);
  });

  function startImageGeneration() {
    setDoPrint(true);
  }

  return (
    <div>
      <div className="diagram-container">
        <DiagramManager printState={doPrint} />
      </div>
      <Navbar bg="light">
        <Container className="justify-content-center">
          <Button className="print-button" onClick={startImageGeneration}>
            Generate Diagram Image
          </Button>
        </Container>
      </Navbar>
    </div>
  );
}

export default Diagram;
