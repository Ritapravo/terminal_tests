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
        output = ssh.connect('10.130.151.162', port=22, username='ritpravo', password='kuchupuchu')
        emit('data', '\r\n*** SSH CONNECTION ESTABLISHED ***\r\n')

        shell = ssh.invoke_shell()
        output = shell.recv(1024).decode()
        print("output type", output)
        emit('data', output)

        if shell.recv_ready():
            print("rdddddd")
            output = shell.recv(1024).decode()
            print("output type", output)
            emit('data', output)
        
        # while True:
        #     if shell.recv_ready():
        #         output = shell.recv(1024).decode()
        #         print("output type", output)
        #         emit('data', output)

        #     if shell.recv_stderr_ready():
        #         output_err = shell.recv_stderr(1024).decode()
        #         print(output_err)
        #         emit('data', output_err)

        #     if shell.exit_status_ready():
        #         emit('data', '\r\n*** SSH CONNECTION CLOSED ***\r\n')
        #         ssh.close()
        #         break

    except paramiko.AuthenticationException as e:
        emit('data', f'\r\n*** SSH CONNECTION ERROR: {str(e)} ***\r\n')
    except paramiko.SSHException as e:
        emit('data', f'\r\n*** SSH CONNECTION ERROR: {str(e)} ***\r\n')
    except Exception as e:
        emit('data', f'\r\n*** SSH CONNECTION ERROR: {str(e)} ***\r\n')
        ssh.close()


command = ""
@socketio.on('data')
def handle_command(data):
    print("data ========================", data)
    global command
    try:
        shell.send(data)
        op = shell.recv(1024).decode()
        print(op)
        emit('data', str(op))
        command = ""
    except Exception as e:
        emit('data', f'\r\n*** Error executing command: {str(e)} ***\r\n')



if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8080)




