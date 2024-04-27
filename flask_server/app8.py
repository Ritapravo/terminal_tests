from flask import Flask, request
from flask_socketio import SocketIO, emit, Namespace
import paramiko

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins='*')


class TerminalNamespace(Namespace):
    ssh_connections = {}  # Dictionary to store SSH connections
    shell_connections = {}

    def on_connect(self):
        session_id = request.sid  # Retrieve session ID from socketio connection
        
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        try:
            ssh.connect('10.130.151.162', port=22, username='guest', password='guest123')
            self.ssh_connections[session_id] = ssh  # Store the SSH connection with session ID
            self.emit('data', '\r\n*** SSH CONNECTION ESTABLISHED ***\r\n', room=session_id)

            shell = ssh.invoke_shell()
            shell.setblocking(False)  # Set shell to non-blocking
            self.shell_connections[session_id] = shell

            print("session id === ", session_id)
            print("connections === ", len(self.ssh_connections), len(self.shell_connections))

            # Register the shell channel to the list of inputs for select
            self.emit('data', '\n', room=session_id)  # Send a dummy newline to start receiving output
            socketio.start_background_task(self.listen_shell, session_id)

        except paramiko.AuthenticationException as e:
            self.emit('data', f'\r\n*** SSH CONNECTION ERROR: {str(e)} ***\r\n', room=session_id)
        except paramiko.SSHException as e:
            self.emit('data', f'\r\n*** SSH CONNECTION ERROR: {str(e)} ***\r\n', room=session_id)
        except Exception as e:
            self.emit('data', f'\r\n*** SSH CONNECTION ERROR: {str(e)} ***\r\n', room=session_id)
            ssh.close()

    def on_disconnect(self):
        session_id = request.sid
        if session_id in self.ssh_connections:
            ssh = self.ssh_connections.pop(session_id)  # Remove the SSH connection
            ssh.close()  # Close the SSH connection

        if session_id in self.shell_connections:
            self.shell_connections.pop(session_id)  # Remove the shell connection

    def on_data(self, data):
        session_id = request.sid
        if session_id in self.ssh_connections:
            ssh = self.ssh_connections[session_id]
            shell = self.shell_connections[session_id]
            try:
                shell.send(data)
            except Exception as e:
                self.emit('data', f'\r\n*** Error executing command: {str(e)} ***\r\n', room=session_id)

    def listen_shell(self, session_id):
        shell = self.shell_connections[session_id]
        while True:
            if shell.recv_ready():
                try:
                    
                    output = shell.recv(1024).decode()
                    self.emit('data', output, room=session_id)
                except Exception as e:
                    self.emit('data', f'\r\n*** Error receiving data: {str(e)} ***\r\n', room=session_id)
                    break
            else:
                socketio.sleep(0.1)


socketio.on_namespace(TerminalNamespace('/terminal'))

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8080)
