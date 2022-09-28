import React, { useState, useEffect } from 'react'
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, set, push, remove } from "firebase/database";
import { getStorage, ref as refer, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage";
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Container, Row, Col, Modal } from 'react-bootstrap';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import '../css/message.css';


const Messages = () => {

    //auth user states
    const [username, setUsername] = useState("");
    const [userid, setUserid] = useState("");
    const [dp, setDp] = useState("");
    

    //auth user's friends and last sent/received msgs
    const [friends, setFriends] = useState([]);
    const [userMsgs, setUserMsgs] = useState([]);


    //onclick friend states
    const [currentFriend, setCurrentFriend] = useState("");
    const [currentFriendData, setCurrentFriendData] = useState(null);


    //chat states
    const [msg, setMsg] = useState("");
    const [newMsg, setNewMsg] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [image, setImage] = useState("");
    const [imageName, setImageName] = useState("");
    const [images, setImages] = useState([]);
    const [newImg, setNewImg] = useState(false);


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


    //get auth user's all last messages from friends
    useEffect(()=>{
        let msgArr = [];
        let oneFrndLastmsgArr = [];
        let frndshpIdArr = [];
        let uniquefrndshpIdArr = [];
        const db = getDatabase();
        const msgRef = ref(db, 'messages/');
        //get all messages of auth user and friendship ids
        onValue(msgRef, (snapshot) => {
          snapshot.forEach(item=>{
            if(userid !==''){
                if((item.val().sender === userid || item.val().receiver === userid))
                { 
                    frndshpIdArr.push(item.val().friendshipId)
                    msgArr.push(item.val()); 
                }
            }
          })
        });
        //make unique array of friendship ids
        uniquefrndshpIdArr = [...new Set(frndshpIdArr)];
        //taking the last conversation message of friends
        for(var i=0; i<uniquefrndshpIdArr.length; i++){
            let oneFrndmsgArr = [];
            //taking one friend's conversation with auth user
            for(var j=0; j<msgArr.length; j++){
                if(msgArr[j].friendshipId === uniquefrndshpIdArr[i]){
                    oneFrndmsgArr.push(msgArr[j])
                }
            }
            //finding latest message
            let max = oneFrndmsgArr[0].sentAt;
            let index = 0;
            for(var k=0; k<oneFrndmsgArr.length; k++){
                if(oneFrndmsgArr[k].sentAt > max){
                    max = oneFrndmsgArr[k].sentAt;
                    index = k;
                }
            }
            //push message and friend's information
            if(userid !== oneFrndmsgArr[index].sender){
                const userRef = ref(db, 'users/'+ oneFrndmsgArr[index].sender);
                onValue(userRef, (snapshot) => {
                    oneFrndLastmsgArr.push({msg: oneFrndmsgArr[index].msg, friendId: snapshot.val().id, friendName: snapshot.val().username, friendDP: snapshot.val().dp});
                });
            }
            else if(userid !== oneFrndmsgArr[index].receiver){
                const userRef = ref(db, 'users/'+ oneFrndmsgArr[index].receiver);
                onValue(userRef, (snapshot) => {
                    oneFrndLastmsgArr.push({msg: oneFrndmsgArr[index].msg, friendId: snapshot.val().id, friendName: snapshot.val().username, friendDP: snapshot.val().dp});
                });
            }
        }
        setUserMsgs(oneFrndLastmsgArr);
    },[userid, newMsg])



    //dispatch
    const dispatch = useDispatch();
    //get onclick friend id
    let handleCurrentFriend = (e, id) => {
        e.preventDefault();
        setCurrentFriend(id);
        dispatch({type: "CURRENT_FRIEND", payload: id})
    }
    const currentFriendId = useSelector(item=>item.currentFriend.current_friend_id);

    //get onclick friends all values
    useEffect(()=>{
        const db = getDatabase();
        const userRef = ref(db, 'users/' + currentFriendId);
        onValue(userRef, (snapshot) => {
          setCurrentFriendData(snapshot.val())
        });
    },[currentFriendId])


    //get conversation with onclick friend
    let [msgchange, setMsgChange] = useState(false);
    useEffect(()=>{
        let msgArr = [];
        const db = getDatabase();
        const msgRef = ref(db, 'messages/');
        onValue(msgRef, (snapshot) => {
          snapshot.forEach(item=>{
            if(userid !=='' && currentFriendId !==''){
                if((item.val().sender === userid && item.val().receiver === currentFriendId)
                ||
                (item.val().sender === currentFriendId && item.val().receiver === userid))
                {
                    msgArr.push(item.val()); 
                }
            }
          })
          setMsgChange(!msgchange);
        });
        setConversations(msgArr);
    },[msgchange, userid, currentFriendId])

    //get sent images while chatting
    let [imgchange, setImgChange] = useState(false);
    useEffect(()=>{
        let imageArr = [];
        const db = getDatabase();
        const imageRef = ref(db, 'images-chat/');
        onValue(imageRef, (snapshot) => {
            snapshot.forEach(item=>{
              if(userid !=='' && currentFriendId !==''){
                  if((item.val().sender === userid && item.val().receiver === currentFriendId)
                  ||
                  (item.val().sender === currentFriendId && item.val().receiver === userid))
                  {
                    imageArr.push(item.val()); 
                  }
              }
            })
            setImgChange(!imgchange);
          });
          setImages(imageArr);
    },[imgchange, userid, currentFriendId])


    //message send
    let handleSend = (e) => {
        e.preventDefault();
        const db = getDatabase();

        const friendRef = ref(db, 'friends/');
        let friendshipId = "";
        onValue(friendRef, (snapshot) => {
            snapshot.forEach(item=>{
                if((userid === item.val().sender_id && currentFriendId === item.val().accepter_id)
                || (userid === item.val().accepter_id && currentFriendId === item.val().sender_id)){
                  {
                    friendshipId = item.val().id;
                  }
              }
            })
        });

        set(push(ref(db, 'messages/')), {
          msg : msg,
          sender : userid,
          receiver: currentFriendId,
          friendshipId: friendshipId,
          sentAt: now.toISOString()
        });
        setMsg("");
        setNewMsg(!newMsg);
    }

    //Choose photo
    let handlePhotoSelect = (e) => {
        if (e.target.files[0]){
          setImage(e.target.files[0]);
          setImageName(now.toISOString() + e.target.files[0].name);
        }
    }
      
    //Send Photo
    let handlePhotoAttach = (e) => {
        e.preventDefault();
        const path = `/images/msg/${imageName}`;
        const storage = getStorage();
        const storageRef = refer(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, image); 
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
           }, 
            (error) => {
              console.log(error)
            }, 
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                console.log('File available at', downloadURL);
                setShow(false)
                const db = getDatabase();
                set(push(ref(db, 'images-chat/')), {
                    sender: userid,
                    receiver: currentFriendId,
                    url: downloadURL,
                    imageName: imageName,
                    sentAt: now.toISOString()
                });
                setNewImg(!newImg);
              });
            }
        ); 
    }


    let handleUnsendPhoto = (e, imgname) => {
        e.preventDefault();
        const db = getDatabase();
        const storage = getStorage();
        // Create a reference to the file to delete
        const desertRef = refer(storage, `images/msg/${imgname}`);
        //get id from image chat database 
        const imageRef = ref(db, 'images-chat/');
        let id = "";
        onValue(imageRef, (snapshot) => {
            snapshot.forEach(item=>{
                if(item.val().imageName === imgname){
                    id = item.key;
                }
            })
        });
        // Delete the file
        deleteObject(desertRef).then(() => {
            const imgRef = ref(db, 'images-chat/'+ id);
            remove(imgRef);
        }).catch((error) => {
            console.log(error);
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
                    <Row>
                        <Col lg={8} md={8} sm={12}>
                            <Container>
                                <div className='chatlog'>
                                    {currentFriendData
                                    ? 
                                    <div className='header'>
                                        <div className='img'>
                                            <img src={currentFriendData.dp} alt="picture"/>
                                        </div>
                                        <div className='text'>
                                            <h4>{currentFriendData.username}</h4>
                                            <h6>{currentFriendData.status}</h6>
                                        </div>
                                    </div>
                                    : 
                                    ""
                                    }
                                    <div className='chat'>
                                        {currentFriendData
                                        ?
                                            conversations
                                            ?
                                            conversations.map((item, index)=>( 
 
                                                (
                                                    item.sender === userid
                                                    ?
                                                        <>
                                                        <div className='sender-msg' key={index}>
                                                            <span>
                                                                {item.msg}
                                                            </span>
                                                            <img className='dp' src={dp} alt="picture"/>
                                                        </div>
                                                        {    
                                                        images
                                                        ?
                                                            images.map((img, i)=>(
                                                                (conversations[index+1]
                                                                ? 
                                                                    img.sentAt > item.sentAt && img.sentAt < JSON.stringify(conversations[index+1].sentAt).replace(/"/g, "")
                                                                    ? 
                                                                        img.sender === userid
                                                                        ?
                                                                        <div className='sender-msg'>
                                                                            <Button variant='danger' onClick={(e)=>handleUnsendPhoto(e, img.imageName)} style={{marginRight: "2px"}}>Unsend</Button>
                                                                            <img className='chat-image' src={img.url} alt="picture"/>
                                                                            <img className='dp' src={dp} alt="picture"/>
                                                                        </div>
                                                                        :
                                                                        ""
                                                                    :
                                                                    ""    
                                                                :
                                                                    img.sentAt > item.sentAt
                                                                    ? 
                                                                        img.sender === userid
                                                                        ?
                                                                        <div className='sender-msg'>
                                                                            <Button variant='danger' onClick={(e)=>handleUnsendPhoto(e, img.imageName)} style={{marginRight: "2px"}}>Unsend</Button>
                                                                            <img className='chat-image' src={img.url} alt="picture"/>
                                                                            <img className='dp' src={dp} alt="picture"/>
                                                                        </div>
                                                                        :
                                                                        ""
                                                                    :
                                                                    ""
                                                                )
                                                            ))
                                                        :
                                                        ""
                                                        }
                                                        </>
                                                    :
                                                        <>
                                                        <div className='receiver-msg'>
                                                            <img className='dp' src={currentFriendData.dp} alt="picture"/>
                                                            <span>
                                                                {item.msg}
                                                            </span>
                                                        </div>
                                                        {    
                                                        images
                                                        ?
                                                            images.map((img, i)=>(
                                                                (conversations[index+1]
                                                                    ? 
                                                                        img.sentAt > item.sentAt && img.sentAt < JSON.stringify(conversations[index+1].sentAt).replace(/"/g, "")
                                                                        ? 
                                                                            img.sender === currentFriendId
                                                                            ?
                                                                            <div className='receiver-msg'>
                                                                                <img className='dp' src={currentFriendData.dp} alt="picture"/>
                                                                                <img className='chat-image' src={img.url} alt="unsent"/>
                                                                            </div>
                                                                            :
                                                                            ""
                                                                        :
                                                                        ""    
                                                                    :
                                                                        img.sentAt > item.sentAt
                                                                        ? 
                                                                            img.sender === currentFriendId
                                                                            ?
                                                                            <div className='receiver-msg'>
                                                                                <img className='dp' src={currentFriendData.dp} alt="picture"/>
                                                                                <img className='chat-image' src={img.url} alt="unsent"/>
                                                                            </div>
                                                                            :
                                                                            ""
                                                                        :
                                                                        ""
                                                                )
                                                            ))
                                                        :
                                                        ""
                                                        }
                                                        </>
                                                )
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
                                                        <Form.Control type="text" placeholder="Write something" name="msg" onChange={(e)=>setMsg(e.target.value)} value={msg}/>
                                                    </Form.Group>
                                                    <Button type="submit" onClick={handleSend}>Send</Button>
                                                </Form>
                                            </div>
                                        </div>
                                        <div className='buttons'>
                                            <Button onClick={handleShow}>Attach Photo</Button>
                                            <Button>Attach File</Button>
                                            <Button>Search</Button>
                                        </div>
                                    </div>
                                </div>
                            </Container>
                        </Col>
                        <Col lg={4} md={4} sm={12}>
                            <div className='lists'>
                                {userMsgs
                                ?
                                <div className='chat-list'>
                                    {
                                    userMsgs.map((user, index)=>(
                                        <a href="" className='chatbox' onClick={(e)=>handleCurrentFriend(e, user.friendId)}>
                                            <div className='img'>
                                                <img src={user.friendDP} alt="picture"/>
                                            </div>
                                            <div className='text'>
                                                <h6>{user.friendName}</h6>
                                                <p>{user.msg}</p>
                                            </div>
                                        </a>
                                    ))
                                    }
                                </div>
                                :
                                ""
                                }
                                <div className='friend-list'>
                                {friends.map((user, index)=>(
                                    <a href="" className='friend' onClick={(e)=>handleCurrentFriend(e, user.friendid)}>
                                        <img src={user.dp} alt="picture"/>
                                        <h6>{user.username}</h6>
                                    </a>
                                ))}
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                        <Modal.Title>Select photo to send</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label></Form.Label>
                            <Form.Control type="file" onChange={handlePhotoSelect}/>
                            </Form.Group>
                        </Form>
                        </Modal.Body>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handlePhotoAttach}>
                            Send
                        </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </>
    )
}

export default Messages