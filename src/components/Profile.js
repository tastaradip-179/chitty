import React, {useState, useEffect} from 'react'
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { getStorage, ref as refer, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { Button, Row, Col, Container, Form, Modal, Spinner } from 'react-bootstrap';
import '../css/profile.css';

const Profile = () => {

  //auth user states
  const [username, setUsername] = useState("");
  const [userid, setUserid] = useState("");
  const [dp, setDp] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [status, setStatus] = useState("");

  //file states
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  let [loading, setLoading] = useState(false);

  //auth user's friends
  const [friends, setFriends] = useState([]);

  //getting auth and database
  const auth = getAuth();
  const db = getDatabase();


  //getting current user
  useEffect(()=>{
    onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserid(user.uid);
          setUsername(user.displayName);
          setDp(user.photoURL);
        } else {
          setUsername("");
          setDp("");
        }
      });
  }, []
  )


  //get auth user's friends
  let [change, setChange] = useState(false);
  let [change2, setChange2] = useState(false);
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
        setChange(!change);
      }); 
      setFriends(friendArr);
  },[userid, change, change2])

  
  //modal
  const [showNameModal, setShowNameModal] = useState(false);
  const handleCloseNameModal = () => setShowNameModal(false);
  const handleShowNameModal = () => setShowNameModal(true);
  const [showDPmodal, setShowDPmodal] = useState(false);
  const handleCloseDPmodal = () => setShowDPmodal(false);
  const handleShowDPmodal = () => setShowDPmodal(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const handleCloseStatusModal = () => setShowStatusModal(false);
  const handleShowStatusModal = () => setShowStatusModal(true);
  

  //edit username
  let handleChangeUsername = () => {
    updateProfile(auth.currentUser, {
        displayName: newUsername
      }).then(() => {
        setUsername(newUsername);
        set(ref(db, 'users/'+auth.currentUser.uid), {
            id: auth.currentUser.uid,
            username: newUsername,
            email: auth.currentUser.email,
            dp: auth.currentUser.photoURL,
            status: status,
            createdAt: auth.currentUser.metadata.creationTime,
            updatedAt: Date()
          });
      }).catch((error) => {
        console.log(error)
      });
      setShowNameModal(false)
  }


  //choose picture
  let handleDPselect = (e) => {
      if (e.target.files[0]){
          setFile(e.target.files[0]);
          setFilename(Date().toISOString() + e.target.files[0].name)
      }  
  }
  //upload picture
  let handleDPupload = async(e) => {
    e.preventDefault();
    setLoading(true);
    const path = `/images/${userid}/${filename}`;
    const storage = getStorage();
    const storageRef = refer(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file); 
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
            updateProfile(auth.currentUser, {
              photoURL: downloadURL
             }).then(() => {
              set(ref(db, 'users/'+auth.currentUser.uid), {
                id: auth.currentUser.uid,
                username: username,
                email: auth.currentUser.email,
                dp: downloadURL,
                status: status,
                createdAt: auth.currentUser.metadata.creationTime,
                updatedAt: Date()
              });
              setLoading(false);
              console.log('File available at', downloadURL);
             }).catch((error) => {
               console.log(error)
               setLoading(true);
             });
             setShowDPmodal(false)
             setDp(downloadURL)
          });
        }
      );
  }

  //post new status
  let handleStatus = () => {
    set(ref(db, 'users/'+auth.currentUser.uid), {
      id: auth.currentUser.uid,
      username: username,
      email: auth.currentUser.email,
      dp: auth.currentUser.photoURL,
      status: status,
      createdAt: auth.currentUser.metadata.creationTime,
      updatedAt: Date()
    });
    setShowStatusModal(false)
  }

  
  return (
    <>
        <Topbar/>
        <div className='body'>
          <div className='left'>
            <Sidebar username={username} userid={userid} dp={dp}/>
          </div>
          <div className='right'>
            <div className='profile'>
              <Container fluid>
                <Row>
                  <Col lg={4} md={4} sm={12}>
                    <img src={dp} className='display-pic' alt="display-pic"/>
                    <div className='buttons'>
                      <Button onClick={handleShowNameModal}>Edit Username</Button>
                      <Button onClick={handleShowDPmodal}>Change Picture</Button>
                      <Button onClick={handleShowStatusModal}>Post Status</Button>
                    </div>
                  </Col>
                  <Col lg={8} md={8} sm={12}>
                    <div className='info'>
                      <h1>{username}</h1>
                      <h4>{status}</h4>
                      <h6>{friends.length} Friends</h6>
                    </div>
                    <div className='friends'>
                      {friends.map((user, index)=>(
                          <div className='friend'>
                            <div style={{padding: "26px"}}>
                              <img src={user.dp} alt="picture"/>
                              <h6>{user.username}</h6>
                            </div>
                          </div>
                      ))}
                    </div>
                  </Col>
                </Row>
                </Container>
              </div>
            </div>
        </div>

        <Modal show={showNameModal} onHide={handleCloseNameModal}>
          <Modal.Header closeButton>
            <Modal.Title>Change Username</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="exampleForm.ControlInput">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" onChange={(e)=>setNewUsername(e.target.value)}/>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseNameModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleChangeUsername}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showDPmodal} onHide={handleCloseDPmodal}>
          <Modal.Header closeButton>
            <Modal.Title>Change Display Picture</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label></Form.Label>
                <Form.Control type="file" onChange={handleDPselect}/>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDPmodal}>
              Close
            </Button>
            {loading
                ?
                  <Button variant="primary">
                    <Spinner animation="grow" variant="secondary" />
                  </Button>
                :
                <Button variant="primary" onClick={handleDPupload}>
                  Save Changes
                </Button>
            }
          </Modal.Footer>
        </Modal>

        <Modal show={showStatusModal} onHide={handleCloseStatusModal}>
          <Modal.Header closeButton>
            <Modal.Title>Post New Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInputS">
                <Form.Label>Your Status</Form.Label>
                <Form.Control type="text" onChange={(e)=>setStatus(e.target.value)}/>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseStatusModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleStatus}>
              Post
            </Button>
          </Modal.Footer>
        </Modal>
    </>
  )
}

export default Profile