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
   xteam: Agent[]=[]
  team: Agent[] = [
    {name:"Planner",
      prompt:"Planner. Suggest a plan. Revise the plan based on feedback from the critic.\n" +
        "The plan may involve an assistant who can write code and a researcher who doesn't write code.\n" +
        "The user will execute any code. Explain the plan first. Be clear which step is performed by the assistant, and which step is performed by a researcher.",
      description:"A planner agent. Comes up with the plan for solving the task"
    },
    {name:"Researcher",
      prompt:"Researcher. You follow an approved plan. You are able to access internet but output the " +
        " research you find in html anchor tags that you store to the word_dir in a html document. You don't write code. " +
        "The user will execute any code. ",
          description: "Researcher agent. Can search internet for to execute steps on the plan. Does not code."},
    {name:"Critic",
      prompt:"Critic. Double check plan, claims, code from other agents and provide feedback. " +
        "Check whether the plan includes adding verifiable info such as source URL. The user will execute any code. ",
       description: "Critics the plan, research and code to can comes up with ideas to make it better. Does not code."
    }

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

  editAgent(agent:Agent){
    this.currentAgent = agent;
    const modal: any = new Modal(this.agentEditor.nativeElement);
    modal.show();

  }
  deleteAgent(agent: Agent) {
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

}
