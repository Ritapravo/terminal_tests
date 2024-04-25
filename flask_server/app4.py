from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import paramiko
import re

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins='*')

@app.route('/')
def index():
    return 'SSH Terminal Backend'

ssh = None
shell = None

@socketio.on('connect')
def handle_connect():
    global ssh, shell

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        ssh.connect('10.130.151.162', port=22, username='ritpravo', password='kuchupuchu')
        emit('data', '\r\n*** SSH CONNECTION ESTABLISHED ***\r\n')

        shell = ssh.invoke_shell()
        shell.settimeout(0.2)  # Set a timeout to prevent blocking
        output = shell.recv(1024).decode()
        emit('data', output)
        # Start a loop to continuously read output from the shell
        while True:
            if shell.recv_ready():
                output = shell.recv(1024).decode()
                print("output ============== ", output)
                emit('data', output)

            if shell.exit_status_ready():
                emit('data', '\r\n*** SSH CONNECTION CLOSED ***\r\n')
                ssh.close()
                break

            @socketio.on('data')
            def handle_command(data):
                try:
                    shell.send(data)
                except Exception as e:
                    emit('data', f'\r\n*** Error executing command: {str(e)} ***\r\n')
                        # print(".")

    except paramiko.AuthenticationException as e:
        emit('data', f'\r\n*** SSH CONNECTION ERROR 1: {str(e)} ***\r\n')
    except paramiko.SSHException as e:
        emit('data', f'\r\n*** SSH CONNECTION ERROR 2: {str(e)} ***\r\n')
    except Exception as e:
        emit('data', f'\r\n*** SSH CONNECTION ERROR 3: {str(e)} ***\r\n')
        ssh.close()

@socketio.on('data')
def handle_command(data):
    try:
        shell.send(data)
    except Exception as e:
        emit('data', f'\r\n*** Error executing command: {str(e)} ***\r\n')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8080)
