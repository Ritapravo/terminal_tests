import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import io from 'socket.io-client';

const TerminalComponent2 = () => {
  const terminalRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Create a new terminal instance
    const term = new Terminal({ cursorBlink: true });
    term.open(terminalRef.current);
    term.writeln('Welcome to the Web Terminal!');

    // Connect to the backend server
    socketRef.current = io.connect('http://10.130.151.162:8080');

    // Handle user input from the terminal
    term.onData(e => {
      // Send input to the backend server via Socket.IO
      socketRef.current.emit('data', e);
    });

    // Receive data from the backend server and write it to the terminal
    socketRef.current.on('data', data => {
      term.write(data);
    });

    return () => {
      // Cleanup function
      term.dispose();
      socketRef.current.disconnect();
    };
  }, []);

  return <div ref={terminalRef}></div>;
};

export default TerminalComponent2;
