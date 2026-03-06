export const browserIpc = {
  async getVersion() {
    return await window.flune.getVersion();
  },
  navigate(input: string) {
    window.flune.browser?.navigate(input);
  },
};