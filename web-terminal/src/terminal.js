import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import io from 'socket.io-client';

const TerminalComponent = () => {
  const [alpha, setAlpha] = useState("");
  const [credentials, setCredentials] = useState(
    {
      hostname : '10.130.151.162',
      port : '22',
      username : 'sysad',
      password : 'sysad123'
    }
  )

  const handleInputChange = (e) =>{
    const newCredentials = {...credentials, [e.target.name]:e.target.value};
    setCredentials(newCredentials);
  }

  const terminalRef = useRef(null);
  const socketRef = useRef(null);

  const handleConnect = () => {
    // const credentials = { hostname, port, username, password };
    socketRef.current.emit('connect_ssh', credentials);
  };

  useEffect(() => {
    // Create a new terminal instance
    const term = new Terminal({ cursorBlink: true });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    // Open the terminal in #terminal-container
    term.open(terminalRef.current);
    // Make the terminal's size and geometry fit the size of #terminal-container
    fitAddon.fit();
    // Set terminal height to fill the viewport
    const terminalContainer = terminalRef.current.querySelector('.xterm-rows');
    terminalContainer.style.height = 'calc(100vh - 40px)'; // Adjust height as needed

    // Connect to the backend server
    const connectToServer = () => {
      socketRef.current = io.connect('http://10.130.151.162:8000/terminal');
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

    };
    connectToServer();
    return () => {
      term?.dispose();
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div>
        <input
          type="text"
          placeholder="Hostname"
          value={credentials.hostname}
          name={'hostname'}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="Port"
          value={credentials.port}
          name={'port'}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="Username"
          value={credentials.username}
          name={'username'}
          onChange={handleInputChange}
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          name={'password'}
          onChange={handleInputChange}
        />
        <button onClick={handleConnect}>Connect</button>
      </div>
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

export default TerminalComponent;
