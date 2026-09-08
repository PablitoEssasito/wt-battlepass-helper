export const setNumberInput = (
  callback: (value: number) => void,
  value: string,
  min = 0,
  max = Number.MAX_SAFE_INTEGER
) => {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    callback(min);
    return;
  }

  callback(Math.min(Math.max(Math.trunc(parsedValue), min), max));
};
