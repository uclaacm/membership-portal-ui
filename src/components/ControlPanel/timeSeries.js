import React from 'react';
import moment from 'moment';
import { Chart } from 'chart.js';
import { Line } from 'react-chartjs-2';

const CHART_HOVER_RADIUS = 5;
const CHART_BORDER_WIDTH = 1;
const CHART_COLORS = [
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
    
    createDataSet (chartDates, eventData, i) {
        const dataSet = {
            data: [],
            radius: [],
            backgroundColor: [],
            pointHoverBackgroundColor: []
        };
        chartDates.forEach((date) => {
            dataSet.data.append(eventData.attendance[date] || 0);
            dataSet.radius.append(eventData.attendance[date] ? 3 : 0);
            dataSet.backgroundColor.append(CHART_COLORS[i % CHART_COLORS.length]);
            dataSet.pointHoverBackgroundColor.append(dataSet.backgroundColor);
        })
        return dataSet;
    }

    getChartData = (chartDates) => ({
        labels: chartDates.map(date => moment(date).format("MM/DD HH:mm")),
        datasets: this.state.data.map((eventData, i) => {
            const dataSet = this.createDataSet(chartDates, eventData, i);
            return {
                ...this.createDataSet(chartDates, eventData, i),
                label: eventData.event.title,
                pointHoverRadius: CHART_HOVER_RADIUS,
                borderWidth: CHART_BORDER_WIDTH
            }
        })
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
                data={this.createChartData(this.getChartDates())}
                options={{legend: { display: false }, hover: {mode: 'nearest'}}}
                />
            </div>
		);
	}
}
