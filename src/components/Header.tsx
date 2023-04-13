// Importing the Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";

export default function Header() {
  return (
    <Navbar bg="light">
      <Container className="justify-content-center">
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
  );
}
