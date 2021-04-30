import { DataPointType } from "../../index"
import getYAxisData from "../getYAxisData"

const NO_MARGIN = { top: 0, right: 0, bottom: 0, left: 0}
test("empty data", () => {
  const data:DataPointType[] = []

  const result = getYAxisData(data, 1000, NO_MARGIN, 10)
  expect(result.yTicks).toEqual([0])
  expect(result.yScale(0)).toEqual(500)
  expect(result.yScale(1)).toEqual(500)
})

test("one data point, one key-value", () => {
  const data:DataPointType[] = [
    {date: new Date(), apple: 100} //max sum 100
  ]

  const result = getYAxisData(data, 1000, NO_MARGIN, 5)
  expect(result.yTicks).toEqual([
    0, 20, 40, 60, 80, 100
  ])
  expect(result.yScale(0)).toEqual(1000)
  expect(result.yScale(50)).toEqual(500)
  expect(result.yScale(100)).toEqual(0)
})


test("one data point, multiple key-values", () => {
  const data:DataPointType[] = [
    {date: new Date(), apple: 100, banana: 150, cherries: 50} //max sum 300
  ]

  const result = getYAxisData(data, 1000, NO_MARGIN, 10)
  expect(result.yTicks).toEqual([
    0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300
  ])
  expect(result.yScale(0)).toEqual(1000)
  expect(result.yScale(75)).toEqual(750)
  expect(result.yScale(150)).toEqual(500)
  expect(result.yScale(225)).toEqual(250)
  expect(result.yScale(300)).toEqual(0)
})

test("multiple data points, multiple key-values", () => {
  const data:DataPointType[] = [
    {date: new Date(), apple: 20, banana: 60, cherries: 50},
    {date: new Date(), apple: 70, banana: 50, cherries: 70}, //max sum 190
    {date: new Date(), apple: 10, banana: 90, cherries: 20},
  ]

  const result = getYAxisData(data, 1000, NO_MARGIN, 10)
  expect(result.yTicks).toEqual([
    0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200
  ])
  expect(result.yScale(0)).toEqual(1000)
  expect(result.yScale(50)).toEqual(750)
  expect(result.yScale(100)).toEqual(500)
  expect(result.yScale(150)).toEqual(250)
  expect(result.yScale(200)).toEqual(0)
})
