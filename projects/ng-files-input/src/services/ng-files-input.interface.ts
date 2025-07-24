export interface NgFIlesInputConfig {
  preview?: boolean;
  isValid?: (file: File) => boolean | Promise<boolean>;
  onSelect?: (file: File) => void;
}
