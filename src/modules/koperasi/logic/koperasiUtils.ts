export interface SHUResult {
  jasaSimpanan: number;
  jasaPinjaman: number;
  totalSHUUser: number;
  savingSharePercent: number;
  loanSharePercent: number;
}

export function calculateSHU(params: {
  totalSHU: number;
  userSavings: number;
  totalSavingsPool: number;
  userBorrowing?: number;
  totalBorrowingPool?: number;
  savingAllocationPercent?: number; // default 30%
  loanAllocationPercent?: number; // default 70%
}): SHUResult {
  const {
    totalSHU,
    userSavings,
    totalSavingsPool,
    userBorrowing = 0,
    totalBorrowingPool = 0,
    savingAllocationPercent = 30,
    loanAllocationPercent = 70
  } = params;

  if (totalSHU <= 0) {
    return { jasaSimpanan: 0, jasaPinjaman: 0, totalSHUUser: 0, savingSharePercent: 0, loanSharePercent: 0 };
  }

  const savingShare = totalSavingsPool > 0 && userSavings > 0 ? (userSavings / totalSavingsPool) : 0;
  const loanShare = totalBorrowingPool > 0 && userBorrowing > 0 ? (userBorrowing / totalBorrowingPool) : 0;

  const poolJasaSimpanan = totalSHU * (savingAllocationPercent / 100);
  const poolJasaPinjaman = totalSHU * (loanAllocationPercent / 100);

  const jasaSimpanan = Math.round(poolJasaSimpanan * savingShare);
  const jasaPinjaman = Math.round(poolJasaPinjaman * loanShare);

  return {
    jasaSimpanan,
    jasaPinjaman,
    totalSHUUser: jasaSimpanan + jasaPinjaman,
    savingSharePercent: Math.round(savingShare * 1000) / 10,
    loanSharePercent: Math.round(loanShare * 1000) / 10
  };
}

export function calculateLoanInstallment(amount: number, tenorMonths: number, flatFeePercentPerMonth: number = 0): {
  monthlyPrincipal: number;
  monthlyFee: number;
  monthlyTotal: number;
  totalRepayment: number;
} {
  if (amount <= 0 || tenorMonths <= 0) {
    return { monthlyPrincipal: 0, monthlyFee: 0, monthlyTotal: 0, totalRepayment: 0 };
  }

  const monthlyPrincipal = Math.round(amount / tenorMonths);
  const monthlyFee = Math.round(amount * (flatFeePercentPerMonth / 100));
  const monthlyTotal = monthlyPrincipal + monthlyFee;
  const totalRepayment = monthlyTotal * tenorMonths;

  return {
    monthlyPrincipal,
    monthlyFee,
    monthlyTotal,
    totalRepayment
  };
}
