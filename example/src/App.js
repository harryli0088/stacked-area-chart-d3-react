import React, { Component } from 'react'
import {
  scaleOrdinal,
  schemeCategory10,
  timeFormat,
} from "d3";

import StackedAreaChart from 'stacked-area-chart-d3-react'


const data = [
  {date: new Date(2005,0,1), apples: 750, bananas: 300, cherries: 100, durians: 50},
  {date: new Date(2006,0,1), apples: 1000, bananas: 400, cherries: 150, durians: 75},
  {date: new Date(2007,0,1), apples: 1300, bananas: 500, cherries: 250, durians: 100},
  {date: new Date(2008,0,1), apples: 1600, bananas: 600, cherries: 300, durians: 150},
  {date: new Date(2009,0,1), apples: 1800, bananas: 800, cherries: 400, durians: 200},
  {date: new Date(2010,0,1), apples: 2100, bananas: 1000, cherries: 500, durians: 225},
  {date: new Date(2011,0,1), apples: 2200, bananas: 1100, cherries: 600, durians: 250},
  {date: new Date(2012,0,1), apples: 2400, bananas: 1200, cherries: 500, durians: 300},
  {date: new Date(2013,0,1), apples: 2200, bananas: 1400, cherries: 550, durians: 400},
  {date: new Date(2014,0,1), apples: 2300, bananas: 1700, cherries: 500, durians: 500},
  {date: new Date(2015,0,1), apples: 2100, bananas: 1900, cherries: 400, durians: 400},
  {date: new Date(2016,0,1), apples: 2000, bananas: 1500, cherries: 450, durians: 300},
  {date: new Date(2017,0,1), apples: 1900, bananas: 1300, cherries: 600, durians: 200},
  {date: new Date(2018,0,1), apples: 1800, bananas: 1400, cherries: 700, durians: 100},
  {date: new Date(2019,0,1), apples: 1700, bananas: 1400, cherries: 800, durians: 50},
];

const keys = ["apples", "bananas", "cherries", "durians"];

const color = scaleOrdinal().domain(keys).range(schemeCategory10);

export default class App extends Component {
  render () {
    return (
      <div className="container">
        <h1>Responsive Stacked Area Chart</h1>
        <p><i>Built using D3.js and React.js</i></p>
        <p><a href="https://github.com/harryli0088/stacked-area-chart-d3-react" target="_blank" rel="noopener noreferrer">https://github.com/harryli0088/stacked-area-chart-d3-react</a></p>
        <StackedAreaChart
          data={data}
          keys={keys}

          //optional props, shown with defaults
          areaOpacity={"0.9"} //could be string or number
          axisStroke="#ccc"
          axisStrokeWidth={2}
          colorFunction={color}
          dateFormat={timeFormat("%Y")}
          dots={true}
          dotsRadius={10} //could be string or number
          dotsStroke={"#aaa"}
          dotsStrokeWidth={2}
          dotsFilter={"brightness(1.25)"}
          height={300}
          margin={{top: 20, right: 0, bottom: 30, left: 50}}
          onClickHandler={function(e, key, dataIndex) {}}
          onMouseOverHandler={function(e, key, dataIndex) {}}
          xTickSize={5}
          xTicksSkip={3}
          yTickSize={5}
          yFormat={function(y) { return y }}
          yMaxTicks={5}
        />

        <br/>

        <div>
          <svg>
            <g>
              {keys.map((k,i) =>
                <g transform={"translate(0,"+(i*30)+")"} key={i}>
                  <rect x="0" y="0" width="25" height="25" fill={color(k)}></rect>
                  <text x="30" y="18">{k}</text>
                </g>
              )}
            </g>
          </svg>
        </div>
      </div>
    )
  }
}
