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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mYWlyc3Rlci5kZS8uL3NyYy9jb250cmFjdFBhZ2UudHMiLCJ3ZWJwYWNrOi8vZmFpcnN0ZXIuZGUvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZmFpcnN0ZXIuZGUvLi9zcmMvcHJpY2VDYWxjdWxhdGlvbi50cyIsIndlYnBhY2s6Ly9mYWlyc3Rlci5kZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9mYWlyc3Rlci5kZS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2ZhaXJzdGVyLmRlL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9mYWlyc3Rlci5kZS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY2FsY3VsYXRlUHJpY2UgfSBmcm9tICcuL3ByaWNlQ2FsY3VsYXRpb24nO1xuXG4vLyBjb25zdCBhcGlVcmwgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MzMzNFwiO1xuLy8gY29uc3QgYXBpVXJsID0gXCJodHRwczovL2ZhaXJzdGVyLmNvZGU4LmRldlwiO1xuY29uc3QgYXBpVXJsID0gJ2h0dHBzOi8vZmFpcnN0ZXItYmFja2VuZC5henVyZXdlYnNpdGVzLm5ldC9hcGknO1xuY29uc3QgYXZhaWxhYmxlQ29udHJhY3RQbGFucyA9IFtcbiAge1xuICAgIGlkOiAnaGVhdHB1bXAtdGFyaWYtdGlsZScsXG4gICAgbmFtZTogJ1fDpHJtZXB1bXBlbiBUYXJpZicsXG4gICAgYnV0dG9uU2VsZWN0b3JJZDogJ2hlYXQtc2VsZWN0LWJ1dHRvbicsXG4gIH0sXG4gIHtcbiAgICBpZDogJzFzdC10YXJpZi10aWxlJyxcbiAgICBuYW1lOiAnMSBNb25hdHMgVGFyaWYnLFxuICAgIGJ1dHRvblNlbGVjdG9ySWQ6ICdvbmUtbW9udGgtc2VsZWN0LWJ1dHRvbicsXG4gIH0sXG4gIHtcbiAgICBpZDogJzJuZC10YXJpZi10aWxlJyxcbiAgICBuYW1lOiAnMTIgTW9uYXRzIFRhcmlmJyxcbiAgICBidXR0b25TZWxlY3RvcklkOiAnMTItbW9udGhzLXNlbGVjdC1idXR0b24nLFxuICB9LFxuICB7XG4gICAgaWQ6ICczcmQtdGFyaWYtdGlsZScsXG4gICAgbmFtZTogJzI0IE1vbmF0cyBUYXJpZicsXG4gICAgYnV0dG9uU2VsZWN0b3JJZDogJzI0LW1vbnRocy1zZWxlY3QtYnV0dG9uJyxcbiAgfSxcbl07XG5jb25zdCBpZFBsYW5NYXBwaW5nID0ge1xuICAnaGVhdHB1bXAtdGFyaWYtdGlsZSc6ICdXw6RybWVwdW1wZW4gVGFyaWYnLFxuICAnMXN0LXRhcmlmLXRpbGUnOiAnMSBNb25hdHMgVGFyaWYnLFxuICAnMm5kLXRhcmlmLXRpbGUnOiAnMTIgTW9uYXRzIFRhcmlmJyxcbiAgJzNyZC10YXJpZi10aWxlJzogJzI0IE1vbmF0cyBUYXJpZicsXG59O1xuY29uc3QgY29udHJhY3RTdGF0ZSA9IHtcbiAgaWQ6IG51bGwsXG4gIHNlbGVjdGVkUGxhbjogJzJuZC10YXJpZi10aWxlJyxcbiAgY2FsY3VsYXRpb246IG51bGwsXG4gIHBsYW5UeXBlOiAnJyxcbiAgbGVnYWxDb25zZW50czogW10sXG4gIGxlZ2FsVGVybXM6IHtcbiAgICB2ZXJ0cmFnc2JlZGluZ3VuZ2VuOiAnJyxcbiAgICBhbGxnU3Ryb21saWVmZXJiZWRpbmd1bmdlbjogJycsXG4gICAgcHJlaXNCZXN0aW1tdW5nZW46ICcnLFxuICAgIHdpZGVycnVmc3JlY2h0OiAnJyxcbiAgfSxcbn07XG50eXBlIERhdGFSZXNwb25zZVR5cGUgPSB7XG4gIGlkOiBzdHJpbmc7XG4gIGVtYWlsOiBzdHJpbmc7XG4gIHBsYW46IHN0cmluZztcbiAgemlwQ29kZTogc3RyaW5nO1xuICB5ZWFybHlDb25zdW1wdGlvbkt3SDogbnVtYmVyO1xuICBzdGF0dXM6IHN0cmluZztcbiAgdXNlcjoge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgZW1haWw6IHN0cmluZztcbiAgICBpbnZvaWNlQWRkcmVzczogc3RyaW5nO1xuICAgIGZpcnN0TmFtZTogc3RyaW5nO1xuICAgIGxhc3ROYW1lOiBzdHJpbmc7XG4gICAgZGVsaXZlcnlBZGRyZXNzOiBzdHJpbmc7XG4gICAgbWV0ZXJJZDogc3RyaW5nO1xuICB9O1xufTtcbmxldCBjb250cmFjdERhdGE6IERhdGFSZXNwb25zZVR5cGUgPSBudWxsO1xubGV0IGNvbnRyYWN0TmFtZUVsZW1lbnQ6IEhUTUxFbGVtZW50O1xubGV0IGNvbnRyYWN0QWRkcmVzc0VsZW1lbnQ6IEhUTUxFbGVtZW50O1xubGV0IGNvbnRyYWN0RGVsaXZlcnlBZGRyZXNzRWxlbWVudDogSFRNTEVsZW1lbnQ7XG5sZXQgY29udHJhY3RNZXRlcklkRWxlbWVudDogSFRNTEVsZW1lbnQ7XG5sZXQgcGxhbkxpc3RFbGVtZW50OiBIVE1MRWxlbWVudDtcbmxldCBzZWxlY3RlZFBsYW5OYW1lRWxlbWVudDogSFRNTEVsZW1lbnQ7XG5cbmNvbnN0IG9uU3VibWl0ID0gYXN5bmMgKCkgPT4ge1xuICBpZiAoXG4gICAgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZWdhbC1jb25zZW50LWNoZWNrYm94JykgYXMgSFRNTEZvcm1FbGVtZW50KVxuICAgICAgLmNoZWNrZWQgPT0gZmFsc2VcbiAgKSB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xlZ2FsLWNvbnNlbnQtY2hlY2snKS5jbGFzc0xpc3QuYWRkKCdoaWdobGlnaHQnKTtcbiAgICBhd2FpdCB3YWl0KDIwMDApO1xuICAgIGRvY3VtZW50XG4gICAgICAuZ2V0RWxlbWVudEJ5SWQoJ2xlZ2FsLWNvbnNlbnQtY2hlY2snKVxuICAgICAgLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZ2hsaWdodCcpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb250cmFjdFN0YXRlLmxlZ2FsQ29uc2VudHMgPSBbXG4gICAgZ2V0RWxlbWVudEJ5WHBhdGgoJy8vKltAaWQ9XCJsZWdhbC1jb25zZW50LWNoZWNrXCJdL3NwYW4nKS5pbm5lclRleHQsXG4gICAgZ2V0RWxlbWVudEJ5WHBhdGgoJy8vKltAaWQ9XCJ3Zi1mb3JtLWNvbnRyYWN0Rm9ybVwiXS9zZWN0aW9uWzVdL2RpdicpXG4gICAgICAuaW5uZXJUZXh0LFxuICBdO1xuXG4gIGxldCByZXN1bHQgPSBhd2FpdCBmZXRjaChgJHthcGlVcmx9L29mZmVyLyR7Y29udHJhY3RTdGF0ZS5pZH1gLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgY29udHJhY3RTdGF0ZSxcbiAgICAgIHNlbGVjdGVkUGxhbjogaWRQbGFuTWFwcGluZ1tjb250cmFjdFN0YXRlLnNlbGVjdGVkUGxhbl0sXG4gICAgfSksXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9LFxuICB9KTtcbiAgd2luZG93LnNjcm9sbFRvKHtcbiAgICB0b3A6IDAsXG4gICAgbGVmdDogMCxcbiAgICBiZWhhdmlvcjogJ3Ntb290aCcsXG4gIH0pO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZy1zdWJoZWFkZXInKS5pbm5lckhUTUwgPSAnQW5nZWJvdCBiZXN0w6R0aWd0JztcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRpbmctY292ZXInKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdCgpIHtcbiAgLy8gRG8gc3R1ZmYgb25seSBpZiBvbiBjb250cmFjdC1wYWdlXG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgIT09ICcvY29udHJhY3QnKSByZXR1cm47XG5cbiAgbGV0IGhhc1NlZW5Mb2FkaW5nRm9yQXRMZWFzdFR3b1NlY29uZHMgPSBmYWxzZTtcbiAgLy8gTG9hZCBDb250cmFjdCBEZXRhaWxzXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGhhc1NlZW5Mb2FkaW5nRm9yQXRMZWFzdFR3b1NlY29uZHMgPSB0cnVlO1xuICB9LCAyMDAwKTtcbiAgYXdhaXQgbG9hZENvbnRyYWN0RGV0YWlscygpO1xuXG4gIC8vIGluaXRpYWxpemUgaW50ZXJmYWNlXG4gIHBsYW5MaXN0RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGFuLWxpc3Qtc2VsZWN0b3InKTtcbiAgc2VsZWN0ZWRQbGFuTmFtZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VsZWN0ZWQtcGxhbi10aXRsZS10ZXh0Jyk7XG4gIHVwZGF0ZVBsYW5MaXN0KHRydWUpO1xuXG4gIHdoaWxlICghaGFzU2VlbkxvYWRpbmdGb3JBdExlYXN0VHdvU2Vjb25kcykge1xuICAgIGF3YWl0IHdhaXQoMjAwKTtcbiAgfVxuICBpZiAoY29udHJhY3REYXRhLnN0YXR1cyAhPT0gJ3NpZ25lZCcpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZy1jb3ZlcicpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZy1zdWJoZWFkZXInKS5pbm5lckhUTUwgPVxuICAgICAgJ0FuZ2Vib3QgYmVyZWl0cyBiZXN0w6R0aWd0JztcbiAgfVxuICBjb25zb2xlLmxvZygnR290IGRhdGEgYW5kIHJlYWR5Jyk7XG5cbiAgLy8gUmVnaXN0ZXIgZXZlbnRzXG4gIGRvY3VtZW50XG4gICAgLmdldEVsZW1lbnRCeUlkKCdwbGFuLW5hdi1sZWZ0JylcbiAgICAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBuYXZpZ2F0ZVBsYW5zKC0xKSk7XG4gIGRvY3VtZW50XG4gICAgLmdldEVsZW1lbnRCeUlkKCdwbGFuLW5hdi1yaWdodCcpXG4gICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbmF2aWdhdGVQbGFucygxKSk7XG4gIGRvY3VtZW50XG4gICAgLmdldEVsZW1lbnRCeUlkKCdjb250cmFjdC1mb3JtLXN1Ym1pdCcpXG4gICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25TdWJtaXQpO1xuXG4gIGF2YWlsYWJsZUNvbnRyYWN0UGxhbnMubWFwKCh7IGlkLCBidXR0b25TZWxlY3RvcklkLCBuYW1lIH0sIGluZGV4KSA9PiB7XG4gICAgbGV0IGJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGJ1dHRvblNlbGVjdG9ySWQpIGFzIEhUTUxMaW5rRWxlbWVudDtcbiAgICBidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnZGlzYWJsZWQnKTtcbiAgfSk7XG59XG5cbmNvbnN0IGxvYWRDb250cmFjdERldGFpbHMgPSBhc3luYyAoKSA9PiB7XG4gIGxldCBvZmZlcklkID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gIG9mZmVySWQgPSBvZmZlcklkLnNsaWNlKDEsIG9mZmVySWQubGVuZ3RoKTtcbiAgY29udHJhY3RTdGF0ZS5pZCA9IG9mZmVySWQ7XG5cbiAgY29uc3QgY29udHJhY3REYXRhUmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHthcGlVcmx9L29mZmVyLyR7b2ZmZXJJZH1gLCB7fSk7XG4gIGNvbnRyYWN0RGF0YSA9IGF3YWl0IGNvbnRyYWN0RGF0YVJlc3BvbnNlLmpzb24oKTtcblxuICBjb250cmFjdE5hbWVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyYWN0LWRhdGEtbmFtZScpO1xuICBjb250cmFjdEFkZHJlc3NFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyYWN0LWRhdGEtYWRkcmVzcycpO1xuICBjb250cmFjdERlbGl2ZXJ5QWRkcmVzc0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAnY29udHJhY3QtZGF0YS1kZWxpdmVyeS1hZGRyZXNzJ1xuICApO1xuICBjb250cmFjdE1ldGVySWRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyYWN0LWRhdGEtbWV0ZXItaWQnKTtcblxuICAvLyBQYXJzZSBkZWxpdmVyeSBhZGRyZXNzOiBcIjEwMjQ1IEJlcmxpbiwgU3RyYcOfbWFubnN0cmFzc2UgMjVcIlxuICBsZXQgZGVsaXZlcnlDaXR5ID0gJyc7XG4gIGxldCBkZWxpdmVyeVN0cmVldCA9ICcnO1xuICBsZXQgZGVsaXZlcnlIb3VzZU51bWJlciA9ICcnO1xuXG4gIGlmIChjb250cmFjdERhdGEudXNlcj8uZGVsaXZlcnlBZGRyZXNzKSB7XG4gICAgY29uc3QgYWRkcmVzc01hdGNoID0gY29udHJhY3REYXRhLnVzZXIuZGVsaXZlcnlBZGRyZXNzLm1hdGNoKFxuICAgICAgL15cXGQrXFxzKyhbXixdKyksXFxzKyguKz8pXFxzKyhcXGQrKSQvXG4gICAgKTtcbiAgICBpZiAoYWRkcmVzc01hdGNoKSB7XG4gICAgICBkZWxpdmVyeUNpdHkgPSBhZGRyZXNzTWF0Y2hbMV0udHJpbSgpO1xuICAgICAgZGVsaXZlcnlTdHJlZXQgPSBhZGRyZXNzTWF0Y2hbMl0udHJpbSgpO1xuICAgICAgZGVsaXZlcnlIb3VzZU51bWJlciA9IGFkZHJlc3NNYXRjaFszXS50cmltKCk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2FsY3VsYXRlZFByaWNlcyA9IGF3YWl0IGNhbGN1bGF0ZVByaWNlKFxuICAgIGNvbnRyYWN0RGF0YS56aXBDb2RlLFxuICAgIGNvbnRyYWN0RGF0YS55ZWFybHlDb25zdW1wdGlvbkt3SCxcbiAgICBjb250cmFjdERhdGEucGxhbiBhcyAnY29tbWVyY2lhbCcgfCAncHJpdmF0ZScgfCAnaGVhdCcsXG4gICAgZGVsaXZlcnlDaXR5LFxuICAgIGRlbGl2ZXJ5U3RyZWV0LFxuICAgIGRlbGl2ZXJ5SG91c2VOdW1iZXJcbiAgKTtcbiAgY29uc29sZS5sb2coJ0NhbGN1bGF0ZWQgcHJpY2UnLCBjYWxjdWxhdGVkUHJpY2VzLCBjb250cmFjdERhdGEpO1xuICBjb250cmFjdFN0YXRlLmNhbGN1bGF0aW9uID0gY2FsY3VsYXRlZFByaWNlcztcbiAgY29udHJhY3RTdGF0ZS5wbGFuVHlwZSA9IGNvbnRyYWN0RGF0YS5wbGFuO1xuXG4gIGlmIChjb250cmFjdERhdGEucGxhbiA9PSAnY29tbWVyY2lhbCcpIHtcbiAgICAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xlZ2FsLXRlcm1zLWxpbmsnKSBhcyBIVE1MQW5jaG9yRWxlbWVudCkuaHJlZiA9XG4gICAgICAnaHR0cHM6Ly9jZG4uc2hvcGlmeS5jb20vcy9maWxlcy8xLzA3NDIvMTM4MS84NjMyL2ZpbGVzL1N0cm9tbGllZmVydmVydHJhZ19mYWlyc3Rlcl9vbmxpbmVfR2V3ZXJiZWt1bmRlbi5wZGY/dj0xNzMwMzkzNjI5JztcbiAgICAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlbGl2ZXJ5LXRlcm1zLWxpbmsnKSBhcyBIVE1MQW5jaG9yRWxlbWVudCkuaHJlZiA9XG4gICAgICAnaHR0cHM6Ly9jZG4uc2hvcGlmeS5jb20vcy9maWxlcy8xLzA3NDIvMTM4MS84NjMyL2ZpbGVzL0FMQl9BbmxhZ2VfMV9mYWlyc3Rlcl9HZXdlcmJla3VuZGVuLnBkZj92PTE3MzAzOTM2MjknO1xuICAgIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJpY2UtdGVybXMtbGluaycpIGFzIEhUTUxBbmNob3JFbGVtZW50KS5ocmVmID1cbiAgICAgICdodHRwczovL2Nkbi5zaG9waWZ5LmNvbS9zL2ZpbGVzLzEvMDc0Mi8xMzgxLzg2MzIvZmlsZXMvQW5sYWdlXzJfZmFpcnN0ZXJfUHJlaXNibGF0dF9HZXdlcmJla3VuZGVuLnBkZj92PTE3MzAzOTM2MjgnO1xuICAgIChcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgICAnZGVsaXZlcnktbGVnYWwtdGVybXMtZm9vdGVyJ1xuICAgICAgKSBhcyBIVE1MQW5jaG9yRWxlbWVudFxuICAgICkuaHJlZiA9XG4gICAgICAnaHR0cHM6Ly9jZG4uc2hvcGlmeS5jb20vcy9maWxlcy8xLzA3NDIvMTM4MS84NjMyL2ZpbGVzL0FMQl9BbmxhZ2VfMV9mYWlyc3Rlcl9HZXdlcmJla3VuZGVuLnBkZj92PTE3MzAzOTM2MjknO1xuICB9XG4gIGNvbnRyYWN0U3RhdGUubGVnYWxUZXJtcy52ZXJ0cmFnc2JlZGluZ3VuZ2VuID0gKFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZWdhbC10ZXJtcy1saW5rJykgYXMgSFRNTEFuY2hvckVsZW1lbnRcbiAgKS5ocmVmO1xuICBjb250cmFjdFN0YXRlLmxlZ2FsVGVybXMuYWxsZ1N0cm9tbGllZmVyYmVkaW5ndW5nZW4gPSAoXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlbGl2ZXJ5LXRlcm1zLWxpbmsnKSBhcyBIVE1MQW5jaG9yRWxlbWVudFxuICApLmhyZWY7XG4gIGNvbnRyYWN0U3RhdGUubGVnYWxUZXJtcy5wcmVpc0Jlc3RpbW11bmdlbiA9IChcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJpY2UtdGVybXMtbGluaycpIGFzIEhUTUxBbmNob3JFbGVtZW50XG4gICkuaHJlZjtcbiAgY29udHJhY3RTdGF0ZS5sZWdhbFRlcm1zLndpZGVycnVmc3JlY2h0ID0gKFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3aWRlcnJ1Zi1sZWdhbC10ZXJtcycpIGFzIEhUTUxBbmNob3JFbGVtZW50XG4gICkuaHJlZjtcblxuICBjb250cmFjdE5hbWVFbGVtZW50LmlubmVySFRNTCA9IGAke2NvbnRyYWN0RGF0YS51c2VyLmZpcnN0TmFtZX0gJHtjb250cmFjdERhdGEudXNlci5sYXN0TmFtZX1gO1xuICBjb250cmFjdEFkZHJlc3NFbGVtZW50LmlubmVySFRNTCA9IGNvbnRyYWN0RGF0YS51c2VyLmludm9pY2VBZGRyZXNzO1xuICBjb250cmFjdERlbGl2ZXJ5QWRkcmVzc0VsZW1lbnQuaW5uZXJIVE1MID0gY29udHJhY3REYXRhLnVzZXIuZGVsaXZlcnlBZGRyZXNzO1xuICBjb250cmFjdE1ldGVySWRFbGVtZW50LmlubmVySFRNTCA9IGNvbnRyYWN0RGF0YS51c2VyLm1ldGVySWQ7XG5cbiAgbGV0IG5ldFN1ZmZpeCA9ICdQcmVpc2UgaW5rbC4gTXdTdCc7XG4gIGlmIChjb250cmFjdERhdGEucGxhbiA9PSAnY29tbWVyY2lhbCcpIHtcbiAgICBuZXRTdWZmaXggPSAnUHJlaXNlIGV4a2wuIE13U3QnO1xuICB9XG5cbiAgbGV0IG1vbnRobHlGZWVXaXRoQmFzZSA9IGZvcm1hdERlY2ltYWwoXG4gICAgKGNhbGN1bGF0ZWRQcmljZXMuZ3J1bmRwcmVpcyArIGNhbGN1bGF0ZWRQcmljZXMuYmFzZUZlZSAqIDEyKSAvIDEyXG4gICk7XG4gIC8vIC8vIFNldCBQcmljZSBEYXRhXG4gIGdldEVsZW1lbnRCeVhwYXRoKFxuICAgICcvLypbQGlkPVwiMm5kLXRhcmlmLXRpbGVcIl0vZGl2WzRdJ1xuICApLmlubmVySFRNTCA9IGBBYnNjaGxhZyAgPGI+JHtmb3JtYXREZWNpbWFsKFxuICAgIGNhbGN1bGF0ZWRQcmljZXMuYWJzY2hsYWdcbiAgKX0gRVVSIC8gTW9uYXQgPC9iPmA7XG4gIGdldEVsZW1lbnRCeVhwYXRoKFxuICAgICcvLypbQGlkPVwiM3JkLXRhcmlmLXRpbGVcIl0vZGl2WzRdJ1xuICApLmlubmVySFRNTCA9IGBBYnNjaGxhZyA8Yj4ke2Zvcm1hdERlY2ltYWwoXG4gICAgY2FsY3VsYXRlZFByaWNlcy5hYnNjaGxhZ1xuICApfSBFVVIgLyBNb25hdDwvYj5gO1xuICAvLyBnZXRFbGVtZW50QnlYcGF0aChcbiAgLy8gICAnLy8qW0BpZD1cIjFzdC10YXJpZi10aWxlXCJdL2RpdlszXSdcbiAgLy8gKS5pbm5lckhUTUwgPSBgR3J1bmRwcmVpcyAke2NhbGN1bGF0ZWRQcmljZXMuZ3J1bmRwcmVpc30gRVVSIC8gSmFocmA7XG4gIGdldEVsZW1lbnRCeVhwYXRoKFxuICAgICcvLypbQGlkPVwiMm5kLXRhcmlmLXRpbGVcIl0vZGl2WzNdJ1xuICApLmlubmVySFRNTCA9IGBHcnVuZGdlYsO8aHIgJHttb250aGx5RmVlV2l0aEJhc2V9IEVVUiAvIE1vbmF0YDtcbiAgZ2V0RWxlbWVudEJ5WHBhdGgoXG4gICAgJy8vKltAaWQ9XCIzcmQtdGFyaWYtdGlsZVwiXS9kaXZbM10nXG4gICkuaW5uZXJIVE1MID0gYEdydW5kZ2Viw7xociAke21vbnRobHlGZWVXaXRoQmFzZX0gRVVSIC8gTW9uYXRgO1xuICAvLyBnZXRFbGVtZW50QnlYcGF0aChcbiAgLy8gICAnLy8qW0BpZD1cIjFzdC10YXJpZi10aWxlXCJdL2RpdlsyXSdcbiAgLy8gKS5pbm5lckhUTUwgPSBgJHtjYWxjdWxhdGVkUHJpY2VzLmFyYmVpdHNwcmVpc30gY3QvS3dIYDtcbiAgZ2V0RWxlbWVudEJ5WHBhdGgoXG4gICAgJy8vKltAaWQ9XCIybmQtdGFyaWYtdGlsZVwiXS9kaXZbMl0nXG4gICkuaW5uZXJIVE1MID0gYCR7Zm9ybWF0RGVjaW1hbChjYWxjdWxhdGVkUHJpY2VzLmFyYmVpdHNwcmVpcyl9IGN0L2tXaGA7XG4gIGdldEVsZW1lbnRCeVhwYXRoKFxuICAgICcvLypbQGlkPVwiM3JkLXRhcmlmLXRpbGVcIl0vZGl2WzJdJ1xuICApLmlubmVySFRNTCA9IGAke2Zvcm1hdERlY2ltYWwoY2FsY3VsYXRlZFByaWNlcy5hcmJlaXRzcHJlaXMpfSBjdC9rV2hgO1xuXG4gIGdldEVsZW1lbnRCeVhwYXRoKFxuICAgICcvLypbQGlkPVwiMm5kLXRhcmlmLXRpbGVcIl0vZGl2WzVdJ1xuICApLmlubmVySFRNTCA9IGBBYmjDpG5naWcgdm9uIGRlaW5lbSBha3R1ZWxsZW4gVmVyYnJhdWNoIDxici8+ICR7bmV0U3VmZml4fWA7XG4gIGdldEVsZW1lbnRCeVhwYXRoKFxuICAgICcvLypbQGlkPVwiM3JkLXRhcmlmLXRpbGVcIl0vZGl2WzVdJ1xuICApLmlubmVySFRNTCA9IGBBYmjDpG5naWcgdm9uIGRlaW5lbSBha3R1ZWxsZW4gVmVyYnJhdWNoIDxici8+ICR7bmV0U3VmZml4fWA7XG59O1xuXG5jb25zdCB1cGRhdGVQbGFuTGlzdCA9IChpbml0aWFsOiBib29sZWFuKSA9PiB7XG4gIGF2YWlsYWJsZUNvbnRyYWN0UGxhbnMubWFwKCh7IGlkLCBidXR0b25TZWxlY3RvcklkLCBuYW1lIH0sIGluZGV4KSA9PiB7XG4gICAgaWYgKGluaXRpYWwpIHtcbiAgICAgIGRvY3VtZW50XG4gICAgICAgIC5nZXRFbGVtZW50QnlJZChidXR0b25TZWxlY3RvcklkKVxuICAgICAgICAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxlY3RQbGFuKGlkKSk7XG4gICAgfVxuICAgIGxldCBidXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChidXR0b25TZWxlY3RvcklkKSBhcyBIVE1MTGlua0VsZW1lbnQ7XG4gICAgYnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVkJyk7XG4gICAgaWYgKGlkID09IGNvbnRyYWN0U3RhdGUuc2VsZWN0ZWRQbGFuKSB7XG4gICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKTtcbiAgICAgIHNlbGVjdGVkUGxhbk5hbWVFbGVtZW50LmlubmVySFRNTCA9IG5hbWU7XG5cbiAgICAgIGNvbnN0IGxpc3RXaWR0aCA9IHBsYW5MaXN0RWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgIHBsYW5MaXN0RWxlbWVudC5zY3JvbGxUbyh7XG4gICAgICAgIGxlZnQ6IGxpc3RXaWR0aCAqIGluZGV4LFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIGJlaGF2aW9yOiAnaW5zdGFudCcsXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3Qgc2VsZWN0UGxhbiA9IChwbGFuSWQ6IHN0cmluZykgPT4gKGV2ZW50KSA9PiB7XG4gIGlmIChwbGFuSWQgPT0gJzFzdC10YXJpZi10aWxlJyB8fCBwbGFuSWQgPT0gJ2hlYXRwdW1wLXRhcmlmLXRpbGUnKSB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyYWN0LWZvcm0tc3VibWl0JykuaW5uZXJIVE1MID1cbiAgICAgICdUYXJpZiBhbmZyYWdlbic7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyYWN0LWZvcm0tc3VibWl0JykuaW5uZXJIVE1MID1cbiAgICAgICdLb3N0ZW5wZmxpY2h0aWcgPGJyPmFic2NobGllw59lbjxicj7igI0nO1xuICB9XG5cbiAgY29udHJhY3RTdGF0ZS5zZWxlY3RlZFBsYW4gPSBwbGFuSWQ7XG4gIHVwZGF0ZVBsYW5MaXN0KGZhbHNlKTtcbiAgZG9jdW1lbnRcbiAgICAuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyYWN0LWZvcm0tc3VibWl0JylcbiAgICAuc2Nyb2xsSW50b1ZpZXcoeyBiZWhhdmlvcjogJ3Ntb290aCcgfSk7XG59O1xuXG5jb25zdCBuYXZpZ2F0ZVBsYW5zID0gKGRpcmVjdGlvbjogbnVtYmVyKSA9PiAoZXZlbnQpID0+IHtcbiAgaWYgKCFwbGFuTGlzdEVsZW1lbnQpIHJldHVybjtcblxuICBjb25zdCBsaXN0V2lkdGggPSBwbGFuTGlzdEVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gIGNvbnN0IGN1cnJlbnRTY3JvbGxQb3NpdGlvbiA9IHBsYW5MaXN0RWxlbWVudC5zY3JvbGxMZWZ0O1xuICBsZXQgbmV3U2Nyb2xsUG9zaXRpb24gPSBjdXJyZW50U2Nyb2xsUG9zaXRpb24gKyBsaXN0V2lkdGggKiBkaXJlY3Rpb247XG4gIGlmIChuZXdTY3JvbGxQb3NpdGlvbiA+PSBsaXN0V2lkdGggKiBhdmFpbGFibGVDb250cmFjdFBsYW5zLmxlbmd0aCkge1xuICAgIG5ld1Njcm9sbFBvc2l0aW9uID0gMDtcbiAgfSBlbHNlIGlmIChuZXdTY3JvbGxQb3NpdGlvbiA8IDApIHtcbiAgICBuZXdTY3JvbGxQb3NpdGlvbiA9IGxpc3RXaWR0aCAqIChhdmFpbGFibGVDb250cmFjdFBsYW5zLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcGxhbkxpc3RFbGVtZW50LnNjcm9sbFRvKHtcbiAgICBsZWZ0OiBuZXdTY3JvbGxQb3NpdGlvbixcbiAgICB0b3A6IDAsXG4gICAgYmVoYXZpb3I6ICdzbW9vdGgnLFxuICB9KTtcbn07XG5cbmNvbnN0IHdhaXQgPSBhc3luYyAobXM6IG51bWJlcikgPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbn07XG5cbmZ1bmN0aW9uIGdldEVsZW1lbnRCeVhwYXRoKHBhdGgpOiBIVE1MRWxlbWVudCB7XG4gIHJldHVybiBkb2N1bWVudC5ldmFsdWF0ZShcbiAgICBwYXRoLFxuICAgIGRvY3VtZW50LFxuICAgIG51bGwsXG4gICAgWFBhdGhSZXN1bHQuRklSU1RfT1JERVJFRF9OT0RFX1RZUEUsXG4gICAgbnVsbFxuICApLnNpbmdsZU5vZGVWYWx1ZSBhcyBIVE1MRWxlbWVudDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGVjaW1hbChudW1iZXJWYWx1ZTogbnVtYmVyKSB7XG4gIC8vIEB0cy1pZ25vcmVcbiAgcmV0dXJuIG51bWJlclZhbHVlLnRvRml4ZWQoMikudG9Mb2NhbGVTdHJpbmcoJ2RlLURFJykucmVwbGFjZSgnLicsICcsJyk7XG59XG4iLCJpbXBvcnQgeyBpbml0IH0gZnJvbSAnLi9jb250cmFjdFBhZ2UnO1xuaW1wb3J0IHsgY2FsY3VsYXRlUHJpY2UgfSBmcm9tICcuL3ByaWNlQ2FsY3VsYXRpb24nO1xuXG5hc3luYyBmdW5jdGlvbiBtYWluKCkge1xuICBpbml0KCk7XG4gIGFzeW5jIGZ1bmN0aW9uIGxvZ1N1Ym1pdChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICBsZXQgZm9ybSA9IHtcbiAgICAgIGVuZXJneUNvbnN1bWVyOiAoXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgICAgICdmb3JtLWZpZWxkLWVuZXJneS1jb25zdW1lcidcbiAgICAgICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50XG4gICAgICApLnZhbHVlIGFzICdjb21tZXJjaWFsJyB8ICdwcml2YXRlJyB8ICdoZWF0JyxcbiAgICAgIHppcENvZGU6IChcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tZmllbGQtemlwLWNvZGUnKSBhcyBIVE1MSW5wdXRFbGVtZW50XG4gICAgICApLnZhbHVlLFxuICAgICAgY29uc3VtcHRpb246IChcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAgICAgJ2Zvcm0tZmllbGQteWVhcmx5LWNvbnN1bXB0aW9uJ1xuICAgICAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnRcbiAgICAgICkudmFsdWUsXG4gICAgfTtcbiAgICBsZXQgcHJpY2VzID0gYXdhaXQgY2FsY3VsYXRlUHJpY2UoXG4gICAgICBmb3JtLnppcENvZGUsXG4gICAgICBwYXJzZUludChmb3JtLmNvbnN1bXB0aW9uKSxcbiAgICAgIGZvcm0uZW5lcmd5Q29uc3VtZXJcbiAgICApO1xuXG4gICAgaWYgKCFwcmljZXMpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjYWxjdWxhdGUgcHJpY2VzJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHByaWNlc05ldCA9IGZvcm0uZW5lcmd5Q29uc3VtZXIgPT0gJ2NvbW1lcmNpYWwnO1xuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dvcmtpbmctcHJpY2UtdGV4dCcpLmlubmVySFRNTCA9IGAke1xuICAgICAgcHJpY2VzTmV0ID8gJ25ldHRvJyA6ICdicnV0dG8nXG4gICAgfSAke3ByaWNlcy5hcmJlaXRzcHJlaXN9IENlbnQva1doYDtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFzZS1wcmljZS10ZXh0JykuaW5uZXJIVE1MID0gYCR7XG4gICAgICBwcmljZXNOZXQgPyAnbmV0dG8nIDogJ2JydXR0bydcbiAgICB9ICR7cHJpY2VzLmdydW5kcHJlaXN9IEVVUi9KYWhyYDtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgICdtb250aGx5LWZlZS10ZXh0J1xuICAgICkuaW5uZXJIVE1MID0gYGJydXR0byAke3ByaWNlcy5hYnNjaGxhZ30gRVVSYDtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVmdW5kLXRleHQnKS5pbm5lckhUTUwgPSBgJHtcbiAgICAgIHByaWNlc05ldCA/ICduZXR0bycgOiAnYnJ1dHRvJ1xuICAgIH0gJHtwcmljZXMuZXJzdGF0dHVuZ30gQ2VudC9rV2hgO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3N0LWNhbGMtdGFibGUnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgfVxuXG4gIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2YtZm9ybS1GYWlyc3Rlci1DYWxjdWxhdGlvbicpO1xuICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGxvZ1N1Ym1pdCk7XG59XG5cbnRyeSB7XG4gIG1haW4oKTtcbn0gY2F0Y2ggKGUpIHtcbiAgY29uc29sZS5lcnJvcihlLm1lc3NhZ2UpO1xufVxuIiwidHlwZSBQcmljZVJlc3VsdFR5cGUgPSB7XG4gIGFyYmVpdHNwcmVpczogbnVtYmVyO1xuICBncnVuZHByZWlzOiBudW1iZXI7XG4gIGFic2NobGFnOiBudW1iZXI7XG4gIGVyc3RhdHR1bmc6IG51bWJlcjtcbiAgYmFzZUZlZTogbnVtYmVyO1xufTtcblxudHlwZSBBcGlSZXNwb25zZSA9IHtcbiAgY2FsY3VsYXRpb246IHtcbiAgICB3b3JraW5nUHJpY2VQZXJLd0g6IG51bWJlcjtcbiAgICBiYXNlUHJpY2VQZXJZZWFyTmV0d29ya1VzYWdlOiBudW1iZXI7XG4gICAgbW9udGhseUZlZTogbnVtYmVyO1xuICAgIHJlZnVuZDogbnVtYmVyO1xuICAgIGJhc2VGZWVQZXJNb250aDogbnVtYmVyO1xuICB9O1xuICBwbGFuczogQXJyYXk8e1xuICAgIGlkOiBzdHJpbmc7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGR1cmF0aW9uSW5Nb250aHM6IG51bWJlcjtcbiAgICBlbmREYXRlOiBzdHJpbmc7XG4gICAgdmF0SW5mbzogc3RyaW5nO1xuICAgIG1vbnRobHlGZWU6IG51bWJlcjtcbiAgICB5ZWFybHlCYXNlRmVlOiBudW1iZXI7XG4gICAgY29uc3VtcHRpb25QcmljZTogbnVtYmVyO1xuICAgIHRvdGFsQ29zdHNQZXJZZWFyOiBudW1iZXI7XG4gIH0+O1xuICBsZWdhbERvY3VtZW50czogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn07XG5cbmV4cG9ydCBjb25zdCBjYWxjdWxhdGVQcmljZSA9IGFzeW5jIChcbiAgemlwQ29kZTogc3RyaW5nLFxuICBjb25zdW1wdGlvbkt3SDogbnVtYmVyLFxuICB0eXBlOiAnY29tbWVyY2lhbCcgfCAncHJpdmF0ZScgfCAnaGVhdCcsXG4gIGRlbGl2ZXJ5Q2l0eT86IHN0cmluZyxcbiAgZGVsaXZlcnlTdHJlZXQ/OiBzdHJpbmcsXG4gIGRlbGl2ZXJ5SG91c2VOdW1iZXI/OiBzdHJpbmdcbik6IFByb21pc2U8UHJpY2VSZXN1bHRUeXBlIHwgbnVsbD4gPT4ge1xuICB0cnkge1xuICAgIC8vIE1hcCB0eXBlIHRvIGN1c3RvbWVyVHlwZVxuICAgIGNvbnN0IGN1c3RvbWVyVHlwZSA9XG4gICAgICB0eXBlID09PSAncHJpdmF0ZSdcbiAgICAgICAgPyAnaW5kaXZpZHVhbCdcbiAgICAgICAgOiB0eXBlID09PSAnY29tbWVyY2lhbCdcbiAgICAgICAgPyAnY29tcGFueSdcbiAgICAgICAgOiAnaW5kaXZpZHVhbCc7XG5cbiAgICAvLyBNYXAgdHlwZSB0byBwb3dlclR5cGVcbiAgICBjb25zdCBwb3dlclR5cGUgPSB0eXBlID09PSAnaGVhdCcgPyAnaGVhdCcgOiAnZWxlY3RyaWNpdHknO1xuXG4gICAgLy8gUHJlcGFyZSBBUEkgcGF5bG9hZFxuICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICBjdXN0b21lclR5cGU6IGN1c3RvbWVyVHlwZSxcbiAgICAgIGRlbGl2ZXJ5WmlwQ29kZTogemlwQ29kZSxcbiAgICAgIGRlbGl2ZXJ5Q2l0eTogZGVsaXZlcnlDaXR5IHx8ICcnLFxuICAgICAgZGVsaXZlcnlTdHJlZXQ6IGRlbGl2ZXJ5U3RyZWV0IHx8ICcnLFxuICAgICAgZGVsaXZlcnlIb3VzZU51bWJlcjogZGVsaXZlcnlIb3VzZU51bWJlciB8fCAnJyxcbiAgICAgIHBvd2VyVHlwZTogcG93ZXJUeXBlLFxuICAgICAgeWVhcmx5Q29uc3VtcHRpb246IGNvbnN1bXB0aW9uS3dILnRvU3RyaW5nKCksXG4gICAgfTtcblxuICAgIC8vIE1ha2UgQVBJIGNhbGxcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFxuICAgICAgJ2h0dHBzOi8vZmFpcnN0ZXItYmFja2VuZC5henVyZXdlYnNpdGVzLm5ldC9hcGkvcGxhbnMvY2FsY3VsYXRlJyxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgY29uc29sZS5lcnJvcignQVBJIGNhbGwgZmFpbGVkOicsIHJlc3BvbnNlLnN0YXR1cywgcmVzcG9uc2Uuc3RhdHVzVGV4dCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhOiBBcGlSZXNwb25zZSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcblxuICAgIC8vIE1hcCBBUEkgcmVzcG9uc2UgdG8gcmV0dXJuIHR5cGUgdXNpbmcgY2FsY3VsYXRpb24gdmFsdWVzXG4gICAgcmV0dXJuIHtcbiAgICAgIGFyYmVpdHNwcmVpczogZGF0YS5jYWxjdWxhdGlvbi53b3JraW5nUHJpY2VQZXJLd0gsXG4gICAgICBncnVuZHByZWlzOiBkYXRhLmNhbGN1bGF0aW9uLmJhc2VQcmljZVBlclllYXJOZXR3b3JrVXNhZ2UsXG4gICAgICBhYnNjaGxhZzogZGF0YS5jYWxjdWxhdGlvbi5tb250aGx5RmVlLFxuICAgICAgZXJzdGF0dHVuZzogZGF0YS5jYWxjdWxhdGlvbi5yZWZ1bmQsXG4gICAgICBiYXNlRmVlOiBkYXRhLmNhbGN1bGF0aW9uLmJhc2VGZWVQZXJNb250aCxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNhbGN1bGF0aW5nIHByaWNlOicsIGVycm9yKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oMTU2KTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==