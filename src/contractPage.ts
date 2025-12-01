import { calculatePrice, priceConstants2026 } from './priceCalculation';

// const apiUrl = "http://localhost:3334";
// const apiUrl = "https://fairster.code8.dev";
const apiUrl = 'https://fairster-backend.azurewebsites.net/api';
const availableContractPlans = [
  {
    id: 'heatpump-tarif-tile',
    name: 'Wärmepumpen Tarif',
    buttonSelectorId: 'heat-select-button',
  },
  {
    id: '1st-tarif-tile',
    name: '1 Monats Tarif',
    buttonSelectorId: 'one-month-select-button',
  },
  {
    id: '2nd-tarif-tile',
    name: '12 Monats Tarif',
    buttonSelectorId: '12-months-select-button',
  },
  {
    id: '3rd-tarif-tile',
    name: '24 Monats Tarif',
    buttonSelectorId: '24-months-select-button',
  },
];
const idPlanMapping = {
  'heatpump-tarif-tile': 'Wärmepumpen Tarif',
  '1st-tarif-tile': '1 Monats Tarif',
  '2nd-tarif-tile': '12 Monats Tarif',
  '3rd-tarif-tile': '24 Monats Tarif',
};
const contractState = {
  id: null,
  selectedPlan: '2nd-tarif-tile',
  calculation: null,
  planType: '',
  legalConsents: [],
  legalTerms: {
    vertragsbedingungen: '',
    allgStromlieferbedingungen: '',
    preisBestimmungen: '',
    widerrufsrecht: '',
  },
};
type DataResponseType = {
  id: string;
  email: string;
  plan: string;
  zipCode: string;
  yearlyConsumptionKwH: number;
  status: string;
  user: {
    id: string;
    email: string;
    invoiceAddress: string;
    firstName: string;
    lastName: string;
    deliveryAddress: string;
    meterId: string;
  };
};
let contractData: DataResponseType = null;
let contractNameElement: HTMLElement;
let contractAddressElement: HTMLElement;
let contractDeliveryAddressElement: HTMLElement;
let contractMeterIdElement: HTMLElement;
let planListElement: HTMLElement;
let selectedPlanNameElement: HTMLElement;

