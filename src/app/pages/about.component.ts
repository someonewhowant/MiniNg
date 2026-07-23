import { Component } from '@core';

@Component({
  selector: 'page-about',
  template: `
    <div>
      <h2>О магазине</h2>
      <p>Mini Shop - демонстрация возможностей фреймворка MiniNG v2.0.</p>
      <p>Мы используем хэш-роутер, чтобы переключаться между вкладками.</p>
    </div>
  `
})
export class AboutComponent {}
