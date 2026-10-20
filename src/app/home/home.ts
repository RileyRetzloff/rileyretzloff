import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';

const FEEDBACK_BUTTON_LABELS = ['psst', 'a word?'];

function pickLabel(): string {
  // Non-empty by construction, so the index always hits.
  return FEEDBACK_BUTTON_LABELS[
    Math.floor(Math.random() * FEEDBACK_BUTTON_LABELS.length)
  ]!;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  imports: [
    RouterLink
  ]
})
export class Home {
  protected readonly feedbackLabel = pickLabel();
}
