import fs from 'fs';
import { KvEngine } from './types';

export class JsonEngine implements KvEngine {
  config: any;
  filename: string;
  constructor(filename: string) {
    const runtime = globalThis.process?.release?.name;
    if (!runtime) {
      throw new Error('json-storage must be used in nodejs');
    }
    this.filename = filename;
    let config: any = {};
    try {
      config = JSON.parse(fs.readFileSync(filename, 'utf-8'));
    } catch (error) {
      config = {};
    }
    this.config = config;
  }
  set(key: string, value: any): boolean {
    this.config[key] = value;
    this.writeFile(this.filename, this.config);
    return true;
  }
  get(key: string) {
    return this.config[key];
  }
  remove(key: string): void {
    this.config[key] = undefined;
    this.write();
  }
  keys(): string[] {
    return Object.keys(this.config);
  }
  write() {
    fs.writeFileSync(this.filename, JSON.stringify(this.config), 'utf-8');
  }
  writeFile(name: string, obj: any = {}) {
    fs.writeFileSync(
      name,
      JSON.stringify(obj),
      // `${util.inspect(obj, { maxArrayLength: null })}`,
      'utf-8'
    );
  }
}
