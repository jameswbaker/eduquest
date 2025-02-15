import React, { useState, useEffect } from 'react';
import "./DataDashboard.css";
import { useParams } from 'react-router-dom';
import RadarChart from '../components/RadarChart';
import { useCourseSummary } from '../hooks/useCourseSummary';
import { aggregateAllRubricData } from '../utils/courseSummaryUtils';
import RubricList from "../components/RubricList"; // Import modal component
import RubricCard from '../components/RubricCard';
import StudentCard from '../components/StudentCard';
import AssignmentCard from '../components/AssignmentCard';

const TDashboard = () => {
  const { courseId } = useParams();
  console.log('courseId ', courseId);

  const [rubricOpen, setRubricOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('students'); // Default to 'students'


  const { 
    students, 
    assignments, 
    courseName, 
    courseCode, 
    rubricItems, 
    selectedRubricItems, 
    toggleRubricItem, 
    error 
  } = useCourseSummary(courseId);

  console.log('this is students ', students);
  console.log('this is rubric items ', rubricItems);
  console.log('this is assignments ', assignments);


  const [analyticsData, setAnalyticsData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    rubricItems: [],
    students: [],
    timeRange: "",
  });

  useEffect(() => {
    if (assignments.length > 0 && selectedRubricItems.length > 0) {
      const aggregatedData = aggregateAllRubricData(assignments, selectedRubricItems);
      setAnalyticsData(aggregatedData);
    }
  }, [assignments, selectedRubricItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>{courseName || "Loading..."}</h1>
        <div className="teacher-navbar">
          <button 
              className={`icon-button ${selectedTab === 'students' ? 'active' : ''}`} 
              onClick={() => setSelectedTab('students')}
            >
              Students
            </button>
            <button 
              className={`icon-button ${selectedTab === 'assignments' ? 'active' : ''}`} 
              onClick={() => setSelectedTab('assignments')}
            >
              Assignments
          </button>
          {/* <button className="icon-button" onClick={() => setRubricOpen(true)}>Bucket</button> */}
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Student List */}
        <div className="courses-section">
          <h2>{selectedTab === 'students' ? "Student List" : "Assignment List"}</h2>
          <div className="courses-list">
            {selectedTab === 'students' ? (
              // Render Student List
              students.map((student, index) => (
                <StudentCard key={index} studentName={student.user.name} grade={student.grades.current_score} color="blue" />
              ))
            ) : (
              // TODO: assignment card HAS NO due date for now. wait for backend
              assignments.map((assignment, index) => (
                <AssignmentCard key={index} assignmentName={assignment.name} dueDate={assignment.dueAt} color="green" />
              ))
            )}
          </div>
        </div>

        <div className="courses-section">
          <h2>Rubric Items</h2>
          <div className="courses-list">
            {rubricItems.map((item, index) => (
              // TODO: edit the style for this
              <RubricCard key={index} rubricName={item} color="blue" />
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="powerchart-history-container">
          <section className="profile-section">
            <header className="charts-header">
              <h2>Summary</h2>
            </header>
            {analyticsData ? <RadarChart data={analyticsData} /> : <p>Loading analytics...</p>}
          </section>

          {/* <section className="charts-section">
            <header className="charts-header">
              <h2>History</h2>
            </header>
          </section> */}
        </div>

        <div>
          <RubricList 
          isOpen={rubricOpen} 
          onClose={() => setRubricOpen(false)} 
          rubricItems={rubricItems} 
          />
        </div>

      </div>
    </div>
  );
};

export default TDashboard;
