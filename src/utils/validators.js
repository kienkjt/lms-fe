export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const validatePhone = (phone) => {
  const regex = /^(0|\+84)[3-9][0-9]{8}$/;
  return regex.test(phone);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

export const validateBankAccount = (accountNumber) => {
  // Vietnamese bank accounts are typically 9-20 digits
  const regex = /^[0-9]{9,20}$/;
  return regex.test(accountNumber);
};

export const validateWithdrawalAmount = (amount, maxAmount = null) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) return false;
  if (maxAmount && numAmount > maxAmount) return false;
  return true;
};
