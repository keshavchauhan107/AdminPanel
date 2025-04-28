import { TmplAstLetDeclaration } from '@angular/compiler';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-page-not-found',
  imports: [FormsModule,],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss'
})
export class PageNotFoundComponent {
  numberValue: number | null = null;
  num: number = this.randomNum();
  chances: number = 9;

  // helper to generate a new random
  private randomNum() {
    return Math.round(Math.random() * 1000);
  }

  preventMinus(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'Subtract') {
      event.preventDefault();
    }
  }

  onclick(form: NgForm) {
    if (this.numberValue == null) {
      alert('Enter some number');
      return;
    }

    // if out of chances
    if (this.chances === 0) {
      alert('You lose! Try again.');
      this.resetGame(form);
      return;
    }

    // wrong guess
    if (this.numberValue < this.num) {
      this.chances--;
      alert(`Try bigger! Chances remaining: ${this.chances}`);
    }
    else if (this.numberValue > this.num) {
      this.chances--;
      alert(`Try smaller! Chances remaining: ${this.chances}`);
    }
    // correct guess
    else {
      alert('🎉 You won! Starting a new game.');
      this.resetGame(form);
    }
  }

  private resetGame(form: NgForm) {
    // 1) clear the form/model & validation state
    form.resetForm();

    // 2) reset game logic
    this.num     = this.randomNum();
    this.chances = 9;
    // no need to set numberValue = null; resetForm() already did that
  }

  
}
