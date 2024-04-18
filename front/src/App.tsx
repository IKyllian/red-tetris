import { useEffect, useState } from 'react';
import './App.css'
import { Board, BoardPreview } from './components/board/board'
import { TETROMINOES } from './types/tetrominoes-type'
import * as io from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState<io.Socket | undefined>(undefined);
  // const socket = io.connect('http://localhost:3000');
  
  console.log("Socket connected = ", socket);
  useEffect(() => {
    setSocket(io.connect('http://localhost:3000'))
  }, [])

  useEffect(() => {
    socket?.emit('play');
  }, [socket])

  return (
    <>
     <Board rowsSize={20} columnsSize={10} />
     {
      Object.values(TETROMINOES).map((tetromino) => (
        <BoardPreview tetromino={tetromino} />
      ))
     }
    </>
  )
}

export default App
