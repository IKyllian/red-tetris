import './App.css'
import { Board, BoardPreview } from './components/board/board'
import { TETROMINOES } from './types/tetrominoes-type'

function App() {

  return (
    <>
     {/* <Board rows={20} columns={10} /> */}
     {
      Object.values(TETROMINOES).map((tetromino) => (
        <BoardPreview tetromino={tetromino} />
      ))
     }
    </>
  )
}

export default App
