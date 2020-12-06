import './App.css';
import SimulationZ from "./SimulationZ";
import React from "react";
import SimulationT from "./SimulationT";
import styled from "styled-components";


const Wrapper = styled.div`
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  > button {
    width: 200px;
    padding: 10px;
    margin: 10px;
  }
  font-size: calc(10px + 2vmin);
  color: white;
`

class App extends React.Component {
  state = { status: 'menu' }

  render () {
    return (
      <div className="App">
        {this.state.status === 'tree' && <SimulationT/>}
        {this.state.status === 'integers' && <SimulationZ/>}
        {this.state.status === 'menu' && <Wrapper>
          <button onClick={() => this.setState({ status: 'integers' })}>Simulate on integers!</button>
          <button onClick={() => this.setState({ status: 'tree' })}>Simulate on tree!</button>
        </Wrapper>}
      </div>
    );
  }
}

export default App
