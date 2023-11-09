const getNumberFromText = (text: string) => {
  const numbers = text.match(/\d+/);

  if (numbers) {
    return parseInt(numbers[0]);
  }
};

const Functions = {
  getNumberFromText,
};

export default Functions;
