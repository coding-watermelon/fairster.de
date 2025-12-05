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
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

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
    const raw = await response.text();
    if (!raw) {
      console.error('API call returned empty body', response.status);
      return null;
    }

    let data: ApiResponse | null;
    try {
      data = JSON.parse(raw);
    } catch (parseErr) {
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
  } catch (error) {
    console.error('Error calculating price:', error);
    return null;
  }
};
