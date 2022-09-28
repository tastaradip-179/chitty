import React, { useState, useEffect } from 'react'
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { Alert, Card, Button, Row, Col } from 'react-bootstrap';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import '../css/users.css';

const Friends = () => {

   //auth user states
   const [username, setUsername] = useState("");
   const [userid, setUserid] = useState("");
   const [dp, setDp] = useState("");

   //all friends states
   const [friends, setFriends] = useState([]);



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


    //get auth user's friends
    let [change2, setChange2] = useState(false);
    let [change3, setChange3] = useState(false);
    useEffect(()=>{
    //getting auth
    const auth = getAuth();
    let friendArr = [];
    const db = getDatabase();
    const userRef = ref(db, 'users/');
    const friendRef = ref(db, 'friends/');
    //get friends arr 
    onValue(friendRef, (snapshot) => {
        snapshot.forEach(itemFriend=>{
            if(userid != ''){
                //checking friendship
                if(userid === itemFriend.val().sender_id || userid === itemFriend.val().accepter_id){
                    //add key as id to request database
                    let frndshpId = itemFriend.key;
                    if(frndshpId !== undefined && itemFriend.val().id === undefined){
                        set((ref(db, 'friends/' + frndshpId)), {
                            id: frndshpId,
                            sender_id: itemFriend.val().sender_id,
                            accepter_id: itemFriend.val().accepter_id,
                        });
                    }
                    //friend arr push
                    onValue(userRef, (snapshot) => {
                        snapshot.forEach(itemUser=>{
                            if(itemUser.key !== userid){
                                //get friends values
                                if(itemUser.key === itemFriend.val().sender_id || itemUser.key === itemFriend.val().accepter_id ){
                                    friendArr.push({"frndshpId": frndshpId, dp: itemUser.val().dp, email: itemUser.val().email, friendid: itemUser.val().id, username: itemUser.val().username, createdAt: itemUser.val().createdAt});
                                }  
                            }
                        })
                        setChange2(!change2);
                    });
                }
            } 
          });
          setChange3(!change3);
        }); 
        setFriends(friendArr);
    },[userid, change2, change3])

    let handleUnfriend = (id) => {
        const db = getDatabase();
        set((ref(db, 'friends/' + id)), {
            id: null,
            sender_id: null,
            accepter_id: null,  
            createdAt: null
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
              {friends.length > 0
              ?
              friends.map((user, index)=>(
                <Col lg={2} md={2} sm={4}>
                  <Card key={index} style={{ width: '100%' }}>
                      <Card.Img variant="top" src={user.dp} alt="dp"/>
                      <Card.Body>
                          <Card.Title>{user.username}</Card.Title>
                          <Button variant="danger" onClick={()=>handleUnfriend(user.frndshpId)}>Unfriend</Button>
                      </Card.Body>
                  </Card>
                </Col>
              ))
              :
              <Alert variant="danger">
                No Friends 
              </Alert>
              }
            </Row>
      </div>
    </div>   
  </>
  )
}

export default Friends