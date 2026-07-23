import { Pipe, PipeTransform } from '@core';

@Pipe({ name: 'currency' })
export class CurrencyPipe implements PipeTransform {
  transform(value: any, currencyCode: string = 'USD'): string {
    if (value == null || isNaN(value)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode.replace(/['"]/g, '') // Remove quotes if passed as string literal
    }).format(value);
  }
}
