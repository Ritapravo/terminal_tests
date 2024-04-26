from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import paramiko
import select

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins='*')

@app.route('/')
def index():
    return 'SSH Terminal Backend'


@socketio.on('connect')
def handle_connect():

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        ssh.connect('10.130.151.162', port=22, username='ritpravo', password='kuchupuchu')
        emit('data', '\r\n*** SSH CONNECTION ESTABLISHED ***\r\n')

        shell = ssh.invoke_shell()
        shell.setblocking(False)  # Set shell to non-blocking
        
        # Register the shell channel to the list of inputs for select
        socketio.emit('data', '\n')  # Send a dummy newline to start receiving output
        socketio.start_background_task(listen_shell, shell)

    except paramiko.AuthenticationException as e:
        emit('data', f'\r\n*** SSH CONNECTION ERROR: {str(e)} ***\r\n')
    except paramiko.SSHException as e:
        emit('data', f'\r\n*** SSH CONNECTION ERROR: {str(e)} ***\r\n')
    except Exception as e:
        emit('data', f'\r\n*** SSH CONNECTION ERROR: {str(e)} ***\r\n')
        ssh.close()

def listen_shell(shell):
    @socketio.on('data')
    def handle_command(data):
        try:
            shell.send(data)
        except Exception as e:
            emit('data', f'\r\n*** Error executing command: {str(e)} ***\r\n')
    while True:
        # Use select to check if there's data available to be read
        if shell.recv_ready():
            try:
                output = shell.recv(1024).decode()
                socketio.emit('data', output)
            except Exception as e:
                emit('data', f'\r\n*** Error receiving data: {str(e)} ***\r\n')
                break
        else:
            # Sleep for a short time to avoid CPU usage
            socketio.sleep(0.1)

# @socketio.on('data')
# def handle_command(data):
#     try:
#         shell.send(data)
#     except Exception as e:
#         emit('data', f'\r\n*** Error executing command: {str(e)} ***\r\n')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8080)
