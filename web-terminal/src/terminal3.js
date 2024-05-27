import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import io from 'socket.io-client';

const Terminal3 = () => {
  const terminalRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Create a new terminal instance
    const term = new Terminal({ cursorBlink: true });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    // Open the terminal in the terminalRef container
    term.open(terminalRef.current);
    // Make the terminal's size and geometry fit the size of the container
    fitAddon.fit();
    // Set terminal height to fill the viewport
    const terminalContainer = terminalRef.current.querySelector('.xterm-rows');
    terminalContainer.style.height = 'calc(100vh - 40px)'; // Adjust height as needed

    // Connect to the backend server
    const connectToServer = () => {
      socketRef.current = io.connect('http://10.130.151.162:8000/test_terminal');
      socketRef.current.on('connect', () => {
        // Automatically connect to Docker container upon successful connection
      });

      // Handle user input from the terminal
      term.onData(e => {
        // Send input to the backend server via Socket.IO
        socketRef.current.emit('data', e);
      });

      // Receive data from the backend server and write it to the terminal
      socketRef.current.on('data', data => {
        term.write(data);
      });

      // Function to handle terminal resize
      const handleResize = () => {
        fitAddon.fit();
      };

      // Add event listener for window resize
      window.addEventListener('resize', handleResize);
    };

    connectToServer();

    return () => {
      term.dispose();
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div 
        ref={terminalRef} 
        style={{
          flex: 1,
          overflow: 'auto', // Add overflow property to enable scrolling
          resize: 'both', // Allow resizing in both directions
          border: '1px solid #ccc', // Add border for better visibility
        }}
      ></div>
    </div>
  );
};

export default Terminal3;
