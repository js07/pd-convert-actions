export interface ActionConfig {
  code: string
  title?: string
  description?: string;
  namespace?: string;
  codeConfig?: string;
  versionMajor?: string | number;
  versionMinor?: string | number;
  versionPatch?: string | number;
  hashId?: string;
}

export interface ConvertOptions {
  defineComponent?: boolean = false;
  createLabel?: boolean = false;
  toEsm?: boolean = true;
  usePipedreamLintRules?: boolean = true;
  appPlaceholder?: string = "app_placeholder";
  addPlaceholderAppProp?: boolean = false;
}

export interface ConvertResult {
  code: string;
  appSlug?: string;
  componentSlug?: string;
  legacyHashId?: string;
  componentKey?: string;
}

export declare function convert(actionConfig: ActionConfig, options: ConvertOptions): Promise<ConvertResult>
