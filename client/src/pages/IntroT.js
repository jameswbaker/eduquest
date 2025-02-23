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

  useEffect(() => {
    const user = ReactSession.get("user");
    console.log("User is:", user);
    if (!user) {
      alert("Please log in first");
      navigate("/");
    } else {
      fetchGoals(user);
    }
  }, [navigate]);

  // Fetch incomplete goals for the user
  const fetchGoals = async (user) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/get-goals?account_id=${user}`,
        { withCredentials: true }
      );
      console.log("Fetched goals:", response.data);
      // Filter only incomplete goals
      const incompleteGoals = response.data.filter((goal) => !goal.completed);
      // For consistency, if a deadline is missing, mark it as "no deadline"
      const formattedGoals = incompleteGoals.map((goal) => ({
        ...goal,
        description: goal.description || "no description",
        deadline: goal.deadline ? formatDate(goal.deadline) : "no deadline",
      }));
      setGoals(formattedGoals);
    } catch (error) {
      console.error(
        "Error fetching goals:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleSearch = () => {
    console.log(`Searching for: ${searchValue}`);
    // Additional search logic...
  };

  // Helper: Format ISO date to "MM-DD-YYYY"
  const formatDate = (isoString) => {
    if (!isoString) return;
    const date = new Date(isoString);
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${month}-${day}-${year}`;
  };

  // Helper: Returns "MM-DD" for display at the bottom of the card
  const formatDeadlineDisplay = (deadlineStr) => {
    if (deadlineStr === "no deadline") return "no deadline";
    const [month, day] = deadlineStr.split("-"); // Assuming "MM-DD-YYYY"
    return `${month}-${day}`;
  };

  // Helper: Calculate the number of days left until deadline.
  // Expects a deadline string in "MM-DD-YYYY" format or "no deadline".
  // Returns a number (can be negative if overdue) or null if no deadline.
  const calculateDaysLeft = (deadlineStr) => {
    if (deadlineStr === "no deadline") return null;
    const [month, day, year] = deadlineStr.split("-");
    const deadlineDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate - now;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  return (
    <div className="intro-container">
      <div className="yellow-container">
        <h1>Ready to go on a quest today?</h1>
        <p>
          Unlock Your Potential: Improve your reading with exciting games today!
        </p>
        <img src="/image/coverPhoto.png" alt="Banner" className="header-image" />
      
      </div>

      <div className="green-container">
        {/* Goals Section */}
        <div className="column">
          <h2>Incomplete Goals</h2>
          <Grid container spacing={2}>
            {goals.map((goal) => {
              const deadlineStr = goal.deadline || "no deadline";
              const daysLeft = calculateDaysLeft(deadlineStr);
              let ringProgress = 0;
              let progressText = "";
              let cardColor = "#5586E0"; // default color

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
                cardColor = '#ff6055'; 
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
            })}
          </Grid>
        </div>
        {/* Other columns can remain here if needed */}
      </div>
    </div>
  );
};

export default IntroPage;
