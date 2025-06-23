![npm](https://img.shields.io/npm/v/ng-files-input)
![downloads](https://img.shields.io/npm/dm/ng-files-input)
![license](https://img.shields.io/npm/l/ng-files-input)

# ng-files-input 📁🖼️

**ng-files-input** is an Angular library for previewing uploaded files with support for images, PDFs, plain text, and more — all wrapped in a highly customizable and developer-friendly file input component.

---

## ✨ Features

- 📸 Image preview
- 📄 PDF viewer with embedded preview
- ❓ Graceful fallback for unsupported file types
- 🧠 Automatic file-type detection
- 🎨 Fully customizable UI
- 🔌 Works with `ngModel` and `FormControl`
- 🧩 Designed for modern Angular (v19+)

---

## 📦 Installation

```bash
npm install ng-files-input
```

## ⚙️ Usage

- Import the module

```ts
import { NgFilesInput, UploadType } from "ng-files-input";

@Component({
  imports: [NgFilesInput],
})
export class ExampleComponent {
  uploadType = UploadType.IMAGE;
}
```

- Template Usage

```html
<ng-files-input [uploadType]="uploadType" [accept]="'.png,.jpg'" [(ngModel)]="file" [disabled]="false" [showPreview]="true"> Please select image </ng-files-input>
```

- Style modification

```scss
--ng-files-area-width: 200px;
--ng-files-area-height: 180px;
--ng-files-border-width: 2px;
--ng-files-border-style: solid;
--ng-files-border-color: #9e9e9e;
--ng-files-background: #f5f5f5;
--ng-files-icon-size: 40;
--ng-files-icon-color: green; // This may or may not work
--ng-files-placeholder-color: #292826;
--ng-files-placeholder-font-size: 12px;
--ng-files-placeholder-gap: 5px;
--ng-files-progress-bar-color: green;
```

## 🚀 Advanced Usage: Custom Upload Function with Progress

TS

```ts
import { HttpClient, HttpRequest } from "@angular/common/http";
import { Component, inject } from "@angular/core";

@Component({
  selector: "app-file-upload",
  templateUrl: "./file-upload.component.html",
})
export class FileUploadComponent {
  private http = inject(HttpClient);

  // Upload function passed to ng-files-input
  uploadFile = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const req = new HttpRequest("POST", "https://your.api/upload", formData, {
      reportProgress: true, // enables progress events
    });

    return this.http.request(req); // returns Observable<HttpEvent<any>>
  };
}
```

HTML

```html
<ng-files-input [(ngModel)]="selectedFile" [uploadFn]="uploadFile"></ng-files-input>
```

## ✅ What ng-files-input handles:

- Automatically calls your `uploadFn(file)`
- Tracks `HttpEventType.UploadProgress`
- Emits upload status (optional: via `(uploadProgress)` or `(uploadComplete)` outputs)

## 🧩 Expected Behavior in Library

Internally, your component might do something like:

```ts
uploadFn(file).subscribe((event) => {
  if (event.type === HttpEventType.UploadProgress) {
    const percent = Math.round((100 * event.loaded) / (event.total ?? 1));
    this.progress = percent;
  } else if (event.type === HttpEventType.Response) {
    this.uploadComplete.emit(event.body);
  }
});
```

## 🗂️ Supported File Types

| File Type                     | Preview Method                |
| ----------------------------- | ----------------------------- |
| Images (`.png`, `.jpg`, etc.) | `<img>` tag                   |
| PDFs                          | `<iframe>` or `<embed>`       |
| Text files                    | `<pre>` element               |
| Others                        | ⚠️ Fallback message displayed |

## 🔧 Inputs

| Input                 | Type     | Description                       |
| --------------------- | -------- | --------------------------------- |
| accept                | string   | Accepted MIME types or extensions |
| disabled              | boolean  | Disable file input                |
| ngModel / formControl | `Base64` | `null`                            |

## 🚀 Roadmap

- Drag-and-drop upload
- Multiple file preview
- File validation (type/size)
- Custom preview template slots

## 📄 License

MIT

## 👨‍💻 Author

Made with ❤️ by [Sanjib Kumar Mandal](https://github.com/sanjib-kumar-mandal)
