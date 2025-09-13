import React, { useState, useEffect } from 'react';
import './signup.css';

import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { app } from '../firebase'

const auth = getAuth(app);

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  
  useEffect(() => {
    signOut(auth);
  }, []);

  const createUser = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((value) => {
        alert("User Created Successfully");
        setEmail("");       
        setPassword("");     
      })
      .catch((error) => {
        alert(error.message); 
      });
  }

  return (
    <div className='signup-page'>
      <label>Email :</label>
      <input 
        type="email" 
        placeholder='Enter Your Email' 
        onChange={(e) => setEmail(e.target.value)} 
        value={email} 
        autoComplete="off"    
        required
      />
      <label>Password :</label>
      <input 
        type="password" 
        placeholder='Enter Your password' 
        onChange={(e) => setPassword(e.target.value)} 
        value={password} 
        autoComplete="new-password"   
        required
      />
      <button onClick={createUser}>Sign Up</button>
    </div>
  )
}

export default SignUp;
