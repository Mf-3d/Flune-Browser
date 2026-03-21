export const browserIpc = {
  navigate(input: string) {
    window.flune.browser?.navigate(input);
  },
};
