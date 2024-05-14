from flask import Flask
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS
from flask import session
from Agent.AutogenTest import run_agent
from RAG.WebReader import html_embed

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")


@socketio.event
def htmlEmbed(task_message):
    html_embed(socketio, task_message)


@socketio.event
def start_agent(task_message):
    run_agent(socketio, task_message)


@socketio.on('message')
def handle_message(data):
    print(data)


@socketio.on('connect')
def test_connect(auth):
    emit('connection', {'data': 'Connected'})


@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    session['current_room'] = room
    emit('joined', {'message': f'{username} has joined the room.'}, room=room)


@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')


if __name__ == '__main__':
    room = ""
    socketio.run(app, host='127.0.0.1', port=5000, debug=True, use_reloader=True, log_output=True)
