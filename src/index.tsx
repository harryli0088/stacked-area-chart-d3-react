import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  area as d3Area,
  extent,
  max,
  scaleLinear,
  scaleOrdinal,
  scaleUtc,
  schemeCategory10,
  stack as d3Stack,
  stackOrderNone,
  stackOffsetNone,
  timeFormat,
} from "d3";

type DataPointType = {
  date: Date,
} & {
  [key:string]: number
}

type Props = {
  data: DataPointType[],
  keys: string[],

  areaOpacity: string,
  axisStroke: string,
  axisStrokeWidth: number,
  colorFunction: (key:string) => string,
  dateFormat: (date:Date) => string,
  dots: boolean,
  dotsRadius: number,
  dotsStroke: string,
  dotsStrokeWidth: number,
  dotsFilter: string,
  height: number,
  margin: {top: number, right: number, bottom: number, left: number},
  onClickHandler: (e: React.MouseEvent<SVGPathElement | SVGRectElement>, key:string, dataIndex: number | null) => void,
  onMouseOverHandler: (e: React.MouseEvent<SVGPathElement | SVGRectElement> | null, key?:string, dataIndex?: number) => void,
  xTickSize: number,
  xTicksSkip: number,
  yFormat: (y: number) => string,
  yTickSize: number,
  yMaxTicks: number,
}


function StackedAreaChart (props:Props) {
  const {
    data,
    keys,

    areaOpacity,
    axisStroke,
    axisStrokeWidth,
    colorFunction: propsColorFunction,
    dateFormat,
    dots,
    dotsRadius,
    dotsStroke,
    dotsStrokeWidth,
    dotsFilter,
    height,
    margin,
    onClickHandler,
    onMouseOverHandler,
    xTickSize,
    xTicksSkip,
    yFormat,
    yTickSize,
    yMaxTicks,
  } = props

  const [hoverKey, setHoverKey] = useState<string>("")
  const [width, setWidth] = useState<number>(500)
  const [xHoverIndex, setXHoverIndex] = useState<number | null>(null)

  const ref = useRef<HTMLDivElement>(null)

  const resize = useCallback(() => {
    if(ref.current) {
      setWidth(ref.current.clientWidth) //responsive chart width
    }
  }, [ref])

  useEffect(() => {
    window.addEventListener('resize', resize); //add resize listener for responsiveness

    resize(); //initial resize

    return () => {
      window.removeEventListener('resize', resize);
    }
  }, [resize])

  const mapPositionToIndex = useCallback((x: number) => {
    const domain = width - margin.left - margin.right;
    const relativeX = x - margin.left;
    const proportion = relativeX / domain;

    const value = Math.round((data.length-1)*proportion);

    return Math.min( Math.max(0, value), data.length-1);
  }, [data, margin, width])


  const mouseMove = (e: React.MouseEvent<SVGPathElement | SVGRectElement>, key: string) => {
    if(ref.current) {
      const boundings = ref.current.getBoundingClientRect(); //get the bounds of the chart
      const newXHoverIndex = mapPositionToIndex(e.clientX - boundings.left); //calculate the x hover index
      if(newXHoverIndex!==xHoverIndex || key!==hoverKey) { //if we should set a new xHoverIndex or hoverKey
        setHoverKey(key);
        setXHoverIndex(newXHoverIndex);
        onMouseOverHandler(e, key, newXHoverIndex); //run the callback from props
      }
    }
  }

  const mouseLeave = () => {
    setXHoverIndex(null);
    onMouseOverHandler(null); //run the callback from props
  }

  const getTitle = useCallback((key:string, dateFormat: (date:Date) => string) => {
    let title = key;
    if(xHoverIndex && data[xHoverIndex]) {
      title += `: (${dateFormat(data[xHoverIndex].date)}, ${data[xHoverIndex][key]})`;
    }
    return title;
  }, [data, xHoverIndex])


  const colorFunction = propsColorFunction || scaleOrdinal().domain(keys).range(schemeCategory10);

  const stack = useMemo(() => (
    d3Stack()
    .keys(keys)
    .order(stackOrderNone)
    .offset(stackOffsetNone)
  ), [keys])

  const series = useMemo(
    () => stack(data),
    [data, stack]
  );

  const area = d3Area()
  //@ts-ignore
  .x((d:DataPointType) => x(d.data.date))
  .y0((d: [number,number]) => y(d[0]))
  .y1((d: [number,number]) => y(d[1]))

  const x = useMemo(() => (
    scaleUtc()
    //@ts-ignore
    .domain(extent(data, d => d.date))
    .range([margin.left, width - margin.right])
  ),[data, margin, width])

  const {
    yAxis,
    y,
  } = useMemo(() => {
    const yDomain = [0, max(series, d => max(d, d => d[1])) || 0]

    const yAxis = []; //will hold the numbers to show on the y axis
    const rawIncrement = (yDomain[1] - yDomain[0]) / yMaxTicks; //difference between max and min divided by the max number of y ticks
    const digits = Math.log(rawIncrement) * Math.LOG10E + 1 | 0; //get the number digits in this number
    const magnitude = Math.pow(10, digits-1); //the power of 10 with the same number of digits
    const roundedIncrement = Math.ceil(rawIncrement/magnitude) * magnitude; //round up to the next highest number with trailing zeros (ex 1000, 2000, etc)
    //starting at the min, increment by the roundedIncrement until we pass the max
    let i = yDomain[0]
    for(i; i<yDomain[1]; i+=roundedIncrement) {
      yAxis.push(i);
    }
    yAxis.push(i); //push an extra rounded increment
    yDomain[1] = i + yDomain[0] //set the max to the extra rounded increment

    const y = scaleLinear()
    .domain(yDomain)
    .range([height - margin.bottom, margin.top])

    return {
      yAxis,
      y,
    }
  }, [data, series, yMaxTicks])



  const rectWidth = useMemo(
    () => Math.min(500, (width-margin.left-margin.right)/2),
    [margin, width]
  )

  return (
    <div ref={ref}>
      <svg width={width} height={height} onMouseLeave={mouseLeave}>
        <g>
          {data.map((d,i) => {
            if(i%xTicksSkip === 0) {
              return (
                <g key={i}>
                  <line x1={x(d.date)} x2={x(d.date)} y1={height-margin.bottom+xTickSize} y2={margin.top} strokeWidth={axisStrokeWidth} stroke={axisStroke}></line>
                  <text x={x(d.date)} y={height-margin.bottom+xTickSize} textAnchor="middle" dy="1.25em">{dateFormat(d.date)}</text>
                </g>
              )
            }
            return null
          })}
        </g>

        <g>
          {yAxis.map((yValue,i) =>
            <g key={i}>
              <line key={i} x1={margin.left-yTickSize} x2={width-margin.right} y1={y(yValue)} y2={y(yValue)} strokeWidth={axisStrokeWidth} stroke={axisStroke}></line>
              <text x={margin.left-yTickSize} y={y(yValue)} textAnchor="end" dx="-5px" dy="0.35em">
                {yFormat(yValue)}
              </text>
            </g>
          )}
        </g>

        <g>
          {series.map((d,i) => {
            //if there is a data point to show
            if(d[0]) {
              const properties = data.length>1 ?
              {
                d:area(d),
              } :
              {
                x: x(d[0].data.date)-rectWidth/2,
                width: rectWidth,
                y: y(d[0][1]),
                height: y(d[0][0])-y(d[0][1]),
              }
              const Element = data.length>1 ? "path" : "rect"

              return (
                <Element
                  {...properties}
                  key={i}
                  fill={colorFunction(d.key)}
                  opacity={areaOpacity}
                  onClick={(e: React.MouseEvent<SVGPathElement | SVGRectElement>)  => onClickHandler(e, d.key, xHoverIndex)}
                  // onTouchStart={(e: React.MouseEvent<SVGPathElement | SVGRectElement>) => this.props.onClickHandler(e, d.key, xHoverIndex)}
                  // onTouchMove={(e: React.MouseEvent<SVGPathElement | SVGRectElement>) => this.mouseMove(e, d.key)}
                  onMouseMove={(e: React.MouseEvent<SVGPathElement | SVGRectElement>) => mouseMove(e, d.key)}
                >
                  <title>{getTitle(d.key, dateFormat)}</title>
                </Element>
              )
            }
            return null
          })}
        </g>

        {xHoverIndex && data[xHoverIndex] && dots ?
          <g>
            <line
              x1={x(data[xHoverIndex].date)}
              x2={x(data[xHoverIndex].date)}
              y1={margin.top}
              y2={height - margin.bottom}
              stroke={dotsStroke}
              strokeWidth={dotsStrokeWidth}
            ></line>

            {keys.map((k,i) =>
              <circle
                key={i}
                cx={x(data[xHoverIndex].date)}
                cy={y(series[i][xHoverIndex][1])}
                r={dotsRadius}
                fill={colorFunction(keys[i])}
                stroke={dotsStroke}
                strokeWidth={dotsStrokeWidth}
                filter={dotsFilter}
              >
                <title>{getTitle(k, dateFormat)}</title>
              </circle>
            )}
          </g>
        : null}
      </svg>
    </div>
  )
}


