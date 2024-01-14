from flask import Flask
from flask_socketio import SocketIO, emit

socketio = SocketIO()


def create_app():
    app = Flask(__name__)
    socketio.init_app(app)

    from .controllers.ChatController import ChatController
    app.register_blueprint(ChatController)

    return app


@socketio.on('connect')
def test_connect(auth):
    emit('my response', {'data': 'Connected'})


@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')
