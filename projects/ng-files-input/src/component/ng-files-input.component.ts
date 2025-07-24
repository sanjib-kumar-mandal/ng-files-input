import {
  Component,
  effect,
  forwardRef,
  inject,
  input,
  model,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgFilesInputService } from '../services/ng-files-input.service';
import { NgFIlesInputConfig } from '../services/ng-files-input.interface';

@Component({
  selector: 'ng-files-input',
  imports: [],
  templateUrl: './ng-files-input.component.html',
  styleUrl: './ng-files-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgFilesInput),
      multi: true,
    },
    NgFilesInputService,
  ],
})
export class NgFilesInput implements ControlValueAccessor {
  // Id on the input
  id = input<string>();
  // name of the input
  name = input<string>();
  // File accept type from device
  accept = input<string>();
  // Disbale status
  disabled = model<boolean>(false);
  // Config
  config = input<NgFIlesInputConfig>();
  // value can be provided and it currently must be url string or base64 string
  value = input<string>();

  // Injectables
  private ngFilesInputService = inject(NgFilesInputService);
  // Local variables
  isImage = {
    valid: false,
    data: '',
  };

  onChange = (value: any) => {};
  onTouched = () => {};

  constructor() {
    effect(async () => {
      // For previewing
      this.previewImageValidate(this.value());
      // Update controller
      if (this.value()) {
        // Check if base64 is provided or not
        if (this.ngFilesInputService.fileType.isBase64Image(this.value())) {
          this.writeValue(this.value());
        }
        // Check if url provided or not
        else if (
          await this.ngFilesInputService.fileType.isImageURL(this.value())
        ) {
          const base64 = await this.ngFilesInputService.convertUrlToBase64(
            this.value()
          );
          if (base64) {
            this.writeValue(base64);
          }
        }
      }
    });
  }

  private async previewImageValidate(data?: string) {
    const { isImageURL, isBase64Image } = this.ngFilesInputService.fileType;
    if (this.config()?.preview) {
      if (await isImageURL(data)) {
        this.isImage.valid = true;
        this.isImage.data = data!;
      } else if (isBase64Image(data)) {
        this.isImage.valid = true;
        this.isImage.data = data!;
      } else {
        this.isImage.valid = false;
        this.isImage.data = '';
      }
    } else {
      this.isImage.valid = false;
      this.isImage.data = '';
    }
    console.log(this.isImage);
  }

  /**
   * FIle selected
   * @param event
   */
  async onFileSelected(event: Event) {
    try {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        const selectedFile = input.files[0];
        // if trying to access file
        if (this.config()?.hasOwnProperty('onSelect')) {
          (this.config() as any).onSelect(selectedFile);
        }
        // If needs validation
        if (this.config()?.hasOwnProperty('isValid')) {
          const isValid = await (this.config() as any).isValid(selectedFile);
          if (isValid) {
            const base64 = await this.ngFilesInputService.convertFileToBase64(
              selectedFile
            );
            this.writeValue(base64);
          }
        } else {
          // Do not required validation
          const base64 = await this.ngFilesInputService.convertFileToBase64(
            selectedFile
          );
          this.writeValue(base64);
        }
      }
    } catch (e) {
      console.error('Error on uploading file', e);
    }
  }

  // Whatever input passed through this function is value which will work as input
  writeValue(obj: any): void {
    this.previewImageValidate(obj);
  }
  // Angular change
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  // Angular touch
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  // Disable state maintain
  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(Boolean(isDisabled));
  }
}
