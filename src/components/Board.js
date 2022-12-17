import React, { Component } from 'react';
import Field from './Field';

export default class Board extends Component {
    render() {
        let board = []
        for(let i = 0; i < 9; i++){
            let row = []
            for(let j = 0; j < 9; j++){
                row.push(<Field 
                    key={9*i + j}
                    number={9*i + j}
                    data={this.props.fieldsObject[9*i + j]} 
                    isSelected={this.props.selectedField === 9*i + j}
                    correct={parseInt(this.props.solution[9*i + j])}/>)
            }
            board.push(<div style={{display: "flex", flexDirection: "row"}} key={i}>{ row }</div>)
        }
        return (<div style={{display: "flex", flexDirection: "column"}}>{ board }</div>);
    }
}
