import './App.css'
import { Board, BoardPreview } from './components/board/board'
import { TETROMINOS } from './types/tetrominoes'

function App() {

  return (
    <>
     <Board rows={20} columns={10} />
     <BoardPreview tetromino={TETROMINOS.I} />
     <BoardPreview tetromino={TETROMINOS.J} />
     <BoardPreview tetromino={TETROMINOS.L} />
     <BoardPreview tetromino={TETROMINOS.O} />
     <BoardPreview tetromino={TETROMINOS.S} />
     <BoardPreview tetromino={TETROMINOS.T} />
     <BoardPreview tetromino={TETROMINOS.Z} />
    </>
  )
}

export default App
