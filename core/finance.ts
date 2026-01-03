export type LoanSummary = {
  monthly_payment: number;
  total_interest: number;
  total_paid: number;
  months: number;
};

export const calculateLoan = (principal: number, annual_rate_percent: number, term_months: number): LoanSummary => {
  if (principal <= 0 || term_months <= 0) {
    return { monthly_payment: 0, total_interest: 0, total_paid: 0, months: 0 };
  }
  const monthly_rate = (annual_rate_percent / 100) / 12;
  if (monthly_rate === 0) {
    const payment = principal / term_months;
    return { monthly_payment: payment, total_interest: 0, total_paid: payment * term_months, months: term_months };
  }
  const payment = (principal * monthly_rate) / (1 - Math.pow(1 + monthly_rate, -term_months));
  const total_paid = payment * term_months;
  return { monthly_payment: payment, total_interest: total_paid - principal, total_paid, months: term_months };
};

