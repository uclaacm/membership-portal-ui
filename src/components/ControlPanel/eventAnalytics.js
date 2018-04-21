import React from 'react';
import Button from 'components/Button';
import Event from './event.js';
import { Chart } from 'chart.js'
import { Bar } from 'react-chartjs-2'



export default class EventAnalytics extends React.Component {

	render() {
		const yearData = {
			labels: ["1", "2", "3", "4", "5+"],
			datasets: [{
				label: 'Attendees',
				data: [400, 150, 30, 15, 5],
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
					'rgba(255, 159, 64, 0.2)',
					'rgba(255, 206, 86, 0.2)',
					'rgba(75, 192, 192, 0.2)',
					'rgba(54, 162, 235, 0.2)'
				],
				borderColor: [
					'rgba(255,99,132,1)',
					'rgba(255, 159, 64, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(54, 162, 235, 1)'
				],
				borderWidth: 1
			}],
			options: {
				legend: {
					display: false
				}
			}
		};

		const majorData = {
			labels: ["CS", "Ling CS", "Math CS"],
			datasets: [{
				label: 'Attendees',
				data: [520, 150, 30],
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
					'rgba(75, 192, 192, 0.2)',
					'rgba(54, 162, 235, 0.2)'
				],
				borderColor: [
					'rgba(255,99,132,1)',
					'rgba(75, 192, 192, 1)',
					'rgba(54, 162, 235, 1)'
				],
				borderWidth: 1
			}]
		};

		return (
			<div className="chartWrapper">
				<h3 className="chart-title">Attendees By Year</h3>
				<Bar data={yearData} options={{legend: { display: false }}} />
				<h3 className="chart-title">Attendees By Major</h3>
				<Bar data={majorData} options={{legend: { display: false }}} />
			</div>
        );
	}
}