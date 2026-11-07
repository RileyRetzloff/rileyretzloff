import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import { pickRandom } from '../random';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  imports: [
    RouterLink
  ]
})
export class Home {
  protected readonly feedbackLabel = pickRandom(['psst', 'a word?']);
}
