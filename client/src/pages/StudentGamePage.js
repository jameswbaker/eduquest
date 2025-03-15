import React, { useState, useEffect } from "react";
import { ReactSession } from "react-client-session";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./StudentGamePage.css";

const StudentGamePage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [user, setUser] = useState("");
  const [studentName, setStudentName] = useState(""); // For full name
  const [todos, setTodos] = useState([]); 
  const [selectedCourse, setSelectedCourse] = useState(null); 


  // Check if the user is logged in and fetch session info
  useEffect(() => {
    // TODO: check logic here. i think it fixes curr session user to be vivi li
    const currUser = ReactSession.get("user");
    setUser(currUser);
    console.log("User is:", currUser);
    if (!currUser) {
      alert("Please log in first");
      navigate("/");
    } else {
      // Fetch student's Canvas info for their full name
      fetchStudentCanvasInfo();
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

  useEffect(() => {
    fetchCourses();
    fetchTodos();
  }, []);

  // Fetch courses from API
  const fetchCourses = async () => {
    setError("");
    try {
      const response = await axios.get("http://localhost:4000/api/courses", {
        withCredentials: true,
      });
      setCourses(response.data);
    } catch (error) {
      console.error(
        "Error fetching courses:",
        error.response ? error.response.data : error.message
      );
      setError(
        "Error fetching courses. Please check your token and permissions."
      );
    }
  };

  // Helper: Format ISO date string to "MM-DD-YYYY"
  function formatDate(isoString) {
    if (!isoString) return;
    const date = new Date(isoString);
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${month}-${day}-${year}`;
  }

  // Fetch to-do items (assignments) from API and sort by due date
  const fetchTodos = async () => {
    setError("");
    try {
      const response = await axios.get("http://localhost:4000/api/user/to-do", {
        withCredentials: true,
      });
      const formattedTodos = response.data.map((todo, index) => {
        const dueAtISO = todo.assignment?.due_at; // original ISO string
        return {
          todoId: todo.assignment?.id || index,
          courseName: todo.context_name, 
          assignmentName: todo.assignment?.name || "No assignment name",
          dueAt: dueAtISO ? formatDate(dueAtISO) : "No due date",
          dueAtISO: dueAtISO || null, // keep ISO for sorting
          htmlUrl: todo.assignment?.html_url || "#",
        };
      });
      // Sort assignments by due date (earliest first), assignments with no due date go to the end
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
      setError("Error fetching todos. Please check your token and permissions.");
    }
  };

  // Fetch student info (full name) from Canvas API
  const fetchStudentCanvasInfo = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/users/user-details", {
        withCredentials: true,
      });
      setStudentName(response.data.name);
      console.log("this is student's info: ", response.data);
      console.log("this is student's name: ", studentName);
    } catch (error) {
      console.error(
        "Error fetching student canvas info:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const filteredTodos = selectedCourse
    ? todos.filter(todo => todo.courseId === selectedCourse)
    : todos;

  // Colors for course cards
  const colorOrder = ["yellow", "blue", "red", "pink", "green"];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>{studentName ? `${studentName}'s Dashboard` : "Dashboard"}</h1>
        <div className="header-icons">
          {/* Optional teacher view button can go here */}
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Courses Section */}
        <div className="courses-section">
          <h2>Courses</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div className="courses-list">
            {courses.map((course, index) => {
              const color = colorOrder[index % colorOrder.length];
              return (
                <CourseCard
                  key={course.id}
                  courseName={course.name}
                  instructor={course.instructor || "Unknown Instructor"}
                  color={color}
                  courseId={course.id}
                  isSelected={selectedCourse === course.id}
                  onSelect={setSelectedCourse}
                />
              );
            })}
          </div>
        </div>

        {/* Games Section */}
        <div className="todo-section">
          <h2>{selectedCourse ? "Games for Selected Course" : "All Games"}</h2>
          <div className="todo-list">
            {filteredTodos.length > 0 ? (
              filteredTodos.map(todo => (
                <ToDoCard
                  key={todo.todoId}
                  assignmentName={todo.assignmentName}
                  courseName={todo.courseName}
                  dueDate={todo.dueAt}
                  htmlUrl={todo.htmlUrl}
                  color="yellow"
                />
              ))
            ) : (
              <p>No available games.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseCard = ({ courseName, instructor, color, courseId, isSelected, onSelect }) => {
    return (
      <div
        className={`course-card ${color} ${isSelected ? "selected" : ""}`}
        onClick={() => onSelect(courseId)}
      >
        <div className={`color-section ${color}`}></div>
        <div className={`text-section ${color}`}>
          <h3>{courseName}</h3>
          <p>{instructor}</p>
        </div>
      </div>
    );
  };

/*

const CourseCard = ({ courseName, instructor, color, courseId }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/courseDashboard/${courseId}`);
  };

  return (
    <div className={`course-card ${color}`} onClick={handleClick}>
      <div className={`color-section ${color}`}></div>
      <div className={`text-section ${color}`}>
        <h3>{courseName}</h3>
        <p>{instructor}</p>
      </div>
    </div>
  );
};
*/

const ToDoCard = ({ courseName, assignmentName, dueDate, htmlUrl, color }) => (
  <a 
    href={htmlUrl} 
    target="_blank" 
    rel="noopener noreferrer" 
    style={{ textDecoration: 'none' }} 
  >
    <div className={`course-card ${color}`}>
      <div className={`todo-color-section ${color}`}></div>
      <div className="todo-text-section">
        <h3>{assignmentName}</h3>
        <p>{courseName}</p>
        <p><strong>Due:</strong> {dueDate}</p>
      </div>
    </div>
  </a>
);

export default StudentGamePage;
