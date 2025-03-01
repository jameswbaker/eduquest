import React from "react";
import { Bar, Scatter } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, PointElement, Tooltip, Title } from "chart.js";
import "./TChart.css";

// Register required chart elements
ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, Tooltip, Title);

const TChart = () => {
  // Dummy data for Powerchart (Bar Chart)
  const powerchartData = {
    labels: ["Math", "Science", "History", "Art", "Programming"],
    datasets: [
      {
        label: "Scores",
        data: [85, 92, 78, 88, 95],
        backgroundColor: ["#F2C100", "#5586E0", "#E54B32", "#EA97B3", "#8FCE5D"],
      },
    ],
  };

  const powerchartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Powerchart: Course Scores", font: { size: 16 } },
    },
  };

  // Dummy data for Scatter Plot
  const scatterData = {
    datasets: [
      {
        label: "Study Hours vs Test Scores",
        data: [
          { x: 2, y: 50 },
          { x: 4, y: 70 },
          { x: 6, y: 80 },
          { x: 8, y: 90 },
          { x: 10, y: 95 },
        ],
        backgroundColor: "#5586E0",
      },
    ],
  };

  const scatterOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Scatter Plot: Study Hours vs Test Scores", font: { size: 16 } },
    },
    scales: {
      x: { title: { display: true, text: "Study Hours" } },
      y: { title: { display: true, text: "Test Scores" } },
    },
  };

  return (
    <div className="powerchart-history-container">
      {/* Powerchart Section */}
      <section className="profile-section">
        <header className="goals-header">
          <h2>Summary</h2>
        </header>
        <Bar data={powerchartData} options={powerchartOptions} />
      </section>

      {/* History Section */}
      <section className="goals-section">
        <header className="goals-header">
          <h2>History</h2>
        </header>
        <Scatter data={scatterData} options={scatterOptions} />
      </section>
    </div>
  );
};

export default TChart;
