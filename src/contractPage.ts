import { calculatePrice } from "./priceCalculation";

const apiUrl = "http://localhost:3333";
const availableContractPlans = [
  {
    id: "1st-tarif-tile",
    name: "1 Monats Tarif",
    buttonSelectorId: "one-month-select-button",
  },
  {
    id: "2nd-tarif-tile",
    name: "12 Monats Tarif",
    buttonSelectorId: "12-months-select-button",
  },
  {
    id: "3rd-tarif-tile",
    name: "24 Monats Tarif",
    buttonSelectorId: "24-months-select-button",
  },
];
const contractState = {
  id: null,
  selectedPlan: "2nd-tarif-tile",
  calculation: null,
};
let contractNameElement: HTMLElement;
let contractAddressElement: HTMLElement;
let contractDeliveryAddressElement: HTMLElement;
let contractMeterIdElement: HTMLElement;
let planListElement: HTMLElement;
let selectedPlanNameElement: HTMLElement;

type DataResponseType = {
  id: string;
  email: string;
  plan: string;
  zipCode: string;
  yearlyConsumptionKwH: number;
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

const onSubmit = async () => {
  console.log("On Submit", contractState);

  let result = await fetch(`${apiUrl}/offer/${contractState.id}`, {
    method: "POST",
    body: JSON.stringify(contractState),
    headers: {
      "Content-Type": "application/json",
    },
  });

  document.getElementById("loading-cover").classList.remove("hide");
};

export async function init() {
  // Do stuff only if on contract-page
  if (window.location.pathname !== "/contract") return;

  let hasSeenLoadingForAtLeastTwoSeconds = false;
  console.log("Init contract page");
  // Load Contract Details
  setTimeout(() => {
    hasSeenLoadingForAtLeastTwoSeconds = true;
  }, 2000);
  await loadContractDetails();

  // initialize interface
  planListElement = document.getElementById("plan-list-selector");
  selectedPlanNameElement = document.getElementById("selected-plan-title-text");
  updatePlanList(true);

  while (!hasSeenLoadingForAtLeastTwoSeconds) {
    await wait(200);
  }
  document.getElementById("loading-cover").classList.add("hide");

  // Register events
  document
    .getElementById("plan-nav-left")
    .addEventListener("click", navigatePlans(-1));
  document
    .getElementById("plan-nav-right")
    .addEventListener("click", navigatePlans(1));
  document
    .getElementById("contract-form-submit")
    .addEventListener("click", onSubmit);
}

const loadContractDetails = async () => {
  let offerId = window.location.hash;
  offerId = offerId.slice(1, offerId.length);
  contractState.id = offerId;

  const contractDataResponse = await fetch(`${apiUrl}/offer/${offerId}`, {});
  const contractData: DataResponseType = await contractDataResponse.json();

  contractNameElement = document.getElementById("contract-data-name");
  contractAddressElement = document.getElementById("contract-data-address");
  contractDeliveryAddressElement = document.getElementById(
    "contract-data-delivery-address"
  );
  contractMeterIdElement = document.getElementById("contract-data-meter-id");
  const calculatedPrices = calculatePrice(
    contractData.zipCode,
    contractData.yearlyConsumptionKwH,
    "private"
  );
  contractState.calculation = calculatedPrices;

  contractNameElement.innerHTML = `${contractData.user.firstName} ${contractData.user.lastName}`;
  contractAddressElement.innerHTML = contractData.user.invoiceAddress;
  contractDeliveryAddressElement.innerHTML = contractData.user.deliveryAddress;
  contractMeterIdElement.innerHTML = contractData.user.meterId;

  // // Set Price Data
  getElementByXpath(
    '//*[@id="2nd-tarif-tile"]/div[4]'
  ).innerHTML = `${calculatedPrices.abschlag} EUR / Monat`;
  getElementByXpath(
    '//*[@id="3rd-tarif-tile"]/div[4]'
  ).innerHTML = `${calculatedPrices.abschlag} EUR / Monat`;
  getElementByXpath(
    '//*[@id="1st-tarif-tile"]/div[3]'
  ).innerHTML = `Arbeitspreis ${calculatedPrices.arbeitspreis} ct/KwH - Grundpreis ${calculatedPrices.grundpreis} EUR / Jahr`;
  getElementByXpath(
    '//*[@id="2nd-tarif-tile"]/div[3]'
  ).innerHTML = `Arbeitspreis ${calculatedPrices.arbeitspreis} ct/KwH - Grundpreis ${calculatedPrices.grundpreis} EUR / Jahr`;
  getElementByXpath(
    '//*[@id="3rd-tarif-tile"]/div[3]'
  ).innerHTML = `Arbeitspreis ${calculatedPrices.arbeitspreis} ct/KwH - Grundpreis ${calculatedPrices.grundpreis} EUR / Jahr`;
  getElementByXpath(
    '//*[@id="1st-tarif-tile"]/div[2]'
  ).innerHTML = `${calculatedPrices.arbeitspreis} ct/KwH`;
  getElementByXpath(
    '//*[@id="2nd-tarif-tile"]/div[2]'
  ).innerHTML = `${calculatedPrices.arbeitspreis} ct/KwH`;
  getElementByXpath(
    '//*[@id="3rd-tarif-tile"]/div[2]'
  ).innerHTML = `${calculatedPrices.arbeitspreis} ct/KwH`;
};

const updatePlanList = (initial: boolean) => {
  availableContractPlans.map(({ id, buttonSelectorId, name }, index) => {
    if (initial) {
      document
        .getElementById(buttonSelectorId)
        .addEventListener("click", selectPlan(id));
    }
    let button = document.getElementById(buttonSelectorId) as HTMLLinkElement;
    button.classList.remove("disabled");
    if (id == contractState.selectedPlan) {
      button.classList.add("disabled");
      selectedPlanNameElement.innerHTML = name;

      const listWidth = planListElement.offsetWidth;
      planListElement.scrollTo({
        left: listWidth * index,
        top: 0,
        behavior: "instant",
      });
    }
  });
};

const selectPlan = (planId: string) => (event) => {
  console.log("Select Plan", planId);

  contractState.selectedPlan = planId;
  updatePlanList(false);
};

const navigatePlans = (direction: number) => (event) => {
  console.log("Navigate plan", direction);
  if (!planListElement) return;
  const listWidth = planListElement.offsetWidth;
  const currentScrollPosition = planListElement.scrollLeft;
  planListElement.scrollTo({
    left: currentScrollPosition + listWidth * direction,
    top: 0,
    behavior: "smooth",
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
