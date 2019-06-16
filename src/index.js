import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button style={props.highlight? {backgroundColor: "#ff000047"}: {}} className="square" onClick={props.onClick}>
      {props.t}
    </button>

  );
}
class Board extends React.Component {
  renderSquare(i, winningSquares) {
    var shouldHighlight = false;
    if (winningSquares.includes(i)) {
      shouldHighlight = true;
    }
    return <Square highlight={shouldHighlight} t={this.props.squares[i]} key={i} onClick={() => this.props.onClick(i)}/>;
  }

  render() {
    let list = [];
    for (let p=0;p<3;p++) {
      let sum = 3*p;
      let childList = [];
      for (let c=0;c<3;c++) {
        childList.push(this.renderSquare(c+sum, this.props.winningSquares));
      }
      list.push(
        <div className="board-row" key={p}>
          {childList}
        </div>
      );
    }
    return (
      <div>
        {list}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        row: null,
        col: null
      }],
      stepNumber: 0,
      xIsNext: true,
      col: null,
      row: null,
      order: true
    };
  }
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length-1];
    let squares =current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext? 'x': 'o';
    this.setState({
      history: history.concat([{
       squares: squares,
       col: i%3,
       row: parseInt(i/3)
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const result = calculateWinner(current.squares);
    const moves = history.map((step, move) => {
         const desc = move ?
           'Go to move #' + move + `(${step.col}, ${step.row})`:
           'Go to game start';
         const isCurrent = move===this.state.stepNumber;
         return (
           <li key={move}>
              <button style={isCurrent? {backgroundColor: "#ff000047"}: {}} onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
         );
    });
    let orderedMoves = this.state.order? moves: moves.slice(0).reverse();
    let status;
    let winningLine = [];
    if (result) {
      winningLine = result.winningLine;
      status = 'Winner: ' + result.square;
    } else {
      if (history.length === 10) {
        status = 'Draw';
      } else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
           squares={current.squares}
           winningSquares={winningLine}
            onClick={(i) => this.handleClick(i)} />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.setState({order: (!this.state.order)})}>Toggle</button>
          <ol>
            {orderedMoves}
          </ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {square: squares[a], winningLine: lines[i]};
    }
  }

  return null;
}
