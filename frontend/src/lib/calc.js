// Calculation logic for laser cutting & engraving quotes.
// All measurements in millimeters, time in minutes.

export function computeQuote(input) {
  const {
    pricePerSheet = 0,
    sheetWidth = 1,
    sheetHeight = 1,
    wasteFactor = 0,
    pieceWidth = 0,
    pieceHeight = 0,
    quantity = 1,
    cuttingTimeMin = 0,
    engravingTimeMin = 0,
    machineHourlyRate = 0,
    engravingHourlyRate = 0,
    electricityCostPerHour = 0,
    laborCostPerHour = 0,
    additionalCosts = [],
    profitMargin = 0,
  } = input;

  const sheetArea = Math.max(sheetWidth * sheetHeight, 1);
  const pieceArea = Math.max(pieceWidth * pieceHeight, 0);
  const totalPieceArea = pieceArea * Math.max(quantity, 1);
  const sheetsUsed = totalPieceArea / sheetArea; // fractional
  const materialCost = sheetsUsed * pricePerSheet * (1 + wasteFactor);

  const cuttingHours = cuttingTimeMin / 60;
  const engravingHours = engravingTimeMin / 60;
  const totalHours = cuttingHours + engravingHours;

  const cuttingCost = cuttingHours * machineHourlyRate;
  const engravingCost = engravingHours * engravingHourlyRate;
  const electricityCost = totalHours * electricityCostPerHour;
  const laborCost = totalHours * laborCostPerHour;

  const additionalTotal = (additionalCosts || []).reduce(
    (s, c) => s + (parseFloat(c.amount) || 0),
    0
  );

  const subtotal =
    materialCost +
    cuttingCost +
    engravingCost +
    electricityCost +
    laborCost +
    additionalTotal;

  const profitAmount = subtotal * (profitMargin / 100);
  const total = subtotal + profitAmount;
  const pricePerUnit = total / Math.max(quantity, 1);

  return {
    materialCost,
    cuttingCost,
    engravingCost,
    electricityCost,
    laborCost,
    additionalTotal,
    subtotal,
    profitAmount,
    total,
    pricePerUnit,
    sheetsUsed,
    totalHours,
  };
}

export function fmtMoney(n, symbol = "$") {
  const v = Number.isFinite(n) ? n : 0;
  return `${symbol}${v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function fmtNum(n, digits = 2) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return iso;
  }
}
