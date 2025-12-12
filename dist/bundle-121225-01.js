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
        const addressMatch = contractData.user.deliveryAddress.match(/^(.+?)\s+(\d+),\s+\d+\s+(.+)$/);
        if (addressMatch) {
            deliveryStreet = addressMatch[1].trim();
            deliveryHouseNumber = addressMatch[2].trim();
            deliveryCity = addressMatch[3].trim();
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
    // getElementByXpath(
    //   '//*[@id="2nd-tarif-tile"]/div[4]'
    // ).innerHTML = `Abschlag  <b>${formatDecimal(
    //   calculatedPrices.abschlag
    // )} EUR / Monat </b>`;
    // getElementByXpath(
    //   '//*[@id="3rd-tarif-tile"]/div[4]'
    // ).innerHTML = `Abschlag <b>${formatDecimal(
    //   calculatedPrices.abschlag
    // )} EUR / Monat</b>`;
    getElementByXpath('//*[@id="2nd-tarif-tile"]/div[4]').innerHTML = `Abschlag richtet sich nach deinem aktuellen Verbrauch`;
    getElementByXpath('//*[@id="3rd-tarif-tile"]/div[4]').innerHTML = `Abschlag richtet sich nach deinem aktuellen Verbrauch`;
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
    getElementByXpath('//*[@id="2nd-tarif-tile"]/div[5]').innerHTML = `Wir teilen dir den Abschlag mit der Bestätigung mit`;
    getElementByXpath('//*[@id="3rd-tarif-tile"]/div[5]').innerHTML = `Wir teilen dir den Abschlag mit der Bestätigung mit`;
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
        if (id == 'heatpump-tarif-tile') {
            return;
        }
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
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
        });
        // No content at all
        if (response.status === 204) {
            console.error('API call returned 204 No Content');
            return null;
        }
        if (!response.ok) {
            console.error('API call failed:', response.status, response.statusText);
            return null;
        }
        // Parse body; don't rely on content-type being exposed via CORS
        const raw = yield response.text();
        if (!raw) {
            console.error('API call returned empty body', response.status);
            return null;
        }
        let data;
        try {
            data = JSON.parse(raw);
        }
        catch (parseErr) {
            console.error('API call returned non-JSON or malformed JSON');
            console.error('Status:', response.status, response.statusText);
            console.error('Body snippet:', raw.slice(0, 300));
            return null;
        }
        if (!data || !data.calculation) {
            console.error('API call returned no calculation payload');
            console.error('Body snippet:', raw.slice(0, 300));
            return null;
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0lBQ2QsQ0FBQztBQUNILENBQUMsRUFBQztBQTNGVyxzQkFBYyxrQkEyRnpCOzs7Ozs7O1VDekhGO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mYWlyc3Rlci5kZS8uL3NyYy9jb250cmFjdFBhZ2UudHMiLCJ3ZWJwYWNrOi8vZmFpcnN0ZXIuZGUvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZmFpcnN0ZXIuZGUvLi9zcmMvcHJpY2VDYWxjdWxhdGlvbi50cyIsIndlYnBhY2s6Ly9mYWlyc3Rlci5kZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9mYWlyc3Rlci5kZS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2ZhaXJzdGVyLmRlL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9mYWlyc3Rlci5kZS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY2FsY3VsYXRlUHJpY2UgfSBmcm9tICcuL3ByaWNlQ2FsY3VsYXRpb24nO1xuXG4vLyBjb25zdCBhcGlVcmwgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MzMzNFwiO1xuLy8gY29uc3QgYXBpVXJsID0gXCJodHRwczovL2ZhaXJzdGVyLmNvZGU4LmRldlwiO1xuY29uc3QgYXBpVXJsID0gJ2h0dHBzOi8vZmFpcnN0ZXItYmFja2VuZC5henVyZXdlYnNpdGVzLm5ldC9hcGknO1xuY29uc3QgYXZhaWxhYmxlQ29udHJhY3RQbGFucyA9IFtcbiAge1xuICAgIGlkOiAnaGVhdHB1bXAtdGFyaWYtdGlsZScsXG4gICAgbmFtZTogJ1fDpHJtZXB1bXBlbiBUYXJpZicsXG4gICAgYnV0dG9uU2VsZWN0b3JJZDogJ2hlYXQtc2VsZWN0LWJ1dHRvbicsXG4gIH0sXG4gIHtcbiAgICBpZDogJzFzdC10YXJpZi10aWxlJyxcbiAgICBuYW1lOiAnMSBNb25hdHMgVGFyaWYnLFxuICAgIGJ1dHRvblNlbGVjdG9ySWQ6ICdvbmUtbW9udGgtc2VsZWN0LWJ1dHRvbicsXG4gIH0sXG4gIHtcbiAgICBpZDogJzJuZC10YXJpZi10aWxlJyxcbiAgICBuYW1lOiAnMTIgTW9uYXRzIFRhcmlmJyxcbiAgICBidXR0b25TZWxlY3RvcklkOiAnMTItbW9udGhzLXNlbGVjdC1idXR0b24nLFxuICB9LFxuICB7XG4gICAgaWQ6ICczcmQtdGFyaWYtdGlsZScsXG4gICAgbmFtZTogJzI0IE1vbmF0cyBUYXJpZicsXG4gICAgYnV0dG9uU2VsZWN0b3JJZDogJzI0LW1vbnRocy1zZWxlY3QtYnV0dG9uJyxcbiAgfSxcbl07XG5jb25zdCBpZFBsYW5NYXBwaW5nID0ge1xuICAnaGVhdHB1bXAtdGFyaWYtdGlsZSc6ICdXw6RybWVwdW1wZW4gVGFyaWYnLFxuICAnMXN0LXRhcmlmLXRpbGUnOiAnMSBNb25hdHMgVGFyaWYnLFxuICAnMm5kLXRhcmlmLXRpbGUnOiAnMTIgTW9uYXRzIFRhcmlmJyxcbiAgJzNyZC10YXJpZi10aWxlJzogJzI0IE1vbmF0cyBUYXJpZicsXG59O1xuY29uc3QgY29udHJhY3RTdGF0ZSA9IHtcbiAgaWQ6IG51bGwsXG4gIHNlbGVjdGVkUGxhbjogJzJuZC10YXJpZi10aWxlJyxcbiAgY2FsY3VsYXRpb246IG51bGwsXG4gIHBsYW5UeXBlOiAnJyxcbiAgbGVnYWxDb25zZW50czogW10sXG4gIGxlZ2FsVGVybXM6IHtcbiAgICB2ZXJ0cmFnc2JlZGluZ3VuZ2VuOiAnJyxcbiAgICBhbGxnU3Ryb21saWVmZXJiZWRpbmd1bmdlbjogJycsXG4gICAgcHJlaXNCZXN0aW1tdW5nZW46ICcnLFxuICAgIHdpZGVycnVmc3JlY2h0OiAnJyxcbiAgfSxcbn07XG50eXBlIERhdGFSZXNwb25zZVR5cGUgPSB7XG4gIGlkOiBzdHJpbmc7XG4gIGVtYWlsOiBzdHJpbmc7XG4gIHBsYW46IHN0cmluZztcbiAgemlwQ29kZTogc3RyaW5nO1xuICB5ZWFybHlDb25zdW1wdGlvbkt3SDogbnVtYmVyO1xuICBzdGF0dXM6IHN0cmluZztcbiAgdXNlcjoge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgZW1haWw6IHN0cmluZztcbiAgICBpbnZvaWNlQWRkcmVzczogc3RyaW5nO1xuICAgIGZpcnN0TmFtZTogc3RyaW5nO1xuICAgIGxhc3ROYW1lOiBzdHJpbmc7XG4gICAgZGVsaXZlcnlBZGRyZXNzOiBzdHJpbmc7XG4gICAgbWV0ZXJJZDogc3RyaW5nO1xuICB9O1xufTtcbmxldCBjb250cmFjdERhdGE6IERhdGFSZXNwb25zZVR5cGUgPSBudWxsO1xubGV0IGNvbnRyYWN0TmFtZUVsZW1lbnQ6IEhUTUxFbGVtZW50O1xubGV0IGNvbnRyYWN0QWRkcmVzc0VsZW1lbnQ6IEhUTUxFbGVtZW50O1xubGV0IGNvbnRyYWN0RGVsaXZlcnlBZGRyZXNzRWxlbWVudDogSFRNTEVsZW1lbnQ7XG5sZXQgY29udHJhY3RNZXRlcklkRWxlbWVudDogSFRNTEVsZW1lbnQ7XG5sZXQgcGxhbkxpc3RFbGVtZW50OiBIVE1MRWxlbWVudDtcbmxldCBzZWxlY3RlZFBsYW5OYW1lRWxlbWVudDogSFRNTEVsZW1lbnQ7XG5cbmNvbnN0IG9uU3VibWl0ID0gYXN5bmMgKCkgPT4ge1xuICBpZiAoXG4gICAgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZWdhbC1jb25zZW50LWNoZWNrYm94JykgYXMgSFRNTEZvcm1FbGVtZW50KVxuICAgICAgLmNoZWNrZWQgPT0gZmFsc2VcbiAgKSB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xlZ2FsLWNvbnNlbnQtY2hlY2snKS5jbGFzc0xpc3QuYWRkKCdoaWdobGlnaHQnKTtcbiAgICBhd2FpdCB3YWl0KDIwMDApO1xuICAgIGRvY3VtZW50XG4gICAgICAuZ2V0RWxlbWVudEJ5SWQoJ2xlZ2FsLWNvbnNlbnQtY2hlY2snKVxuICAgICAgLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZ2hsaWdodCcpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb250cmFjdFN0YXRlLmxlZ2FsQ29uc2VudHMgPSBbXG4gICAgZ2V0RWxlbWVudEJ5WHBhdGgoJy8vKltAaWQ9XCJsZWdhbC1jb25zZW50LWNoZWNrXCJdL3NwYW4nKS5pbm5lclRleHQsXG4gICAgZ2V0RWxlbWVudEJ5WHBhdGgoJy8vKltAaWQ9XCJ3Zi1mb3JtLWNvbnRyYWN0Rm9ybVwiXS9zZWN0aW9uWzVdL2RpdicpXG4gICAgICAuaW5uZXJUZXh0LFxuICBdO1xuXG4gIGxldCByZXN1bHQgPSBhd2FpdCBmZXRjaChgJHthcGlVcmx9L29mZmVyLyR7Y29udHJhY3RTdGF0ZS5pZH1gLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgY29udHJhY3RTdGF0ZSxcbiAgICAgIHNlbGVjdGVkUGxhbjogaWRQbGFuTWFwcGluZ1tjb250cmFjdFN0YXRlLnNlbGVjdGVkUGxhbl0sXG4gICAgfSksXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9LFxuICB9KTtcbiAgd2luZG93LnNjcm9sbFRvKHtcbiAgICB0b3A6IDAsXG4gICAgbGVmdDogMCxcbiAgICBiZWhhdmlvcjogJ3Ntb290aCcsXG4gIH0pO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZy1zdWJoZWFkZXInKS5pbm5lckhUTUwgPSAnQW5nZWJvdCBiZXN0w6R0aWd0JztcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRpbmctY292ZXInKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdCgpIHtcbiAgLy8gRG8gc3R1ZmYgb25seSBpZiBvbiBjb250cmFjdC1wYWdlXG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgIT09ICcvY29udHJhY3QnKSByZXR1cm47XG5cbiAgbGV0IGhhc1NlZW5Mb2FkaW5nRm9yQXRMZWFzdFR3b1NlY29uZHMgPSBmYWxzZTtcbiAgLy8gTG9hZCBDb250cmFjdCBEZXRhaWxzXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGhhc1NlZW5Mb2FkaW5nRm9yQXRMZWFzdFR3b1NlY29uZHMgPSB0cnVlO1xuICB9LCAyMDAwKTtcbiAgYXdhaXQgbG9hZENvbnRyYWN0RGV0YWlscygpO1xuXG4gIC8vIGluaXRpYWxpemUgaW50ZXJmYWNlXG4gIHBsYW5MaXN0RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGFuLWxpc3Qtc2VsZWN0b3InKTtcbiAgc2VsZWN0ZWRQbGFuTmFtZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VsZWN0ZWQtcGxhbi10aXRsZS10ZXh0Jyk7XG4gIHVwZGF0ZVBsYW5MaXN0KHRydWUpO1xuXG4gIHdoaWxlICghaGFzU2VlbkxvYWRpbmdGb3JBdExlYXN0VHdvU2Vjb25kcykge1xuICAgIGF3YWl0IHdhaXQoMjAwKTtcbiAgfVxuICBpZiAoY29udHJhY3REYXRhLnN0YXR1cyAhPT0gJ3NpZ25lZCcpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZy1jb3ZlcicpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZy1zdWJoZWFkZXInKS5pbm5lckhUTUwgPVxuICAgICAgJ0FuZ2Vib3QgYmVyZWl0cyBiZXN0w6R0aWd0JztcbiAgfVxuICBjb25zb2xlLmxvZygnR290IGRhdGEgYW5kIHJlYWR5Jyk7XG5cbiAgLy8gUmVnaXN0ZXIgZXZlbnRzXG4gIGRvY3VtZW50XG4gICAgLmdldEVsZW1lbnRCeUlkKCdwbGFuLW5hdi1sZWZ0JylcbiAgICAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBuYXZpZ2F0ZVBsYW5zKC0xKSk7XG4gIGRvY3VtZW50XG4gICAgLmdldEVsZW1lbnRCeUlkKCdwbGFuLW5hdi1yaWdodCcpXG4gICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbmF2aWdhdGVQbGFucygxKSk7XG4gIGRvY3VtZW50XG4gICAgLmdldEVsZW1lbnRCeUlkKCdjb250cmFjdC1mb3JtLXN1Ym1pdCcpXG4gICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25TdWJtaXQpO1xuXG4gIGF2YWlsYWJsZUNvbnRyYWN0UGxhbnMubWFwKCh7IGlkLCBidXR0b25TZWxlY3RvcklkLCBuYW1lIH0sIGluZGV4KSA9PiB7XG4gICAgbGV0IGJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGJ1dHRvblNlbGVjdG9ySWQpIGFzIEhUTUxMaW5rRWxlbWVudDtcbiAgICBidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnZGlzYWJsZWQnKTtcbiAgfSk7XG59XG5cbmNvbnN0IGxvYWRDb250cmFjdERldGFpbHMgPSBhc3luYyAoKSA9PiB7XG4gIGxldCBvZmZlcklkID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gIG9mZmVySWQgPSBvZmZlcklkLnNsaWNlKDEsIG9mZmVySWQubGVuZ3RoKTtcbiAgY29udHJhY3RTdGF0ZS5pZCA9IG9mZmVySWQ7XG5cbiAgY29uc3QgY29udHJhY3REYXRhUmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHthcGlVcmx9L29mZmVyLyR7b2ZmZXJJZH1gLCB7fSk7XG4gIGNvbnRyYWN0RGF0YSA9IGF3YWl0IGNvbnRyYWN0RGF0YVJlc3BvbnNlLmpzb24oKTtcblxuICBjb250cmFjdE5hbWVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyYWN0LWRhdGEtbmFtZScpO1xuICBjb250cmFjdEFkZHJlc3NFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyYWN0LWRhdGEtYWRkcmVzcycpO1xuICBjb250cmFjdERlbGl2ZXJ5QWRkcmVzc0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAnY29udHJhY3QtZGF0YS1kZWxpdmVyeS1hZGRyZXNzJ1xuICApO1xuICBjb250cmFjdE1ldGVySWRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyYWN0LWRhdGEtbWV0ZXItaWQnKTtcblxuICAvLyBQYXJzZSBkZWxpdmVyeSBhZGRyZXNzOiBcIjEwMjQ1IEJlcmxpbiwgU3RyYcOfbWFubnN0cmFzc2UgMjVcIlxuICBsZXQgZGVsaXZlcnlDaXR5ID0gJyc7XG4gIGxldCBkZWxpdmVyeVN0cmVldCA9ICcnO1xuICBsZXQgZGVsaXZlcnlIb3VzZU51bWJlciA9ICcnO1xuXG4gIGlmIChjb250cmFjdERhdGEudXNlcj8uZGVsaXZlcnlBZGRyZXNzKSB7XG4gICAgY29uc3QgYWRkcmVzc01hdGNoID0gY29udHJhY3REYXRhLnVzZXIuZGVsaXZlcnlBZGRyZXNzLm1hdGNoKFxuICAgICAgL14oLis/KVxccysoXFxkKyksXFxzK1xcZCtcXHMrKC4rKSQvXG4gICAgKTtcbiAgICBpZiAoYWRkcmVzc01hdGNoKSB7XG4gICAgICBkZWxpdmVyeVN0cmVldCA9IGFkZHJlc3NNYXRjaFsxXS50cmltKCk7XG4gICAgICBkZWxpdmVyeUhvdXNlTnVtYmVyID0gYWRkcmVzc01hdGNoWzJdLnRyaW0oKTtcbiAgICAgIGRlbGl2ZXJ5Q2l0eSA9IGFkZHJlc3NNYXRjaFszXS50cmltKCk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2FsY3VsYXRlZFByaWNlcyA9IGF3YWl0IGNhbGN1bGF0ZVByaWNlKFxuICAgIGNvbnRyYWN0RGF0YS56aXBDb2RlLFxuICAgIGNvbnRyYWN0RGF0YS55ZWFybHlDb25zdW1wdGlvbkt3SCxcbiAgICBjb250cmFjdERhdGEucGxhbiBhcyAnY29tbWVyY2lhbCcgfCAncHJpdmF0ZScgfCAnaGVhdCcsXG4gICAgZGVsaXZlcnlDaXR5LFxuICAgIGRlbGl2ZXJ5U3RyZWV0LFxuICAgIGRlbGl2ZXJ5SG91c2VOdW1iZXJcbiAgKTtcbiAgY29uc29sZS5sb2coJ0NhbGN1bGF0ZWQgcHJpY2UnLCBjYWxjdWxhdGVkUHJpY2VzLCBjb250cmFjdERhdGEpO1xuXG4gIGlmICghY2FsY3VsYXRlZFByaWNlcykge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjYWxjdWxhdGUgcHJpY2VzJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29udHJhY3RTdGF0ZS5jYWxjdWxhdGlvbiA9IGNhbGN1bGF0ZWRQcmljZXM7XG4gIGNvbnRyYWN0U3RhdGUucGxhblR5cGUgPSBjb250cmFjdERhdGEucGxhbjtcblxuICBpZiAoY29udHJhY3REYXRhLnBsYW4gPT0gJ2NvbW1lcmNpYWwnKSB7XG4gICAgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZWdhbC10ZXJtcy1saW5rJykgYXMgSFRNTEFuY2hvckVsZW1lbnQpLmhyZWYgPVxuICAgICAgJ2h0dHBzOi8vY2RuLnNob3BpZnkuY29tL3MvZmlsZXMvMS8wNzQyLzEzODEvODYzMi9maWxlcy9TdHJvbWxpZWZlcnZlcnRyYWdfZmFpcnN0ZXJfb25saW5lX0dld2VyYmVrdW5kZW4ucGRmP3Y9MTczMDM5MzYyOSc7XG4gICAgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWxpdmVyeS10ZXJtcy1saW5rJykgYXMgSFRNTEFuY2hvckVsZW1lbnQpLmhyZWYgPVxuICAgICAgJ2h0dHBzOi8vY2RuLnNob3BpZnkuY29tL3MvZmlsZXMvMS8wNzQyLzEzODEvODYzMi9maWxlcy9BTEJfQW5sYWdlXzFfZmFpcnN0ZXJfR2V3ZXJiZWt1bmRlbi5wZGY/dj0xNzMwMzkzNjI5JztcbiAgICAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ByaWNlLXRlcm1zLWxpbmsnKSBhcyBIVE1MQW5jaG9yRWxlbWVudCkuaHJlZiA9XG4gICAgICAnaHR0cHM6Ly9jZG4uc2hvcGlmeS5jb20vcy9maWxlcy8xLzA3NDIvMTM4MS84NjMyL2ZpbGVzL0FubGFnZV8yX2ZhaXJzdGVyX1ByZWlzYmxhdHRfR2V3ZXJiZWt1bmRlbi5wZGY/dj0xNzMwMzkzNjI4JztcbiAgICAoXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgICAgJ2RlbGl2ZXJ5LWxlZ2FsLXRlcm1zLWZvb3RlcidcbiAgICAgICkgYXMgSFRNTEFuY2hvckVsZW1lbnRcbiAgICApLmhyZWYgPVxuICAgICAgJ2h0dHBzOi8vY2RuLnNob3BpZnkuY29tL3MvZmlsZXMvMS8wNzQyLzEzODEvODYzMi9maWxlcy9BTEJfQW5sYWdlXzFfZmFpcnN0ZXJfR2V3ZXJiZWt1bmRlbi5wZGY/dj0xNzMwMzkzNjI5JztcbiAgfVxuICBjb250cmFjdFN0YXRlLmxlZ2FsVGVybXMudmVydHJhZ3NiZWRpbmd1bmdlbiA9IChcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGVnYWwtdGVybXMtbGluaycpIGFzIEhUTUxBbmNob3JFbGVtZW50XG4gICkuaHJlZjtcbiAgY29udHJhY3RTdGF0ZS5sZWdhbFRlcm1zLmFsbGdTdHJvbWxpZWZlcmJlZGluZ3VuZ2VuID0gKFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWxpdmVyeS10ZXJtcy1saW5rJykgYXMgSFRNTEFuY2hvckVsZW1lbnRcbiAgKS5ocmVmO1xuICBjb250cmFjdFN0YXRlLmxlZ2FsVGVybXMucHJlaXNCZXN0aW1tdW5nZW4gPSAoXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ByaWNlLXRlcm1zLWxpbmsnKSBhcyBIVE1MQW5jaG9yRWxlbWVudFxuICApLmhyZWY7XG4gIGNvbnRyYWN0U3RhdGUubGVnYWxUZXJtcy53aWRlcnJ1ZnNyZWNodCA9IChcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2lkZXJydWYtbGVnYWwtdGVybXMnKSBhcyBIVE1MQW5jaG9yRWxlbWVudFxuICApLmhyZWY7XG5cbiAgY29udHJhY3ROYW1lRWxlbWVudC5pbm5lckhUTUwgPSBgJHtjb250cmFjdERhdGEudXNlci5maXJzdE5hbWV9ICR7Y29udHJhY3REYXRhLnVzZXIubGFzdE5hbWV9YDtcbiAgY29udHJhY3RBZGRyZXNzRWxlbWVudC5pbm5lckhUTUwgPSBjb250cmFjdERhdGEudXNlci5pbnZvaWNlQWRkcmVzcztcbiAgY29udHJhY3REZWxpdmVyeUFkZHJlc3NFbGVtZW50LmlubmVySFRNTCA9IGNvbnRyYWN0RGF0YS51c2VyLmRlbGl2ZXJ5QWRkcmVzcztcbiAgY29udHJhY3RNZXRlcklkRWxlbWVudC5pbm5lckhUTUwgPSBjb250cmFjdERhdGEudXNlci5tZXRlcklkO1xuXG4gIGxldCBuZXRTdWZmaXggPSAnUHJlaXNlIGlua2wuIE13U3QnO1xuICBpZiAoY29udHJhY3REYXRhLnBsYW4gPT0gJ2NvbW1lcmNpYWwnKSB7XG4gICAgbmV0U3VmZml4ID0gJ1ByZWlzZSBleGtsLiBNd1N0JztcbiAgfVxuXG4gIGxldCBtb250aGx5RmVlV2l0aEJhc2UgPSBmb3JtYXREZWNpbWFsKFxuICAgIChjYWxjdWxhdGVkUHJpY2VzLmdydW5kcHJlaXMgKyBjYWxjdWxhdGVkUHJpY2VzLmJhc2VGZWUgKiAxMikgLyAxMlxuICApO1xuICAvLyAvLyBTZXQgUHJpY2UgRGF0YVxuICAvLyBnZXRFbGVtZW50QnlYcGF0aChcbiAgLy8gICAnLy8qW0BpZD1cIjJuZC10YXJpZi10aWxlXCJdL2Rpdls0XSdcbiAgLy8gKS5pbm5lckhUTUwgPSBgQWJzY2hsYWcgIDxiPiR7Zm9ybWF0RGVjaW1hbChcbiAgLy8gICBjYWxjdWxhdGVkUHJpY2VzLmFic2NobGFnXG4gIC8vICl9IEVVUiAvIE1vbmF0IDwvYj5gO1xuICAvLyBnZXRFbGVtZW50QnlYcGF0aChcbiAgLy8gICAnLy8qW0BpZD1cIjNyZC10YXJpZi10aWxlXCJdL2Rpdls0XSdcbiAgLy8gKS5pbm5lckhUTUwgPSBgQWJzY2hsYWcgPGI+JHtmb3JtYXREZWNpbWFsKFxuICAvLyAgIGNhbGN1bGF0ZWRQcmljZXMuYWJzY2hsYWdcbiAgLy8gKX0gRVVSIC8gTW9uYXQ8L2I+YDtcbiAgZ2V0RWxlbWVudEJ5WHBhdGgoXG4gICAgJy8vKltAaWQ9XCIybmQtdGFyaWYtdGlsZVwiXS9kaXZbNF0nXG4gICkuaW5uZXJIVE1MID0gYEFic2NobGFnIHJpY2h0ZXQgc2ljaCBuYWNoIGRlaW5lbSBha3R1ZWxsZW4gVmVyYnJhdWNoYDtcbiAgZ2V0RWxlbWVudEJ5WHBhdGgoXG4gICAgJy8vKltAaWQ9XCIzcmQtdGFyaWYtdGlsZVwiXS9kaXZbNF0nXG4gICkuaW5uZXJIVE1MID0gYEFic2NobGFnIHJpY2h0ZXQgc2ljaCBuYWNoIGRlaW5lbSBha3R1ZWxsZW4gVmVyYnJhdWNoYDtcblxuICAvLyBnZXRFbGVtZW50QnlYcGF0aChcbiAgLy8gICAnLy8qW0BpZD1cIjFzdC10YXJpZi10aWxlXCJdL2RpdlszXSdcbiAgLy8gKS5pbm5lckhUTUwgPSBgR3J1bmRwcmVpcyAke2NhbGN1bGF0ZWRQcmljZXMuZ3J1bmRwcmVpc30gRVVSIC8gSmFocmA7XG4gIGdldEVsZW1lbnRCeVhwYXRoKFxuICAgICcvLypbQGlkPVwiMm5kLXRhcmlmLXRpbGVcIl0vZGl2WzNdJ1xuICApLmlubmVySFRNTCA9IGBHcnVuZGdlYsO8aHIgJHttb250aGx5RmVlV2l0aEJhc2V9IEVVUiAvIE1vbmF0YDtcbiAgZ2V0RWxlbWVudEJ5WHBhdGgoXG4gICAgJy8vKltAaWQ9XCIzcmQtdGFyaWYtdGlsZVwiXS9kaXZbM10nXG4gICkuaW5uZXJIVE1MID0gYEdydW5kZ2Viw7xociAke21vbnRobHlGZWVXaXRoQmFzZX0gRVVSIC8gTW9uYXRgO1xuICAvLyBnZXRFbGVtZW50QnlYcGF0aChcbiAgLy8gICAnLy8qW0BpZD1cIjFzdC10YXJpZi10aWxlXCJdL2RpdlsyXSdcbiAgLy8gKS5pbm5lckhUTUwgPSBgJHtjYWxjdWxhdGVkUHJpY2VzLmFyYmVpdHNwcmVpc30gY3QvS3dIYDtcbiAgZ2V0RWxlbWVudEJ5WHBhdGgoXG4gICAgJy8vKltAaWQ9XCIybmQtdGFyaWYtdGlsZVwiXS9kaXZbMl0nXG4gICkuaW5uZXJIVE1MID0gYCR7Zm9ybWF0RGVjaW1hbChjYWxjdWxhdGVkUHJpY2VzLmFyYmVpdHNwcmVpcyl9IGN0L2tXaGA7XG4gIGdldEVsZW1lbnRCeVhwYXRoKFxuICAgICcvLypbQGlkPVwiM3JkLXRhcmlmLXRpbGVcIl0vZGl2WzJdJ1xuICApLmlubmVySFRNTCA9IGAke2Zvcm1hdERlY2ltYWwoY2FsY3VsYXRlZFByaWNlcy5hcmJlaXRzcHJlaXMpfSBjdC9rV2hgO1xuXG4gIGdldEVsZW1lbnRCeVhwYXRoKFxuICAgICcvLypbQGlkPVwiMm5kLXRhcmlmLXRpbGVcIl0vZGl2WzVdJ1xuICApLmlubmVySFRNTCA9IGBXaXIgdGVpbGVuIGRpciBkZW4gQWJzY2hsYWcgbWl0IGRlciBCZXN0w6R0aWd1bmcgbWl0YDtcbiAgZ2V0RWxlbWVudEJ5WHBhdGgoXG4gICAgJy8vKltAaWQ9XCIzcmQtdGFyaWYtdGlsZVwiXS9kaXZbNV0nXG4gICkuaW5uZXJIVE1MID0gYFdpciB0ZWlsZW4gZGlyIGRlbiBBYnNjaGxhZyBtaXQgZGVyIEJlc3TDpHRpZ3VuZyBtaXRgO1xufTtcblxuY29uc3QgdXBkYXRlUGxhbkxpc3QgPSAoaW5pdGlhbDogYm9vbGVhbikgPT4ge1xuICBhdmFpbGFibGVDb250cmFjdFBsYW5zLm1hcCgoeyBpZCwgYnV0dG9uU2VsZWN0b3JJZCwgbmFtZSB9LCBpbmRleCkgPT4ge1xuICAgIGlmIChpbml0aWFsKSB7XG4gICAgICBkb2N1bWVudFxuICAgICAgICAuZ2V0RWxlbWVudEJ5SWQoYnV0dG9uU2VsZWN0b3JJZClcbiAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VsZWN0UGxhbihpZCkpO1xuICAgIH1cbiAgICBsZXQgYnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYnV0dG9uU2VsZWN0b3JJZCkgYXMgSFRNTExpbmtFbGVtZW50O1xuICAgIGJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdkaXNhYmxlZCcpO1xuXG4gICAgaWYgKGlkID09ICdoZWF0cHVtcC10YXJpZi10aWxlJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaWQgPT0gY29udHJhY3RTdGF0ZS5zZWxlY3RlZFBsYW4pIHtcbiAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xuICAgICAgc2VsZWN0ZWRQbGFuTmFtZUVsZW1lbnQuaW5uZXJIVE1MID0gbmFtZTtcblxuICAgICAgY29uc3QgbGlzdFdpZHRoID0gcGxhbkxpc3RFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgcGxhbkxpc3RFbGVtZW50LnNjcm9sbFRvKHtcbiAgICAgICAgbGVmdDogbGlzdFdpZHRoICogaW5kZXgsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgYmVoYXZpb3I6ICdpbnN0YW50JyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59O1xuXG5jb25zdCBzZWxlY3RQbGFuID0gKHBsYW5JZDogc3RyaW5nKSA9PiAoZXZlbnQpID0+IHtcbiAgaWYgKHBsYW5JZCA9PSAnMXN0LXRhcmlmLXRpbGUnIHx8IHBsYW5JZCA9PSAnaGVhdHB1bXAtdGFyaWYtdGlsZScpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udHJhY3QtZm9ybS1zdWJtaXQnKS5pbm5lckhUTUwgPVxuICAgICAgJ1RhcmlmIGFuZnJhZ2VuJztcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udHJhY3QtZm9ybS1zdWJtaXQnKS5pbm5lckhUTUwgPVxuICAgICAgJ0tvc3RlbnBmbGljaHRpZyA8YnI+YWJzY2hsaWXDn2VuPGJyPuKAjSc7XG4gIH1cblxuICBjb250cmFjdFN0YXRlLnNlbGVjdGVkUGxhbiA9IHBsYW5JZDtcbiAgdXBkYXRlUGxhbkxpc3QoZmFsc2UpO1xuICBkb2N1bWVudFxuICAgIC5nZXRFbGVtZW50QnlJZCgnY29udHJhY3QtZm9ybS1zdWJtaXQnKVxuICAgIC5zY3JvbGxJbnRvVmlldyh7IGJlaGF2aW9yOiAnc21vb3RoJyB9KTtcbn07XG5cbmNvbnN0IG5hdmlnYXRlUGxhbnMgPSAoZGlyZWN0aW9uOiBudW1iZXIpID0+IChldmVudCkgPT4ge1xuICBpZiAoIXBsYW5MaXN0RWxlbWVudCkgcmV0dXJuO1xuXG4gIGNvbnN0IGxpc3RXaWR0aCA9IHBsYW5MaXN0RWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgY29uc3QgY3VycmVudFNjcm9sbFBvc2l0aW9uID0gcGxhbkxpc3RFbGVtZW50LnNjcm9sbExlZnQ7XG4gIGxldCBuZXdTY3JvbGxQb3NpdGlvbiA9IGN1cnJlbnRTY3JvbGxQb3NpdGlvbiArIGxpc3RXaWR0aCAqIGRpcmVjdGlvbjtcbiAgaWYgKG5ld1Njcm9sbFBvc2l0aW9uID49IGxpc3RXaWR0aCAqIGF2YWlsYWJsZUNvbnRyYWN0UGxhbnMubGVuZ3RoKSB7XG4gICAgbmV3U2Nyb2xsUG9zaXRpb24gPSAwO1xuICB9IGVsc2UgaWYgKG5ld1Njcm9sbFBvc2l0aW9uIDwgMCkge1xuICAgIG5ld1Njcm9sbFBvc2l0aW9uID0gbGlzdFdpZHRoICogKGF2YWlsYWJsZUNvbnRyYWN0UGxhbnMubGVuZ3RoIC0gMSk7XG4gIH1cblxuICBwbGFuTGlzdEVsZW1lbnQuc2Nyb2xsVG8oe1xuICAgIGxlZnQ6IG5ld1Njcm9sbFBvc2l0aW9uLFxuICAgIHRvcDogMCxcbiAgICBiZWhhdmlvcjogJ3Ntb290aCcsXG4gIH0pO1xufTtcblxuY29uc3Qgd2FpdCA9IGFzeW5jIChtczogbnVtYmVyKSA9PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xufTtcblxuZnVuY3Rpb24gZ2V0RWxlbWVudEJ5WHBhdGgocGF0aCk6IEhUTUxFbGVtZW50IHtcbiAgcmV0dXJuIGRvY3VtZW50LmV2YWx1YXRlKFxuICAgIHBhdGgsXG4gICAgZG9jdW1lbnQsXG4gICAgbnVsbCxcbiAgICBYUGF0aFJlc3VsdC5GSVJTVF9PUkRFUkVEX05PREVfVFlQRSxcbiAgICBudWxsXG4gICkuc2luZ2xlTm9kZVZhbHVlIGFzIEhUTUxFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBmb3JtYXREZWNpbWFsKG51bWJlclZhbHVlOiBudW1iZXIpIHtcbiAgLy8gQHRzLWlnbm9yZVxuICByZXR1cm4gbnVtYmVyVmFsdWUudG9GaXhlZCgyKS50b0xvY2FsZVN0cmluZygnZGUtREUnKS5yZXBsYWNlKCcuJywgJywnKTtcbn1cbiIsImltcG9ydCB7IGluaXQgfSBmcm9tICcuL2NvbnRyYWN0UGFnZSc7XG5pbXBvcnQgeyBjYWxjdWxhdGVQcmljZSB9IGZyb20gJy4vcHJpY2VDYWxjdWxhdGlvbic7XG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKSB7XG4gIGluaXQoKTtcbiAgYXN5bmMgZnVuY3Rpb24gbG9nU3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIGxldCBmb3JtID0ge1xuICAgICAgZW5lcmd5Q29uc3VtZXI6IChcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAgICAgJ2Zvcm0tZmllbGQtZW5lcmd5LWNvbnN1bWVyJ1xuICAgICAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnRcbiAgICAgICkudmFsdWUgYXMgJ2NvbW1lcmNpYWwnIHwgJ3ByaXZhdGUnIHwgJ2hlYXQnLFxuICAgICAgemlwQ29kZTogKFxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS1maWVsZC16aXAtY29kZScpIGFzIEhUTUxJbnB1dEVsZW1lbnRcbiAgICAgICkudmFsdWUsXG4gICAgICBjb25zdW1wdGlvbjogKFxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgICAgICAnZm9ybS1maWVsZC15ZWFybHktY29uc3VtcHRpb24nXG4gICAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudFxuICAgICAgKS52YWx1ZSxcbiAgICB9O1xuICAgIGxldCBwcmljZXMgPSBhd2FpdCBjYWxjdWxhdGVQcmljZShcbiAgICAgIGZvcm0uemlwQ29kZSxcbiAgICAgIHBhcnNlSW50KGZvcm0uY29uc3VtcHRpb24pLFxuICAgICAgZm9ybS5lbmVyZ3lDb25zdW1lclxuICAgICk7XG5cbiAgICBpZiAoIXByaWNlcykge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNhbGN1bGF0ZSBwcmljZXMnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcHJpY2VzTmV0ID0gZm9ybS5lbmVyZ3lDb25zdW1lciA9PSAnY29tbWVyY2lhbCc7XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd29ya2luZy1wcmljZS10ZXh0JykuaW5uZXJIVE1MID0gYCR7XG4gICAgICBwcmljZXNOZXQgPyAnbmV0dG8nIDogJ2JydXR0bydcbiAgICB9ICR7cHJpY2VzLmFyYmVpdHNwcmVpc30gQ2VudC9rV2hgO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYXNlLXByaWNlLXRleHQnKS5pbm5lckhUTUwgPSBgJHtcbiAgICAgIHByaWNlc05ldCA/ICduZXR0bycgOiAnYnJ1dHRvJ1xuICAgIH0gJHtwcmljZXMuZ3J1bmRwcmVpc30gRVVSL0phaHJgO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgJ21vbnRobHktZmVlLXRleHQnXG4gICAgKS5pbm5lckhUTUwgPSBgYnJ1dHRvICR7cHJpY2VzLmFic2NobGFnfSBFVVJgO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWZ1bmQtdGV4dCcpLmlubmVySFRNTCA9IGAke1xuICAgICAgcHJpY2VzTmV0ID8gJ25ldHRvJyA6ICdicnV0dG8nXG4gICAgfSAke3ByaWNlcy5lcnN0YXR0dW5nfSBDZW50L2tXaGA7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvc3QtY2FsYy10YWJsZScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICB9XG5cbiAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Zi1mb3JtLUZhaXJzdGVyLUNhbGN1bGF0aW9uJyk7XG4gIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgbG9nU3VibWl0KTtcbn1cblxudHJ5IHtcbiAgbWFpbigpO1xufSBjYXRjaCAoZSkge1xuICBjb25zb2xlLmVycm9yKGUubWVzc2FnZSk7XG59XG4iLCJ0eXBlIFByaWNlUmVzdWx0VHlwZSA9IHtcbiAgYXJiZWl0c3ByZWlzOiBudW1iZXI7XG4gIGdydW5kcHJlaXM6IG51bWJlcjtcbiAgYWJzY2hsYWc6IG51bWJlcjtcbiAgZXJzdGF0dHVuZzogbnVtYmVyO1xuICBiYXNlRmVlOiBudW1iZXI7XG59O1xuXG50eXBlIEFwaVJlc3BvbnNlID0ge1xuICBjYWxjdWxhdGlvbjoge1xuICAgIHdvcmtpbmdQcmljZVBlckt3SDogbnVtYmVyO1xuICAgIGJhc2VQcmljZVBlclllYXJOZXR3b3JrVXNhZ2U6IG51bWJlcjtcbiAgICBtb250aGx5RmVlOiBudW1iZXI7XG4gICAgcmVmdW5kOiBudW1iZXI7XG4gICAgYmFzZUZlZVBlck1vbnRoOiBudW1iZXI7XG4gIH07XG4gIHBsYW5zOiBBcnJheTx7XG4gICAgaWQ6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgZHVyYXRpb25Jbk1vbnRoczogbnVtYmVyO1xuICAgIGVuZERhdGU6IHN0cmluZztcbiAgICB2YXRJbmZvOiBzdHJpbmc7XG4gICAgbW9udGhseUZlZTogbnVtYmVyO1xuICAgIHllYXJseUJhc2VGZWU6IG51bWJlcjtcbiAgICBjb25zdW1wdGlvblByaWNlOiBudW1iZXI7XG4gICAgdG90YWxDb3N0c1BlclllYXI6IG51bWJlcjtcbiAgfT47XG4gIGxlZ2FsRG9jdW1lbnRzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufTtcblxuZXhwb3J0IGNvbnN0IGNhbGN1bGF0ZVByaWNlID0gYXN5bmMgKFxuICB6aXBDb2RlOiBzdHJpbmcsXG4gIGNvbnN1bXB0aW9uS3dIOiBudW1iZXIsXG4gIHR5cGU6ICdjb21tZXJjaWFsJyB8ICdwcml2YXRlJyB8ICdoZWF0JyxcbiAgZGVsaXZlcnlDaXR5Pzogc3RyaW5nLFxuICBkZWxpdmVyeVN0cmVldD86IHN0cmluZyxcbiAgZGVsaXZlcnlIb3VzZU51bWJlcj86IHN0cmluZ1xuKTogUHJvbWlzZTxQcmljZVJlc3VsdFR5cGUgfCBudWxsPiA9PiB7XG4gIHRyeSB7XG4gICAgLy8gTWFwIHR5cGUgdG8gY3VzdG9tZXJUeXBlXG4gICAgY29uc3QgY3VzdG9tZXJUeXBlID1cbiAgICAgIHR5cGUgPT09ICdwcml2YXRlJ1xuICAgICAgICA/ICdpbmRpdmlkdWFsJ1xuICAgICAgICA6IHR5cGUgPT09ICdjb21tZXJjaWFsJ1xuICAgICAgICA/ICdjb21wYW55J1xuICAgICAgICA6ICdpbmRpdmlkdWFsJztcblxuICAgIC8vIE1hcCB0eXBlIHRvIHBvd2VyVHlwZVxuICAgIGNvbnN0IHBvd2VyVHlwZSA9IHR5cGUgPT09ICdoZWF0JyA/ICdoZWF0JyA6ICdlbGVjdHJpY2l0eSc7XG5cbiAgICAvLyBQcmVwYXJlIEFQSSBwYXlsb2FkXG4gICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgIGN1c3RvbWVyVHlwZTogY3VzdG9tZXJUeXBlLFxuICAgICAgZGVsaXZlcnlaaXBDb2RlOiB6aXBDb2RlLFxuICAgICAgZGVsaXZlcnlDaXR5OiBkZWxpdmVyeUNpdHkgfHwgJycsXG4gICAgICBkZWxpdmVyeVN0cmVldDogZGVsaXZlcnlTdHJlZXQgfHwgJycsXG4gICAgICBkZWxpdmVyeUhvdXNlTnVtYmVyOiBkZWxpdmVyeUhvdXNlTnVtYmVyIHx8ICcnLFxuICAgICAgcG93ZXJUeXBlOiBwb3dlclR5cGUsXG4gICAgICB5ZWFybHlDb25zdW1wdGlvbjogY29uc3VtcHRpb25Ld0gudG9TdHJpbmcoKSxcbiAgICB9O1xuXG4gICAgLy8gTWFrZSBBUEkgY2FsbFxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXG4gICAgICAnaHR0cHM6Ly9mYWlyc3Rlci1iYWNrZW5kLmF6dXJld2Vic2l0ZXMubmV0L2FwaS9wbGFucy9jYWxjdWxhdGUnLFxuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIE5vIGNvbnRlbnQgYXQgYWxsXG4gICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjA0KSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdBUEkgY2FsbCByZXR1cm5lZCAyMDQgTm8gQ29udGVudCcpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgY29uc29sZS5lcnJvcignQVBJIGNhbGwgZmFpbGVkOicsIHJlc3BvbnNlLnN0YXR1cywgcmVzcG9uc2Uuc3RhdHVzVGV4dCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBQYXJzZSBib2R5OyBkb24ndCByZWx5IG9uIGNvbnRlbnQtdHlwZSBiZWluZyBleHBvc2VkIHZpYSBDT1JTXG4gICAgY29uc3QgcmF3ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgIGlmICghcmF3KSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdBUEkgY2FsbCByZXR1cm5lZCBlbXB0eSBib2R5JywgcmVzcG9uc2Uuc3RhdHVzKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCBkYXRhOiBBcGlSZXNwb25zZSB8IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGRhdGEgPSBKU09OLnBhcnNlKHJhdyk7XG4gICAgfSBjYXRjaCAocGFyc2VFcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0FQSSBjYWxsIHJldHVybmVkIG5vbi1KU09OIG9yIG1hbGZvcm1lZCBKU09OJyk7XG4gICAgICBjb25zb2xlLmVycm9yKCdTdGF0dXM6JywgcmVzcG9uc2Uuc3RhdHVzLCByZXNwb25zZS5zdGF0dXNUZXh0KTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0JvZHkgc25pcHBldDonLCByYXcuc2xpY2UoMCwgMzAwKSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIWRhdGEgfHwgIWRhdGEuY2FsY3VsYXRpb24pIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0FQSSBjYWxsIHJldHVybmVkIG5vIGNhbGN1bGF0aW9uIHBheWxvYWQnKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0JvZHkgc25pcHBldDonLCByYXcuc2xpY2UoMCwgMzAwKSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBNYXAgQVBJIHJlc3BvbnNlIHRvIHJldHVybiB0eXBlIHVzaW5nIGNhbGN1bGF0aW9uIHZhbHVlc1xuICAgIHJldHVybiB7XG4gICAgICBhcmJlaXRzcHJlaXM6IGRhdGEuY2FsY3VsYXRpb24ud29ya2luZ1ByaWNlUGVyS3dILFxuICAgICAgZ3J1bmRwcmVpczogZGF0YS5jYWxjdWxhdGlvbi5iYXNlUHJpY2VQZXJZZWFyTmV0d29ya1VzYWdlLFxuICAgICAgYWJzY2hsYWc6IGRhdGEuY2FsY3VsYXRpb24ubW9udGhseUZlZSxcbiAgICAgIGVyc3RhdHR1bmc6IGRhdGEuY2FsY3VsYXRpb24ucmVmdW5kLFxuICAgICAgYmFzZUZlZTogZGF0YS5jYWxjdWxhdGlvbi5iYXNlRmVlUGVyTW9udGgsXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjYWxjdWxhdGluZyBwcmljZTonLCBlcnJvcik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDE1Nik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=