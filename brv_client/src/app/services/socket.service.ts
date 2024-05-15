import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private url = 'ws://localhost:5000'; // Your Socket.IO server URL

  constructor() {
    this.socket = io(this.url);
  }

  // Method to emit events
  emitEvent(event: string, data: any): void {
    this.socket.emit(event, data);
  }
  joinRoom(data: {username: string, room: string}) {
    this.socket.emit('join', data);
  }

  // Method to listen to events
  listenEvent(event: string, callback: (data: any) => void): void {
    this.socket.on(event, callback);
  }


  // Disconnect the socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
