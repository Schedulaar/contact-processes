import './App.css';
import styled from 'styled-components'
import React from "react";
import Slider from 'react-input-slider';
import Latex from 'react-latex'
import {MdKeyboardHide, MdPause, MdPlayArrow as MdPlay, MdRefresh} from 'react-icons/md'

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
const LAYERS = 9
const FPS = 30
const d = 6
let nNodes = 0
for (let i = 0; i < LAYERS; i++) nNodes += Math.pow(d, i)
const infected = new Array(nNodes)


const until = d + 1
for (let i = 0; i < until; i++)
  infected[i] = 1
for (let i = until; i < nNodes; i++)
  infected[i] = 0;

const delx = (1920 + 2 * 50) / (LAYERS - 1)


const OFFSET = 200

const Svg = styled.svg`
  flex: 1;

  circle {
    transition: fill 0.2s;
  }

  line {
    transition: stroke 0.2s;
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

class SimulationT extends React.Component {

  state = {
    t: 0,
    pause: true,
    showControls: false,
    lambda: 1 / (d - 1),
    infected
  }

  componentDidMount() {
    this.interval = setInterval(() => window.requestAnimationFrame(this.update), 1000 / FPS);
  }

  play = () => this.setState({pause: false})
  pause = () => this.setState({pause: true})

  updateBehavior = ({infected, t, lambda}) => {
    const healProp = 1 / FPS
    const infectProp = lambda / FPS
    for (let i = 0; i < nNodes; i++) {
      if (infected[i] === 1) {
        if (Math.random() < healProp) infected[i] = 0
        if (i > 0 && Math.random() < infectProp) infected[Math.floor((i - 1) / d)] = 1
        if (i * d <= nNodes) {
          for (let j = 1; j <= d; j++)
            if (Math.random() < infectProp) infected[i * d + j] = 1
        }
      }
    }
    return {infected, t: t + 1 / FPS}
  }

  update = () => {
    if (this.state.pause) return
    this.setState(this.updateBehavior)
  }

  lambdaChange = ({x}) => {
    this.setState(state => ({
      lambda: x,
    }))
  }

  refresh = () => {
    for (let i = 0; i < nNodes; i++)
      infected[i] = 1;

    const until = d + 1
    for (let i = 0; i < until; i++)
      infected[i] = 1
    for (let i = until; i < nNodes; i++)
      infected[i] = 0;

    this.setState({infected, t: 0})
  }

  showControls = (e) => this.setState({showControls: true})
  hideControls = (e) => {
    this.setState({showControls: false})
    e.preventDefault()
    e.stopPropagation()
  }

  renderLayer(infected, layer) {
    const nPixels = Math.pow(d, layer)
    const pixels = new Array(nPixels);
    const delY = (1080 - OFFSET - 100) / (nPixels - 1)
    let y = 50
    for (let i = 0; i < nPixels; i++) {
      pixels[i] = <line x1={50 + layer * delx} x2={50 + layer * delx} y1={y} y2={y + delY}
                        stroke={infected[nPixels + i] ? "white" : "var(--back-col)"} strokeWidth={10}/>
      y += delY
    }
    return pixels
  }

  renderLayerAcc(layer) {
    const nPixels = Math.pow(d, 3)
    const pixels = new Array(nPixels + 2);
    const delY = (1080 - OFFSET - 100) / (nPixels - 1)
    const perPixel = Math.pow(d, layer - 3)
    let y = 50
    let j = 0
    let totalInfected = 0
    for (let k = 0; k < layer; k++) j += Math.pow(d, k)
    for (let i = 0; i < nPixels; i++) {
      let acc = 0
      for (let k = 0; k < perPixel; k++) {
        acc += infected[j]
        j++
      }
      totalInfected += acc
      pixels[i] = <line x1={50 + layer * delx} x2={50 + layer * delx} y1={y} y2={y + delY}
                        stroke={acc > 0 ? "white" : "var(--back-col)"} strokeWidth={10}/>
      y += delY
    }
    pixels[nPixels] = <rect x={50 + layer*delx - 5} y={50} width={10} height={1080 - OFFSET - 100} fill="transparent" stroke="white"/>
    pixels[nPixels+1] = <text x={50 + layer * delx} textAnchor="middle" y={1080 - OFFSET - 15} fill="white">{totalInfected}</text>
    return pixels
  }

  renderAccLayers() {
    const layers = []
    for (let k = 3; k < LAYERS; k++)
      layers.push(this.renderLayerAcc(k))
    return layers;
  }

  renderLayer1() {
    const pixels = new Array(d)
    for (let i = 1; i <= d; i++) pixels[i] = <>
      <circle r={10} cx={50 + delx} cy={50 + (1080 - OFFSET - 100) / (d - 1) * (i - 1)} stroke="white"
              fill={infected[i] ? "white" : "var(--back-col)"}/>
      <line x1={50 + 15} y1={(1080 - OFFSET) / 2} x2={50 + delx - 15}
            y2={50 + (1080 - OFFSET - 100) / (d - 1) * (i - 1)}
            stroke="gray" strokeWidth="2"/>
    </>
    return pixels
  }

  renderLayer2() {
    const pixels = new Array(d * d)
    for (let i = 1; i <= d; i++) {
      for (let j = 1; j <= d; j++) {
        pixels[d * (i - 1) + j - 1] = <>
          <circle r={5} cx={50 + 2 * delx} cy={50 + (1080 - OFFSET - 100) / (d*d - 1) * (d * (i - 1) + j - 1)}
                  stroke="white" fill={infected[i * d + j] ? "white" : "var(--back-col)"}/>
          <line x1={50 + delx + 15} y1={50 + (1080 - OFFSET - 100) / (d-1) * (i - 1)} x2={50 + 2 * delx - 10}
                y2={50 + (1080 - OFFSET - 100) / (d*d - 1) * (d * (i - 1) + j - 1)} stroke="gray" strokeWidth="2"/>
        </>
      }
    }
    return pixels
  }

  render() {
    const {t, lambda, pause, showControls, infected} = this.state

    return (
      <Wrapper>
        <Svg viewBox="0 0 1920 1080">

          <line x1={0} y1={1080 - OFFSET} x2={1920} y2={1080 - OFFSET} stroke="white" strokeWidth="2"/>
          <circle r={10} cx={50} cy={(1080 - OFFSET) / 2} stroke="white"
                  fill={infected[0] ? "white" : "var(--back-col)"}/>
          {/** LAYER 1 */
            this.renderLayer1()}
          {/** LAYER 2 */
            this.renderLayer2()}
          }
          {this.renderAccLayers(infected).flat()}
        </Svg>
        <ControlPanel style={{opacity: showControls ? 1 : 0}} onClick={this.showControls}>
          <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <Latex>{`$\\lambda=${lambda.toFixed(2)}$`}</Latex>
            <Slider axis="x" x={lambda} xstep={0.01} xmin={0.01} xmax={1} onChange={this.lambdaChange}
                    onDragEnd={this.lambdaChangeEnded}/>
          </div>
          {pause
            ? <MdPlay style={{padding: '10px', margin: '10px'}} stroke={"white"} onClick={this.play}/>
            : <MdPause style={{padding: '10px', margin: '10px'}} stroke={"white"} onClick={this.pause}/>
          }
          <MdRefresh style={{padding: '10px', margin: '10px'}} stroke={"white"} onClick={this.refresh}/>
          <MdKeyboardHide style={{padding: '10px', margin: '10px'}} stroke={"white"} onClick={this.hideControls}/>
          <Latex>{`$t=${t.toFixed(1)}$`}</Latex>

        </ControlPanel>
      </Wrapper>
    );
  }
}

export default SimulationT
