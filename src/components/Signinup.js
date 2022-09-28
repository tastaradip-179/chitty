import React, { useState } from 'react'
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import '../firebaseconfig';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { useNavigate } from 'react-router-dom';
import '../css/signinup.scss';

const Signinup = () => {

    //Signup/Register States
    let [usernameR, setUsernameR] = useState("");
    let [emailR, setEmailR] = useState("");
    let [passwordR, setPasswordR] = useState("");
    let [cpasswordR, setCpasswordR] = useState("");
    let [loadingR, setLoadingR] = useState(false);
    let [errorMessageR, setErrorMessageR] = useState("");
    let [successMessageR, setSuccessMessageR] = useState("");  


    //Signin/Login States
    let [emailL, setEmailL] = useState("");
    let [passwordL, setPasswordL] = useState("");
    let [errorMessageL, setErrorMessageL] = useState("");
    let [loadingL, setLoadingL] = useState(false);


    //auth
    const auth = getAuth();

    //navigation
    let navigate = useNavigate(); 


    //click Titles
    let handleSigninTitle = (e) => {
        e.preventDefault();
        let signup = document.getElementById("signup");
        let signin = e.target.parentNode;
        
        Array.from(signin.classList).find((element) => {
            if(element !== "reveal") {
                signup.classList.remove('reveal')
                signin.classList.add('reveal'); 
            }
        });
    }
    let handleSignupTitle = (e) => {
        e.preventDefault();
        let signin = document.getElementById("signin");
        let signup = e.target.parentNode;
        
        Array.from(signup.classList).find((element) => {
            if(element !== "reveal") {
                signin.classList.remove('reveal');
                signup.classList.add('reveal');
            }
        });
    }


    
    //handle Register
    let handleSignupSubmit = (e) => {
        e.preventDefault();
        setLoadingR(true);
        createUserWithEmailAndPassword(auth, emailR, passwordR)
            .then((user) => {
                updateProfile(auth.currentUser, {
                    displayName: usernameR, 
                    photoURL: "https://webiconspng.com/wp-content/uploads/2017/01/Computer-Users-Icon-PNG.png"
                }).then(() => {
                    const db = getDatabase();
                    set(ref(db, 'users/'+user.user.uid), {
                        id: user.user.uid,
                        username: usernameR,
                        email: emailR,
                        dp: user.user.photoURL,
                        createdAt: Date()
                    }); 
                    setErrorMessageR("");
                    setSuccessMessageR("Account created successfully!!!");
                    setLoadingR(false);
                    setErrorMessageL("");
                }).catch((error) => {
                    console.log(error);
                });
            })
            .catch((error) => {
                setLoadingR(false);
                const errorCode = error.code;
                setSuccessMessageR("");
                if(error.message.includes("Firebase: ")){
                    let errmsg = error.message.replace("Firebase: ","");
                    if(errmsg.includes("Error ")){
                        let errmsg2 = errmsg.replace("Error ","");
                        setErrorMessageR(errmsg2);
                    }
                    else{
                        setErrorMessageR(errmsg);
                    }
                }
                else{
                    setErrorMessageR(error.message);
                } 
                if(passwordR != cpasswordR){
                    setErrorMessageR("Confirmation Password is not matched");
                }
            });
    }


    //handle Login
    let handleSigninSubmit = (e) => {
        e.preventDefault();
        setLoadingL(true);
        signInWithEmailAndPassword(auth, emailL, passwordL)
        .then((userCredential) => {
            const user = userCredential.user;
            setErrorMessageL("");
            navigate('/');
        })
        .catch((error) => {
            const errorCode = error.code;
            setLoadingL(false);
            if(error.message.includes("Firebase: ")){
                let errmsg = error.message.replace("Firebase: ","");
                if(errmsg.includes("Error ")){
                    let errmsg2 = errmsg.replace("Error ","");
                    setErrorMessageL(errmsg2);
                }
                else{
                    setErrorMessageL(errmsg);
                }
            }
            else{
                setErrorMessageL(error.message);
            } 
        });
    }



    return (
        <>
        <Container>
            {errorMessageL
                ?
                <Alert variant="danger">
                {errorMessageL}
                </Alert>
                : 
                ""
            }
            {errorMessageR
                ?
                <Alert variant="danger">
                {errorMessageR}
                </Alert>
                : 
                ""
            }
            {successMessageR
                ?
                <Alert variant="success">
                {successMessageR}
                </Alert>
                : 
                ""
            }
            <div className='vertically-middle'>
                <div className='form-structure'>
                    <div className='top'>
                            <div className='signin reveal' id="signin">
                                <h3 className='signin-title' onClick={handleSigninTitle}><span>or </span>Sign in</h3>
                                <h2 className='form-title'>Sign in</h2>
                                <Form>
                                    <Form.Group className="mb-3" controlId="formEmailL">
                                        <Form.Control type="email" placeholder="Email" onChange={(e)=>setEmailL(e.target.value)}/>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="formPasswordL">
                                        <Form.Control type="password" placeholder="Password" onChange={(e)=>setPasswordL(e.target.value)}/>
                                    </Form.Group>
                                    {loadingL
                                    ?
                                    <Button className='signin-btn'>
                                        <Spinner animation="grow" variant="secondary" />
                                    </Button>
                                    :
                                    <Button type="submit" className='signin-btn' onClick={handleSigninSubmit}>
                                        Submit
                                    </Button>
                                    }
                                </Form>
                            </div>
                    </div>
                    <div className='bottom'>
                        <div className='signup' id="signup">
                            <h3 className='signup-title' onClick={handleSignupTitle}><span>or</span>Sign up</h3>
                            <h2 className='form-title'>Sign up</h2>
                            <Form>
                                <Form.Group className="mb-3" controlId="formBasicNameR">
                                    <Form.Control type="text" placeholder="Name" onChange={(e)=>setUsernameR(e.target.value)}/>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicEmailR">
                                    <Form.Control type="email" placeholder="Email" onChange={(e)=>setEmailR(e.target.value)}/>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicPasswordR">
                                    <Form.Control type="password" placeholder="Password" onChange={(e)=>setPasswordR(e.target.value)}/>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicConfirmPasswordR">
                                    <Form.Control type="password" placeholder="Confirm Password" onChange={(e)=>setCpasswordR(e.target.value)}/>
                                </Form.Group>
                                {loadingR
                                ?
                                    <Button className='signup-btn'>
                                    <Spinner animation="grow" variant="secondary" />
                                    </Button>
                                :
                                    <Button type="submit" className='signup-btn' onClick={handleSignupSubmit}>
                                        Submit
                                    </Button>
                                }
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </Container> 
        </>
    )
}

export default Signinup