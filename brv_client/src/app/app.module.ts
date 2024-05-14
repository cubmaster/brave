import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MarkdownModule } from 'ngx-markdown';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {MemberComponent} from "./member/member.component";
import {AgentComponent} from "./agent/agent.component";
import {FormsModule} from "@angular/forms";
import {ReverseArrayPipe} from "./reverse-array.pipe";

@NgModule({
  declarations: [
    AppComponent,MemberComponent,AgentComponent,ReverseArrayPipe
  ],
  imports: [
FormsModule,
    BrowserModule,
    AppRoutingModule,
    MarkdownModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
