import './App.css';
import styled from 'styled-components'
import React from "react";
import randomExponential from "./exponentialRandom";
import Slider from 'react-input-slider';
import Latex from 'react-latex'
import { MdRefresh, MdPlayArrow as MdPlay, MdPause, MdKeyboardHide } from 'react-icons/md'

const Wrapper = styled.div`
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
  font-size: calc(10px + 2vmin);
  color: white;
`

const MAX_T = 1.;
const FPS = 40;
const SPEED = 0.1;
const RESETAFTERCHANGE = false
const OFFSET = 200

const Svg = styled.svg`
  flex: 1;
  
  circle {
    transition: fill 0.2s;
  }
`

const ControlPanel = styled.div`
  position: absolute;
  width: 100%;
  height: ${OFFSET}px;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.2s;
`

const fillRandomArray = (array, rate, t) => {
  const newArray = array.filter(z => z >= t)
  while (newArray.length === 0 || newArray[newArray.length - 1] < MAX_T + t)
    newArray.push(randomExponential(rate) + (newArray.length === 0 ? t : newArray[newArray.length - 1]))
  return newArray
}

class SimulationZ extends React.Component {

  state = {
    t: 0,
    pause: true,
    showControls: true,
    lambda: 2,
    points: [
      {infected: true, arrowsLeft: [], arrowsRight: [], deltas: []},
      {infected: true, arrowsLeft: [], arrowsRight: [], deltas: []},
      {infected: true, arrowsLeft: [], arrowsRight: [], deltas: []},
      {infected: true, arrowsLeft: [], arrowsRight: [], deltas: []},
      {infected: true, arrowsLeft: [], arrowsRight: [], deltas: []},
      {infected: true, arrowsLeft: [], arrowsRight: [], deltas: []},
      {infected: true, arrowsLeft: [], arrowsRight: [], deltas: []},
      {infected: true, arrowsLeft: [], arrowsRight: [], deltas: []},
      {infected: true, arrowsLeft: [], arrowsRight: [], deltas: []},
      {infected: true, arrowsLeft: [], arrowsRight: [], deltas: []},
      {infected: true, arrowsLeft: [], arrowsRight: [], deltas: []},
      {infected: true, arrowsLeft: [], arrowsRight: [], deltas: []},
      {infected: true, arrowsLeft: [], arrowsRight: [], deltas: []},
      {infected: true, arrowsLeft: [], arrowsRight: [], deltas: []},
      {infected: true, arrowsLeft: [], arrowsRight: [], deltas: []},
      {infected: true, arrowsLeft: [], arrowsRight: [], deltas: []},
    ],

  }

  componentDidMount() {
    this.interval = setInterval(this.update, 1000 / FPS);
  }

  play = () => this.setState({ pause: false })
  pause = () => this.setState({ pause: true })

  update = (advanceT = true) => {
    this.setState(({points, t, lambda, pause}) => {
      const t2 = t + ((advanceT && !pause) ? SPEED / FPS : 0)

      // Assume only one arrow or delta
      const points2 = points.map((point, i) => {
        let infected = point.infected
        if (point.infected && point.deltas.length > 0 && point.deltas[0] >= t && point.deltas[0] < t2)
          infected = false
        else if (i > 0 && points[i - 1].infected && points[i - 1].arrowsRight.length > 0
          && points[i - 1].arrowsRight[0] >= t && points[i - 1].arrowsRight[0] < t2)
          infected = true
        else if (i < points.length - 1 && points[i + 1].infected && points[i + 1].arrowsLeft.length > 0
          && points[i + 1].arrowsLeft[0] >= t && points[i + 1].arrowsLeft[0] < t2)
          infected = true

        const arrowsLeft = fillRandomArray(point.arrowsLeft, lambda, t2)
        const arrowsRight = fillRandomArray(point.arrowsRight, lambda, t2)
        const deltas = fillRandomArray(point.deltas, 1, t2)

        return {infected, arrowsLeft, arrowsRight, deltas}
      })
      return {t: t2, points: points2}
    })
  }

  lambdaChange = ({x}) => {
    this.setState(state => ({
      lambda: x,
    }))
  }

  refresh = () => {
    this.setState(state => ({
      points: state.points.map(point => ({...point, infected: true, arrowsLeft: [], arrowsRight: [], deltas: []}))
    }), () => this.update(false))
  }

  lambdaChangeEnded = () => {
    if (RESETAFTERCHANGE) {
      this.setState(state => ({
        points: state.points.map(point => ({...point, arrowsLeft: [], arrowsRight: []}))
      }), this.update)
    }
  }

  showControls = (e) => this.setState({showControls: true })
  hideControls = (e) => {
    this.setState({showControls: false })
    e.preventDefault()
    e.stopPropagation()
  }

  render() {
    const {points, t, lambda, pause, showControls} = this.state
    return (
      <Wrapper>
        <Svg viewBox="0 0 1920 1080">
          <defs>
            <marker id='head' orient="auto"
                    markerWidth='2' markerHeight='4'
                    refX='0.1' refY='2'>
              <path d='M0,0 V4 L2,2 Z' fill="gray"/>
            </marker>
          </defs>
          <line x1={0} y1={1080 - OFFSET} x2={1920} y2={1080 - OFFSET} stroke="white" strokeWidth="2"/>
          {this.state.points.map((point, i) => {
            const delx = (1920 + 2 * 50) / (points.length - 1)
            const x = -50 + i * delx
            return <>
              <line x1={x} y1={1080-OFFSET} x2={x} y2={0} stroke="gray" strokeWidth={1}/>
              <circle r={10} cx={x} cy={1080-OFFSET} stroke="white"
                      fill={point.infected ? "white" : "var(--back-col)"}/>
              {point.arrowsLeft.map(tArrow =>
                <path markerEnd='url(#head)' strokeWidth={4} stroke='gray'
                      d={`M ${x - 15}, ${1080-OFFSET - (tArrow - t) / MAX_T * 1080} h ${-delx + 35}`}/>)}
              }
              {point.arrowsRight.map(tArrow =>
                <path markerEnd='url(#head)' strokeWidth={4} stroke='gray'
                      d={`M ${x + 15}, ${1080-OFFSET - (tArrow - t) / MAX_T * 1080} h ${delx - 35}`}/>)}
              }
              {point.deltas.map(tDelta =>
                <text x={x - 8} y={1080-OFFSET - (tDelta - t) / MAX_T * 1080 + 8} fill='white'>δ</text>)}
            </>
          })}
        </Svg>
        <ControlPanel style={{ opacity: showControls ? 1 : 0 }} onClick={this.showControls}>
          <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <Latex>{`$\\lambda=${lambda.toFixed(1)}$`}</Latex>
            <Slider axis="x" x={lambda} xstep={0.1} xmin={0.1} xmax={10} onChange={this.lambdaChange} onDragEnd={this.lambdaChangeEnded}/>
          </div>
          {pause
            ? <MdPlay style={{padding: '10px', margin: '10px'}} stroke={"white"} onClick={this.play}/>
            : <MdPause style={{padding: '10px', margin: '10px'}} stroke={"white"} onClick={this.pause}/>
          }
          <MdRefresh style={{ padding: '10px', margin: '10px' }} stroke={"white"} onClick={this.refresh} />
          <MdKeyboardHide style={{ padding: '10px', margin: '10px' }} stroke={"white"} onClick={this.hideControls} />

        </ControlPanel>
      </Wrapper>
    );
  }
}

export default SimulationZ
