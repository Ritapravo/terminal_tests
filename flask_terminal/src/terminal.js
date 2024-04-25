import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

const TerminalComponent = () => {
  const terminalRef = useRef(null);

  useEffect(() => {
    const term = new Terminal();
    term.open(terminalRef.current);
    term.writeln('Welcome to the Web Terminal!');
    
    // Add event listeners, etc. as needed

    console.log(terminalRef);
    return () => {
      term.dispose();
    };
  }, []);

  return <div ref={terminalRef}></div>;
};

export default TerminalComponent;

// import React, { useEffect, useRef } from 'react';
// import { Terminal } from '@xterm/xterm';
// import '@xterm/xterm/css/xterm.css';

// const TerminalComponent = () => {
//   const terminalRef = useRef(null);
//   const term = useRef(null);

//   useEffect(() => {
//     term.current = new Terminal({ cursorBlink: true });
//     term.current.open(terminalRef.current);
//     term.current.writeln('Welcome to the Web Terminal!');
    
//     // Event listener for handling user input
//     term.current.onKey((e) => {
//       handleInput(e.key);
//     });

//     return () => {
//       term.current.dispose();
//     };
//   }, []);
//   const handleInput = (key) => {
//     // console.log("term.current ==== ", term.current );
//     // Check if Enter key is pressed
//     if (key === '\r') {
//       console.log("entered", term.current);
//       // Get the input entered by the user
//       // const input = term.current.buffer.getLine(term.current.buffer.cursorY).translateToString().trim();
//       const input =  String(term.current.input).trim();
//       console.log("input ==== ", input);
//       // Process the input (e.g., execute command)
//       processInput(input);
//       // Clear the input line
//       term.current.writeln('');
//     } else {
//       // Echo back the user's input
//       term.current.write(key);
//     }
//   };

//   const processInput = (input) => {
//     // You can implement command processing logic here
//     // For now, let's just echo back the input
//     // term.current.writeln('You entered: ' + input);
//   };

//   return <div ref={terminalRef}></div>;
// };

// export default TerminalComponent;

