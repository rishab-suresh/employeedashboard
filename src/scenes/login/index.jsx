import React from "react";

import { onValue, ref, set } from "firebase/database";
import { db } from "../../firebaseconfig";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import moment from "moment";
export const Login = () => {
  const [users, setUsers] = useState([]);
  const [employeeId, setEmployeeId] = useState();
  const currentDate = moment().format("DD MMM YYYY")
  const navigate = useNavigate();
  useEffect(() => {
    onValue(ref(db, "users"), (snapshot) => {
      setUsers(
        Object.entries(snapshot.val()).map(([userId, userData]) => ({
          userId,
          ...userData,
        }))
      );
      console.log(users);
      console.log(snapshot.val());
    });
  }, []);

  const handleLogin = (employeeId) => {
    // Iterate through the list of users
    for (let i = 0; i < users.length; i++) {
      // Check if the employee ID of the current user matches the entered employee ID
      if (users[i].EmpID === employeeId) {
        // Use the corresponding user ID to navigate to the Dashboard component
        const { Name, EmpID, userId } = users[i];
        set(ref(db,`users/${userId}/Login`),"Yes")
        set(ref(db,`users/${userId}/Activity/${currentDate}/Login`),moment().format("HHmm"))
        const dashboardUrl = `/Dashboard/${Name}/${EmpID}/${userId}`
        navigate(dashboardUrl, { state: { Name, EmpID, userId } });
        return;
      }
    }
    // handle employee not found
  };

  return (
    <div className="body-password container">
      <div className="left">
        <div className="overlay">
         
          <h1 className="company">RMC Track</h1>
        </div>
      </div>
      <div className="right">
        <h1>Welcome</h1>
        <h4>Login With Your Employee ID</h4>
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />
        <button onClick={() => handleLogin(employeeId)} className="loginbutton">Login</button>
      </div>
     
    </div>
  );
};
