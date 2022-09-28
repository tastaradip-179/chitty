import React, { useState, useEffect } from 'react'
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, get, set, push, child, onChildAdded } from "firebase/database";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import '../css/message.css';

const GroupMessages = () => {

    //auth user states
    const [username, setUsername] = useState("");
    const [userid, setUserid] = useState("");
    const [dp, setDp] = useState("");
    

    //auth user's groups
    const [groups, setGroups] = useState([]);
    const [userGrpMsgs, setUserGrpMsgs] = useState([]);

    //onclick group states
    const [currentGroup, setCurrentGroup] = useState("");
    const [currentGroupData, setCurrentGroupData] = useState(null);
    

    //chat states
    const [grpMsg, setGrpMsg] = useState("");
    const [newGrpMsg, setNewGrpMsg] = useState(false);
    const [grpConversations, setGrpConversations] = useState([]);
    const [grpImage, setGrpImage] = useState("");
    const [grpImageName, setGrpImageName] = useState("");
    const [grpImages, setGrpImages] = useState([]);
    const [newGrpImage, setNewGrpImage] = useState(false);

    //modal states
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    //date
    const now = new Date(); 


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


    //get auth user's all groups
    let [change2, setChange2] = useState(false);  
    useEffect(()=>{
        let groupArr = [];
        const db = getDatabase();
        const groupRef = ref(db, 'groups/');
        if(userid != ''){
            onValue(groupRef, (snapshot) => {
                snapshot.forEach(itemGroup=>{
                    //add key as id to the group table
                    let groupId = itemGroup.key;
                    if(groupId !== undefined && itemGroup.val().id === undefined){
                        set(ref(db, 'groups/'+ groupId), {
                          id: groupId,
                          name: itemGroup.val().name,
                          admin: itemGroup.val().admin,
                          friends: itemGroup.val().friends,
                          createdAt: itemGroup.val().createdAt
                        });
                    } 
                    //the groups created by auth user
                    if(userid === itemGroup.val().admin){
                        groupArr.push(itemGroup.val());
                    }
                    //the groups added to auth user
                    else{
                      if(itemGroup.val().friends){
                        itemGroup.val().friends.map((itemFrndId)=>{
                          if(userid === itemFrndId){
                            groupArr.push(itemGroup.val());
                          }
                        })
                      }
                    }
                  })
                  setChange2(!change2);
            });
        }
        setGroups(groupArr);
    },[userid, change2])


    //get auth user's all group messages
    let [change3, setChange3] = useState(false);  
    useEffect(()=>{
        let grpMsgArrs = [];
        const db = getDatabase();
        const grpMsgRef = ref(db, 'group-messages/');
        //finding last messages of auth user's groups
        if(groups){
            groups.map((group, e)=>(
                get(child(grpMsgRef, `groupId:${group.id}`)).then((snapshot) => {
                  if(snapshot.exists()){
                      //push all values
                      let index = 0;
                      snapshot.forEach(element => {
                          grpMsgArrs.push({id: group.id, msg: element.val().msg, name:group.name, dp:group.dp, index: index++})   
                          //eliminate previous messages 
                            for(var i=0; i<grpMsgArrs.length-1; i++){
                            if(grpMsgArrs[i].id === grpMsgArrs[i+1].id && grpMsgArrs[i].index < grpMsgArrs[i+1].index){
                                grpMsgArrs.splice(i,1);
                            }
                        }
                      });
                  }
                }).catch((error) => {
                  console.error(error);
                })
            )) ;
            console.log(grpMsgArrs)
            setUserGrpMsgs(grpMsgArrs);    
        }
      },[userid])


   //dispatch
   const dispatch = useDispatch();
   //get onclick friend id
   let handleCurrentGroup = (e, id) => {
       e.preventDefault();
       setCurrentGroup(id);
       dispatch({type: "CURRENT_GROUP", payload: id})
   }
   const currentGroupId = useSelector(item=>item.currentGroup.current_group_id);
   //get onclick groups all values
   useEffect(()=>{
    const db = getDatabase();
    const grpRef = ref(db, 'groups/' + currentGroupId);
    onValue(grpRef, (snapshot) => {
      //getting admin name  
      let adminName = "";
      if(snapshot.val().admin){
        const grpAdminRef = ref(db, 'users/' + snapshot.val().admin);
        onValue(grpAdminRef, (user)=>{
            adminName = user.val().username
        })
      }
      //getting group friends name
      const frnds = snapshot.val().friends;
      let friendNames = [];
      frnds.map((frnd,index)=>{
      const grpfriendRef = ref(db, 'users/'+ frnd);
        onValue(grpfriendRef, (friend) => {
          friendNames.push(friend.val().username);
        });
      })
      //push all values
      setCurrentGroupData({id: snapshot.val().id, name: snapshot.val().name, admin: snapshot.val().admin, friends: snapshot.val().friends, dp: snapshot.val().dp, createdAt: snapshot.val().createdAt, adminName: adminName, friendNames: friendNames})
    }); 
    },[currentGroupId])

    //get messages from onclicked group
    useEffect(()=>{
        let grpMsgArr = [];
        const db = getDatabase();
        const grpMsgRef = ref(db, 'group-messages/' + `groupId:${currentGroupId}`);    
        onChildAdded(grpMsgRef, (snapshot) => {
            const userRef = ref(db, 'users/' + snapshot.val().sender);
            let senderName = "";
            let senderDP = "";
            onValue(userRef, (user)=>{
                 senderName = user.val().username
                 senderDP = user.val().dp
            })  
            grpMsgArr.push({sender: snapshot.val().sender, msg: snapshot.val().msg, sentAt: snapshot.val().sentAt, senderName: senderName, senderDP: senderDP});
        });
        setGrpConversations(grpMsgArr);
        setNewGrpMsg(!newGrpMsg);
    },[newGrpMsg, currentGroupId])



    //message send
    let handleSend = (e) => {
        e.preventDefault();
        const db = getDatabase();
        const groupRef = ref(db, 'group-messages');
        //push message under group id into database
        const newGroupRef = push(child(groupRef, `groupId:${currentGroupId}`));
        set(newGroupRef, {
            sender: userid,
            msg : grpMsg,
            sentAt: now.toISOString()
        });
        setGrpMsg("");
        setNewGrpMsg(!newGrpMsg);
    }


    return (
        <>
            <Topbar/>
            <div className='body'>
                <div className='left'>
                    <Sidebar username={username} userid={userid} dp={dp}/>
                </div>
                <div className='right'>
                    <Row>
                        <Col lg={8} md={8} sm={12}>
                            <Container>
                                <div className='chatlog'>
                                    {currentGroupData
                                    ? 
                                    <div className='header'>
                                        <div className='img'>
                                            <img src={currentGroupData.dp} alt="picture"/>
                                        </div>
                                        <div className='text'>
                                            <h2>{currentGroupData.name}</h2>
                                            <h4>{currentGroupData.adminName}</h4>
                                            <h6>{currentGroupData.friendNames.map((name, index)=>(
                                                <span>{name} {index < currentGroupData.friendNames.length-1 ? "," : ""} </span>
                                                ))}
                                            </h6>
                                        </div>
                                    </div>
                                    : 
                                    ""
                                    }
                                    <div className='chat'>
                                    {currentGroupData
                                        ?
                                            grpConversations
                                            ?
                                            grpConversations.map((item, index)=>(
                                                item.sender == userid
                                                ?
                                                <div className='sender-msg' key={index}>
                                                    <span>
                                                    {item.msg}
                                                    </span>
                                                    <img className='dp' src={dp} alt="picture"/>
                                                </div>
                                                :
                                                <div className='receiver-msg'>
                                                    <img className='dp' src={item.senderDP} alt="picture"/>
                                                    <span>
                                                        {item.msg}
                                                    </span>
                                                </div>
                                            ))
                                            :
                                            ""
                                        :
                                        ""
                                    }        
                                    </div>
                                    <div className='forms'>
                                        <div className='send-msg'>
                                            <div className='form'>
                                                <Form>
                                                    <Form.Group className="mb-3" controlId="formBasicMsg">
                                                        <Form.Control type="text" placeholder="Write something" name="grpMsg" onChange={(e)=>setGrpMsg(e.target.value)} value={grpMsg}/>
                                                    </Form.Group>
                                                    <Button type="submit" onClick={handleSend}>Send</Button>
                                                </Form>
                                            </div>
                                        </div>
                                        <div className='buttons'>
                                            <Button onClick={handleShow}>Attach Image</Button>
                                            <Button>Attach File</Button>
                                            <Button>Search</Button>
                                        </div>
                                    </div>
                                </div>
                            </Container>
                        </Col>
                        <Col lg={4} md={4} sm={12}>
                            <div className='lists'>
                            {userGrpMsgs
                                ?
                                <div className='chat-list'>
                                {userGrpMsgs.map((group, index)=>( 
                                    <a href="" className='chatbox' onClick={(e)=>handleCurrentGroup(e, group.id)}>
                                        {group.dp
                                        ?
                                        <div className='img'>
                                            <img src={group.dp} alt="picture"/>
                                        </div>
                                        :
                                        ""
                                        }
                                        <div className='text'>
                                            <h6>{group.name}</h6>
                                            <p>{group.msg}</p>
                                        </div>
                                    </a>
                                ))}
                                </div>
                                : 
                                ""
                            }
                            {groups
                                ?
                                <div className='friend-list'>
                                {groups.map((group, index)=>( 
                                    <a href="" className='friend' onClick={(e)=>handleCurrentGroup(e, group.id)}>
                                        <img src={group.dp} alt="picture"/>
                                        <h6>{group.name}</h6>
                                    </a>
                                    
                                ))}
                                </div>
                                :
                                ""
                            } 
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    )
}

export default GroupMessages