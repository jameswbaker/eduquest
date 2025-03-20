// CourseDashboard.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RadarChart from '../components/RadarChart';
import AssignmentCard from '../components/AssignmentCard';
import RubricCard from '../components/RubricCard';
import Navbar from '../components/NavBar';
import './CourseDashboard.css';
import { ReactSession } from "react-client-session";

export default function CourseDashboard() {
  const domain = process.env.REACT_APP_API_BASE_URL || 'localhost';
  // Get courseId from URL path parameters
  const { courseId } = useParams();
  const navigate = useNavigate();

  // States for course details and analytics
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [rubricItems, setRubricItems] = useState([]);
  const [selectedRubricItems, setSelectedRubricItems] = useState(new Set());
  const [assignmentRadarLabels, setAssignmentRadarLabels] = useState([]);
  const [assignmentRadarData, setAssignmentRadarData] = useState([]);
  const [processedData, setProcessedData] = useState('');
  const [assignmentAverages, setAssignmentAverages] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    const enrollmentType = ReactSession.get("enrollmentType");
    console.log(enrollmentType);
      if (enrollmentType === "TeacherEnrollment") {
        alert("Not authorized to access teacher page");
        navigate('/teacherBoard');
      }
    }, [navigate]);
    

  // Fetch course details from API and extract rubric items
  const fetchCourseDetails = async () => {
    setError('');
    try {
      const response = await axios.get(
        `http://${domain}:4000/api/courses/${courseId}/course-details`,
        { withCredentials: true }
      );
      setCourseName(response.data.course_name);
      setCourseCode(response.data.course_code);
      setAssignments(response.data.assignments);
      extractRubricItems(response.data.assignments);
    } catch (err) {
      console.error(
        'Error fetching course details:',
        err.response ? err.response.data : err.message
      );
      setError('Error fetching course details. Please check your token and permissions.');
    }
  };


  

  const extractRubricItems = (assignments) => {
    const uniqueRubrics = new Set();
    assignments.forEach((assignment) => {
      assignment.rubric?.forEach((criterion) => {
        uniqueRubrics.add(criterion.description);
      });
    });
    setRubricItems([...uniqueRubrics]);
  };

  // Toggle a rubric item in the selection set
  const toggleRubricItem = (item) => {
    setSelectedRubricItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  };

  // Filter entries to only those rubric items that are selected
  const filterSelectedRubricItems = (entries) => {
    return entries.filter((entry) => selectedRubricItems.has(entry.description));
  };

  // --- Aggregation Functions ---
  // Aggregate rubric data from course submissions
  async function aggregateCourseDetailsData() {
    try {
      const response = await axios.get(
        `http://${domain}:4000/api/course-details-agg/${courseId}`,
        { withCredentials: true }
      );
      const course = response.data;
      const aggregatedData = aggregateAllRubricData(course);
      setProcessedData(aggregatedData);
      const assignmentData = computeAveragePercentageByAssignment(course);
      setAssignmentAverages(assignmentData);
      // Load initial radar data (overall averages)
      loadRadarDataByAssignment(null);
    } catch (err) {
      console.error('Error aggregating course details:', err);
    }
  }

  function aggregateAllRubricData(course) {
    const aggregator = {};
    const submissionsEdges = course?.submissionsConnection?.edges || [];
    submissionsEdges.forEach((submissionEdge) => {
      const submissionNode = submissionEdge.node;
      const assignment = submissionNode.assignment;
      if (!assignment) return;
      const rubric = assignment.rubric;
      if (!rubric?.criteria) return;
      const assignmentSubmissions = assignment?.submissionsConnection?.edges || [];
      assignmentSubmissions.forEach((subEdge) => {
        const submissionForUser = subEdge.node;
        if (!submissionForUser) return;
        const userId = submissionForUser.userId;
        if (!aggregator[userId]) {
          aggregator[userId] = {};
        }
        const rubricAssessments = submissionForUser?.rubricAssessmentsConnection?.nodes || [];
        rubricAssessments.forEach((assessment) => {
          const ratingMap = {};
          (assessment.assessmentRatings || []).forEach((rating) => {
            const critId = rating.criterion?._id;
            const description = rating.criterion?.description;
            if (!critId) return;
            ratingMap[critId] = { pointsEarned: rating.points, description };
          });
          rubric.criteria.forEach((crit) => {
            const critId = crit._id;
            const maxPoints = crit.points || 0;
            const desc = crit.description;
            const ratingInfo = ratingMap[critId];
            const earnedPoints = ratingInfo?.pointsEarned || 0;
            const usedDescription = ratingInfo?.description || desc;
            if (!aggregator[userId][critId]) {
              aggregator[userId][critId] = { description: usedDescription, totalEarned: 0, totalPossible: 0 };
            }
            aggregator[userId][critId].totalEarned += earnedPoints;
            aggregator[userId][critId].totalPossible += maxPoints;
          });
        });
      });
    });
    Object.keys(aggregator).forEach((userId) => {
      Object.keys(aggregator[userId]).forEach((critId) => {
        const entry = aggregator[userId][critId];
        entry.percentage = entry.totalPossible > 0 ? (entry.totalEarned / entry.totalPossible) * 100 : 0;
      });
    });
    return aggregator;
  }

  // Compute overall class averages from aggregated rubric data
  function computeClassAverages(aggregator) {
    const classMap = {};
    const allCritIds = new Set();
    Object.keys(aggregator).forEach((userId) => {
      Object.keys(aggregator[userId]).forEach((critId) => {
        allCritIds.add(critId);
      });
    });
    allCritIds.forEach((critId) => {
      let totalEarned = 0;
      let totalPossible = 0;
      let description = null;
      Object.keys(aggregator).forEach((userId) => {
        const entry = aggregator[userId][critId];
        if (entry) {
          totalEarned += entry.totalEarned;
          totalPossible += entry.totalPossible;
          if (!description) {
            description = entry.description;
          }
        }
      });
      const percentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
      classMap[critId] = { description: description || "Unknown Criterion", totalEarned, totalPossible, percentage };
    });
    return classMap;
  }

  // Compute average percentages per assignment for each rubric criterion
  function computeAveragePercentageByAssignment(course) {
    const aggregator = {};
    const submissionsEdges = course?.submissionsConnection?.edges || [];
    submissionsEdges.forEach((submissionEdge) => {
      const submissionNode = submissionEdge.node;
      const assignment = submissionNode.assignment;
      if (!assignment) return;
      const assignmentId = submissionNode.assignmentId;
      const assignmentName = assignment.name;
      const rubric = assignment.rubric;
      if (!rubric?.criteria) return;
      if (!aggregator[assignmentId]) {
        aggregator[assignmentId] = { assignmentName, criteriaMap: {} };
      }
      const assignmentSubmissions = assignment?.submissionsConnection?.edges || [];
      assignmentSubmissions.forEach((subEdge) => {
        const submissionForUser = subEdge.node;
        if (!submissionForUser) return;
        const rubricAssessments = submissionForUser?.rubricAssessmentsConnection?.nodes || [];
        rubricAssessments.forEach((assessment) => {
          const ratingMap = {};
          (assessment.assessmentRatings || []).forEach((rating) => {
            const critId = rating.criterion?._id;
            const critDesc = rating.criterion?.description;
            if (!critId) return;
            ratingMap[critId] = { pointsEarned: rating.points, description: critDesc };
          });
          rubric.criteria.forEach((crit) => {
            const critId = crit._id;
            const critMax = crit.points || 0;
            const critDesc = crit.description;
            const ratingInfo = ratingMap[critId];
            const earned = ratingInfo?.pointsEarned || 0;
            const usedDesc = ratingInfo?.description || critDesc;
            if (!aggregator[assignmentId].criteriaMap[critId]) {
              aggregator[assignmentId].criteriaMap[critId] = { description: usedDesc, sumEarned: 0, sumPossible: 0 };
            }
            aggregator[assignmentId].criteriaMap[critId].sumEarned += earned;
            aggregator[assignmentId].criteriaMap[critId].sumPossible += critMax;
          });
        });
      });
    });
    Object.keys(aggregator).forEach((assignmentId) => {
      const criteriaScores = aggregator[assignmentId].criteriaMap || {};
      Object.keys(criteriaScores).forEach((critId) => {
        const { sumEarned, sumPossible } = criteriaScores[critId];
        criteriaScores[critId].averagePercentage = sumPossible > 0 ? (sumEarned / sumPossible) * 100 : 0;
      });
    });
    return aggregator;
  }

  // Load radar chart data based on assignment selection; if no assignment is selected, show overall averages
  const loadRadarDataByAssignment = (selectedAssignment) => {
    if (!assignmentAverages || Object.keys(assignmentAverages).length === 0) {
      setAssignmentRadarLabels([]);
      setAssignmentRadarData([]);
      return;
    }
    if (!selectedAssignment) {
      const classAverages = computeClassAverages(processedData);
      const entries = Object.values(classAverages);
      const filteredEntries = filterSelectedRubricItems(entries);
      filteredEntries.sort((a, b) => a.description.localeCompare(b.description));
      const chartLabels = filteredEntries.map((e) => e.description);
      const chartData = filteredEntries.map((e) => e.percentage);
      setAssignmentRadarLabels(chartLabels);
      setAssignmentRadarData(chartData);
      return;
    }
    const assignmentAvg = assignmentAverages[selectedAssignment.id];
    if (!assignmentAvg) {
      setAssignmentRadarLabels([]);
      setAssignmentRadarData([]);
      return;
    }
    const criteriaScores = Object.values(assignmentAvg.criteriaMap);
    const filteredCriteria = filterSelectedRubricItems(criteriaScores);
    filteredCriteria.sort((a, b) => a.description.localeCompare(b.description));
    const labels = filteredCriteria.map((c) => c.description);
    const data = filteredCriteria.map((c) => c.averagePercentage);
    setAssignmentRadarLabels(labels);
    setAssignmentRadarData(data);
  };

  // Handle assignment selection/deselection
  const handleAssignmentSelect = (assignment) => {
    if (selectedAssignment?.id === assignment.id) {
      setSelectedAssignment(null);
    } else {
      setSelectedAssignment(assignment);
    }
  };

  // On mount, fetch course details and aggregate data
  useEffect(() => {
    fetchCourseDetails();
    aggregateCourseDetailsData();
  }, [courseId]);

  // Reload radar data when processed data, selected assignment, or rubric items change
  useEffect(() => {
    loadRadarDataByAssignment(selectedAssignment);
  }, [processedData, selectedAssignment, selectedRubricItems]);

  return (
    <div className="course-dashboard-container">
      {/* Header with Back button and course info */}
      <header className="dashboard-header course-header-left">
        <div className="go-back-link">
            <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                navigate('/dashboard/:studentId');
            }}
            style={{ textDecoration: 'none', color: '#007bff' }}
            >
            {/* ← Back to Dashboard */}
            ⬅️

            </a>
            <h1>{courseName || "Loading..."}</h1>
        </div>
       
           
        </header>


      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div className="dashboard-main">
        {/* Left Column: Assignment List */}
        <div className="courses-section">
          <h2>Assignment List</h2>
          <div className="courses-list">
            {assignments.map((assignment, index) => (
              <AssignmentCard
                key={index}
                assignmentName={assignment.name}
                dueDate={assignment.dueAt}
                color={selectedAssignment?.id === assignment.id ? "green" : "blue"}
                onClick={() => handleAssignmentSelect(assignment)}
              />
            ))}
          </div>
        </div>
        
        {/* Middle Column: Rubric Items */}
        <div className="courses-section">
          <h2>Rubric Items</h2>
          <div className="courses-list">
            {rubricItems.map((item, index) => (
              <RubricCard
                key={index}
                rubricName={item}
                color={selectedRubricItems.has(item) ? "green" : "blue"}
                onClick={() => toggleRubricItem(item)}
              />
            ))}
          </div>
        </div>
        
        {/* Right Column: Assignment Ability Chart */}
        <div className="powerchart-history-container">
          <section className="course-profile-section">
            <header className="charts-header">
              <h2>Assignment Ability Chart</h2>
            </header>
            <RadarChart 
              dataset={assignmentRadarData} 
              labels={assignmentRadarLabels} 
              dataset_label={selectedAssignment ? `${selectedAssignment.name} Performance` : "Assignments Overview"}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

