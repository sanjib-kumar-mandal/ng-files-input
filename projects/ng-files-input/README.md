![npm](https://img.shields.io/npm/v/ng-files-input)
![downloads](https://img.shields.io/npm/dm/ng-files-input)
![license](https://img.shields.io/npm/l/ng-files-input)
![build](https://img.shields.io/github/actions/workflow/status/sanjib-kumar-mandal/ng-files-input/build.yml)

# ng-files-input 📁🖼️

**ng-files-input** is an Angular library for previewing uploaded files with support for images, PDFs, plain text, and more — all wrapped in a highly customizable and developer-friendly file input component.

---

## ✨ Features

- 📸 Image preview
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

```ts
@Component({
  ...
})
export class HomeComponent {
  config = {
    preview: true,
    isValid: (file: File): boolean => {
      return file ? true : false;
    },
    onSelect: (file: File): void => {
      console.log(file);
    },
  };

  modelValueChanged() {
    console.log(this.base64);
  }
}
```

```html
<ng-files-input [(ngModel)]="base64" (ngModelChange)="modelValueChanged()" [config]="config" accept=".png,.jpg,.jpeg">Upload file</ng-files-input>
```

- Style modification

```scss
--ng-files-input-width: 220px;
--ng-files-input-height: 180px;
--ng-files-input-background-color: #292826 | #f5f5f5;
--ng-files-input-border-width: 0px;
--ng-files-input-border-style: solid;
--ng-files-input-border-color: #3c3c3c | #e5e5e5;
```

## 🚀 Roadmap

- Drag-and-drop upload
- Multiple file preview
- File validation (type/size)
- Custom preview template slots

## 📄 License

MIT

## 👨‍💻 Author

Made with ❤️ by [Sanjib Kumar Mandal](https://github.com/sanjib-kumar-mandal)
