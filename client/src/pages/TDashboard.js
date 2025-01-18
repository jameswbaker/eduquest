// App.jsx
import React, {useState} from "react";
import "./TDashboard.css";
// import TChart from "../components/TChart.js";
// import "../components/TChart.css"

const TDashboard = () => {
  const [courseName, setCoursename] = useState('English 101'); // to change
  const [studentList, setStudents] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  // use starter dummy data for now
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    assignedBy: "",
  });

  // const getStudentList = () => {
  //   // call API call to get a list of students
  //   // but for now let's use dummy data, this is how API should return
  //   const dummyData = [{"studentName": "James Baker", "grade": "90%"},
  //     {},
  //     {},
  //     {},
  //     {}
  //   ]
  //   return dummyData
  // }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addGoal = () => {
    setGoals([...goals, formData]); // Add new goal to the list
    setFormData({ title: "", description: "", deadline: "", assignedBy: "student" }); // Reset form
    setIsModalOpen(false); // Close modal
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>{courseName}</h1>
        <div className="teacher-navbar">
          <button className="icon-button">Assignment</button>
          <button className="icon-button">Student</button>
          <button className="icon-button">Bucket</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Courses Section */}
        <div className="courses-section">
          <h2>Student List</h2>
          <div className="courses-list">
            <CourseCard
              studentName="James Baker"
              grade="95%"
              color="yellow"
            />
            <CourseCard
              studentName="Grace Thanglerdsumpan"
              grade="90%"
              color="blue"
            />
            <CourseCard
              studentName="Vivi Li"
              grade="90%"
              color="red"
            />
            <CourseCard
              studentName="Cindy Wei"
              grade="100%"
              color="pink"
            />
            <CourseCard
              studentName="Avi"
              grade="98%"
              color="green"
            />
          </div>
        </div>
        {/* <div>
          this is where chart should be
          {/* <TChart/> */}
        {/* </div>  */}

{/* */}
        <div className="powerchart-history-container">
          <section className="profile-section">
            <header className="charts-header">
              <h2>Summary</h2>
            </header>
          </section>

          <section className="charts-section">
            <header className="charts-header">
              <h2>History</h2>
            </header>
          </section>
          
        </div> 
        <div>
          <button className="add-charts-btn" 
            onClick={() => setIsModalOpen(true)}
          >
            Generate new analytics
          </button>
          {/* Modal for Adding Goals */}
           {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Generate New Analytics</h2>
                <form className="goal-form">
                  <label>
                    Rubric Items to Include:
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Students to Include:
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Time Range:
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                    />
                  </label>
                </form>
                <div className="modal-actions">
                  <button className="modal-btn save-btn" onClick={addGoal}>
                    Generate
                  </button>
                  <button className="modal-btn cancel-btn" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )} 
        </div>
        
      </div>
    </div>
  );
};

const CourseCard = ({ studentName, grade, color }) => (
  <div className={`course-card ${color}`}>
    <h3>{studentName}</h3>
    <p className={`grade`}>Course Grade: {grade}</p>
  </div>
);

const ToDoCard = ({ taskName, dueDate, color, border }) => (
  <div
    className={`todo-card ${color} ${border ? `border-${border}` : ""}`}
  >
    <h3>{taskName}</h3>
    <p>{dueDate}</p>
  </div>
);

export default TDashboard;
