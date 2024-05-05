import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import io from 'socket.io-client';

const TerminalComponent2 = () => {
  const terminalRef = useRef(null);
  const socketRef = useRef(null);
  const [server, setServer] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (connected) {
      // Create a new terminal instance
      const term = new Terminal({ cursorBlink: true });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      // Open the terminal in #terminal-container
      term.open(terminalRef.current);
      // Make the terminal's size and geometry fit the size of #terminal-container
      fitAddon.fit();
      // term.writeln('Welcome to the Web Terminal!');

      // Connect to the backend server with provided details
      socketRef.current = io.connect('http://10.130.151.162:8080/terminal');

      // Join room based on session ID
      socketRef.current.on('connect', () => {
        socketRef.current.emit('join_room', socketRef.current.id);
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

      return () => {
        // Cleanup function
        term.dispose();
        socketRef.current.disconnect();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [connected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://10.130.151.162:8080/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ server, username, password }),
      });
      if (response.ok) {
        // setConnected(true);
        console.log(await response);
      } else {
        console.error('Failed to connect:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <div>
      {!connected ? (
        <form onSubmit={handleSubmit}>
          <label>
            Server:
            <input type="text" value={server} onChange={(e) => setServer(e.target.value)} />
          </label>
          <br />
          <label>
            Username:
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <br />
          <label>
            Password:
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <br />
          <button type="submit">Connect</button>
        </form>
      ) : (
        <div ref={terminalRef}></div>
      )}
    </div>
  );
};

export default TerminalComponent2;
