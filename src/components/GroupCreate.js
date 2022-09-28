import React, {useState, useEffect} from 'react'
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { getStorage, ref as refer, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { Alert, Form, Button, Container, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import Topbar from './Topbar';
import Sidebar from './Sidebar';


const GroupCreate = () => {

  //auth user states
  const [username, setUsername] = useState("");
  const [userid, setUserid] = useState("");
  const [dp, setDp] = useState("");

  //create group states
  const [groupName, setGroupName] = useState("");
  const [groupFriends, setGroupFriends] = useState([]);
  const [msg, setMsg] = useState("");

  //file states
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  let [loading, setLoading] = useState(false);

  //auth user's friends
  const [friends, setFriends] = useState([]);


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



  //select friends from list to add in a group
  let handleAddFriendstoGroup = (e) => { 
    var selectedOptions = e;
    var friendsinGroup = [];
      for (var i = 0; i < selectedOptions.length ; i++) {
        friendsinGroup.push(selectedOptions[i].value);
      }
    setGroupFriends(friendsinGroup)
  }
 


  //choose picture
  let handleGroupDPselect = (e) => {
    if (e.target.files[0]){
        setFile(e.target.files[0]);
        setFilename(now.toISOString() + e.target.files[0].name)
    }  
  }

  //group create
  let handleCreateGroup = async(e) => {
    e.preventDefault();
    const db = getDatabase();  
    setLoading(true);
    const path = `/images/groups/${filename}`;
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
            set(push(ref(db, 'groups/')), {
              name: groupName,
              admin: userid,
              friends: groupFriends,
              dp: downloadURL,
              createdAt: now.toISOString()
            })
            setMsg("Group has been created")
            setGroupName("")   
            setGroupFriends("")
            setLoading("");
          });
        }
      );
  }

    
    
  return (
    <>
        <Topbar/>
        <div className='body'>
            <div className='left'>
                <Sidebar username={username} userid={userid} dp={dp}/>
            </div>
            <div className='right'>
                <Container>
                    <Form style={{margin: "40px auto", width: "500px"}}>
                        {msg
                        ?
                        <Alert variant="success">{msg}</Alert>
                        :
                        ""
                        }
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Group Name</Form.Label>
                            <Form.Control type="text" name="groupName" onChange={(e)=>setGroupName(e.target.value)}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                        <Form.Label>Add People</Form.Label>
                            <Select
                                closeMenuOnSelect={false}
                                defaultValue=""
                                isMulti
                                options={friends.map(friend => ({ label: friend.username, value: friend.friendid }))}
                                onChange={(e)=>handleAddFriendstoGroup(e)}
                                />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput3">
                          <Form.Label>Select Display Photo</Form.Label>
                          <Form.Control type="file" onChange={handleGroupDPselect}/>
                        </Form.Group>
                        {loading
                            ?
                              <Button variant="primary" style={{width: "100%"}}>
                                <Spinner animation="grow" variant="secondary" />
                              </Button>
                            :
                            <Button variant="primary" type="submit" style={{width: "100%"}} onClick={handleCreateGroup}>
                              Submit
                            </Button>
                        }
                    </Form>
                </Container>
            </div>
        </div>
    </>
  )
}

export default GroupCreate