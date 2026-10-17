import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { TopNav } from "./top-nav/top-nav";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, TopNav],
  templateUrl: "./app.html",
})
export class App {}
