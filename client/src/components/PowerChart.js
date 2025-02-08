import React from "react";
import { Scatter } from "react-chartjs-2";
import "./PowerChart.css";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const PowerChart = () => {
  const scatterData = {
    datasets: [
      {
        label: "Student Performance",
        data: [
          { x: 90, y: 95 },
          { x: 85, y: 90 },
          { x: 88, y: 92 },
          { x: 92, y: 97 },
          { x: 80, y: 85 },
        ],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "PowerChart: Student Performance",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Student Effort (%)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Grades (%)",
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <h2>PowerChart</h2>
      <Scatter data={scatterData} options={options} />
    </div>
  );
};

export default PowerChart;
