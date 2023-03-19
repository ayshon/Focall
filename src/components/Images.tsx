// Importing the Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";

export default function Footer() {
  return (
    <div className="images-container">
      <Navbar bg="light">
        <Container className="justify-content-center">
          <div>
            <u>
              <b>Diagram Image Capture</b>
            </u>
          </div>
        </Container>
      </Navbar>
      <div id="myImages"></div>
    </div>
  );
}
