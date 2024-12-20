import { slp, slp2025, wp } from "./priceData";

const priceConstants2024 = {
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
export const priceConstants2025 = {
  private: {
    producer: 6.5,
    structuringBudget: 2.22,
  },
  commercial: {
    producer: 6.5,
    structuringBudget: 2.85,
  },
  heat: {
    producer: 6.5,
    structuringBudget: 2.11,
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
  baseFee: number;
};
export const calculatePrice = (
  zipCode: string,
  consumptionKwH: number,
  type: "commercial" | "private" | "heat",
  priceConstants?,
  newPrices?: boolean
): PriceResultType | null => {
  if (typeof priceConstants == "undefined") {
    priceConstants = priceConstants2024;
  }
  let dataSource = type != "heat" ? slp : wp;
  if (type != "heat" && newPrices) {
    // @ts-ignore
    dataSource = slp2025;
  }
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
  const baseFee = Math.floor(4.2 * vatFactor * 100) / 100;
  const yearlyConsumption =
    basePricePerKwHGross +
    (workingPricePerKwHGross / 100) * consumptionKwH +
    baseFee * 12;
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
    baseFee: baseFee,
  };
};
