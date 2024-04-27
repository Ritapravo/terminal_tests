import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import io from 'socket.io-client';

const TerminalComponent2 = () => {
  const terminalRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Create a new terminal instance
    const term = new Terminal({ cursorBlink: true });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    // Open the terminal in #terminal-container
    term.open(terminalRef.current);
    // Make the terminal's size and geometry fit the size of #terminal-container
    fitAddon.fit();
    // term.writeln('Welcome to the Web Terminal!');

    // Connect to the backend server
    socketRef.current = io.connect('http://10.130.151.162:8080/terminal');

    // Join room based on session ID
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_room', socketRef.current.id);
    });

    // Handle user input from the terminal
    term.onData(e => {
      // Send input to the backend server via Socket.IO
      // console.log("e ============", e);

      socketRef.current.emit('data', e);
    });

    // Receive data from the backend server and write it to the terminal
    socketRef.current.on('data', data => {
      // console.log("data ============", data);
      term.write(data);
    });

    // Function to handle terminal resize
    const handleResize = () => {
      fitAddon.fit();
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    return () => {
      // Cleanup function
      term.dispose();
      socketRef.current.disconnect();
    };
  }, []);

  return <div ref={terminalRef}></div>;
};

export default TerminalComponent2;
