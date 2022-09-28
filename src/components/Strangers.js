import React, { useState, useEffect } from 'react'
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { Alert, Card, Button, Row, Col } from 'react-bootstrap';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import '../css/users.css';

const Strangers = () => {

   //auth user states
   const [username, setUsername] = useState("");
   const [userid, setUserid] = useState("");
   const [dp, setDp] = useState("");

   //all strangers states
   const [strangers, setStrangers] = useState([]);



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


    //get all strangers
    let [change2, setChange2] = useState(false);
    let [change3, setChange3] = useState(false);
    useEffect(()=>{
      let strangerArr = [];

      const db = getDatabase();
      const userRef = ref(db, 'users/');
      const friendRef = ref(db, 'friends/'); 
      const reqRef = ref(db, 'requests/');
        onValue(userRef, (snapshot) => {
            snapshot.forEach(itemUser=>{
                if(userid !== ''){
                    //taking all users
                    if(userid !== itemUser.key){
                        strangerArr.push({"btnText": "Add Friend", dp: itemUser.val().dp, email: itemUser.val().email, userid: itemUser.val().id, username: itemUser.val().username}); 
                        onValue(reqRef, (snapshot) => {
                            snapshot.forEach(itemReq=>{
                                //checking if request sent to stranger
                                if(userid === itemReq.val().sender_id && itemUser.key === itemReq.val().receiver_id){
                                    strangerArr.pop();
                                    strangerArr.push({"btnText": "Request Sent", dp: itemUser.val().dp, email: itemUser.val().email, userid: itemUser.val().id, username: itemUser.val().username}); 
                                }
                                //checking if request got from stranger
                                else if(userid === itemReq.val().receiver_id && itemUser.key === itemReq.val().sender_id){
                                    strangerArr.pop();
                                    strangerArr.push({"btnText": "Pending Request", dp: itemUser.val().dp, email: itemUser.val().email, userid: itemUser.val().id, username: itemUser.val().username});
                                } 
                            })
                            setChange3(!change3);
                        });
                        //checking friends
                        onValue(friendRef, (snapshot) => {
                        snapshot.forEach(itemFriend=>{ 
                          if((itemUser.key === itemFriend.val().sender_id && userid === itemFriend.val().accepter_id)
                            ||
                            (itemUser.key === itemFriend.val().accepter_id && userid === itemFriend.val().sender_id)
                          ){
                            //taking users excluding friends
                            strangerArr.pop();
                          }  
                        })
                        setChange2(!change2);
                        }); 
                    }  
                }  
            });
          }); 
          setStrangers(strangerArr); 
    },[userid, change2, change3])


    //send friend request
    let handleAddFriend = (id) => {
        const db = getDatabase();
        set(push(ref(db, 'requests/')), {
          receiver_id: id,
          sender_id: userid,
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
            {strangers.length > 0
            ?
              strangers.map((user, index)=>(
                <Col lg={2} md={2} sm={4}>
                  <Card key={index} style={{ width: '100%' }}>
                      <Card.Img variant="top" src={user.dp} alt="dp"/>
                      <Card.Body>
                          <Card.Title>{user.username}</Card.Title>
                          {
                          user.btnText == "Request Sent"
                          ?
                          <Button variant = "info" style={{color: "#ffffff"}} disabled>{user.btnText}</Button>
                          :
                          user.btnText == "Pending Request"
                          ?
                          <Button variant = "secondary" disabled>{user.btnText}</Button>
                          :
                          user.btnText == "Add Friend"
                          ?
                          <Button variant = "primary" onClick={()=>handleAddFriend(user.userid)}>{user.btnText}</Button>
                          :
                          ""
                          }
                      </Card.Body>
                  </Card>
                </Col>
              ))
            :
              <Alert variant="danger">
                No Strangers 
              </Alert>
            }
            </Row>
        </div>
        </div> 
    </>
    )
}

export default Strangers