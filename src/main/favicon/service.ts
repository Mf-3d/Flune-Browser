import { nativeImage, type NativeImage } from "electron";
import type { Favicon } from "@/shared/types/data";
import { config } from "@/app.config";

export class FaviconService {
  private cache = new Map<string, NativeImage>();

  constructor() {}

  async get(url: string): Promise<Favicon | undefined> {
    if (new URL(url).protocol === `${config.protocol}:`) {
      return;
    }

    console.log(new URL(url).protocol, `${config.protocol}:`, url);

    if (this.cache.has(url)) {
      return {
        url,
        data: this.cache.get(url)!,
      };
    }

    const data = await this.fetchFavicon(url);

    if (!data) {
      throw new Error("Failed to fetch favicon.");
    }

    const favicon: Favicon = {
      url,
      data,
      // dataUrl: data.toDataURL(),
    };
    if (favicon) {
      this.cache.set(url, data);
    }

    return favicon;
  }

  private async fetchFavicon(url: string): Promise<NativeImage | undefined> {
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      // headers: {
      //   "Content-Type": "application/json",
      // },
    });

    return nativeImage.createFromDataURL(URL.createObjectURL(await res.blob()));
  }
}
