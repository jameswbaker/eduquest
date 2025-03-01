import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactSession } from "react-client-session";
import { Grid } from "@mui/material";
import axios from "axios";
import "./Intro.css";
import SearchBar from "../components/SearchBar";
import CardComponent from "../components/Card";

const IntroPage = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [goals, setGoals] = useState([]);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const user = ReactSession.get("user");
    console.log("User is:", user);
    if (!user) {
      alert("Please log in first");
      navigate("/");
    } else {
      fetchGoals(user);
      fetchTodos(user);
    }
  }, [navigate]);

  useEffect(() => {
    const enrollmentType = ReactSession.get("enrollmentType");
    console.log(enrollmentType);
    if (enrollmentType === "TeacherEnrollment") {
      alert("Not authorized to access teacher page");
      navigate('/teacherBoard');
    }
  }, [navigate]);

  // Helper: Format ISO date to "MM-DD-YYYY"
  const formatDate = (isoString) => {
    if (!isoString) return;
    const date = new Date(isoString);
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${month}-${day}-${year}`;
  };

  // Fetch incomplete goals for the user and sort them by deadline
  const fetchGoals = async (user) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/get-goals?account_id=${user}`,
        { withCredentials: true }
      );
      console.log("Fetched goals:", response.data);
      const incompleteGoals = response.data.filter((goal) => !goal.completed);
      // Map each goal, storing a formatted deadline for display and the raw deadline for sorting.
      const formattedGoals = incompleteGoals.map((goal) => ({
        ...goal,
        description: goal.description || "no description",
        deadline: goal.deadline ? formatDate(goal.deadline) : "no deadline",
        deadlineISO: goal.deadline || null, // store raw deadline value for sorting
      }));
      // Sort goals: the nearest deadline first; goals with no deadline at the end.
      formattedGoals.sort((a, b) => {
        if (!a.deadlineISO && !b.deadlineISO) return 0;
        if (!a.deadlineISO) return 1;
        if (!b.deadlineISO) return -1;
        return new Date(a.deadlineISO) - new Date(b.deadlineISO);
      });
      setGoals(formattedGoals);
    } catch (error) {
      console.error(
        "Error fetching goals:",
        error.response ? error.response.data : error.message
      );
    }
  };

  // Fetch upcoming assignments (to-dos) and sort them by due date
  const fetchTodos = async (user) => {
    try {
      const response = await axios.get("http://localhost:4000/api/user/to-do", {
        withCredentials: true,
      });
      const formattedTodos = response.data.map((todo, index) => {
        const dueAtISO = todo.assignment?.due_at;
        const dueAtFormatted = dueAtISO ? formatDate(dueAtISO) : "No due date";
        return {
          todoId: todo.assignment?.id || index,
          courseName: todo.context_name,
          assignmentName: todo.assignment?.name || "No assignment name",
          dueAt: dueAtISO ? dueAtFormatted : "No due date",
          dueAtISO: dueAtISO || null,
          htmlUrl: todo.assignment?.html_url || "#",
        };
      });
      // Sort by due date, with assignments having no due date at the end.
      formattedTodos.sort((a, b) => {
        if (!a.dueAtISO && !b.dueAtISO) return 0;
        if (!a.dueAtISO) return 1;
        if (!b.dueAtISO) return -1;
        return new Date(a.dueAtISO) - new Date(b.dueAtISO);
      });
      setTodos(formattedTodos);
      console.log("Todos fetched:", formattedTodos);
    } catch (error) {
      console.error(
        "Error fetching todos:",
        error.response ? error.response.data : error.message
      );
    }
  };

  // Helper: Returns "MM-DD" for display at the bottom of the card
  const formatDeadlineDisplay = (deadlineStr) => {
    if (
      !deadlineStr ||
      deadlineStr.toLowerCase().includes("no due date") ||
      deadlineStr.toLowerCase().includes("no deadline")
    )
      return "No due date";
    const [month, day] = deadlineStr.split("-"); // Assuming "MM-DD-YYYY"
    return `${month}-${day}`;
  };

  // Helper: Calculate days left until deadline (expects "MM-DD-YYYY" or "No due date")
  const calculateDaysLeft = (deadlineStr) => {
    if (
      !deadlineStr ||
      deadlineStr.toLowerCase().includes("no due date") ||
      deadlineStr.toLowerCase().includes("no deadline")
    )
      return null;
    const [month, day, year] = deadlineStr.split("-");
    const deadlineDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="intro-container">
      <div className="yellow-container">
        <h1>Ready to go on a quest today?</h1>
        <p>Unlock Your Potential: Improve your reading with exciting games today!</p>
        <img src="/image/coverPhoto.png" alt="Banner" className="header-image" />
    
      </div>

      <div className="green-container">
        {/* Column for Incomplete Goals */}
       {/* Column for Incomplete Goals */}
<div className="column">
  <h2>Incomplete Goals</h2>
  <div className="scroll-container">
    <div className="cards-wrapper">

    {goals.length > 0 ? (
        goals.map((goal) => {
        const deadlineStr = goal.deadline || "no deadline";
        const daysLeft = calculateDaysLeft(deadlineStr);
        let ringProgress = 0;
        let progressText = "";
        let cardColor = "#5586E0"; // default

        if (deadlineStr === "no deadline" || daysLeft === null) {
          ringProgress = 0;
          progressText = "";
        } else if (daysLeft >= 7) {
          ringProgress = 0;
          progressText = `${daysLeft} days`;
        } else if (daysLeft >= 0 && daysLeft < 7) {
          ringProgress = ((7 - daysLeft) / 7) * 100;
          progressText = `${daysLeft} days`;
        } else {
          ringProgress = 100;
          progressText = `Late`;
          cardColor = "#ff6055";
        }

        return (
          <CardComponent
            key={goal.goal_id}
            title={goal.goal_title}
            date={formatDeadlineDisplay(deadlineStr)}
            progress={ringProgress}
            progressText={progressText}
            backgroundColor={cardColor}
            link="/profile"
          />
        );
      })
      ) : (
        <p>No Goals</p>
      )}
    </div>
  </div>
</div>

{/* Column for Upcoming Assignments */}
<div className="column">
  <h2>Upcoming Assignments</h2>
  <div className="scroll-container">
    <div className="cards-wrapper">
      {todos.length > 0 ? (
        todos.map((todo) => {
          const dueAtStr = todo.dueAt;
          const daysLeft = calculateDaysLeft(dueAtStr);
          let ringProgress = 0;
          let progressText = "";
          let cardColor = "#5586E0";

          if (!dueAtStr || dueAtStr.toLowerCase().includes("no due date")) {
            ringProgress = 0;
            progressText = "";
          } else if (daysLeft >= 7) {
            ringProgress = 0;
            progressText = `${daysLeft} days`;
          } else if (daysLeft >= 0 && daysLeft < 7) {
            ringProgress = ((7 - daysLeft) / 7) * 100;
            progressText = `${daysLeft} days`;
          } else {
            ringProgress = 100;
            progressText = `Late`;
            cardColor = "#ff6055";
          }

          return (
            <CardComponent
              key={todo.todoId}
              title={todo.assignmentName}
              subtitle={todo.courseName}
              date={formatDeadlineDisplay(dueAtStr)}
              progress={ringProgress}
              progressText={progressText}
              backgroundColor={cardColor}
              link={todo.htmlUrl}
            />
          );
        })
      ) : (
        <p>No Assignments</p>
      )}
    </div>
  </div>
</div>
</div>
    </div>
  );
};

export default IntroPage;
