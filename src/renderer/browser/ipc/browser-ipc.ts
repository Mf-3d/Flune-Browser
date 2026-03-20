export const browserIpc = {
  async getVersion() {
    return await window.flune.getVersion();
  },
  async getVersions() {
    return await window.flune.getVersions();
  },
  navigate(input: string) {
    window.flune.browser?.navigate(input);
  },
};
