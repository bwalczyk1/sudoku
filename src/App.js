import React, { Component } from 'react';
import Board from './components/Board';

export default class App extends Component { 
  constructor(){
    super();
    let defaultSet = "568040003002090007097860000600310409030050062019600508003006801051000020900700345"
    let solve = require('@mattflow/sudoku-solver')
    let solution = solve(defaultSet)
    let fieldsObject = {}
    for(let i = 0; i < 81; i++){
      let fieldValue = parseInt(defaultSet[i])
      fieldsObject[i] = {mode: fieldValue === 0 ? "normal" : 'set', value: fieldValue}
    }
    this.state = {mode: "normal", fieldsObject: fieldsObject, selectedField: 0, solution: solution}
    document.addEventListener('keydown', (e) => this.handleKeyDown(e))
  }

  handleKeyDown(event){
    // arrows
    let keyCode = event.keyCode
    if(keyCode === 37 && this.state.selectedField % 9 !== 0) // left
      this.setState({selectedField: this.state.selectedField - 1})
    else if(keyCode === 38 && Math.floor(this.state.selectedField/9) !== 0) // up
      this.setState({selectedField: this.state.selectedField - 9})
    else if(keyCode === 39 && this.state.selectedField % 9 !== 8) // right
      this.setState({selectedField: this.state.selectedField + 1})
    else if(keyCode === 40 && Math.floor(this.state.selectedField/9) !== 8) // down
      this.setState({selectedField: this.state.selectedField + 9})
    else if(keyCode >= 49 && keyCode <= 57)
      this.changeFieldValue(keyCode - 48)
    else if(keyCode >= 97 && keyCode <= 105)
      this.changeFieldValue(keyCode - 96)
  }

  handleModeChange(selectedMode){
    if(this.state.mode === selectedMode)
      this.setState({mode: "normal"})
    else
      this.setState({mode: selectedMode})
  }

  changeFieldValue(value){
    if(this.state.fieldsObject[this.state.selectedField].mode === 'set')
      return
    let fieldsObject = this.state.fieldsObject
    if(this.state.mode === "normal"){
      fieldsObject[this.state.selectedField].mode = 'normal'
      fieldsObject[this.state.selectedField].value = value
    }
    else if(this.state.mode === 'hint'){
      if(fieldsObject[this.state.selectedField].mode !== 'hint'){
        fieldsObject[this.state.selectedField].mode = 'hint'
        fieldsObject[this.state.selectedField].value = []
      }
      if(!fieldsObject[this.state.selectedField].value.includes(value)){
        fieldsObject[this.state.selectedField].value.push(value)
      }
    }
    this.setState({fieldsObject: fieldsObject})
  }

  loadFile(file){
    let reader = new FileReader()
    reader.readAsText(file)
    reader.onload = () => {
      let fieldsObject;
      let fieldsString = ""
      if(reader.result.includes('{')){
        // reading saved json file
        fieldsObject  = JSON.parse(reader.result)
        for(let i = 0; i < 81; i++){
          if(fieldsObject[i].mode === 'set')
            fieldsString += fieldsObject[i].value
          else
            fieldsString += "0"
        }
      }
      else{
        // read txt file
        fieldsObject = this.state.fieldsObject
        fieldsString = reader.result
        for(let i in fieldsObject){
          let fieldValue = parseInt(fieldsObject[i])
          if(fieldValue !== 0)
            fieldsObject[i].mode = "set"
          else
            fieldsObject[i].mode = "normal"
          fieldsObject[i].value = fieldValue
        }
      }
      let solve = require('@mattflow/sudoku-solver')
      let solution = solve(fieldsString)
      this.setState({fieldsObject: fieldsObject, solution: solution})
    }
  }

  saveFile(){
    let bytes = new TextEncoder().encode(JSON.stringify(this.state.fieldsObject))
    let blob = new Blob([bytes], {type: 'application/json;charset=utf-8'})
    let numberString = ''
    for(let i = 0; i < 81; i++){
      let field = this.state.fieldsObject[i]
      if(field.mode === 'set')
        numberString += field.value
      else
        numberString += '0'
    }
    let downloadLink = document.createElement('a')
    downloadLink.setAttribute('download', 'sudoku' + numberString + '.json')
    downloadLink.setAttribute('href', URL.createObjectURL(blob))
    downloadLink.click()
  }

  solveSudoku(){
    let fieldsObject = this.state.fieldsObject
    for(let i in this.state.solution){
      fieldsObject[i].value = this.state.solution[i]
      if(fieldsObject[i].mode !== "set")
        fieldsObject[i].mode = 'normal'
    }
    this.setState({fieldsObject: fieldsObject})
  }

  render() {
    let numberBlockStyle = {width: "50px", height: "50px", padding: "10px", margin: "5px", backgroundColor: "grey", display: "flex", justifyContent: "center", alignItems: 'center'}
    return (
      <div style={{display: "flex", flexDirection: "row", width: "100vw", height: "100vh", alignItems: "center", justifyContent: "space-around", fontSize: '20px'}}>
        <input type="file" onChange={(e)=> this.loadFile(e.target.files[0])}/>
        <Board fieldsObject={ this.state.fieldsObject } selectedField={this.state.selectedField} solution={this.state.solution}/>
        <div style={{height: '50vh', display: "flex", flexDirection: "column", justifyContent: 'space-evenly', alignItems: 'center'}}>
          <div style={{border: "1px solid black", padding: "5px 45px 5px 45px"}} onClick={() => this.solveSudoku()}>Solve</div>
          <div>
            <label htmlFor="hint">Hint:</label>
            <input type="checkbox" id="hint" checked={this.state.mode === "hint"} onChange={() => this.handleModeChange("hint")}/>
          </div>
          <div>
            <label htmlFor="erase">Erase:</label>
            <input type="checkbox" id="erase" checked={this.state.mode === "erase"} onChange={() => this.handleModeChange("erase")}/>
          </div>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{display: "flex", flexDirection: "row"}}>
              <div style={ numberBlockStyle } onClick={() => this.changeFieldValue(1)}>1</div>
              <div style={ numberBlockStyle } onClick={() => this.changeFieldValue(2)}>2</div>
              <div style={ numberBlockStyle } onClick={() => this.changeFieldValue(3)}>3</div>
            </div>
            <div style={{display: "flex", flexDirection: "row"}}>
              <div style={ numberBlockStyle } onClick={() => this.changeFieldValue(4)}>4</div>
              <div style={ numberBlockStyle } onClick={() => this.changeFieldValue(5)}>5</div>
              <div style={ numberBlockStyle } onClick={() => this.changeFieldValue(6)}>6</div>
            </div>
            <div style={{display: "flex", flexDirection: "row"}}>
              <div style={ numberBlockStyle } onClick={() => this.changeFieldValue(7)}>7</div>
              <div style={ numberBlockStyle } onClick={() => this.changeFieldValue(8)}>8</div>
              <div style={ numberBlockStyle } onClick={() => this.changeFieldValue(9)}>9</div>
            </div>
          </div>
          <div style={{border: "1px solid black", padding: "5px 45px 5px 45px"}} onClick={() => this.saveFile()}>Save file</div>
        </div>
      </div>
    );
  }
}
