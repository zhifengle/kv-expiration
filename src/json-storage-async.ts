import fs from 'fs';
import { KvEngineAsync } from './types';

export class JsonEngineAsync implements KvEngineAsync {
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
  async set(key: string, value: any): Promise<boolean> {
    this.config[key] = value;
    return true;
  }
  async get(key: string): Promise<any> {
    return this.config[key];
  }
  async remove(key: string): Promise<void> {
    this.config[key] = undefined;
  }
  async keys(): Promise<string[]> {
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
