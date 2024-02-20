import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {SocketService} from "./services/socket.service";
import {MarkdownService} from "ngx-markdown";
import {AgentMessage} from "./types";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit,OnDestroy{
  @ViewChild('task') task!: ElementRef<HTMLTextAreaElement>;

  team=[
    {name:"Assistant"},
    {name:"Reviewer",prompt:"You are a code reviewer and you comment on any python code to be sure its correct.  You will be sure all needed packages for the code are installed with pip install commands in bash before the script runs.  When you are done send the code to user_proxy for execution."}
  ]
  room = "tadsroom";
  user= "tad";

  messages: any[]=[];


  constructor(private socketService: SocketService,private markdownService: MarkdownService) {}

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

    });
    this.socketService.listenEvent("agent_response",(data)=>{
        let msg:AgentMessage = {sender:"",content:""};
        msg.content = <string>this.markdownService.parse(data.content);

        if(data.content.length>0){
          if(data.sender==="user_proxy") {
            msg.sender = this.room;
          }else{
            msg.sender = data.sender;
          }
          console.log(msg);
          this.messages.push(msg);
        }

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
