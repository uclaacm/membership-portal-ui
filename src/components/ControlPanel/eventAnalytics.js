import React from 'react';
import Button from 'components/Button';
import Event from './event.js';
import { Chart } from 'chart.js'
import { HorizontalBar } from 'react-chartjs-2'



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
			labels: ["Computer Science", "Linguistics and Computer Science", "Mathematics of Computation"],
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
				<HorizontalBar data={yearData} />
				<HorizontalBar data={majorData} />
			</div>
        );
	}
}