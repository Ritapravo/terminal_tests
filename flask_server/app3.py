from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, emit
import paramiko

app = Flask(__name__)
app.config["SECRET_KEY"] = "your_secret_key"  # Replace with a strong secret key
socketio = SocketIO(app, cors_allowed_origins='*')

# Configure your private key details (replace with your actual information)
private_key_path = "/path/to/your/private_key"
username = "ritpravo"
hostname = "10.130.151.162"
password = "kuchupuchu"  # **Security Note:** Consider using key-based authentication

@app.route("/")
def index():
    return render_template("index.html")  # Assuming your frontend is named index.html

ssh_client = None
@socketio.on("connect")
def handle_connect():

    @socketio.on("data")
    def handle_data(data):
        global ssh_client  # Access the global ssh_client variable

        if not ssh_client:
            try:
                ssh_client = paramiko.SSHClient()
                ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                ssh_client.connect(hostname=hostname, port=22, username=username, password=password)
                emit("data", "\r\n*** SSH CONNECTION ESTABLISHED ***\r\n")
            except Exception as e:
                emit("data", f"\r\n*** SSH CONNECTION ERROR: {str(e)} ***\r\n")
                return

        stdin, stdout, stderr = ssh_client.exec_command(data)
        output = stdout.read().decode()
        emit("data", output)

    @socketio.on("disconnect")
    def handle_disconnect():
        if ssh_client:
            ssh_client.close()
            emit("data", "\r\n*** SSH CONNECTION CLOSED ***\r\n")

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=8080)
