import React from 'react'
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import '../css/navbar.css';

const Topbar = () => {

  //getting auth
  const auth = getAuth();

  //navigate
  const navigate = useNavigate();

  //sign out
  let handleSignout = () => {
    signOut(auth).then(function() {
        navigate("/signinup");
    }).catch(function(error) {
        console.log(error);
    });
  }  
  
  return (
    <>
        {/* top navigation bar */}
        <div className='top-navbar'>
            <Navbar bg="dark" variant='dark' expand="lg" fixed="top">
                <Container className='topbar'>
                    <div className='left'>
                        <Navbar.Brand href="#">Chitty</Navbar.Brand>
                    </div>
                    <div className='right'>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link href="/">Profile</Nav.Link>
                                <NavDropdown title="Messages" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/my-messages">My Messages</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.2">New Messages</NavDropdown.Item>
                                <NavDropdown.Item href="/group-messages">Group Messages</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="#action/3.4">All Messages</NavDropdown.Item>
                                </NavDropdown>
                                <Nav.Link href="/signinup" onClick={handleSignout}>Sign out</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </div>
                </Container>
            </Navbar>
        </div>
        {/* top navigation bar */}
    </>
  )
}

export default Topbar