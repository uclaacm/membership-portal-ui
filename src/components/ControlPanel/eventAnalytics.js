import React from 'react';
import Button from 'components/Button';
import Event from './event.js';
import { Chart } from 'chart.js'
import { Bar } from 'react-chartjs-2'



export default class EventAnalytics extends React.Component {

	render() {
		const yearData = {
			labels: ["Freshman", "Sophomore", "Junior", "Senior", "Post-Senior"],
			datasets: [{
				label: 'Year',
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
			}]
		}

		const majorData = {
			labels: ["Computer Science", "Ling CS", "Math CS"],
			datasets: [{
				label: 'Top 3 Majors',
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
		}

		return (
			<div className="chartWrapper">
				<h1 className="TitlePrimary">Total Attendees: 100</h1>
				<Bar data={yearData} />
				<Bar data={majorData} />
			</div>
        );
	}
}