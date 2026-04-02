function fakeApi() {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * 3) + 1;
    const combination = Array.from({ length: COLS }, () =>
      Math.floor(Math.random() * symbols.length),
    );
    setTimeout(() => {
      resolve({ delay, combination });
    }, delay * 1000);
  });
}
