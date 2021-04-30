import { DataPointType, MarginType } from "../index"

import { scaleLinear } from "d3";

export default function getYAxisData(
  data: DataPointType[],
  height: number,
  margin: MarginType,
  yMaxTicks: number,
) {
  //calculate the maximum y value we have in our stacked area chart
  const yMax = data.reduce((maxSum, d) => { //reduce over each data point
    const sum = Object.values(d).reduce((sum, value) => { //reduce over all the keys in this data point
      if(typeof value === "number") { //if this value is a number (ie not the date)
        return sum + value //return the sum plus the value
      }
      return sum //else ignore the value
    }, 0)
    if(sum > maxSum) { //if this sum is higher
      return sum //return it
    }
    return maxSum //else ignore the lower sum
  }, 0)

  const yDomain = [0, yMax]

  const yTicks:number[] = []; //will hold the numbers to show on the y axis
  const rawIncrement = (yDomain[1]) / yMaxTicks; //difference between max and min divided by the max number of y ticks
  const digits = Math.log(rawIncrement) * Math.LOG10E + 1 | 0; //get the number digits in this number
  const magnitude = Math.pow(10, digits-1); //the power of 10 with the same number of digits
  const roundedIncrement = Math.ceil(rawIncrement/magnitude) * magnitude; //round up to the next highest number with trailing zeros (ex 1000, 2000, etc)
  //starting at the min, increment by the roundedIncrement until we pass the max
  let i = 0
  for(i; i<yDomain[1]; i+=roundedIncrement) {
    yTicks.push(i);
  }
  yTicks.push(i); //push an extra rounded increment
  yDomain[1] = i  //set the max to the extra rounded increment

  const yScale = scaleLinear()
  .domain(yDomain)
  .range([height - margin.bottom, margin.top])

  return {
    yTicks,
    yScale,
  }
}
