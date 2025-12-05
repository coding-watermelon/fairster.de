/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 331:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.init = init;
const priceCalculation_1 = __webpack_require__(872);
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
let contractData = null;
let contractNameElement;
let contractAddressElement;
let contractDeliveryAddressElement;
let contractMeterIdElement;
let planListElement;
let selectedPlanNameElement;
const onSubmit = () => __awaiter(void 0, void 0, void 0, function* () {
    if (document.getElementById('legal-consent-checkbox')
        .checked == false) {
        document.getElementById('legal-consent-check').classList.add('highlight');
        yield wait(2000);
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
    let result = yield fetch(`${apiUrl}/offer/${contractState.id}`, {
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
});
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        // Do stuff only if on contract-page
        if (window.location.pathname !== '/contract')
            return;
        let hasSeenLoadingForAtLeastTwoSeconds = false;
        // Load Contract Details
        setTimeout(() => {
            hasSeenLoadingForAtLeastTwoSeconds = true;
        }, 2000);
        yield loadContractDetails();
        // initialize interface
        planListElement = document.getElementById('plan-list-selector');
        selectedPlanNameElement = document.getElementById('selected-plan-title-text');
        updatePlanList(true);
        while (!hasSeenLoadingForAtLeastTwoSeconds) {
            yield wait(200);
        }
        if (contractData.status !== 'signed') {
            document.getElementById('loading-cover').classList.add('hide');
        }
        else {
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
            let button = document.getElementById(buttonSelectorId);
            button.classList.remove('disabled');
        });
    });
}
const loadContractDetails = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let offerId = window.location.hash;
    offerId = offerId.slice(1, offerId.length);
    contractState.id = offerId;
    const contractDataResponse = yield fetch(`${apiUrl}/offer/${offerId}`, {});
    contractData = yield contractDataResponse.json();
    contractNameElement = document.getElementById('contract-data-name');
    contractAddressElement = document.getElementById('contract-data-address');
    contractDeliveryAddressElement = document.getElementById('contract-data-delivery-address');
    contractMeterIdElement = document.getElementById('contract-data-meter-id');
    // Parse delivery address: "10245 Berlin, Straßmannstrasse 25"
    let deliveryCity = '';
    let deliveryStreet = '';
    let deliveryHouseNumber = '';
    if ((_a = contractData.user) === null || _a === void 0 ? void 0 : _a.deliveryAddress) {
        const addressMatch = contractData.user.deliveryAddress.match(/^\d+\s+([^,]+),\s+(.+?)\s+(\d+)$/);
        if (addressMatch) {
            deliveryCity = addressMatch[1].trim();
            deliveryStreet = addressMatch[2].trim();
            deliveryHouseNumber = addressMatch[3].trim();
        }
    }
    const calculatedPrices = yield (0, priceCalculation_1.calculatePrice)(contractData.zipCode, contractData.yearlyConsumptionKwH, contractData.plan, deliveryCity, deliveryStreet, deliveryHouseNumber);
    console.log('Calculated price', calculatedPrices, contractData);
    if (!calculatedPrices) {
        console.error('Failed to calculate prices');
        return;
    }
    contractState.calculation = calculatedPrices;
    contractState.planType = contractData.plan;
    if (contractData.plan == 'commercial') {
        document.getElementById('legal-terms-link').href =
            'https://cdn.shopify.com/s/files/1/0742/1381/8632/files/Stromliefervertrag_fairster_online_Gewerbekunden.pdf?v=1730393629';
        document.getElementById('delivery-terms-link').href =
            'https://cdn.shopify.com/s/files/1/0742/1381/8632/files/ALB_Anlage_1_fairster_Gewerbekunden.pdf?v=1730393629';
        document.getElementById('price-terms-link').href =
            'https://cdn.shopify.com/s/files/1/0742/1381/8632/files/Anlage_2_fairster_Preisblatt_Gewerbekunden.pdf?v=1730393628';
        document.getElementById('delivery-legal-terms-footer').href =
            'https://cdn.shopify.com/s/files/1/0742/1381/8632/files/ALB_Anlage_1_fairster_Gewerbekunden.pdf?v=1730393629';
    }
    contractState.legalTerms.vertragsbedingungen = document.getElementById('legal-terms-link').href;
    contractState.legalTerms.allgStromlieferbedingungen = document.getElementById('delivery-terms-link').href;
    contractState.legalTerms.preisBestimmungen = document.getElementById('price-terms-link').href;
    contractState.legalTerms.widerrufsrecht = document.getElementById('widerruf-legal-terms').href;
    contractNameElement.innerHTML = `${contractData.user.firstName} ${contractData.user.lastName}`;
    contractAddressElement.innerHTML = contractData.user.invoiceAddress;
    contractDeliveryAddressElement.innerHTML = contractData.user.deliveryAddress;
    contractMeterIdElement.innerHTML = contractData.user.meterId;
    let netSuffix = 'Preise inkl. MwSt';
    if (contractData.plan == 'commercial') {
        netSuffix = 'Preise exkl. MwSt';
    }
    let monthlyFeeWithBase = formatDecimal((calculatedPrices.grundpreis + calculatedPrices.baseFee * 12) / 12);
    // // Set Price Data
    getElementByXpath('//*[@id="2nd-tarif-tile"]/div[4]').innerHTML = `Abschlag  <b>${formatDecimal(calculatedPrices.abschlag)} EUR / Monat </b>`;
    getElementByXpath('//*[@id="3rd-tarif-tile"]/div[4]').innerHTML = `Abschlag <b>${formatDecimal(calculatedPrices.abschlag)} EUR / Monat</b>`;
    // getElementByXpath(
    //   '//*[@id="1st-tarif-tile"]/div[3]'
    // ).innerHTML = `Grundpreis ${calculatedPrices.grundpreis} EUR / Jahr`;
    getElementByXpath('//*[@id="2nd-tarif-tile"]/div[3]').innerHTML = `Grundgebühr ${monthlyFeeWithBase} EUR / Monat`;
    getElementByXpath('//*[@id="3rd-tarif-tile"]/div[3]').innerHTML = `Grundgebühr ${monthlyFeeWithBase} EUR / Monat`;
    // getElementByXpath(
    //   '//*[@id="1st-tarif-tile"]/div[2]'
    // ).innerHTML = `${calculatedPrices.arbeitspreis} ct/KwH`;
    getElementByXpath('//*[@id="2nd-tarif-tile"]/div[2]').innerHTML = `${formatDecimal(calculatedPrices.arbeitspreis)} ct/kWh`;
    getElementByXpath('//*[@id="3rd-tarif-tile"]/div[2]').innerHTML = `${formatDecimal(calculatedPrices.arbeitspreis)} ct/kWh`;
    getElementByXpath('//*[@id="2nd-tarif-tile"]/div[5]').innerHTML = `Abhängig von deinem aktuellen Verbrauch <br/> ${netSuffix}`;
    getElementByXpath('//*[@id="3rd-tarif-tile"]/div[5]').innerHTML = `Abhängig von deinem aktuellen Verbrauch <br/> ${netSuffix}`;
});
const updatePlanList = (initial) => {
    availableContractPlans.map(({ id, buttonSelectorId, name }, index) => {
        if (initial) {
            document
                .getElementById(buttonSelectorId)
                .addEventListener('click', selectPlan(id));
        }
        let button = document.getElementById(buttonSelectorId);
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
const selectPlan = (planId) => (event) => {
    if (planId == '1st-tarif-tile' || planId == 'heatpump-tarif-tile') {
        document.getElementById('contract-form-submit').innerHTML =
            'Tarif anfragen';
    }
    else {
        document.getElementById('contract-form-submit').innerHTML =
            'Kostenpflichtig <br>abschließen<br>‍';
    }
    contractState.selectedPlan = planId;
    updatePlanList(false);
    document
        .getElementById('contract-form-submit')
        .scrollIntoView({ behavior: 'smooth' });
};
const navigatePlans = (direction) => (event) => {
    if (!planListElement)
        return;
    const listWidth = planListElement.offsetWidth;
    const currentScrollPosition = planListElement.scrollLeft;
    let newScrollPosition = currentScrollPosition + listWidth * direction;
    if (newScrollPosition >= listWidth * availableContractPlans.length) {
        newScrollPosition = 0;
    }
    else if (newScrollPosition < 0) {
        newScrollPosition = listWidth * (availableContractPlans.length - 1);
    }
    planListElement.scrollTo({
        left: newScrollPosition,
        top: 0,
        behavior: 'smooth',
    });
};
const wait = (ms) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => setTimeout(resolve, ms));
});
function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
function formatDecimal(numberValue) {
    // @ts-ignore
    return numberValue.toFixed(2).toLocaleString('de-DE').replace('.', ',');
}


