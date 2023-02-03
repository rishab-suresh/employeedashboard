import React from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebaseconfig";
import { onValue, push, ref, set, once, update } from "firebase/database";
import { useState, useEffect } from "react";
import ReactSwitch from "react-switch";
import moment from "moment";
import "./index.css";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { Name, employeeId, userId } = useParams();
  const [employeeData, setEmployeeData] = useState({});
  const currentDate = moment().format("DD MMM YYYY");
  const [statusFields, setStatusFields] = useState({
    Break: 0,
    Meeting: 0,
    OnMail: 0,
    Idle: 1,
  });
  const [ismeetingOn, setIsMeetingOn] = useState(false);
  const [isBreakOn, setIsBreakOn] = useState(false);
  const [meetingStart, setMeetingStart] = useState(0);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [breakStart, setBreakStart] = useState(0);
  const [breaktimeStart, setBreakTimeStart] = useState(false);
  const [breakReason, setBreakReason] = useState([]);

  useEffect(() => {
    onValue(ref(db, `users/${userId}`), (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      if (data) {
        setEmployeeData(data);
      } else {
        console.log("Employee ID not found in the database");
        // handle case for employee ID not found here
      }
    });
  }, [userId]);

  useEffect(() => {
    onValue(
      ref(db, `users/${userId}/Activity/${currentDate}/Status`),
      (snapshot) => {
        const statuses = snapshot.val();
        if (statuses) {
          setStatusFields(statuses);
          console.log(statusFields);
        } else {
          console.log("No status found for today");
        }
      }
    );
  }, [userId, currentDate]);

  function handleChange(field, value) {
    set(
      ref(db, `users/${userId}/Activity/${currentDate}/Status/${field}`),
      value ? "1" : "0"
    );
    set(
      ref(db, `users/${userId}/Activity/${currentDate}/Status/Idle`),
      value ? "0" : "1"
    );
  }

  function handleMeetingStart() {
    const meetingReason = document.getElementById("meeting-reason").value;
    let meetingStart = moment().format("HHmm");
    setMeetingStart(parseInt(moment().format("HHmm")));
    onValue(
      ref(db, `users/${userId}/Activity/${currentDate}/meetings`),
      (snapshot) => {
        let data = snapshot.val();
        if (!data) {
          data = {};
        }
        if (!("meetings" in data)) {
          data["meetings"] = {};
        }

        console.log(data);
        let newMeeting = { meeting_start: meetingStart, remark: meetingReason };
        let meetingCount = Object.keys(data).length + 1;
        let newMeetingKey = `meeting${meetingCount}`;
        data[newMeetingKey] = newMeeting;
        set(ref(db, `users/${userId}/Activity/${currentDate}/meetings`), data);
      },
      {
        onlyOnce: true,
      }
    );
    set(ref(db, `users/${userId}/Activity/${currentDate}/Status/Meeting`), "1");
    set(ref(db, `users/${userId}/Activity/${currentDate}/Status/Idle`), "0");
    console.log(
      `Meeting started at ${meetingStart} for the reason: ${meetingReason}`
    );
    document.getElementById("meeting-reason").value = "";
    setMeetingStarted(true);
  }

  function handleMeetingEnd() {
    let meetingEnd = moment().format("HHmm");
    meetingEnd = parseInt(meetingEnd);
    onValue(
      ref(db, `users/${userId}/Activity/${currentDate}/meetings/`),
      (snapshot) => {
        let data = snapshot.val();
        let lastMeeting = data[Object.keys(data)[Object.keys(data).length - 1]];
        console.log(lastMeeting);
        lastMeeting.meeting_end = meetingEnd;
        set(ref(db, `users/${userId}/Activity/${currentDate}/meetings`), data);
        set(
          ref(db, `users/${userId}/Activity/${currentDate}/Status/Meeting`),
          "0"
        );
        set(
          ref(db, `users/${userId}/Activity/${currentDate}/Status/Idle`),
          "1"
        );
        console.log(`Meeting ended at ${meetingEnd}`);
      },
      {
        onlyOnce: true,
      }
    );
    onValue(
      ref(db, `users/${userId}/Activity/${currentDate}/meetings_duration`),
      (snapshot) => {
        let existingDuration = snapshot.val() || 0;
        console.log(existingDuration);
        let newDuration = existingDuration + (meetingEnd - meetingStart);
        set(
          ref(db, `users/${userId}/Activity/${currentDate}/meetings_duration`),
          newDuration
        );
        console.log(`Total meeting duration: ${newDuration}`);
      },
      {
        onlyOnce: true,
      }
    );

    setIsMeetingOn(false);
  }
  function handleBreakStart() {
    const breakReason = document
      .querySelector('input[name="break-reason"]:checked')
      .getAttribute("value");
    let breakStart = moment().format("HHmm");
    setBreakStart(parseInt(moment().format("HHmm")));
    onValue(
      ref(db, `users/${userId}/Activity/${currentDate}/breaks`),
      (snapshot) => {
        let data = snapshot.val() || {};
        if (!("breaks" in data)) {
          data["breaks"] = {};
        }

        console.log(data);
        let newBreak = { break_start: breakStart, remark: breakReason };
        let breakCount = Object.keys(data).length + 1;
        let newBreakKey = `breaks${breakCount}`;
        data[newBreakKey] = newBreak;
        set(ref(db, `users/${userId}/Activity/${currentDate}/breaks`), data);
      },
      {
        onlyOnce: true,
      }
    );
    handleChange("Break", true);
    console.log(
      `Break started at ${breakStart} for the reason: ${breakReason}`
    );
    document.getElementById("break-reason").value = "";
    setBreakTimeStart(true);
  }

  function handleBreakEnd() {
    let BreakEnd = moment().format("HHmm");
    BreakEnd = parseInt(BreakEnd);

    onValue(
      ref(db, `users/${userId}/Activity/${currentDate}/breaks`),
      (snapshot) => {
        let data = snapshot.val();
        let lastBreak = data[Object.keys(data)[Object.keys(data).length - 1]];
        console.log(lastBreak);
        lastBreak.break_end = BreakEnd;
        console.log(BreakEnd);

        set(ref(db, `users/${userId}/Activity/${currentDate}/breaks`), data);
        set(
          ref(db, `users/${userId}/Activity/${currentDate}/Status/Break`),
          "0"
        );
        set(
          ref(db, `users/${userId}/Activity/${currentDate}/Status/Idle`),
          "1"
        );
        console.log(`Break ended at ${BreakEnd}`);
      },
      {
        onlyOnce: true,
      }
    );
    onValue(
      ref(db, `users/${userId}/Activity/${currentDate}/break_duration`),
      (snapshot) => {
        let existingDuration = snapshot.val() || 0;
        console.log(existingDuration);
        let newDuration = existingDuration + (BreakEnd - breakStart);
        set(
          ref(db, `users/${userId}/Activity/${currentDate}/break_duration`),
          newDuration
        );
      },
      {
        onlyOnce: true,
      }
    );
    setIsBreakOn(false);
  }
  let currentStatus;
  if (statusFields.Break === "1") {
    currentStatus = "On Break";
  } else if (statusFields.Meeting === "1") {
    currentStatus = "In Meeting";
  } else if (statusFields.OnMail === "1") {
    currentStatus = "On Mail";
  } else {
    currentStatus = "Idle";
  }

  function logout() {
    set(ref(db, `users/${userId}/Activity/${currentDate}/Status`), {
      Break: "0",
      Meeting: "0",
      OnMail: "0",
      Idle: "1",
    }).then(set(ref(db, `users/${userId}/Login`), "No"));

    navigate("/");
  }
  return (
    <div className="main">
      <div>
        <div className="container-bio">
          <div className="name">
            <h3 className="name">
              Welcome : <span>{employeeData.Name}</span>
            </h3>
          </div>
          <div className="details">
            <h5 className="id">
              Employee ID :
              <span>
                <bold> {employeeData.EmpID} </bold>
              </span>
            </h5>
            <h5 className="date">
              <span> {currentDate} </span>
            </h5>
          </div>
        </div>

        <div className="status-toggle-body">
          <div>
            <div className="status-toggle">
              <div>
                <label>
                  <ReactSwitch
                    onChange={(checked) => {
                      setIsBreakOn(checked);
                      if (!checked) {
                        handleBreakEnd();
                      }
                    }}
                    checked={isBreakOn}
                  />
                  <span>Break</span>
                </label>
                {isBreakOn && (
                  <>
                    <label className="checkbox">
                      <input
                        name="break-reason"
                        id="break-reason"
                        type="checkbox"
                        defaultChecked={false}
                      />
                      Lunch Break
                    </label>
                    <label className="checkbox">
                      <input
                        name="break-reason"
                        id="break-reason"
                        type="checkbox"
                        defaultChecked={false}
                      />
                      Snack Break
                    </label>

                    <button onClick={handleBreakStart} className="breakstart">
                      Start Break
                    </button>
                  </>
                )}
              </div>
              <div>
                <label>
                  <ReactSwitch
                    onChange={(checked) => {
                      setIsMeetingOn(checked);
                      if (!checked) {
                        handleMeetingEnd();
                      }
                    }}
                    checked={ismeetingOn}
                  />
                  <span>Meeting</span>
                </label>
                {ismeetingOn && (
                  <>
                    <input
                      type="text"
                      id="meeting-reason"
                      placeholder="Enter the reason for the meeting"
                    />
                    <button onClick={handleMeetingStart} className="breakstart">
                      Start Meeting
                    </button>
                  </>
                )}
              </div>

              <div>
                <label>
                  <ReactSwitch
                    checked={statusFields.OnMail === "1"}
                    onChange={(checked) => handleChange("OnMail", checked)}
                  />
                  <span>OnMail</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="current-container">
          <div className="current-status">
            <h1>Current Status: {currentStatus} </h1>
          </div>
        </div>
        <div className="logout-button">
          <button className="logout" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
