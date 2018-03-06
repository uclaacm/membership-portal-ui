import React from 'react';
import Button from 'components/Button';
import { Chart } from 'chart.js'
import { Pie  } from 'react-chartjs-2'



export default class EventAnalytics extends React.Component {

	render() {

		var genderData = {
			labels: ["Male", "Female", "Other"],
			datasets: [{
				label: 'Gender',
				data: [400, 190, 10],
				backgroundColor: [
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 99, 132, 0.2)',
					'rgba(255, 206, 86, 0.2)'
				],
				borderColor: [
					'rgba(54, 162, 235, 1)',
					'rgba(255,99,132,1)',
					'rgba(255, 206, 86, 1)'
				],
				borderWidth: 1
			}]
		}

		var yearData = {
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

		var majorData = {
			labels: ["Computer Science", "Linguistics and Computer Science", "Mathematics of Computation", "Cognitive Science", "Electrical Engineering"],
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

		return (
			<div className="chartWrapper">
				<Pie data={genderData} />
				<Pie data={yearData} />
				<Pie data={majorData} />
			</div>
        );
	}
}