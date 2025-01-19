import React from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import './RadarChart.css';

// Register required Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const RadarChart = ({ dataset, labels }) => {
    
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Student Ability',
                data: dataset,
                fill: true,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)',
                pointBackgroundColor: 'rgb(255, 99, 132)',
                pointBorderColor: '#fff',
            },
        ],
    };

    const options = {
        // responsive: true,
        layout: {
            padding: {
                top: 20, // Adjust as needed
                bottom: 20,
                left: 20,
                right: 20,
            },
        },
        scales: {
            r: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="chart-container">
            <Radar data={data} options={options} />
        </div>
    );
};

export default RadarChart;

// const radar_data = [92, 59, 90, 25, 56, 64, 40];

// const radar_labels = [
//     'Ability to follow instructions',
//     'Ability to work in a team',
//     'Ability to work independently',
//     'Ability to communicate',
//     'Ability to manage time',
//     'Ability to solve problems',
//     'Ability to learn new skills',
// ]

// // equal to whatever we set that canvas id to
// const myChart = new Chart('myChart', {
//     type: 'radar',
//     data: {
//         labels: radar_labels,
//         datasets: [
//             {
//                 label: 'Student Ability',
//                 data: radar_data,
//                 fill: true,
//                 backgroundColor: 'rgba(255, 99, 132, 0.2)',
//                 borderColor: 'rgb(255, 99, 132)',
//                 pointBackgroundColor: 'rgb(255, 99, 132)',
//                 pointBorderColor: '#fff',
//             }
//         ]
//     }
// });