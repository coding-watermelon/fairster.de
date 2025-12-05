type PriceResultType = {
  arbeitspreis: number;
  grundpreis: number;
  abschlag: number;
  erstattung: number;
  baseFee: number;
};

type ApiResponse = {
  calculation: {
    workingPricePerKwH: number;
    basePricePerYearNetworkUsage: number;
    monthlyFee: number;
    refund: number;
    baseFeePerMonth: number;
  };
  plans: Array<{
    id: string;
    name: string;
    durationInMonths: number;
    endDate: string;
    vatInfo: string;
    monthlyFee: number;
    yearlyBaseFee: number;
    consumptionPrice: number;
    totalCostsPerYear: number;
  }>;
  legalDocuments: Record<string, string>;
};

export const calculatePrice = async (
  zipCode: string,
  consumptionKwH: number,
  type: 'commercial' | 'private' | 'heat',
  deliveryCity?: string,
  deliveryStreet?: string,
  deliveryHouseNumber?: string
): Promise<PriceResultType | null> => {
  try {
    // Map type to customerType
    const customerType =
      type === 'private'
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
    const response = await fetch(
      'https://fairster-backend.azurewebsites.net/api/plans/calculate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      console.error('API call failed:', response.status, response.statusText);
      return null;
    }

    const data: ApiResponse = await response.json();

    // Map API response to return type using calculation values
    return {
      arbeitspreis: data.calculation.workingPricePerKwH,
      grundpreis: data.calculation.basePricePerYearNetworkUsage,
      abschlag: data.calculation.monthlyFee,
      erstattung: data.calculation.refund,
      baseFee: data.calculation.baseFeePerMonth,
    };
  } catch (error) {
    console.error('Error calculating price:', error);
    return null;
  }
};
