from flask import Flask, request
from flask_socketio import SocketIO, emit
import paramiko

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")  # Allow all origins

# SSH credentials for the remote server
REMOTE_HOST = '10.130.151.162'
REMOTE_USER = 'ritpravo'
REMOTE_PASSWORD = 'kuchupuchu'

def execute_command_ssh(command):
    try:
        # Create an SSH client
        ssh_client = paramiko.SSHClient()
        ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        # Connect to the remote server
        ssh_client.connect(REMOTE_HOST, username=REMOTE_USER, password=REMOTE_PASSWORD)
        
        # Execute the command
        stdin, stdout, stderr = ssh_client.exec_command(command)
        
        # Read the output
        output = stdout.read().decode()
        
        # Close the SSH connection
        ssh_client.close()
        
        return output
    except Exception as e:
        return str(e)

@socketio.on('connect')
def handle_command(command):
    # Execute the command on the remote server
    output = execute_command_ssh(command)
    
    # Send the output back to the frontend
    emit('output', output)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8080)
