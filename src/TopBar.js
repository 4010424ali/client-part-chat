import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { withRouter } from 'react-router-dom';
import logo from './logo.png';

function TopBar({ location }) {
  return (
    <Navbar bg="light" expand="lg" variant="light">
      <Navbar.Brand href="#home">
        <img
          alt=""
          src={logo}
          width="30"
          height="30"
          className="d-inline-block align-top"
        />{' '}
        OpenHuddle
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          {/* <Nav.Link href="/" active={pathname == "/"}>
            Join another chatroom
          </Nav.Link>   */}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
export default withRouter(TopBar);
