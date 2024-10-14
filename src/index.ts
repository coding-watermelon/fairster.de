import { slp, wp } from "./priceData";
import _ from "lodash";

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
  let [workingPricePerKwH, basePricePerKwH] = _.get(slp, zipCode, []);
  let vatFactor = type == "commercial" ? 1 : VAT;
  if (typeof workingPricePerKwH == "undefined") {
    return null;
  }
  console.log(workingPricePerKwH, basePricePerKwH, zipCode);

  // calculate "Arbeitspreis"
  const structuringBudget = _.get(priceConstants, [type, "structuringBudget"]);
  const producingPrice = _.get(priceConstants, [type, "producer"]);
  let workingPricePerKwHNet =
    parseFloat(workingPricePerKwH) +
    (structuringBudget + producingPrice) *
      (ADMINISTRATIVE_SURCHARGE_FACTOR + 1);
  let workingPricePerKwHGross =
    Math.round(workingPricePerKwHNet * vatFactor * 100) / 100;

  console.log(Math.round(basePricePerKwH * 100) / 100);
  // Calc Grundpreis
  const basePricePerKwHGross =
    Math.round(basePricePerKwH * vatFactor * 100) / 100;

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
  function logSubmit(event) {
    event.preventDefault();
    console.log("Submit login");
  }

  const form = document.getElementById("wf-form-Fairster-Calculation");
  form.addEventListener("submit", logSubmit);
}

main();

/**
 *  $this->AdministrativeSurcharge                  = ($this->ProducingPrice + $this->StructuringBudget) * self::ADMINISTRATIVE_SURCHARGE_FACTOR;
        $this->TotalEnergyPrice                         = $this->ProducingPrice + $this->StructuringBudget + $this->AdministrativeSurcharge;
 */
