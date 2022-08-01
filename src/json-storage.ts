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
    process.on('exit', (code) => {
      this.write();
    });
    process.on('SIGINT', () => {
      this.write();
    });
    process.on('SIGTERM', () => {
      this.write();
    });
  }
  set(key: string, value: any): boolean {
    this.config[key] = value;
    return true;
  }
  get(key: string) {
    return this.config[key];
  }
  remove(key: string): void {
    this.config[key] = undefined;
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
