import React, {useState, useEffect} from 'react'
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, set, remove } from "firebase/database";
import { Card, Button, Row, Col } from 'react-bootstrap';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

const Groups = () => {

    //auth user states
    const [username, setUsername] = useState("");
    const [userid, setUserid] = useState("");
    const [dp, setDp] = useState("");

    //auth user's groups
    const [groupsCreatedbyMe, setGroupsCreatedbyMe] = useState([]);
    const [groupsAddedtoMe, setGroupsAddedtoMe] = useState([]);
    const [groupAdminName, setGroupAdminName] = useState("");


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
        let groupCArr = [];
        let groupAArr = [];
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
                          dp: itemGroup.val().dp,
                          createdAt: itemGroup.val().createdAt
                        });
                    } 
                    //the groups created by auth user
                    if(userid === itemGroup.val().admin){
                      if(itemGroup.val().friends){
                        //finding friends values from the groups
                        const frnds = itemGroup.val().friends;
                        let friendNames = [];
                        frnds.map((frnd,index)=>{
                            const groupfriendRef = ref(db, 'users/'+ frnd );
                              onValue(groupfriendRef, (friend) => {
                                friendNames.push(friend.val().username);
                              });
                        })
                        //push all the values into an array
                        groupCArr.push({id: groupId, admin: itemGroup.val().admin, createdAt: itemGroup.val().createdAt, friends: itemGroup.val().friends, name: itemGroup.val().name, friendNames: friendNames, dp: itemGroup.val().dp}); 
                      }
                      else{
                        //if there is no group friends
                        groupCArr.push(itemGroup.val());
                      }
                    }
                    //the groups added to auth user
                    else{
                      //finding group admin name
                      const groupadminRef = ref(db, 'users/'+ itemGroup.val().admin);
                      onValue(groupadminRef, (snapshot) => {
                        setGroupAdminName(snapshot.val().username);
                      });
                      //finding friends values from the groups
                      if(itemGroup.val().friends){
                        itemGroup.val().friends.map((itemFrndId)=>{
                          if(userid === itemFrndId){
                            const frnds = itemGroup.val().friends;
                            let friendNames = [];
                            frnds.map((frnd,index)=>{
                            const groupfriendRef = ref(db, 'users/'+ frnd );
                              onValue(groupfriendRef, (friend) => {
                                friendNames.push(friend.val().username);
                              });
                            })
                            //push all the values into an array
                            groupAArr.push({id: groupId, admin: itemGroup.val().admin, createdAt: itemGroup.val().createdAt, friends: itemGroup.val().friends, name: itemGroup.val().name, friendNames: friendNames, dp: itemGroup.val().dp}); 
                          }
                      })
                      }
                    }
                  })
                  setChange2(!change2);
            });
        }
        setGroupsCreatedbyMe(groupCArr);
        setGroupsAddedtoMe(groupAArr);
    },[userid, change2])

    
    //delete the group
    let handleDeleteGroup = (id) => {
      const db = getDatabase();
      const groupRef = ref(db, 'groups/'+ id );
      remove(groupRef);
    }


    //leave from group
    let handleLeaveGroup = (id) => {
      const db = getDatabase();
      const groupRef = ref(db, 'groups/'+ id );
      onValue(groupRef, (snapshot) => {
        const friends = snapshot.val().friends;
        for( var i = 0; i < friends.length; i++){ 
          if ( friends[i] === userid) { 
            friends.splice(i, 1); 
          }
        }
            set(groupRef, {
              id: snapshot.val().id,
              name: snapshot.val().name,
              admin: snapshot.val().admin,
              friends: friends,
              dp: snapshot.val().dp,
              createdAt: snapshot.val().createdAt 
            });
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
                <h3>Groups Created by Me</h3>
                {groupsCreatedbyMe.length > 0
                ?
                groupsCreatedbyMe.map((group, index)=>(
                    <Col lg={2} md={2} sm={4}>
                      <Card key={index} style={{ width: '100%' }}>
                        <Card.Img variant="top" src={group.dp} alt="dp"/>
                        <Card.Body>
                            <Card.Title>{group.name}</Card.Title>
                            <Card.Text>admin: <b>{username}</b></Card.Text>
                            {group.friendNames
                            ?
                            group.friendNames.map((name, index)=>(
                              <Card.Text>member{index+1}: <b>{name}</b></Card.Text>
                            ))
                            : 
                            ""
                            }
                            <Button variant="danger" onClick={()=>handleDeleteGroup(group.id)}>Delete</Button>
                        </Card.Body>
                      </Card>
                    </Col>
                ))
                :
                ""
                }
                <h3 style={{marginTop: "70px"}}>Groups Added to Me</h3>
                {groupsAddedtoMe.length > 0
                ?
                groupsAddedtoMe.map((group, index)=>(
                    <Col lg={2} md={2} sm={4}>
                    <Card key={index} style={{ width: '100%' }}>
                      <Card.Img variant="top" src={group.dp} alt="dp"/>
                        <Card.Body>
                            <Card.Title>{group.name}</Card.Title>
                            <Card.Text>admin: <b>{groupAdminName}</b></Card.Text>
                            {group.friendNames.map((name, index)=>(
                                <Card.Text>member{index+1}: <b>{name}</b></Card.Text>
                            ))}
                            <Button variant="danger" onClick={()=>handleLeaveGroup(group.id)}>Leave</Button>
                        </Card.Body>
                    </Card>
                    </Col>
                ))
                :
                ""
                } 
                </Row>
            </div>
        </div>
    </>
  )
}

export default Groups