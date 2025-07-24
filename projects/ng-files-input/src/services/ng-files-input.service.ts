import { Injectable } from '@angular/core';

@Injectable()
export class NgFilesInputService {
  get fileType() {
    return {
      isBase64Image: (base64Data?: string): boolean => {
        if (!base64Data) return false;
        if (!base64Data.startsWith('data:')) return false;
        const mime = base64Data.substring(5, base64Data.indexOf(';'));
        return mime.startsWith('image/');
      },
      isImageURL: async (url?: string): Promise<boolean> => {
        try {
          if (!url) return false;
          const response = await fetch(url, { method: 'HEAD' });
          const contentType = response.headers.get('Content-Type');
          return contentType?.startsWith('image/') ?? false;
        } catch (error) {
          return false;
        }
      },
    };
  }

  convertFileToBase64(file?: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      if (!file) {
        return resolve(null);
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file); // Reads file and encodes as base64

        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      }
    });
  }

  async convertUrlToBase64(url?: string): Promise<string> {
    if (!url) return '';
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };

      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
