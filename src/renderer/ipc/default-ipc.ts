export const defaultIpc = {
  logger: {
    debug(message: string) {
      // eslint-disable-next-line
      console.debug(message);
      window.flune.logger.debug(message);
    },
    info(message: string) {
      // eslint-disable-next-line
      console.info(message);
      window.flune.logger.info(message);
    },
    warn(message: string) {
      // eslint-disable-next-line
      console.warn(message);
      window.flune.logger.warn(message);
    },
    error(message: string | Error) {
      // eslint-disable-next-line
      console.error(message);
      window.flune.logger.error(message);
    },
  },
  async getVersion() {
    return await window.flune.getVersion();
  },
  async getVersions() {
    return await window.flune.getVersions();
  },
};