const onSubmit = async () => {
  if (
    (document.getElementById('legal-consent-checkbox') as HTMLFormElement)
      .checked == false
  ) {
    document.getElementById('legal-consent-check').classList.add('highlight');
    await wait(2000);
    document
      .getElementById('legal-consent-check')
      .classList.remove('highlight');
    return;
  }
  contractState.legalConsents = [
    getElementByXpath('//*[@id="legal-consent-check"]/span').innerText,
    getElementByXpath('//*[@id="wf-form-contractForm"]/section[5]/div')
      .innerText,
  ];

  let result = await fetch(`${apiUrl}/offer/${contractState.id}`, {
    method: 'POST',
    body: JSON.stringify({
      contractState,
      selectedPlan: idPlanMapping[contractState.selectedPlan],
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
  document.getElementById('loading-subheader').innerHTML = 'Angebot bestätigt';
  document.getElementById('loading-cover').classList.remove('hide');
};

export async function init() {
  // Do stuff only if on contract-page
  if (window.location.pathname !== '/contract') return;

  let hasSeenLoadingForAtLeastTwoSeconds = false;
  // Load Contract Details
  setTimeout(() => {
    hasSeenLoadingForAtLeastTwoSeconds = true;
  }, 2000);
  await loadContractDetails();

  // initialize interface
  planListElement = document.getElementById('plan-list-selector');
  selectedPlanNameElement = document.getElementById('selected-plan-title-text');
  updatePlanList(true);

  while (!hasSeenLoadingForAtLeastTwoSeconds) {
    await wait(200);
  }
  if (contractData.status !== 'signed') {
    document.getElementById('loading-cover').classList.add('hide');
  } else {
    document.getElementById('loading-subheader').innerHTML =
      'Angebot bereits bestätigt';
  }
  console.log('Got data and ready');

  // Register events
  document
    .getElementById('plan-nav-left')
    .addEventListener('click', navigatePlans(-1));
  document
    .getElementById('plan-nav-right')
    .addEventListener('click', navigatePlans(1));
  document
    .getElementById('contract-form-submit')
    .addEventListener('click', onSubmit);

  availableContractPlans.map(({ id, buttonSelectorId, name }, index) => {
    let button = document.getElementById(buttonSelectorId) as HTMLLinkElement;
    button.classList.remove('disabled');
  });
}

const loadContractDetails = async () => {
  let offerId = window.location.hash;
  offerId = offerId.slice(1, offerId.length);
  contractState.id = offerId;

  const contractDataResponse = await fetch(`${apiUrl}/offer/${offerId}`, {});
  contractData = await contractDataResponse.json();

  contractNameElement = document.getElementById('contract-data-name');
  contractAddressElement = document.getElementById('contract-data-address');
  contractDeliveryAddressElement = document.getElementById(
    'contract-data-delivery-address'
  );
  contractMeterIdElement = document.getElementById('contract-data-meter-id');
  const calculatedPrices = calculatePrice(
    contractData.zipCode,
    contractData.yearlyConsumptionKwH,
    contractData.plan as 'commercial' | 'private' | 'heat',
    priceConstants2026,
    true
  );
  console.log('Calculated price', calculatedPrices, contractData);
  contractState.calculation = calculatedPrices;
  contractState.planType = contractData.plan;

  if (contractData.plan == 'commercial') {
    (document.getElementById('legal-terms-link') as HTMLAnchorElement).href =
      'https://cdn.shopify.com/s/files/1/0742/1381/8632/files/Stromliefervertrag_fairster_online_Gewerbekunden.pdf?v=1730393629';
    (document.getElementById('delivery-terms-link') as HTMLAnchorElement).href =
      'https://cdn.shopify.com/s/files/1/0742/1381/8632/files/ALB_Anlage_1_fairster_Gewerbekunden.pdf?v=1730393629';
    (document.getElementById('price-terms-link') as HTMLAnchorElement).href =
      'https://cdn.shopify.com/s/files/1/0742/1381/8632/files/Anlage_2_fairster_Preisblatt_Gewerbekunden.pdf?v=1730393628';
    (
      document.getElementById(
        'delivery-legal-terms-footer'
      ) as HTMLAnchorElement
    ).href =
      'https://cdn.shopify.com/s/files/1/0742/1381/8632/files/ALB_Anlage_1_fairster_Gewerbekunden.pdf?v=1730393629';
  }
  contractState.legalTerms.vertragsbedingungen = (
    document.getElementById('legal-terms-link') as HTMLAnchorElement
  ).href;
  contractState.legalTerms.allgStromlieferbedingungen = (
    document.getElementById('delivery-terms-link') as HTMLAnchorElement
  ).href;
  contractState.legalTerms.preisBestimmungen = (
    document.getElementById('price-terms-link') as HTMLAnchorElement
  ).href;
  contractState.legalTerms.widerrufsrecht = (
    document.getElementById('widerruf-legal-terms') as HTMLAnchorElement
  ).href;

  contractNameElement.innerHTML = `${contractData.user.firstName} ${contractData.user.lastName}`;
  contractAddressElement.innerHTML = contractData.user.invoiceAddress;
  contractDeliveryAddressElement.innerHTML = contractData.user.deliveryAddress;
  contractMeterIdElement.innerHTML = contractData.user.meterId;

  let netSuffix = 'Preise inkl. MwSt';
  if (contractData.plan == 'commercial') {
    netSuffix = 'Preise exkl. MwSt';
  }

  let monthlyFeeWithBase = formatDecimal(
    (calculatedPrices.grundpreis + calculatedPrices.baseFee * 12) / 12
  );
  // // Set Price Data
  getElementByXpath(
    '//*[@id="2nd-tarif-tile"]/div[4]'
  ).innerHTML = `Abschlag  <b>${formatDecimal(
    calculatedPrices.abschlag
  )} EUR / Monat </b>`;
  getElementByXpath(
    '//*[@id="3rd-tarif-tile"]/div[4]'
  ).innerHTML = `Abschlag <b>${formatDecimal(
    calculatedPrices.abschlag
  )} EUR / Monat</b>`;
  // getElementByXpath(
  //   '//*[@id="1st-tarif-tile"]/div[3]'
  // ).innerHTML = `Grundpreis ${calculatedPrices.grundpreis} EUR / Jahr`;
  getElementByXpath(
    '//*[@id="2nd-tarif-tile"]/div[3]'
  ).innerHTML = `Grundgebühr ${monthlyFeeWithBase} EUR / Monat`;
  getElementByXpath(
    '//*[@id="3rd-tarif-tile"]/div[3]'
  ).innerHTML = `Grundgebühr ${monthlyFeeWithBase} EUR / Monat`;
  // getElementByXpath(
  //   '//*[@id="1st-tarif-tile"]/div[2]'
  // ).innerHTML = `${calculatedPrices.arbeitspreis} ct/KwH`;
  getElementByXpath(
    '//*[@id="2nd-tarif-tile"]/div[2]'
  ).innerHTML = `${formatDecimal(calculatedPrices.arbeitspreis)} ct/kWh`;
  getElementByXpath(
    '//*[@id="3rd-tarif-tile"]/div[2]'
  ).innerHTML = `${formatDecimal(calculatedPrices.arbeitspreis)} ct/kWh`;

  getElementByXpath(
    '//*[@id="2nd-tarif-tile"]/div[5]'
  ).innerHTML = `Abhängig von deinem aktuellen Verbrauch <br/> ${netSuffix}`;
  getElementByXpath(
    '//*[@id="3rd-tarif-tile"]/div[5]'
  ).innerHTML = `Abhängig von deinem aktuellen Verbrauch <br/> ${netSuffix}`;
};

const updatePlanList = (initial: boolean) => {
  availableContractPlans.map(({ id, buttonSelectorId, name }, index) => {
    if (initial) {
      document
        .getElementById(buttonSelectorId)
        .addEventListener('click', selectPlan(id));
    }
    let button = document.getElementById(buttonSelectorId) as HTMLLinkElement;
    button.classList.remove('disabled');
    if (id == contractState.selectedPlan) {
      button.classList.add('disabled');
      selectedPlanNameElement.innerHTML = name;

      const listWidth = planListElement.offsetWidth;
      planListElement.scrollTo({
        left: listWidth * index,
        top: 0,
        behavior: 'instant',
      });
    }
  });
};

const selectPlan = (planId: string) => (event) => {
  if (planId == '1st-tarif-tile' || planId == 'heatpump-tarif-tile') {
    document.getElementById('contract-form-submit').innerHTML =
      'Tarif anfragen';
  } else {
    document.getElementById('contract-form-submit').innerHTML =
      'Kostenpflichtig <br>abschließen<br>‍';
  }

  contractState.selectedPlan = planId;
  updatePlanList(false);
  document
    .getElementById('contract-form-submit')
    .scrollIntoView({ behavior: 'smooth' });
};

const navigatePlans = (direction: number) => (event) => {
  if (!planListElement) return;

  const listWidth = planListElement.offsetWidth;
  const currentScrollPosition = planListElement.scrollLeft;
  let newScrollPosition = currentScrollPosition + listWidth * direction;
  if (newScrollPosition >= listWidth * availableContractPlans.length) {
    newScrollPosition = 0;
  } else if (newScrollPosition < 0) {
    newScrollPosition = listWidth * (availableContractPlans.length - 1);
  }

  planListElement.scrollTo({
    left: newScrollPosition,
    top: 0,
    behavior: 'smooth',
  });
};

const wait = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

function getElementByXpath(path): HTMLElement {
  return document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue as HTMLElement;
}

function formatDecimal(numberValue: number) {
  // @ts-ignore
  return numberValue.toFixed(2).toLocaleString('de-DE').replace('.', ',');
}
