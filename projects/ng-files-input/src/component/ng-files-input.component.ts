import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  input,
  model,
  output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { UploadType } from './ng-files-input.model';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'ng-files-input',
  templateUrl: './ng-files-input.component.html',
  styleUrls: ['./ng-files-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useValue: forwardRef(() => NgFilesInput),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgFilesInput implements ControlValueAccessor, AfterViewInit {
  // Local variables
  @ViewChild('container', { read: ViewContainerRef })
  container!: ViewContainerRef;
  // Message Templates
  @ViewChild('initialViewTemplate', { read: TemplateRef })
  initialViewTemplate!: TemplateRef<any>;
  @ViewChild('uploadErrorTemplate', { read: TemplateRef })
  uploadErrorTemplate!: TemplateRef<any>;
  @ViewChild('uploadingProgressTemplate', { read: TemplateRef })
  uploadingFileTemplate!: TemplateRef<any>;
  @ViewChild('uploadCompleteTemplate', { read: TemplateRef })
  uploadCompleteTemplate!: TemplateRef<any>;
  @ViewChild('previewTemplate', { read: TemplateRef })
  previewTemplate!: TemplateRef<any>;
  @ViewChild('unknownTemplate', { read: TemplateRef })
  unknownTemplate!: TemplateRef<any>;
  @ViewChild('fileAdded', { read: TemplateRef }) fileAdded!: TemplateRef<any>;
  // Inputs
  id = input<string>();
  name = input<string>();
  uploadType = input<UploadType>();
  accept = input<string>();
  showPreview = input<boolean>();
  disabled = model<boolean>(false);

  uploadFn = input<(file: any) => Observable<HttpEvent<any>>>();

  // Output
  uploadProgress = output<any>();
  uploadComplete = output<any>();

  value = '';

  onChange = (value: any) => {};
  onTouched = () => {};

  private chg = inject(ChangeDetectorRef);
  private document = inject(DOCUMENT);

  ngAfterViewInit(): void {
    this.container.clear();
    this.container.createEmbeddedView(this.initialViewTemplate);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(Boolean(isDisabled));
  }

  writeValue(obj: any): void {
    this.value = obj;
    console.log('initial value', obj);
    this.chg.markForCheck();
  }

  fileChanged(event: any) {
    const file = event?.target?.files[0];
    if (file) {
      const fileType = file.type;
      const fileName = file.name;
      const reader = new FileReader();
      reader.onload = (e) =>
        this.uploadFile(e.target!.result, fileType, fileName);
      // Read the file as a Data URL or as text
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        reader.readAsDataURL(file); // For images and PDFs
      } else {
        reader.readAsText(file); // For text files
      }
    }
  }

  private uploadFile(file: any, fileType: string, fileName?: string): void {
    const fn = this.uploadFn();
    if (fn) {
      fn(file).subscribe({
        next: (event) => {
          this.container.clear();
          if (event.type === HttpEventType.Sent) {
            this.container.createEmbeddedView(this.uploadingFileTemplate, {
              progress: 0,
            });
          } else if (event.type === HttpEventType.UploadProgress) {
            const progress = Math.round(
              (100 * event.loaded) / (event.total || 1)
            );
            this.container.createEmbeddedView(this.uploadingFileTemplate, {
              progress,
            });
            this.uploadProgress.emit({ progress });
          } else if (event.type === HttpEventType.Response) {
            // File data
            this.writeValue(file);
            if (this.showPreview()) {
              this.preview(file, fileType);
            } else {
              this.container.createEmbeddedView(this.uploadCompleteTemplate, {
                label: fileName,
              });
            }
            this.uploadComplete.emit(event.body);
          } else {
            this.container.createEmbeddedView(this.unknownTemplate, {
              message: 'Unknown process',
            });
          }
        },
        error: (e) => {
          this.container.clear();
          // this.container.createEmbeddedView(this.uploadErrorTemplate, {
          //   message: e.error.message ?? e.message ?? 'Something went wrong',
          // });
          this.preview(file, fileType);
        },
      });
    } else {
      this.writeValue(file);
      this.container.clear();
      if (this.showPreview()) {
        this.preview(file, fileType);
      } else {
        this.container.createEmbeddedView(this.fileAdded, {
          label: fileName,
        });
      }
    }
  }

  private preview(file: any, fileType: string) {
    const noPreview = () => {
      const svg = `<svg style="width: var(--ng-files-icon-size, 20); height: var(--ng-files-icon-size, 20); stroke-width: var(--ng-files-icon-stroke-width, 1);" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="28" stroke="#38A169" fill="none"/><path d="M22 30L28 36L40 24" stroke="#38A169" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      const div = this.document.createElement('div');
      div.style.display = 'flex';
      div.style.flexDirection = 'column';
      div.style.gap = '10px';
      const span = this.document.createElement('span');
      span.innerHTML = svg;
      div.appendChild(span);
      return div;
    };
    const ref = this.container.createEmbeddedView(this.previewTemplate);
    const previewArea = ref.rootNodes.find(
      (el) => el.nodeType === 1 && el.tagName === 'DIV'
    ) as HTMLDivElement;
    previewArea.innerHTML = '';
    if (fileType === 'application/pdf') {
      // For PDFs, use an iframe
      const iframe = this.document.createElement('iframe');
      iframe.src = file + '#toolbar=0&navpanes=0&scrollbar=0';
      iframe.style.maxWidth = '100%';
      iframe.style.height = getComputedStyle(previewArea).height;
      previewArea.appendChild(iframe);
    } else if (fileType.startsWith('image/')) {
      // For images, use an img tag
      const img = this.document.createElement('img');
      img.src = file;
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      previewArea.appendChild(img);
    } else if (
      fileType === 'text/plain' ||
      fileType === 'application/msword' ||
      fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      if (fileType === 'text/plain') {
        const pre = this.document.createElement('pre');
        pre.textContent = file;
        previewArea.appendChild(pre);
      } else {
        previewArea.appendChild(noPreview());
      }
    } else {
      previewArea.appendChild(noPreview());
    }
  }
}
