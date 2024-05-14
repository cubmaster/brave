import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Agent} from "../types";

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrl: './member.component.scss'
})
export class MemberComponent {
  @Input() Member: Agent;
  @Output() OnEdit = new EventEmitter<Agent>();
  @Output() OnDelete = new EventEmitter<Agent>();
  constructor() {
      this.Member = <Agent>{};
  }
  delete(){
    this.OnDelete.emit(this.Member)
  }
  edit(){
    this.OnEdit.emit(this.Member)
  }

}
