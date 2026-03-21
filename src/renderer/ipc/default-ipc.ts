export const defaultIpc = {
  log: {
    info(message: string) {
      // eslint-disable-next-line
      console.info(message);
      window.flune.log.info(message);
    },
    warn(message: string) {
      // eslint-disable-next-line
      console.warn(message);
      window.flune.log.warn(message);
    },
    error(message: string | Error) {
      // eslint-disable-next-line
      console.error(message);
      window.flune.log.error(message);
    }
  },
  async getVersion() {
    return await window.flune.getVersion();
  },
  async getVersions() {
    return await window.flune.getVersions();
  },
};