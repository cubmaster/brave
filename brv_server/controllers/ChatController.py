from flask import Blueprint
from brv_server.services import Chat
from flask_socketio import send
from .. import socketio
ChatController = Blueprint('ChatController', __name__)


@ChatController.route('/chat', methods=['GET'])
def chat():
    socketio.emit('message', {'data': 'Start'})
    Chat.planner("Build a calculator")



