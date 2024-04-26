from flask import Flask, request
from flask_socketio import SocketIO, emit
import paramiko

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins='*')

ssh_connections = {}  # Dictionary to store SSH connections
shell_connections = {}


@app.route('/')
def index():
    return 'SSH Terminal Backend'


@socketio.on('connect')
def handle_connect():
    session_id = request.sid  # Retrieve session ID from socketio connection
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        ssh.connect('10.130.151.162', port=22, username='ritpravo', password='kuchupuchu')
        ssh_connections[session_id] = ssh  # Store the SSH connection with session ID
        socketio.emit('data', '\r\n*** SSH CONNECTION ESTABLISHED ***\r\n', room=session_id)

        shell = ssh.invoke_shell()
        shell.setblocking(False)  # Set shell to non-blocking
        shell_connections[session_id] = shell

        print("session id === ", session_id)
        print("connections === ", len(ssh_connections), len(shell_connections))

        # Register the shell channel to the list of inputs for select
        socketio.emit('data', '\n', room=session_id)  # Send a dummy newline to start receiving output
        socketio.start_background_task(listen_shell, session_id, shell_connections)

    except paramiko.AuthenticationException as e:
        socketio.emit('data', f'\r\n*** SSH CONNECTION ERROR: {str(e)} ***\r\n', room=session_id)
    except paramiko.SSHException as e:
        socketio.emit('data', f'\r\n*** SSH CONNECTION ERROR: {str(e)} ***\r\n', room=session_id)
    except Exception as e:
        socketio.emit('data', f'\r\n*** SSH CONNECTION ERROR: {str(e)} ***\r\n', room=session_id)
        ssh.close()

@socketio.on('disconnect')
def handle_disconnect():
    session_id = request.sid
    if session_id in ssh_connections:
        ssh = ssh_connections.pop(session_id)  # Remove the SSH connection
        ssh.close()  # Close the SSH connection

    if session_id in shell_connections:
        shell_connections.pop(session_id)  # Remove the shell connection

def listen_shell(session_id, shell_connections):
    @socketio.on('data')
    def handle_command(data):
        session_id = request.sid
        if session_id in ssh_connections:
            ssh = ssh_connections[session_id]
            shell = shell_connections[session_id]
            try:
                shell.send(data)
            except Exception as e:
                socketio.emit('data', f'\r\n*** Error executing command: {str(e)} ***\r\n', room=session_id)
    while True:
        # if session_id in shell_connections:
        shell = shell_connections[session_id]
        # Use select to check if there's data available to be read
        if shell.recv_ready():
            try:
                output = shell.recv(1024).decode()
                socketio.emit('data', output, room=session_id)
            except Exception as e:
                socketio.emit('data', f'\r\n*** Error receiving data: {str(e)} ***\r\n', room=session_id)
                break
        else:
            # Sleep for a short time to avoid CPU usage
            socketio.sleep(0.1)





if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8080)
