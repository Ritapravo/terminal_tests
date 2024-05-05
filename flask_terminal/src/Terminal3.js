import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import io from 'socket.io-client';

const TerminalComponent = () => {
  const [hostname, setHostname] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const terminalRef = useRef(null);
  const socketRef = useRef(null);

  const handleConnect = () => {
    const credentials = { hostname, port, username, password };
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

    // Connect to the backend server
    const connectToServer = () => {
      socketRef.current = io.connect('http://10.130.151.162:8080/terminal');
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
      term.dispose();
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Hostname"
          value={hostname}
          onChange={e => setHostname(e.target.value)}
        />
        <input
          type="text"
          placeholder="Port"
          value={port}
          onChange={e => setPort(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={handleConnect}>Connect</button>
      </div>
      <div ref={terminalRef}></div>
    </div>
  );
};

export default TerminalComponent;
