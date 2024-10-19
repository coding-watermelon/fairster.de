import { slp, wp } from "./priceData";
// import _ from "lodash";
import { init } from "./contractPage";

const priceConstants = {
  private: {
    producer: 10.888,
    structuringBudget: 0.7493420625,
  },
  commercial: {
    producer: 10.888,
    structuringBudget: 0.867397622499999,
  },
  heat: {
    producer: 10.888,
    structuringBudget: 0.579749999999999,
  },
};
const ADMINISTRATIVE_SURCHARGE_FACTOR = 0.05;
const ESTIMATED_REFUND_FACTOR = 0.5;
const VAT = 1.19;

type PriceResultType = {
  arbeitspreis: number;
  grundpreis: number;
  abschlag: number;
  erstattung: number;
};
const calculatePrice = (
  zipCode: string,
  consumptionKwH: number,
  type: "commercial" | "private" | "heat"
): PriceResultType | null => {
  const dataSource = type != "heat" ? slp : wp;
  let [workingPricePerKwH, basePricePerKwH] = dataSource[zipCode] || [];
  console.log("Prices", basePricePerKwH);
  let vatFactor = type == "commercial" ? 1 : VAT;
  if (typeof workingPricePerKwH == "undefined") {
    return null;
  }

  // calculate "Arbeitspreis"
  const structuringBudget = priceConstants[type]["structuringBudget"];
  const producingPrice = priceConstants[type]["producer"];
  let workingPricePerKwHNet =
    parseFloat(workingPricePerKwH) +
    (structuringBudget + producingPrice) *
      (ADMINISTRATIVE_SURCHARGE_FACTOR + 1);
  let workingPricePerKwHGross =
    Math.round(workingPricePerKwHNet * vatFactor * 100) / 100;

  // Calc Grundpreis
  const basePricePerKwHGross =
    Math.round(parseFloat(basePricePerKwH) * vatFactor * 100) / 100;

  // Monthly Fee
  const yearlyConsumption =
    basePricePerKwHGross + (workingPricePerKwHGross / 100) * consumptionKwH;
  const monthlyFee = Math.round((yearlyConsumption / 12) * 100) / 100;

  // Refund
  const refund =
    Math.floor(structuringBudget * ESTIMATED_REFUND_FACTOR * vatFactor * 100) /
    100;

  return {
    arbeitspreis: workingPricePerKwHGross,
    grundpreis: basePricePerKwHGross,
    abschlag: monthlyFee,
    erstattung: refund,
  };
};

async function main() {
  init();
  function logSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    let form = {
      energyConsumer: (
        document.getElementById(
          "form-field-energy-consumer"
        ) as HTMLInputElement
      ).value as "commercial" | "private" | "heat",
      zipCode: (
        document.getElementById("form-field-zip-code") as HTMLInputElement
      ).value,
      consumption: (
        document.getElementById(
          "form-field-yearly-consumption"
        ) as HTMLInputElement
      ).value,
    };
    let prices = calculatePrice(
      form.zipCode,
      parseInt(form.consumption),
      form.energyConsumer
    );

    let pricesNet = form.energyConsumer == "commercial";

    document.getElementById("working-price-text").innerHTML = `${
      pricesNet ? "netto" : "brutto"
    } ${prices.arbeitspreis} Cent/kWh`;
    document.getElementById("base-price-text").innerHTML = `${
      pricesNet ? "netto" : "brutto"
    } ${prices.grundpreis} EUR/Jahr`;
    document.getElementById(
      "monthly-fee-text"
    ).innerHTML = `brutto ${prices.abschlag} EUR`;
    document.getElementById("refund-text").innerHTML = `${
      pricesNet ? "netto" : "brutto"
    } ${prices.erstattung} Cent/kWh`;
    document.getElementById("cost-calc-table").style.display = "block";
  }

  const form = document.getElementById("wf-form-Fairster-Calculation");
  form.addEventListener("submit", logSubmit);
}

try {
  main();
} catch (e) {
  console.error(e.message);
}

/**
 *  $this->AdministrativeSurcharge                  = ($this->ProducingPrice + $this->StructuringBudget) * self::ADMINISTRATIVE_SURCHARGE_FACTOR;
        $this->TotalEnergyPrice                         = $this->ProducingPrice + $this->StructuringBudget + $this->AdministrativeSurcharge;
 */
