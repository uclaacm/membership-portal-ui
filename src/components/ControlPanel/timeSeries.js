import React from 'react';
import moment from 'moment';
import { Chart } from 'chart.js';
import { Line } from 'react-chartjs-2';

const DEFAULT_COLORS = [
    'rgba(223, 255, 255, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(255, 206, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(255, 159, 64, 0.2)',
    'rgba(255, 215, 132, 1)',
    'rgba(237, 244, 237, 1)',
    'rgba(161, 193, 129, 1)',
    'rgba(255, 231, 76, 1)',
    'rgba(255, 89, 100, 1)',
    'rgba(255, 255, 255, 1)',
    'rgba(56, 97, 140, 1)',
    'rgba(53, 167, 255, 1)'
]

export default class TimeSeries extends React.Component {
    getChartDates() {
        return this.state.data.reduce((accum, curr) => {
            accum.push(...Object.keys(curr.attendance))
            return accum;
        }, []).sort();
    }

    getChartData = (chartDates) => ({
        labels: chartDates.map(date => moment(date).format("MM/DD HH:mm")),
        datasets: this.state.data.map((eventData, i) => ({
            label: eventData.event.title,
            data: chartDates.map(date => eventData.attendance[date] || 0),
            radius: chartDates.map(date => eventData.attendance[date] ? 3 : 0),
            pointHoverRadius: 5,
            backgroundColor: chartDates.map(date => DEFAULT_COLORS[i % DEFAULT_COLORS.length]),
            pointHoverBackgroundColor: chartDates.map(date => DEFAULT_COLORS[i % DEFAULT_COLORS.length]),
            borderWidth: 1
        }))
    })

    constructor(props) {
		super(props)
		this.state = {
            data: committeeData,
		}
	}
	render() {
		return (
            <div className="chartWrapper">
                <h3 className="chart-title">Event Time Series</h3>
                <Line
                data={this.renderChartData(this.getChartDates())}
                options={{legend: { display: false }, hover: {mode: 'nearest'}}}
                />
            </div>
		);
	}
}