// //@ts-ignore
// StackedAreaChart.propTypes = {
//   data: PropTypes.array.isRequired,
//   keys: PropTypes.array.isRequired,
//
//   areaOpacity: PropTypes.oneOfType([
//     PropTypes.string,
//     PropTypes.number
//   ]),
//   axisStroke: PropTypes.string,
//   axisStrokeWidth: PropTypes.number,
//   colorFunction: PropTypes.func,
//   dateFormat: PropTypes.func,
//   dots: PropTypes.bool,
//   dotsRadius: PropTypes.oneOfType([
//     PropTypes.string,
//     PropTypes.number
//   ]),
//   dotsStroke: PropTypes.string,
//   dotsStrokeWidth: PropTypes.number,
//   dotsFilter: PropTypes.string,
//   height: PropTypes.number,
//   margin: PropTypes.object,
//   onClickHandler: PropTypes.func,
//   onMouseOverHandler: PropTypes.func,
//   xTickSize: PropTypes.number,
//   xTicksSkip: PropTypes.number,
//   yFormat: PropTypes.func,
//   yMaxTicks: PropTypes.number,
//   yTickSize: PropTypes.number,
// }
//
// //@ts-ignore
// StackedAreaChart.defaultProps = {
//   areaOpacity: "0.9",
//   axisStroke: "#ccc",
//   axisStrokeWidth: 2,
//   dateFormat: timeFormat("%Y"),
//   dots: true,
//   dotsFilter: "brightness(1.25)",
//   dotsRadius: 10,
//   dotsStroke: "#aaa",
//   dotsStrokeWidth: 2,
//   height: 500,
//   margin: {top: 20, right: 30, bottom: 30, left: 60},
//   onClickHandler: function(e: React.MouseEvent<SVGPathElement | SVGRectElement>, key:string, dataIndex: number) {},
//   onMouseOverHandler: function(e: React.MouseEvent<SVGPathElement | SVGRectElement>, key:string, dataIndex: number) {},
//   xTickSize: 5,
//   xTicksSkip: 1,
//   yFormat: (y: number) => y,
//   yMaxTicks: 5,
//   yTickSize: 5,
// }

export default StackedAreaChart
