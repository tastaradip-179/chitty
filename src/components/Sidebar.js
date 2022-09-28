import React from 'react'
import SidebarMenu from 'react-bootstrap-sidebar-menu';
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import '../css/navbar.css';

const Sidebar = (props) => {

  //getting auth
  const auth = getAuth();


  return (
    <>
        {/* side navigation bar */}
        <div className='sidebar'>
          <SidebarMenu bg='dark'>
            {/* auth user img */}
            <SidebarMenu.Header>
            <img src={props.dp} className='dp' alt="dp"/>
                <SidebarMenu.Brand>
                    <h6>{ props.username }</h6>
                </SidebarMenu.Brand>
            </SidebarMenu.Header>
            {/* auth user img */}
            <SidebarMenu.Body>
                {/* groups */}
                <SidebarMenu.Sub>
                <SidebarMenu.Sub.Toggle>
                    <SidebarMenu.Nav.Icon></SidebarMenu.Nav.Icon>
                    <SidebarMenu.Nav.Title><span>Group</span></SidebarMenu.Nav.Title>
                </SidebarMenu.Sub.Toggle>
                <SidebarMenu.Sub.Collapse>
                    <SidebarMenu.Nav>
                    <SidebarMenu.Nav.Link href="/groups">
                        <SidebarMenu.Nav.Icon></SidebarMenu.Nav.Icon>
                        <SidebarMenu.Nav.Title><span>My Groups</span></SidebarMenu.Nav.Title>
                    </SidebarMenu.Nav.Link>
                    </SidebarMenu.Nav>
                </SidebarMenu.Sub.Collapse>
                <SidebarMenu.Sub.Collapse>
                    <SidebarMenu.Nav>
                    <SidebarMenu.Nav.Link href="/group-create">
                        <SidebarMenu.Nav.Icon></SidebarMenu.Nav.Icon>
                        <SidebarMenu.Nav.Title><span>Create A Group</span></SidebarMenu.Nav.Title>
                    </SidebarMenu.Nav.Link>
                    </SidebarMenu.Nav>
                </SidebarMenu.Sub.Collapse>
                </SidebarMenu.Sub>
                {/* groups */}
                {/* requests */}
                <SidebarMenu.Sub>
                <SidebarMenu.Sub.Toggle>
                    <SidebarMenu.Nav.Icon></SidebarMenu.Nav.Icon>
                    <SidebarMenu.Nav.Title><span>Requests</span></SidebarMenu.Nav.Title>
                </SidebarMenu.Sub.Toggle>
                <SidebarMenu.Sub.Collapse>
                    <SidebarMenu.Nav>
                    <SidebarMenu.Nav.Link href="/requests-pending">
                        <SidebarMenu.Nav.Icon></SidebarMenu.Nav.Icon>
                        <SidebarMenu.Nav.Title><span>Pending</span></SidebarMenu.Nav.Title>
                    </SidebarMenu.Nav.Link>
                    </SidebarMenu.Nav>
                </SidebarMenu.Sub.Collapse>
                <SidebarMenu.Sub.Collapse>
                    <SidebarMenu.Nav>
                    <SidebarMenu.Nav.Link href="/request-sent-to-users">
                        <SidebarMenu.Nav.Icon></SidebarMenu.Nav.Icon>
                        <SidebarMenu.Nav.Title><span>Sent</span></SidebarMenu.Nav.Title>
                    </SidebarMenu.Nav.Link>
                    </SidebarMenu.Nav>
                </SidebarMenu.Sub.Collapse>
                </SidebarMenu.Sub>
                {/* requests */}
                {/* friends */}
                <SidebarMenu.Nav>
                <SidebarMenu.Nav.Link href="/friends">
                    <SidebarMenu.Nav.Icon></SidebarMenu.Nav.Icon>
                    <SidebarMenu.Nav.Title><span>Friends</span></SidebarMenu.Nav.Title>
                </SidebarMenu.Nav.Link>
                </SidebarMenu.Nav>
                {/* friends */}
                {/* all users */}
                <SidebarMenu.Sub>
                <SidebarMenu.Sub.Toggle>
                    <SidebarMenu.Nav.Icon></SidebarMenu.Nav.Icon>
                    <SidebarMenu.Nav.Title><span>Users</span></SidebarMenu.Nav.Title>
                </SidebarMenu.Sub.Toggle>
                <SidebarMenu.Sub.Collapse>
                    <SidebarMenu.Nav>
                    <SidebarMenu.Nav.Link href="/all-users">
                        <SidebarMenu.Nav.Icon></SidebarMenu.Nav.Icon>
                        <SidebarMenu.Nav.Title><span>All Users</span></SidebarMenu.Nav.Title>
                    </SidebarMenu.Nav.Link>
                    </SidebarMenu.Nav>
                </SidebarMenu.Sub.Collapse>
                <SidebarMenu.Sub.Collapse>
                    <SidebarMenu.Nav>
                    <SidebarMenu.Nav.Link href="/strangers">
                        <SidebarMenu.Nav.Icon></SidebarMenu.Nav.Icon>
                        <SidebarMenu.Nav.Title><span>Strangers</span></SidebarMenu.Nav.Title>
                    </SidebarMenu.Nav.Link>
                    </SidebarMenu.Nav>
                </SidebarMenu.Sub.Collapse>
                </SidebarMenu.Sub>
                {/* all users */}
            </SidebarMenu.Body>
          </SidebarMenu>
        </div>
        {/* side navigation bar */}
    </>
  )
}

export default Sidebar