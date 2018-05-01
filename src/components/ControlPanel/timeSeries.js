import React from 'react';
import moment from 'moment';
import { Chart } from 'chart.js';
import { Line } from 'react-chartjs-2';

const DEFAULT_COLORS = [
    'rgba(255, 99, 132, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(255, 206, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(255, 159, 64, 0.2)'
]
const committeeData = [
    {
        event: {
            title: "Hack School"
        },
        attendance: {
            [new Date(2018, 3, 1, 16, 0)]: 12,
            [new Date(2018, 3, 1, 16, 1)]: 20,
            [new Date(2018, 3, 1, 16, 2)]: 30,
            [new Date(2018, 3, 1, 16, 4)]: 24,
            [new Date(2018, 3, 1, 16, 6)]: 21,
            [new Date(2018, 3, 1, 16, 7)]: 18,
            [new Date(2018, 3, 1, 16, 10)]: 7,
        }
    },
    {
        event: {
            title: "Mentorship Brunch"
        },
        attendance: {
            [new Date(2018, 3, 1, 16, 8)]: 12,
            [new Date(2018, 3, 1, 16, 9)]: 20,
            [new Date(2018, 3, 1, 16, 10)]: 30,
            [new Date(2018, 3, 1, 16, 11)]: 24,
            [new Date(2018, 3, 1, 16, 12)]: 21,
            [new Date(2018, 3, 1, 16, 13)]: 18,
            [new Date(2018, 3, 1, 16, 14)]: 7,
        }
    },
]

export default class TimeSeries extends React.Component {
    getChartDates() {
        return this.state.data.reduce((accum, curr) => {
            accum.push(...Object.keys(curr.attendance))
            return accum;
        }, []).sort();
    }

    renderChartData = (chartDates) => ({
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