/***/ }),

/***/ 156:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const contractPage_1 = __webpack_require__(331);
const priceCalculation_1 = __webpack_require__(872);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, contractPage_1.init)();
        function logSubmit(event) {
            return __awaiter(this, void 0, void 0, function* () {
                event.preventDefault();
                event.stopPropagation();
                let form = {
                    energyConsumer: document.getElementById('form-field-energy-consumer').value,
                    zipCode: document.getElementById('form-field-zip-code').value,
                    consumption: document.getElementById('form-field-yearly-consumption').value,
                };
                let prices = yield (0, priceCalculation_1.calculatePrice)(form.zipCode, parseInt(form.consumption), form.energyConsumer);
                if (!prices) {
                    console.error('Failed to calculate prices');
                    return;
                }
                let pricesNet = form.energyConsumer == 'commercial';
                document.getElementById('working-price-text').innerHTML = `${pricesNet ? 'netto' : 'brutto'} ${prices.arbeitspreis} Cent/kWh`;
                document.getElementById('base-price-text').innerHTML = `${pricesNet ? 'netto' : 'brutto'} ${prices.grundpreis} EUR/Jahr`;
                document.getElementById('monthly-fee-text').innerHTML = `brutto ${prices.abschlag} EUR`;
                document.getElementById('refund-text').innerHTML = `${pricesNet ? 'netto' : 'brutto'} ${prices.erstattung} Cent/kWh`;
                document.getElementById('cost-calc-table').style.display = 'block';
            });
        }
        const form = document.getElementById('wf-form-Fairster-Calculation');
        form.addEventListener('submit', logSubmit);
    });
}
try {
    main();
}
catch (e) {
    console.error(e.message);
}


/***/ }),

