import React, { useState, useEffect } from 'react'
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { Alert, Card, Button, Row, Col } from 'react-bootstrap';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import '../css/users.css';

const RequestsPending = () => {
  //auth user states
  const [username, setUsername] = useState("");
  const [userid, setUserid] = useState("");
  const [dp, setDp] = useState("");

  //all pending users states
  const [pendingUsers, setPendingUsers] = useState([]);


  //get auth user 
  let [change, setChange] = useState(false);
  useEffect(()=>{
     //getting auth
     const auth = getAuth();
     const db = getDatabase();
     const userRef = ref(db, 'users/');
     //get auth user values
     onValue(userRef, (snapshot) => {
         snapshot.forEach(item=>{
             if(auth.currentUser.uid === item.key){
               setUserid(auth.currentUser.uid);
               setUsername(item.val().username);
               setDp(item.val().dp)
             }  
           });
           setChange(!change);
         }); 
  },[change])


  //get request pending users
  let [change2, setChange2] = useState(false);
  let [change3, setChange3] = useState(false);
  useEffect(()=>{
    let pendingUserArr = [];
    const db = getDatabase();
    const userRef = ref(db, 'users/');
    const reqRef = ref(db, 'requests/'); 
    //get request sent users values
    onValue(reqRef, (snapshot) => {
        snapshot.forEach(itemRequser=>{
            //set array of request to users
            if(userid !== '' && userid === itemRequser.val().receiver_id){
                //add key as id to request database
                let reqid = itemRequser.key;
                if(reqid !== undefined && itemRequser.val().id === undefined){
                    set((ref(db, 'requests/' + reqid)), {
                        id: reqid,
                        sender_id: itemRequser.val().sender_id,
                        receiver_id: userid,
                    });
                }
                onValue(userRef, (snapshot) => {
                    snapshot.forEach(itemUser=>{
                        if(itemUser.key === itemRequser.val().sender_id){
                          pendingUserArr.push({"reqId": reqid, dp: itemUser.val().dp, email: itemUser.val().email, requserid: itemUser.val().id, username: itemUser.val().username});
                        }   
                    })
                    setChange2(!change2);
                });
            }   
        })
        setChange3(!change3);
    });
    setPendingUsers(pendingUserArr);
  },[userid, change2, change3])

  
  //accept friend request
  let handleAcceptRequest = (id, id2) => {
    const db = getDatabase();
    set(push(ref(db, 'friends/')), {
      sender_id: id,
      accepter_id: userid,
      createdAt: Date()
    });
    set((ref(db, 'requests/' + id2)), {
      id: null,
      receiver_id: null,
      sender_id: null,  
    });
  }


  //reject friend request
  let handleRejectRequest = (id) => {
    const db = getDatabase();
    set((ref(db, 'requests/' + id)), {
        id: null,
        receiver_id: null,
        sender_id: null,  
    });
  }



  return (
    <>
        <Topbar/>
        <div className='body'>
            <div className='left'>
              <Sidebar username={username} userid={userid} dp={dp}/>
            </div>
            <div className='right'>
                <Row className='user-list'>
                  {pendingUsers.length > 0
                  ?
                  pendingUsers.map((user, index)=>(
                    <Col lg={2} md={2} sm={4}>
                      <Card key={index} style={{ width: '100%' }}>
                          <Card.Img variant="top" src={user.dp} alt="dp"/>
                          <Card.Body>
                              <Card.Title>{user.username}</Card.Title>
                              <Button variant="success" onClick={()=>handleAcceptRequest(user.requserid, user.reqId)}>Accept</Button>
                              <Button variant="danger" onClick={()=>handleRejectRequest(user.reqId)}>Reject</Button>
                          </Card.Body>
                      </Card>
                    </Col>
                  ))
                  :
                  <Alert variant="danger">
                    No Requests
                  </Alert>
                  }
                </Row>
            </div>
        </div>
    </>
  )
}

export default RequestsPending