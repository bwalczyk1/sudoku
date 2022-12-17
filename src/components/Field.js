import React, { Component } from 'react';

export default class Field extends Component {
  render() {
    let style = {
        fontSize: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: "100px", 
        width: "100px",
        color: (this.props.data.mode === 'normal' && this.props.data.value === this.props.correct) ? "blue" : this.props.data.value !== this.props.correct ? "red" : 'black',
        backgroundColor: this.props.number % 2 === 0 ? "#e2dede" : "#e4d7be",
        opacity: this.props.isSelected ? '50%' : '100%',
        borderLeft: (this.props.number % 3 === 0 && this.props.number % 9 !== 0) ? "5px solid black" : "0px solid black",
        borderTop: (Math.floor(this.props.number/9) % 3 === 0 && Math.floor(this.props.number/9) % 9 !== 0) ? "5px solid black" : "0px solid black"
    }
    if(this.props.data.mode !== 'hint')
      return (
        <div style={ style }>{this.props.data.value !== 0 ? this.props.data.value : ""}</div>
      )
    console.log(this.props.data.mode, this.props.data.value)
    let field = []
    for(let i = 0; i < 3; i++){
      let row = []
      for(let j = 0; j < 3; j++){
        row.push(<div key={j} style={{width: '33px', height: '33px', textAlign: 'center'}}>{ this.props.data.value.includes(3*i + j + 1) ? (3*i + j + 1) : ""}</div>)
      }
      field.push(<div key={i} style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems: 'center', height: '33%'}}>{ row }</div>)
    }
    style.flexDirection = "column"
    style.fontSize = "20px"
    return (<div style={ style }>{ field }</div>);
  }
}