/***/ 872:
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.calculatePrice = void 0;
const calculatePrice = (zipCode, consumptionKwH, type, deliveryCity, deliveryStreet, deliveryHouseNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Map type to customerType
        const customerType = type === 'private'
            ? 'individual'
            : type === 'commercial'
                ? 'company'
                : 'individual';
        // Map type to powerType
        const powerType = type === 'heat' ? 'heat' : 'electricity';
        // Prepare API payload
        const payload = {
            customerType: customerType,
            deliveryZipCode: zipCode,
            deliveryCity: deliveryCity || '',
            deliveryStreet: deliveryStreet || '',
            deliveryHouseNumber: deliveryHouseNumber || '',
            powerType: powerType,
            yearlyConsumption: consumptionKwH.toString(),
        };
        // Make API call
        const response = yield fetch('https://fairster-backend.azurewebsites.net/api/plans/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            console.error('API call failed:', response.status, response.statusText);
            return null;
        }
        const data = yield response.json();
        // Map API response to return type using calculation values
        return {
            arbeitspreis: data.calculation.workingPricePerKwH,
            grundpreis: data.calculation.basePricePerYearNetworkUsage,
            abschlag: data.calculation.monthlyFee,
            erstattung: data.calculation.refund,
            baseFee: data.calculation.baseFeePerMonth,
        };
    }
    catch (error) {
        console.error('Error calculating price:', error);
        return null;
    }
});
exports.calculatePrice = calculatePrice;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(156);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mYWlyc3Rlci5kZS8uL3NyYy9jb250cmFjdFBhZ2UudHMiLCJ3ZWJwYWNrOi8vZmFpcnN0ZXIuZGUvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZmFpcnN0ZXIuZGUvLi9zcmMvcHJpY2VDYWxjdWxhdGlvbi50cyIsIndlYnBhY2s6Ly9mYWlyc3Rlci5kZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9mYWlyc3Rlci5kZS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2ZhaXJzdGVyLmRlL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9mYWlyc3Rlci5kZS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY2FsY3VsYXRlUHJpY2UgfSBmcm9tICcuL3ByaWNlQ2FsY3VsYXRpb24nO1xuXG4vLyBjb25zdCBhcGlVcmwgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MzMzNFwiO1xuLy8gY29uc3QgYXBpVXJsID0gXCJodHRwczovL2ZhaXJzdGVyLmNvZGU4LmRldlwiO1xuY29uc3QgYXBpVXJsID0gJ2h0dHBzOi8vZmFpcnN0ZXItYmFja2VuZC5henVyZXdlYnNpdGVzLm5ldC9hcGknO1xuY29uc3QgYXZhaWxhYmxlQ29udHJhY3RQbGFucyA9IFtcbiAge1xuICAgIGlkOiAnaGVhdHB1bXAtdGFyaWYtdGlsZScsXG4gICAgbmFtZTogJ1fDpHJtZXB1bXBlbiBUYXJpZicsXG4gICAgYnV0dG9uU2VsZWN0b3JJZDogJ2hlYXQtc2VsZWN0LWJ1dHRvbicsXG4gIH0sXG4gIHtcbiAgICBpZDogJzFzdC10YXJpZi10aWxlJyxcbiAgICBuYW1lOiAnMSBNb25hdHMgVGFyaWYnLFxuICAgIGJ1dHRvblNlbGVjdG9ySWQ6ICdvbmUtbW9udGgtc2VsZWN0LWJ1dHRvbicsXG4gIH0sXG4gIHtcbiAgICBpZDogJzJuZC10YXJpZi10aWxlJyxcbiAgICBuYW1lOiAnMTIgTW9uYXRzIFRhcmlmJyxcbiAgICBidXR0b25TZWxlY3RvcklkOiAnMTItbW9udGhzLXNlbGVjdC1idXR0b24nLFxuICB9LFxuICB7XG4gICAgaWQ6ICczcmQtdGFyaWYtdGlsZScsXG4gICAgbmFtZTogJzI0IE1vbmF0cyBUYXJpZicsXG4gICAgYnV0dG9uU2VsZWN0b3JJZDogJzI0LW1vbnRocy1zZWxlY3QtYnV0dG9uJyxcbiAgfSxcbl07XG5jb25zdCBpZFBsYW5NYXBwaW5nID0ge1xuICAnaGVhdHB1bXAtdGFyaWYtdGlsZSc6ICdXw6RybWVwdW1wZW4gVGFyaWYnLFxuICAnMXN0LXRhcmlmLXRpbGUnOiAnMSBNb25hdHMgVGFyaWYnLFxuICAnMm5kLXRhcmlmLXRpbGUnOiAnMTIgTW9uYXRzIFRhcmlmJyxcbiAgJzNyZC10YXJpZi10aWxlJzogJzI0IE1vbmF0cyBUYXJpZicsXG59O1xuY29uc3QgY29udHJhY3RTdGF0ZSA9IHtcbiAgaWQ6IG51bGwsXG4gIHNlbGVjdGVkUGxhbjogJzJuZC10YXJpZi10aWxlJyxcbiAgY2FsY3VsYXRpb246IG51bGwsXG4gIHBsYW5UeXBlOiAnJyxcbiAgbGVnYWxDb25zZW50czogW10sXG4gIGxlZ2FsVGVybXM6IHtcbiAgICB2ZXJ0cmFnc2JlZGluZ3VuZ2VuOiAnJyxcbiAgICBhbGxnU3Ryb21saWVmZXJiZWRpbmd1bmdlbjogJycsXG4gICAgcHJlaXNCZXN0aW1tdW5nZW46ICcnLFxuICAgIHdpZGVycnVmc3JlY2h0OiAnJyxcbiAgfSxcbn07XG50eXBlIERhdGFSZXNwb25zZVR5cGUgPSB7XG4gIGlkOiBzdHJpbmc7XG4gIGVtYWlsOiBzdHJpbmc7XG4gIHBsYW46IHN0cmluZztcbiAgemlwQ29kZTogc3RyaW5nO1xuICB5ZWFybHlDb25zdW1wdGlvbkt3SDogbnVtYmVyO1xuICBzdGF0dXM6IHN0cmluZztcbiAgdXNlcjoge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgZW1haWw6IHN0cmluZztcbiAgICBpbnZvaWNlQWRkcmVzczogc3RyaW5nO1xuICAgIGZpcnN0TmFtZTogc3RyaW5nO1xuICAgIGxhc3ROYW1lOiBzdHJpbmc7XG4gICAgZGVsaXZlcnlBZGRyZXNzOiBzdHJpbmc7XG4gICAgbWV0ZXJJZDogc3RyaW5nO1xuICB9O1xufTtcbmxldCBjb250cmFjdERhdGE6IERhdGFSZXNwb25zZVR5cGUgPSBudWxsO1xubGV0IGNvbnRyYWN0TmFtZUVsZW1lbnQ6IEhUTUxFbGVtZW50O1xubGV0IGNvbnRyYWN0QWRkcmVzc0VsZW1lbnQ6IEhUTUxFbGVtZW50O1xubGV0IGNvbnRyYWN0RGVsaXZlcnlBZGRyZXNzRWxlbWVudDogSFRNTEVsZW1lbnQ7XG5sZXQgY29udHJhY3RNZXRlcklkRWxlbWVudDogSFRNTEVsZW1lbnQ7XG5sZXQgcGxhbkxpc3RFbGVtZW50OiBIVE1MRWxlbWVudDtcbmxldCBzZWxlY3RlZFBsYW5OYW1lRWxlbWVudDogSFRNTEVsZW1lbnQ7XG5cbmNvbnN0IG9uU3VibWl0ID0gYXN5bmMgKCkgPT4ge1xuICBpZiAoXG4gICAgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZWdhbC1jb25zZW50LWNoZWNrYm94JykgYXMgSFRNTEZvcm1FbGVtZW50KVxuICAgICAgLmNoZWNrZWQgPT0gZmFsc2VcbiAgKSB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xlZ2FsLWNvbnNlbnQtY2hlY2snKS5jbGFzc0xpc3QuYWRkKCdoaWdobGlnaHQnKTtcbiAgICBhd2FpdCB3YWl0KDIwMDApO1xuICAgIGRvY3VtZW50XG4gICAgICAuZ2V0RWxlbWVudEJ5SWQoJ2xlZ2FsLWNvbnNlbnQtY2hlY2snKVxuICAgICAgLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZ2hsaWdodCcpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb250cmFjdFN0YXRlLmxlZ2FsQ29uc2VudHMgPSBbXG4gICAgZ2V0RWxlbWVudEJ5WHBhdGgoJy8vKltAaWQ9XCJsZWdhbC1jb25zZW50LWNoZWNrXCJdL3NwYW4nKS5pbm5lclRleHQsXG4gICAgZ2V0RWxlbWVudEJ5WHBhdGgoJy8vKltAaWQ9XCJ3Zi1mb3JtLWNvbnRyYWN0Rm9ybVwiXS9zZWN0aW9uWzVdL2RpdicpXG4gICAgICAuaW5uZXJUZXh0LFxuICBdO1xuXG4gIGxldCByZXN1bHQgPSBhd2FpdCBmZXRjaChgJHthcGlVcmx9L29mZmVyLyR7Y29udHJhY3RTdGF0ZS5pZH1gLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgY29udHJhY3RTdGF0ZSxcbiAgICAgIHNlbGVjdGVkUGxhbjogaWRQbGFuTWFwcGluZ1tjb250cmFjdFN0YXRlLnNlbGVjdGVkUGxhbl0sXG4gICAgfSksXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9LFxuICB9KTtcbiAgd2luZG93LnNjcm9sbFRvKHtcbiAgICB0b3A6IDAsXG4gICAgbGVmdDogMCxcbiAgICBiZWhhdmlvcjogJ3Ntb290aCcsXG4gIH0pO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZy1zdWJoZWFkZXInKS5pbm5lckhUTUwgPSAnQW5nZWJvdCBiZXN0w6R0aWd0JztcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRpbmctY292ZXInKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdCgpIHtcbiAgLy8gRG8gc3R1ZmYgb25seSBpZiBvbiBjb250cmFjdC1wYWdlXG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgIT09ICcvY29udHJhY3QnKSByZXR1cm47XG5cbiAgbGV0IGhhc1NlZW5Mb2FkaW5nRm9yQXRMZWFzdFR3b1NlY29uZHMgPSBmYWxzZTtcbiAgLy8gTG9hZCBDb250cmFjdCBEZXRhaWxzXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGhhc1NlZW5Mb2FkaW5nRm9yQXRMZWFzdFR3b1NlY29uZHMgPSB0cnVlO1xuICB9LCAyMDAwKTtcbiAgYXdhaXQgbG9hZENvbnRyYWN0RGV0YWlscygpO1xuXG4gIC8vIGluaXRpYWxpemUgaW50ZXJmYWNlXG4gIHBsYW5MaXN0RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGFuLWxpc3Qtc2VsZWN0b3InKTtcbiAgc2VsZWN0ZWRQbGFuTmFtZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VsZWN0ZWQtcGxhbi10aXRsZS10ZXh0Jyk7XG4gIHVwZGF0ZVBsYW5MaXN0KHRydWUpO1xuXG4gIHdoaWxlICghaGFzU2VlbkxvYWRpbmdGb3JBdExlYXN0VHdvU2Vjb25kcykge1xuICAgIGF3YWl0IHdhaXQoMjAwKTtcbiAgfVxuICBpZiAoY29udHJhY3REYXRhLnN0YXR1cyAhPT0gJ3NpZ25lZCcpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZy1jb3ZlcicpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZy1zdWJoZWFkZXInKS5pbm5lckhUTUwgPVxuICAgICAgJ0FuZ2Vib3QgYmVyZWl0cyBiZXN0w6R0aWd0JztcbiAgfVxuICBjb25zb2xlLmxvZygnR290IGRhdGEgYW5kIHJlYWR5Jyk7XG5cbiAgLy8gUmVnaXN0ZXIgZXZlbnRzXG4gIGRvY3VtZW50XG4gICAgLmdldEVsZW1lbnRCeUlkKCdwbGFuLW5hdi1sZWZ0JylcbiAgICAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBuYXZpZ2F0ZVBsYW5zKC0xKSk7XG4gIGRvY3VtZW50XG4gICAgLmdldEVsZW1lbnRCeUlkKCdwbGFuLW5hdi1yaWdodCcpXG4gICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbmF2aWdhdGVQbGFucygxKSk7XG4gIGRvY3VtZW50XG4gICAgLmdldEVsZW1lbnRCeUlkKCdjb250cmFjdC1mb3JtLXN1Ym1pdCcpXG4gICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25TdWJtaXQpO1xuXG4gIGF2YWlsYWJsZUNvbnRyYWN0UGxhbnMubWFwKCh7IGlkLCBidXR0b25TZWxlY3RvcklkLCBuYW1lIH0sIGluZGV4KSA9PiB7XG4gICAgbGV0IGJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGJ1dHRvblNlbGVjdG9ySWQpIGFzIEhUTUxMaW5rRWxlbWVudDtcbiAgICBidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnZGlzYWJsZWQnKTtcbiAgfSk7XG59XG5cbmNvbnN0IGxvYWRDb250cmFjdERldGFpbHMgPSBhc3luYyAoKSA9PiB7XG4gIGxldCBvZmZlcklkID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gIG9mZmVySWQgPSBvZmZlcklkLnNsaWNlKDEsIG9mZmVySWQubGVuZ3RoKTtcbiAgY29udHJhY3RTdGF0ZS5pZCA9IG9mZmVySWQ7XG5cbiAgY29uc3QgY29udHJhY3REYXRhUmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHthcGlVcmx9L29mZmVyLyR7b2ZmZXJJZH1gLCB7fSk7XG4gIGNvbnRyYWN0RGF0YSA9IGF3YWl0IGNvbnRyYWN0RGF0YVJlc3BvbnNlLmpzb24oKTtcblxuICBjb250cmFjdE5hbWVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyYWN0LWRhdGEtbmFtZScpO1xuICBjb250cmFjdEFkZHJlc3NFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyYWN0LWRhdGEtYWRkcmVzcycpO1xuICBjb250cmFjdERlbGl2ZXJ5QWRkcmVzc0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAnY29udHJhY3QtZGF0YS1kZWxpdmVyeS1hZGRyZXNzJ1xuICApO1xuICBjb250cmFjdE1ldGVySWRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyYWN0LWRhdGEtbWV0ZXItaWQnKTtcblxuICAvLyBQYXJzZSBkZWxpdmVyeSBhZGRyZXNzOiBcIjEwMjQ1IEJlcmxpbiwgU3RyYcOfbWFubnN0cmFzc2UgMjVcIlxuICBsZXQgZGVsaXZlcnlDaXR5ID0gJyc7XG4gIGxldCBkZWxpdmVyeVN0cmVldCA9ICcnO1xuICBsZXQgZGVsaXZlcnlIb3VzZU51bWJlciA9ICcnO1xuXG4gIGlmIChjb250cmFjdERhdGEudXNlcj8uZGVsaXZlcnlBZGRyZXNzKSB7XG4gICAgY29uc3QgYWRkcmVzc01hdGNoID0gY29udHJhY3REYXRhLnVzZXIuZGVsaXZlcnlBZGRyZXNzLm1hdGNoKFxuICAgICAgL15cXGQrXFxzKyhbXixdKyksXFxzKyguKz8pXFxzKyhcXGQrKSQvXG4gICAgKTtcbiAgICBpZiAoYWRkcmVzc01hdGNoKSB7XG4gICAgICBkZWxpdmVyeUNpdHkgPSBhZGRyZXNzTWF0Y2hbMV0udHJpbSgpO1xuICAgICAgZGVsaXZlcnlTdHJlZXQgPSBhZGRyZXNzTWF0Y2hbMl0udHJpbSgpO1xuICAgICAgZGVsaXZlcnlIb3VzZU51bWJlciA9IGFkZHJlc3NNYXRjaFszXS50cmltKCk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2FsY3VsYXRlZFByaWNlcyA9IGF3YWl0IGNhbGN1bGF0ZVByaWNlKFxuICAgIGNvbnRyYWN0RGF0YS56aXBDb2RlLFxuICAgIGNvbnRyYWN0RGF0YS55ZWFybHlDb25zdW1wdGlvbkt3SCxcbiAgICBjb250cmFjdERhdGEucGxhbiBhcyAnY29tbWVyY2lhbCcgfCAncHJpdmF0ZScgfCAnaGVhdCcsXG4gICAgZGVsaXZlcnlDaXR5LFxuICAgIGRlbGl2ZXJ5U3RyZWV0LFxuICAgIGRlbGl2ZXJ5SG91c2VOdW1iZXJcbiAgKTtcbiAgY29uc29sZS5sb2coJ0NhbGN1bGF0ZWQgcHJpY2UnLCBjYWxjdWxhdGVkUHJpY2VzLCBjb250cmFjdERhdGEpO1xuXG4gIGlmICghY2FsY3VsYXRlZFByaWNlcykge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjYWxjdWxhdGUgcHJpY2VzJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29udHJhY3RTdGF0ZS5jYWxjdWxhdGlvbiA9IGNhbGN1bGF0ZWRQcmljZXM7XG4gIGNvbnRyYWN0U3RhdGUucGxhblR5cGUgPSBjb250cmFjdERhdGEucGxhbjtcblxuICBpZiAoY29udHJhY3REYXRhLnBsYW4gPT0gJ2NvbW1lcmNpYWwnKSB7XG4gICAgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZWdhbC10ZXJtcy1saW5rJykgYXMgSFRNTEFuY2hvckVsZW1lbnQpLmhyZWYgPVxuICAgICAgJ2h0dHBzOi8vY2RuLnNob3BpZnkuY29tL3MvZmlsZXMvMS8wNzQyLzEzODEvODYzMi9maWxlcy9TdHJvbWxpZWZlcnZlcnRyYWdfZmFpcnN0ZXJfb25saW5lX0dld2VyYmVrdW5kZW4ucGRmP3Y9MTczMDM5MzYyOSc7XG4gICAgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWxpdmVyeS10ZXJtcy1saW5rJykgYXMgSFRNTEFuY2hvckVsZW1lbnQpLmhyZWYgPVxuICAgICAgJ2h0dHBzOi8vY2RuLnNob3BpZnkuY29tL3MvZmlsZXMvMS8wNzQyLzEzODEvODYzMi9maWxlcy9BTEJfQW5sYWdlXzFfZmFpcnN0ZXJfR2V3ZXJiZWt1bmRlbi5wZGY/dj0xNzMwMzkzNjI5JztcbiAgICAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ByaWNlLXRlcm1zLWxpbmsnKSBhcyBIVE1MQW5jaG9yRWxlbWVudCkuaHJlZiA9XG4gICAgICAnaHR0cHM6Ly9jZG4uc2hvcGlmeS5jb20vcy9maWxlcy8xLzA3NDIvMTM4MS84NjMyL2ZpbGVzL0FubGFnZV8yX2ZhaXJzdGVyX1ByZWlzYmxhdHRfR2V3ZXJiZWt1bmRlbi5wZGY/dj0xNzMwMzkzNjI4JztcbiAgICAoXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgICAgJ2RlbGl2ZXJ5LWxlZ2FsLXRlcm1zLWZvb3RlcidcbiAgICAgICkgYXMgSFRNTEFuY2hvckVsZW1lbnRcbiAgICApLmhyZWYgPVxuICAgICAgJ2h0dHBzOi8vY2RuLnNob3BpZnkuY29tL3MvZmlsZXMvMS8wNzQyLzEzODEvODYzMi9maWxlcy9BTEJfQW5sYWdlXzFfZmFpcnN0ZXJfR2V3ZXJiZWt1bmRlbi5wZGY/dj0xNzMwMzkzNjI5JztcbiAgfVxuICBjb250cmFjdFN0YXRlLmxlZ2FsVGVybXMudmVydHJhZ3NiZWRpbmd1bmdlbiA9IChcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGVnYWwtdGVybXMtbGluaycpIGFzIEhUTUxBbmNob3JFbGVtZW50XG4gICkuaHJlZjtcbiAgY29udHJhY3RTdGF0ZS5sZWdhbFRlcm1zLmFsbGdTdHJvbWxpZWZlcmJlZGluZ3VuZ2VuID0gKFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWxpdmVyeS10ZXJtcy1saW5rJykgYXMgSFRNTEFuY2hvckVsZW1lbnRcbiAgKS5ocmVmO1xuICBjb250cmFjdFN0YXRlLmxlZ2FsVGVybXMucHJlaXNCZXN0aW1tdW5nZW4gPSAoXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ByaWNlLXRlcm1zLWxpbmsnKSBhcyBIVE1MQW5jaG9yRWxlbWVudFxuICApLmhyZWY7XG4gIGNvbnRyYWN0U3RhdGUubGVnYWxUZXJtcy53aWRlcnJ1ZnNyZWNodCA9IChcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2lkZXJydWYtbGVnYWwtdGVybXMnKSBhcyBIVE1MQW5jaG9yRWxlbWVudFxuICApLmhyZWY7XG5cbiAgY29udHJhY3ROYW1lRWxlbWVudC5pbm5lckhUTUwgPSBgJHtjb250cmFjdERhdGEudXNlci5maXJzdE5hbWV9ICR7Y29udHJhY3REYXRhLnVzZXIubGFzdE5hbWV9YDtcbiAgY29udHJhY3RBZGRyZXNzRWxlbWVudC5pbm5lckhUTUwgPSBjb250cmFjdERhdGEudXNlci5pbnZvaWNlQWRkcmVzcztcbiAgY29udHJhY3REZWxpdmVyeUFkZHJlc3NFbGVtZW50LmlubmVySFRNTCA9IGNvbnRyYWN0RGF0YS51c2VyLmRlbGl2ZXJ5QWRkcmVzcztcbiAgY29udHJhY3RNZXRlcklkRWxlbWVudC5pbm5lckhUTUwgPSBjb250cmFjdERhdGEudXNlci5tZXRlcklkO1xuXG4gIGxldCBuZXRTdWZmaXggPSAnUHJlaXNlIGlua2wuIE13U3QnO1xuICBpZiAoY29udHJhY3REYXRhLnBsYW4gPT0gJ2NvbW1lcmNpYWwnKSB7XG4gICAgbmV0U3VmZml4ID0gJ1ByZWlzZSBleGtsLiBNd1N0JztcbiAgfVxuXG4gIGxldCBtb250aGx5RmVlV2l0aEJhc2UgPSBmb3JtYXREZWNpbWFsKFxuICAgIChjYWxjdWxhdGVkUHJpY2VzLmdydW5kcHJlaXMgKyBjYWxjdWxhdGVkUHJpY2VzLmJhc2VGZWUgKiAxMikgLyAxMlxuICApO1xuICAvLyAvLyBTZXQgUHJpY2UgRGF0YVxuICBnZXRFbGVtZW50QnlYcGF0aChcbiAgICAnLy8qW0BpZD1cIjJuZC10YXJpZi10aWxlXCJdL2Rpdls0XSdcbiAgKS5pbm5lckhUTUwgPSBgQWJzY2hsYWcgIDxiPiR7Zm9ybWF0RGVjaW1hbChcbiAgICBjYWxjdWxhdGVkUHJpY2VzLmFic2NobGFnXG4gICl9IEVVUiAvIE1vbmF0IDwvYj5gO1xuICBnZXRFbGVtZW50QnlYcGF0aChcbiAgICAnLy8qW0BpZD1cIjNyZC10YXJpZi10aWxlXCJdL2Rpdls0XSdcbiAgKS5pbm5lckhUTUwgPSBgQWJzY2hsYWcgPGI+JHtmb3JtYXREZWNpbWFsKFxuICAgIGNhbGN1bGF0ZWRQcmljZXMuYWJzY2hsYWdcbiAgKX0gRVVSIC8gTW9uYXQ8L2I+YDtcbiAgLy8gZ2V0RWxlbWVudEJ5WHBhdGgoXG4gIC8vICAgJy8vKltAaWQ9XCIxc3QtdGFyaWYtdGlsZVwiXS9kaXZbM10nXG4gIC8vICkuaW5uZXJIVE1MID0gYEdydW5kcHJlaXMgJHtjYWxjdWxhdGVkUHJpY2VzLmdydW5kcHJlaXN9IEVVUiAvIEphaHJgO1xuICBnZXRFbGVtZW50QnlYcGF0aChcbiAgICAnLy8qW0BpZD1cIjJuZC10YXJpZi10aWxlXCJdL2RpdlszXSdcbiAgKS5pbm5lckhUTUwgPSBgR3J1bmRnZWLDvGhyICR7bW9udGhseUZlZVdpdGhCYXNlfSBFVVIgLyBNb25hdGA7XG4gIGdldEVsZW1lbnRCeVhwYXRoKFxuICAgICcvLypbQGlkPVwiM3JkLXRhcmlmLXRpbGVcIl0vZGl2WzNdJ1xuICApLmlubmVySFRNTCA9IGBHcnVuZGdlYsO8aHIgJHttb250aGx5RmVlV2l0aEJhc2V9IEVVUiAvIE1vbmF0YDtcbiAgLy8gZ2V0RWxlbWVudEJ5WHBhdGgoXG4gIC8vICAgJy8vKltAaWQ9XCIxc3QtdGFyaWYtdGlsZVwiXS9kaXZbMl0nXG4gIC8vICkuaW5uZXJIVE1MID0gYCR7Y2FsY3VsYXRlZFByaWNlcy5hcmJlaXRzcHJlaXN9IGN0L0t3SGA7XG4gIGdldEVsZW1lbnRCeVhwYXRoKFxuICAgICcvLypbQGlkPVwiMm5kLXRhcmlmLXRpbGVcIl0vZGl2WzJdJ1xuICApLmlubmVySFRNTCA9IGAke2Zvcm1hdERlY2ltYWwoY2FsY3VsYXRlZFByaWNlcy5hcmJlaXRzcHJlaXMpfSBjdC9rV2hgO1xuICBnZXRFbGVtZW50QnlYcGF0aChcbiAgICAnLy8qW0BpZD1cIjNyZC10YXJpZi10aWxlXCJdL2RpdlsyXSdcbiAgKS5pbm5lckhUTUwgPSBgJHtmb3JtYXREZWNpbWFsKGNhbGN1bGF0ZWRQcmljZXMuYXJiZWl0c3ByZWlzKX0gY3Qva1doYDtcblxuICBnZXRFbGVtZW50QnlYcGF0aChcbiAgICAnLy8qW0BpZD1cIjJuZC10YXJpZi10aWxlXCJdL2Rpdls1XSdcbiAgKS5pbm5lckhUTUwgPSBgQWJow6RuZ2lnIHZvbiBkZWluZW0gYWt0dWVsbGVuIFZlcmJyYXVjaCA8YnIvPiAke25ldFN1ZmZpeH1gO1xuICBnZXRFbGVtZW50QnlYcGF0aChcbiAgICAnLy8qW0BpZD1cIjNyZC10YXJpZi10aWxlXCJdL2Rpdls1XSdcbiAgKS5pbm5lckhUTUwgPSBgQWJow6RuZ2lnIHZvbiBkZWluZW0gYWt0dWVsbGVuIFZlcmJyYXVjaCA8YnIvPiAke25ldFN1ZmZpeH1gO1xufTtcblxuY29uc3QgdXBkYXRlUGxhbkxpc3QgPSAoaW5pdGlhbDogYm9vbGVhbikgPT4ge1xuICBhdmFpbGFibGVDb250cmFjdFBsYW5zLm1hcCgoeyBpZCwgYnV0dG9uU2VsZWN0b3JJZCwgbmFtZSB9LCBpbmRleCkgPT4ge1xuICAgIGlmIChpbml0aWFsKSB7XG4gICAgICBkb2N1bWVudFxuICAgICAgICAuZ2V0RWxlbWVudEJ5SWQoYnV0dG9uU2VsZWN0b3JJZClcbiAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VsZWN0UGxhbihpZCkpO1xuICAgIH1cbiAgICBsZXQgYnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYnV0dG9uU2VsZWN0b3JJZCkgYXMgSFRNTExpbmtFbGVtZW50O1xuICAgIGJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdkaXNhYmxlZCcpO1xuICAgIGlmIChpZCA9PSBjb250cmFjdFN0YXRlLnNlbGVjdGVkUGxhbikge1xuICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2Rpc2FibGVkJyk7XG4gICAgICBzZWxlY3RlZFBsYW5OYW1lRWxlbWVudC5pbm5lckhUTUwgPSBuYW1lO1xuXG4gICAgICBjb25zdCBsaXN0V2lkdGggPSBwbGFuTGlzdEVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICBwbGFuTGlzdEVsZW1lbnQuc2Nyb2xsVG8oe1xuICAgICAgICBsZWZ0OiBsaXN0V2lkdGggKiBpbmRleCxcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICBiZWhhdmlvcjogJ2luc3RhbnQnLFxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IHNlbGVjdFBsYW4gPSAocGxhbklkOiBzdHJpbmcpID0+IChldmVudCkgPT4ge1xuICBpZiAocGxhbklkID09ICcxc3QtdGFyaWYtdGlsZScgfHwgcGxhbklkID09ICdoZWF0cHVtcC10YXJpZi10aWxlJykge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250cmFjdC1mb3JtLXN1Ym1pdCcpLmlubmVySFRNTCA9XG4gICAgICAnVGFyaWYgYW5mcmFnZW4nO1xuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250cmFjdC1mb3JtLXN1Ym1pdCcpLmlubmVySFRNTCA9XG4gICAgICAnS29zdGVucGZsaWNodGlnIDxicj5hYnNjaGxpZcOfZW48YnI+4oCNJztcbiAgfVxuXG4gIGNvbnRyYWN0U3RhdGUuc2VsZWN0ZWRQbGFuID0gcGxhbklkO1xuICB1cGRhdGVQbGFuTGlzdChmYWxzZSk7XG4gIGRvY3VtZW50XG4gICAgLmdldEVsZW1lbnRCeUlkKCdjb250cmFjdC1mb3JtLXN1Ym1pdCcpXG4gICAgLnNjcm9sbEludG9WaWV3KHsgYmVoYXZpb3I6ICdzbW9vdGgnIH0pO1xufTtcblxuY29uc3QgbmF2aWdhdGVQbGFucyA9IChkaXJlY3Rpb246IG51bWJlcikgPT4gKGV2ZW50KSA9PiB7XG4gIGlmICghcGxhbkxpc3RFbGVtZW50KSByZXR1cm47XG5cbiAgY29uc3QgbGlzdFdpZHRoID0gcGxhbkxpc3RFbGVtZW50Lm9mZnNldFdpZHRoO1xuICBjb25zdCBjdXJyZW50U2Nyb2xsUG9zaXRpb24gPSBwbGFuTGlzdEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgbGV0IG5ld1Njcm9sbFBvc2l0aW9uID0gY3VycmVudFNjcm9sbFBvc2l0aW9uICsgbGlzdFdpZHRoICogZGlyZWN0aW9uO1xuICBpZiAobmV3U2Nyb2xsUG9zaXRpb24gPj0gbGlzdFdpZHRoICogYXZhaWxhYmxlQ29udHJhY3RQbGFucy5sZW5ndGgpIHtcbiAgICBuZXdTY3JvbGxQb3NpdGlvbiA9IDA7XG4gIH0gZWxzZSBpZiAobmV3U2Nyb2xsUG9zaXRpb24gPCAwKSB7XG4gICAgbmV3U2Nyb2xsUG9zaXRpb24gPSBsaXN0V2lkdGggKiAoYXZhaWxhYmxlQ29udHJhY3RQbGFucy5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIHBsYW5MaXN0RWxlbWVudC5zY3JvbGxUbyh7XG4gICAgbGVmdDogbmV3U2Nyb2xsUG9zaXRpb24sXG4gICAgdG9wOiAwLFxuICAgIGJlaGF2aW9yOiAnc21vb3RoJyxcbiAgfSk7XG59O1xuXG5jb25zdCB3YWl0ID0gYXN5bmMgKG1zOiBudW1iZXIpID0+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG59O1xuXG5mdW5jdGlvbiBnZXRFbGVtZW50QnlYcGF0aChwYXRoKTogSFRNTEVsZW1lbnQge1xuICByZXR1cm4gZG9jdW1lbnQuZXZhbHVhdGUoXG4gICAgcGF0aCxcbiAgICBkb2N1bWVudCxcbiAgICBudWxsLFxuICAgIFhQYXRoUmVzdWx0LkZJUlNUX09SREVSRURfTk9ERV9UWVBFLFxuICAgIG51bGxcbiAgKS5zaW5nbGVOb2RlVmFsdWUgYXMgSFRNTEVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERlY2ltYWwobnVtYmVyVmFsdWU6IG51bWJlcikge1xuICAvLyBAdHMtaWdub3JlXG4gIHJldHVybiBudW1iZXJWYWx1ZS50b0ZpeGVkKDIpLnRvTG9jYWxlU3RyaW5nKCdkZS1ERScpLnJlcGxhY2UoJy4nLCAnLCcpO1xufVxuIiwiaW1wb3J0IHsgaW5pdCB9IGZyb20gJy4vY29udHJhY3RQYWdlJztcbmltcG9ydCB7IGNhbGN1bGF0ZVByaWNlIH0gZnJvbSAnLi9wcmljZUNhbGN1bGF0aW9uJztcblxuYXN5bmMgZnVuY3Rpb24gbWFpbigpIHtcbiAgaW5pdCgpO1xuICBhc3luYyBmdW5jdGlvbiBsb2dTdWJtaXQoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgbGV0IGZvcm0gPSB7XG4gICAgICBlbmVyZ3lDb25zdW1lcjogKFxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgICAgICAnZm9ybS1maWVsZC1lbmVyZ3ktY29uc3VtZXInXG4gICAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudFxuICAgICAgKS52YWx1ZSBhcyAnY29tbWVyY2lhbCcgfCAncHJpdmF0ZScgfCAnaGVhdCcsXG4gICAgICB6aXBDb2RlOiAoXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLWZpZWxkLXppcC1jb2RlJykgYXMgSFRNTElucHV0RWxlbWVudFxuICAgICAgKS52YWx1ZSxcbiAgICAgIGNvbnN1bXB0aW9uOiAoXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgICAgICdmb3JtLWZpZWxkLXllYXJseS1jb25zdW1wdGlvbidcbiAgICAgICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50XG4gICAgICApLnZhbHVlLFxuICAgIH07XG4gICAgbGV0IHByaWNlcyA9IGF3YWl0IGNhbGN1bGF0ZVByaWNlKFxuICAgICAgZm9ybS56aXBDb2RlLFxuICAgICAgcGFyc2VJbnQoZm9ybS5jb25zdW1wdGlvbiksXG4gICAgICBmb3JtLmVuZXJneUNvbnN1bWVyXG4gICAgKTtcblxuICAgIGlmICghcHJpY2VzKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY2FsY3VsYXRlIHByaWNlcycpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBwcmljZXNOZXQgPSBmb3JtLmVuZXJneUNvbnN1bWVyID09ICdjb21tZXJjaWFsJztcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3b3JraW5nLXByaWNlLXRleHQnKS5pbm5lckhUTUwgPSBgJHtcbiAgICAgIHByaWNlc05ldCA/ICduZXR0bycgOiAnYnJ1dHRvJ1xuICAgIH0gJHtwcmljZXMuYXJiZWl0c3ByZWlzfSBDZW50L2tXaGA7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jhc2UtcHJpY2UtdGV4dCcpLmlubmVySFRNTCA9IGAke1xuICAgICAgcHJpY2VzTmV0ID8gJ25ldHRvJyA6ICdicnV0dG8nXG4gICAgfSAke3ByaWNlcy5ncnVuZHByZWlzfSBFVVIvSmFocmA7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAnbW9udGhseS1mZWUtdGV4dCdcbiAgICApLmlubmVySFRNTCA9IGBicnV0dG8gJHtwcmljZXMuYWJzY2hsYWd9IEVVUmA7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZnVuZC10ZXh0JykuaW5uZXJIVE1MID0gYCR7XG4gICAgICBwcmljZXNOZXQgPyAnbmV0dG8nIDogJ2JydXR0bydcbiAgICB9ICR7cHJpY2VzLmVyc3RhdHR1bmd9IENlbnQva1doYDtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29zdC1jYWxjLXRhYmxlJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIH1cblxuICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dmLWZvcm0tRmFpcnN0ZXItQ2FsY3VsYXRpb24nKTtcbiAgZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBsb2dTdWJtaXQpO1xufVxuXG50cnkge1xuICBtYWluKCk7XG59IGNhdGNoIChlKSB7XG4gIGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcbn1cbiIsInR5cGUgUHJpY2VSZXN1bHRUeXBlID0ge1xuICBhcmJlaXRzcHJlaXM6IG51bWJlcjtcbiAgZ3J1bmRwcmVpczogbnVtYmVyO1xuICBhYnNjaGxhZzogbnVtYmVyO1xuICBlcnN0YXR0dW5nOiBudW1iZXI7XG4gIGJhc2VGZWU6IG51bWJlcjtcbn07XG5cbnR5cGUgQXBpUmVzcG9uc2UgPSB7XG4gIGNhbGN1bGF0aW9uOiB7XG4gICAgd29ya2luZ1ByaWNlUGVyS3dIOiBudW1iZXI7XG4gICAgYmFzZVByaWNlUGVyWWVhck5ldHdvcmtVc2FnZTogbnVtYmVyO1xuICAgIG1vbnRobHlGZWU6IG51bWJlcjtcbiAgICByZWZ1bmQ6IG51bWJlcjtcbiAgICBiYXNlRmVlUGVyTW9udGg6IG51bWJlcjtcbiAgfTtcbiAgcGxhbnM6IEFycmF5PHtcbiAgICBpZDogc3RyaW5nO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBkdXJhdGlvbkluTW9udGhzOiBudW1iZXI7XG4gICAgZW5kRGF0ZTogc3RyaW5nO1xuICAgIHZhdEluZm86IHN0cmluZztcbiAgICBtb250aGx5RmVlOiBudW1iZXI7XG4gICAgeWVhcmx5QmFzZUZlZTogbnVtYmVyO1xuICAgIGNvbnN1bXB0aW9uUHJpY2U6IG51bWJlcjtcbiAgICB0b3RhbENvc3RzUGVyWWVhcjogbnVtYmVyO1xuICB9PjtcbiAgbGVnYWxEb2N1bWVudHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59O1xuXG5leHBvcnQgY29uc3QgY2FsY3VsYXRlUHJpY2UgPSBhc3luYyAoXG4gIHppcENvZGU6IHN0cmluZyxcbiAgY29uc3VtcHRpb25Ld0g6IG51bWJlcixcbiAgdHlwZTogJ2NvbW1lcmNpYWwnIHwgJ3ByaXZhdGUnIHwgJ2hlYXQnLFxuICBkZWxpdmVyeUNpdHk/OiBzdHJpbmcsXG4gIGRlbGl2ZXJ5U3RyZWV0Pzogc3RyaW5nLFxuICBkZWxpdmVyeUhvdXNlTnVtYmVyPzogc3RyaW5nXG4pOiBQcm9taXNlPFByaWNlUmVzdWx0VHlwZSB8IG51bGw+ID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBNYXAgdHlwZSB0byBjdXN0b21lclR5cGVcbiAgICBjb25zdCBjdXN0b21lclR5cGUgPVxuICAgICAgdHlwZSA9PT0gJ3ByaXZhdGUnXG4gICAgICAgID8gJ2luZGl2aWR1YWwnXG4gICAgICAgIDogdHlwZSA9PT0gJ2NvbW1lcmNpYWwnXG4gICAgICAgID8gJ2NvbXBhbnknXG4gICAgICAgIDogJ2luZGl2aWR1YWwnO1xuXG4gICAgLy8gTWFwIHR5cGUgdG8gcG93ZXJUeXBlXG4gICAgY29uc3QgcG93ZXJUeXBlID0gdHlwZSA9PT0gJ2hlYXQnID8gJ2hlYXQnIDogJ2VsZWN0cmljaXR5JztcblxuICAgIC8vIFByZXBhcmUgQVBJIHBheWxvYWRcbiAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgY3VzdG9tZXJUeXBlOiBjdXN0b21lclR5cGUsXG4gICAgICBkZWxpdmVyeVppcENvZGU6IHppcENvZGUsXG4gICAgICBkZWxpdmVyeUNpdHk6IGRlbGl2ZXJ5Q2l0eSB8fCAnJyxcbiAgICAgIGRlbGl2ZXJ5U3RyZWV0OiBkZWxpdmVyeVN0cmVldCB8fCAnJyxcbiAgICAgIGRlbGl2ZXJ5SG91c2VOdW1iZXI6IGRlbGl2ZXJ5SG91c2VOdW1iZXIgfHwgJycsXG4gICAgICBwb3dlclR5cGU6IHBvd2VyVHlwZSxcbiAgICAgIHllYXJseUNvbnN1bXB0aW9uOiBjb25zdW1wdGlvbkt3SC50b1N0cmluZygpLFxuICAgIH07XG5cbiAgICAvLyBNYWtlIEFQSSBjYWxsXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcbiAgICAgICdodHRwczovL2ZhaXJzdGVyLWJhY2tlbmQuYXp1cmV3ZWJzaXRlcy5uZXQvYXBpL3BsYW5zL2NhbGN1bGF0ZScsXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXG4gICAgICB9XG4gICAgKTtcblxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0FQSSBjYWxsIGZhaWxlZDonLCByZXNwb25zZS5zdGF0dXMsIHJlc3BvbnNlLnN0YXR1c1RleHQpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZGF0YTogQXBpUmVzcG9uc2UgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG5cbiAgICAvLyBNYXAgQVBJIHJlc3BvbnNlIHRvIHJldHVybiB0eXBlIHVzaW5nIGNhbGN1bGF0aW9uIHZhbHVlc1xuICAgIHJldHVybiB7XG4gICAgICBhcmJlaXRzcHJlaXM6IGRhdGEuY2FsY3VsYXRpb24ud29ya2luZ1ByaWNlUGVyS3dILFxuICAgICAgZ3J1bmRwcmVpczogZGF0YS5jYWxjdWxhdGlvbi5iYXNlUHJpY2VQZXJZZWFyTmV0d29ya1VzYWdlLFxuICAgICAgYWJzY2hsYWc6IGRhdGEuY2FsY3VsYXRpb24ubW9udGhseUZlZSxcbiAgICAgIGVyc3RhdHR1bmc6IGRhdGEuY2FsY3VsYXRpb24ucmVmdW5kLFxuICAgICAgYmFzZUZlZTogZGF0YS5jYWxjdWxhdGlvbi5iYXNlRmVlUGVyTW9udGgsXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjYWxjdWxhdGluZyBwcmljZTonLCBlcnJvcik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDE1Nik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=