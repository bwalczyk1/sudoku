import React, { Component } from 'react'
import Board from './components/Board'
import './App.css'

export default class App extends Component { 
  constructor(){
    super();
    let availableSets = ["568040003002090007097860000600310409030050062019600508003006801051000020900700345", 
        "070086002060407008800910700780040005310860000002790603540629000020158049100004000",
        "680007100020915807900603520056002000300000000092060058700056081008349006000801430",
        "006057820210006750753004009060005300000700402300928006020540001001070948009001070",
        "020010000000600520805000076381906450560302791000104008102060900000500007450890000"
      ]
    let defaultSet = availableSets[Math.floor(Math.random()*availableSets.length)]
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
    let keyCode = event.keyCode
    if(keyCode === 8){ // backspace
      let fieldsObject = this.state.fieldsObject
      if(fieldsObject[this.state.selectedField].mode === 'set')
        return
      fieldsObject[this.state.selectedField] = {mode: 'normal', value: 0}
      this.setState({fieldsObject: fieldsObject})
    }
    // arrows
    if(keyCode === 37 && this.state.selectedField % 9 !== 0) // left
      this.setState({selectedField: this.state.selectedField - 1})
    else if(keyCode === 38 && Math.floor(this.state.selectedField/9) !== 0) // up
      this.setState({selectedField: this.state.selectedField - 9})
    else if(keyCode === 39 && this.state.selectedField % 9 !== 8) // right
      this.setState({selectedField: this.state.selectedField + 1})
    else if(keyCode === 40 && Math.floor(this.state.selectedField/9) !== 8) // down
      this.setState({selectedField: this.state.selectedField + 9})
    else if(keyCode >= 49 && keyCode <= 57) // numbers
      this.changeFieldValue(keyCode - 48)
    else if(keyCode >= 97 && keyCode <= 105) // numbers
      this.changeFieldValue(keyCode - 96)
  }

  handleModeChange(selectedMode){
    if(this.state.mode === selectedMode)
      this.setState({mode: "normal"})
    else
      this.setState({mode: selectedMode})
  }

  changeFieldValue(value){
    if(this.state.lock || this.state.fieldsObject[this.state.selectedField].mode === 'set')
      return
    let fieldsObject = this.state.fieldsObject
    if(this.state.mode === 'normal'){
      if(document.getElementById('number' + value).className === 'noNumbersLeft')
        return
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
      else{
        let newFieldValueArray = []
        for(let hintValue of fieldsObject[this.state.selectedField].value){
          if(hintValue !== value)
            newFieldValueArray.push(hintValue)
        }
        fieldsObject[this.state.selectedField].value = newFieldValueArray
      }
    }
    this.setState({fieldsObject: fieldsObject}, () => {
      if(this.state.mode !== 'normal')
        return
      for(let i = 0; i < 81; i++){
        if(this.state.fieldsObject[i].value !== parseInt(this.state.solution[i]))
          return
      }
      window.print()
    })
  }

  loadFile(file){
    let reader = new FileReader()
    reader.readAsText(file)
    reader.onload = () => {
      let fieldsObject
      let fieldsString = ""
      if(reader.result.includes('{')){
        // load json file
        fieldsObject  = JSON.parse(reader.result)
        for(let i = 0; i < 81; i++){
          if(fieldsObject[i].mode === 'set')
            fieldsString += fieldsObject[i].value
          else
            fieldsString += "0"
        }
      }
      else{
        // load text file
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
      try{
        let solution = solve(fieldsString)
        this.setState({fieldsObject: fieldsObject, solution: solution, lock: false})
      }
      catch{
        this.setState({fieldsObject: fieldsObject, lock: true})
        alert('This set is unresolvable. Please choose different one.')
      }
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
      fieldsObject[i].value = parseInt(this.state.solution[i])
      if(fieldsObject[i].mode === 'hint')
        fieldsObject[i].mode = 'normal'
    }
    this.setState({fieldsObject: fieldsObject}, ()=>window.print())
  }

  render() {
    let numbers = []
    for(let i = 0; i < 3; i++){
        let row = []
        for(let j = 0; j < 3; j++){
            let numbersWrittenLength = 0;
            for(let k = 0; k < 81; k++){
              if(this.state.fieldsObject[k].value === 3*i + j + 1)
                numbersWrittenLength += 1
            }
            row.push(<div id={ "number" + (3*i + j + 1) } className={ numbersWrittenLength === 11 ? "noNumbersLeft" : 'numbersLeft' } onClick={() => this.changeFieldValue(3*i + j + 1)}>{3*i + j + 1}</div>)
        }
        numbers.push(<div style={{display: "flex", flexDirection: "row"}} key={i}>{ row }</div>)
    }
    return (
      <div id='main'>
        <input className='printIgnore' type="file" onChange={(e)=> this.loadFile(e.target.files[0])}/>
        <Board fieldsObject={ this.state.fieldsObject } selectedField={this.state.selectedField} solution={this.state.solution}/>
        <div className='printIgnore' style={{height: '50vh', flexDirection: "column", justifyContent: 'space-evenly', alignItems: 'center'}}>
          <div className='button' onClick={() => this.solveSudoku()}>Solve</div>
          <div>
            <label htmlFor="hint">Hint:</label>
            <input type="checkbox" id="hint" checked={this.state.mode === "hint"} onChange={() => this.handleModeChange("hint")}/>
          </div>
          {/* <div>
            <label htmlFor="erase">Erase:</label>
            <input type="checkbox" id="erase" checked={this.state.mode === "erase"} onChange={() => this.handleModeChange("erase")}/>
          </div> */}
          <div style={{display: 'flex', flexDirection: 'column'}}>
            { numbers }
          </div>
          <div className='button' onClick={() => this.saveFile()}>Save file</div>
        </div>
      </div>
    );
  }
}
