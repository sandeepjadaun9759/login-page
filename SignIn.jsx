import React, { useState, useEffect } from 'react';
import './signin.css';
import { getDatabase, ref, get, child } from 'firebase/database';
import { app } from '../firebase';
import StudentList from './StudentList';

const SignIn = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setIdentifier("");
    setPassword("");
  }, []);

  const validateMobile = (number) => /^[0-9]{10}$/.test(number);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const normalizeEmail = (email) => (email ?? "")
    .replace(/\s/g, '')      
    .replace(/\u200B/g, '')  
    .toLowerCase();

  const normalizeContact = (contact) => String(contact ?? "")
    .replace(/\D/g, "");

  const signInUser = async () => {
    const trimmedIdentifier = identifier
      .trim()
      .replace(/\s/g, '')
      .replace(/\u200B/g, '')
      .toLowerCase();
    const trimmedPassword = password.trim();

    setIdentifierError("");
    setPasswordError("");

    if (!trimmedIdentifier) {
      setIdentifierError("❌ Please enter Email, WhatsApp, or Mobile Number");
      return;
    }

    if (trimmedIdentifier.includes('@') && !validateEmail(trimmedIdentifier)) {
      setIdentifierError("❌ Please enter a valid email address");
      return;
    }

    if (/^[0-9]+$/.test(trimmedIdentifier) && !validateMobile(trimmedIdentifier)) {
      setIdentifierError("❌ Mobile number must be 10 digits");
      return;
    }

    if (!trimmedPassword) {
      setPasswordError("❌ Please enter Password");
      return;
    }

    const db = getDatabase(app);
    const dbRef = ref(db);

    try {
      const snapshot = await get(child(dbRef, 'A/2021/student'));
      if (snapshot.exists()) {
        const users = snapshot.val();
        let identifierMatch = false;
        let passwordMatch = false;

        Object.keys(users).forEach((key) => {
          const user = users[key];

          const email = user.email ? normalizeEmail(user.email) : "";
          const whatsapp = user.whatsapp ? normalizeContact(user.whatsapp) : "";
          const fmobile = user.fmobile_no ? normalizeContact(user.fmobile_no) : "";

          const emailMatch = email === trimmedIdentifier;
          const whatsappMatch = whatsapp === normalizeContact(trimmedIdentifier);
          const fmobileMatch = fmobile === normalizeContact(trimmedIdentifier);

          if (emailMatch || whatsappMatch || fmobileMatch) {
            identifierMatch = true;
            if (user.password && user.password.trim() === trimmedPassword) {
              passwordMatch = true;
            }
          }
        });

        if (identifierMatch) {
          if (passwordMatch) {
            setLoggedIn(true);
            alert("✅ User Login Successfully");
          } else {
            setPassword("");
            setPasswordError("❌ Password is incorrect");
          }
        } else {
          setIdentifier("");
          setPassword("");
          setIdentifierError("❌ Email, WhatsApp, or Mobile Number is incorrect");
        }
      } else {
        setIdentifierError("❌ No users found in database");
      }
    } catch (error) {
      console.error("Firebase DB Error:", error);
      setIdentifierError("❌ Error connecting to database");
    }
  };

  return (
    <div>
      {!loggedIn ? (
        <div className="signin-page">
          <h1>Sign In</h1>
          <form
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              signInUser();
            }}
          >
            {/* Hidden fields to confuse browser autofill */}
            <input type="text" style={{ display: "none" }} autoComplete="username" />
            <input type="password" style={{ display: "none" }} autoComplete="new-password" />

            <label>Email, WhatsApp, or Mobile Number:</label>
            <input
              type="text"
              name={`identifier_${Date.now()}`} // random name to avoid autofill
              placeholder="Enter Email, WhatsApp, or Mobile Number"
              value={identifier}
              autoComplete="off"
              onChange={(e) => setIdentifier(e.target.value)}
            />
            {identifierError && <p className="error">{identifierError}</p>}

            <label>Password:</label>
            <input
              type="password"
              name={`password_${Date.now()}`} // random name to avoid autofill
              placeholder="Enter Your Password"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError && <p className="error">{passwordError}</p>}

            <button type="submit">Sign In</button>
          </form>
        </div>
      ) : (
        <StudentList />
      )}
    </div>
  );
};

export default SignIn;
