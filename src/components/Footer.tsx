// Importing the Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";

export default function Footer() {
  return (
    <div>
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
      <Navbar bg="light">
        <Container className="justify-content-center">
          <div>
            Developed by Lance Canlas, Joseph Fontanilla, and Sean Llera.
          </div>
        </Container>
      </Navbar>
    </div>
  );
}
