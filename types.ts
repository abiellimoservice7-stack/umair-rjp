
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export type ImageSize = "1K" | "2K" | "4K";

export interface WallpaperStyle {
  id: string;
  name: string;
  promptSuffix: string;
  icon: string;
  preview: string;
}

export interface GeneratedWallpaper {
  id: string;
  url: string;
  prompt: string;
  style: string;
  aspectRatio: AspectRatio;
  createdAt: number;
}

export enum ModelType {
  STANDARD = 'gemini-2.5-flash-image',
  PRO = 'gemini-3-pro-image-preview'
}

// Ensure the AIStudio interface is recognized in the global scope and matches the expected type
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Adding readonly modifier to match the environment's internal declaration of aistudio
    readonly aistudio: AIStudio;
  }
}
