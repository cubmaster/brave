import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Modal } from 'bootstrap';
import {SocketService} from "./services/socket.service";
import {MarkdownService} from "ngx-markdown";
import {Agent, AgentMessage} from "./types";


@Component({
  selector: 'app-root',

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit,OnDestroy{


  @ViewChild('task') task!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('agentEditor', { static: false }) agentEditor!: ElementRef;
  currentAgent: Agent =  <Agent>{};
  team: Agent[]=[];
  agents: Agent[]=[];

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
    this.socketService.listenEvent("agents_list",(data:any)=>{

      this.agents =  JSON.parse(data);
    })

    this.socketService.emitEvent("get_agents",()=>{})
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

  editAgent(agent:Agent){
    this.currentAgent = agent;
    const modal: any = new Modal(this.agentEditor.nativeElement);
    modal.show();

  }
  deleteAgent(agent:Agent) {
    const index = this.team.indexOf(agent);
    if (index !== -1) {
      this.team.splice(index, 1);
    }
  }

  addAgent(){
    const newAgent = <Agent> {name:"", prompt:""}
    this.team.push(newAgent);
    this.editAgent(newAgent);

  }

  saveAgent(){ 
    this.socketService.emitEvent('save_agent', this.currentAgent);
  }

  addToTeam(agent: Agent) {
    const index = this.team.indexOf(agent);
    if (index !== -1) {
      this.team.splice(index, 1);
    }else{
      this.team.push(agent);
    }


  }


}
