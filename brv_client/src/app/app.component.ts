import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {SocketService} from "./services/socket.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit,OnDestroy{
  @ViewChild('task') task!: ElementRef<HTMLTextAreaElement>;

  team=[
    {name:"Assistant",prompt:"You are a helpful assistant"},
    {name:"Reviewer",prompt:"You are a cynic and you comment everything"}
  ]
  room = "tadsroom";
  user= "tad";

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.listenEvent('connection', (data) => {
      console.log("connection")
      console.log(data);
    });
    this.socketService.listenEvent('message', (data) => {
      console.log("message")
      console.log(data);
    });
    this.socketService.listenEvent('joined', (data) => {
             console.log("joined")
      console.log(data);
      //this.startAgent();
    });
    this.socketService.listenEvent("agent_response",(data)=>{
                   console.log("agent_response")
      console.log(data)
    })
    this.joinRoom();

  }

  startAgent(): void {

    const message = {
      room: this.room,
      task: this.task.nativeElement.value,
      team: this.team
    }

    this.socketService.emitEvent('start_agent', message);
  }

  joinRoom(){
    this.socketService.joinRoom( {username: this.user, room: this.room} )
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}
