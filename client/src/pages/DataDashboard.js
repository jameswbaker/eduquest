import React, { useState, useEffect } from 'react';
import "./DataDashboard.css";
import { useLocation } from 'react-router-dom';
import RadarChart from '../components/RadarChart';
import { useCourseSummary } from '../hooks/useCourseSummary';
import { aggregateAllRubricData } from '../utils/courseSummaryUtils';

const TDashboard = () => {
  // CHANGED FROM USELOCATION TO USEPARAMS
  const { courseId } = useParams();

  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);
  // const courseId = queryParams.get('courseId');

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
          <button className="icon-button">Assignment</button>
          <button className="icon-button">Student</button>
          <button className="icon-button">Bucket</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Student List */}
        <div className="courses-section">
          <h2>Student List</h2>
          <div className="courses-list">
            {students.map((student, index) => (
              <CourseCard key={index} studentName={student.name} grade={student.grade} color="blue" />
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

          <section className="charts-section">
            <header className="charts-header">
              <h2>History</h2>
            </header>
          </section>
        </div>

        {/* Generate Analytics Modal */}
        <div>
          <button className="add-charts-btn" onClick={() => setIsModalOpen(true)}>
            Generate new analytics
          </button>

          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Generate New Analytics</h2>
                <form className="goal-form">
                  <label>
                    Rubric Items to Include:
                    <input
                      type="text"
                      name="rubricItems"
                      value={formData.rubricItems}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Students to Include:
                    <input
                      type="text"
                      name="students"
                      value={formData.students}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Time Range:
                    <input
                      type="date"
                      name="timeRange"
                      value={formData.timeRange}
                      onChange={handleInputChange}
                    />
                  </label>
                </form>
                <div className="modal-actions">
                  <button className="modal-btn save-btn" onClick={() => setIsModalOpen(false)}>
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

// Course Card Component
const CourseCard = ({ studentName, grade, color }) => (
  <div className={`course-card ${color}`}>
    <div className={`color-section ${color}`}></div>
    <div className={`text-section ${color}`}>
      <h3>{studentName}</h3>
      <p>Course Grade: {grade}</p>
    </div>
  </div>
);

export default TDashboard;
