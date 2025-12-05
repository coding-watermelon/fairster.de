import { init } from './contractPage';
import { calculatePrice } from './priceCalculation';

async function main() {
  init();
  async function logSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    let form = {
      energyConsumer: (
        document.getElementById(
          'form-field-energy-consumer'
        ) as HTMLInputElement
      ).value as 'commercial' | 'private' | 'heat',
      zipCode: (
        document.getElementById('form-field-zip-code') as HTMLInputElement
      ).value,
      consumption: (
        document.getElementById(
          'form-field-yearly-consumption'
        ) as HTMLInputElement
      ).value,
    };
    let prices = await calculatePrice(
      form.zipCode,
      parseInt(form.consumption),
      form.energyConsumer
    );

    if (!prices) {
      console.error('Failed to calculate prices');
      return;
    }

    let pricesNet = form.energyConsumer == 'commercial';

    document.getElementById('working-price-text').innerHTML = `${
      pricesNet ? 'netto' : 'brutto'
    } ${prices.arbeitspreis} Cent/kWh`;
    document.getElementById('base-price-text').innerHTML = `${
      pricesNet ? 'netto' : 'brutto'
    } ${prices.grundpreis} EUR/Jahr`;
    document.getElementById(
      'monthly-fee-text'
    ).innerHTML = `brutto ${prices.abschlag} EUR`;
    document.getElementById('refund-text').innerHTML = `${
      pricesNet ? 'netto' : 'brutto'
    } ${prices.erstattung} Cent/kWh`;
    document.getElementById('cost-calc-table').style.display = 'block';
  }

  const form = document.getElementById('wf-form-Fairster-Calculation');
  form.addEventListener('submit', logSubmit);
}

try {
  main();
} catch (e) {
  console.error(e.message);
}
