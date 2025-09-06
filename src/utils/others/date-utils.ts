export const fifteenMinsFromNow = (): Date => {
  return new Date(Date.now() + 15 * 60 * 1000);
};
export const msInADay = 24 * 60 * 60 * 1000;
export const fifteenDaysFromNow = (): Date => {
  return new Date(Date.now() + 15 * msInADay);
};
