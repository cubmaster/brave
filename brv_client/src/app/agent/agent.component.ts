import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {Agent} from "../types";

@Component({
  selector: 'app-agent',

  templateUrl: './agent.component.html',
  styleUrl: './agent.component.scss'
})
export class AgentComponent{
  @Input() Agent: Agent =  <Agent>{}


}
