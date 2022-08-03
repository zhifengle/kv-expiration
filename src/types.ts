export interface KvEngine {
  set(key: string, value: any): boolean;
  get(key: string): any;
  remove(key: string): void;
  keys(): string[];
}

export interface KvEngineAsync {
  set(key: string, value: any): Promise<boolean>;
  get(key: string): Promise<any>;
  remove(key: string): Promise<void>;
  keys(): Promise<string[]>;
}
