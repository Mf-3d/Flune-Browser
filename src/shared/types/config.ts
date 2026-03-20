export type Theme = {
  id: string;
  name: string;
  url: string;
};

export type SearchEngine = {
  id: string;
  name: string;
  url: string;
};

export type Config = {
  /**
   * Config version.
   * @example [3,0,0]
   */
  version: [number, number, number];
  settings: {
    autoSave: boolean;
    window: {
      bounds: {
        width: number;
        height: number;
        x: number | null;
        y: number | null;
      };
    };
    search: {
      /**
       * Current search engine ID.
       */
      engine: string;
    };
    design: {
      /**
       * Current theme ID.
       */
      theme: string;
      showHomeButton: boolean;
    };
  };
  themes: Theme[];
  searchEngines: SearchEngine[];
};
