import { KvEngine, KvEngineAsync } from './types';

type TimeOpt =
  | number
  | {
      hh?: number;
      dd?: number;
      mm?: number;
      ss?: number;
      ms?: number;
    };

export function getMilliseconds(opt: TimeOpt): number {
  if (typeof opt === 'number') {
    const oneDay = 24 * 60 * 60 * 1000;
    return oneDay * opt;
  }
  const d = (opt.dd || 0) + 1;
  return (
    +new Date(1970, 1, d, opt.hh || 0, opt.mm || 0, opt.ss || 0, opt.ms || 0) -
    +new Date(1970, 1)
  );
}

export class KvExpiration {
  constructor(
    private engine: KvEngine,
    private prefix: string,
    private suffix: string = '-expiration',
    private bucket: string = ''
  ) {}
  genExpirationKey(key: string): string {
    return `${this.prefix}${this.bucket}${key}${this.suffix}`;
  }
  genKey(key: string): string {
    return `${this.prefix}${this.bucket}${key}`;
  }
  flush() {
    this.engine.keys().forEach((key) => {
      if (key.startsWith(`${this.prefix}${this.bucket}`)) {
        this.engine.remove(key);
      }
    });
  }
  flushExpired() {
    const pre = `${this.prefix}${this.bucket}`;
    this.engine.keys().forEach((key) => {
      if (key.startsWith(pre) && !key.endsWith(this.suffix)) {
        this.flushExpiredItem(key.replace(pre, ''));
      }
    });
  }
  flushExpiredItem(key: string): boolean {
    var exprKey = this.genExpirationKey(key);
    let time = this.engine.get(exprKey);
    if (time) {
      if (typeof time !== 'number') {
        time = parseInt(time);
      }
      if (+new Date() >= time) {
        this.engine.remove(exprKey);
        this.engine.remove(this.genKey(key));
        return true;
      }
    }
    return false;
  }
  set(key: string, value: any, opt?: TimeOpt): boolean {
    this.engine.set(this.genKey(key), value);
    if (opt) {
      const invalidTime = +new Date() + getMilliseconds(opt);
      this.engine.set(this.genExpirationKey(key), invalidTime);
    }
    return true;
  }
  get(key: string): any {
    if (this.flushExpiredItem(key)) {
      return;
    }
    return this.engine.get(this.genKey(key));
  }
  remove(key: string) {
    this.engine.remove(this.genKey(key));
    this.engine.remove(this.genExpirationKey(key));
  }
}

export class KvExpirationAsync {
  constructor(
    private engine: KvEngineAsync,
    private prefix: string,
    private suffix: string = '-expiration',
    private bucket: string = ''
  ) {}
  genExpirationKey(key: string): string {
    return `${this.prefix}${this.bucket}${key}${this.suffix}`;
  }
  genKey(key: string): string {
    return `${this.prefix}${this.bucket}${key}`;
  }
  async flush() {
    const keys = await this.engine.keys();
    const task: Promise<any>[] = [];
    keys.forEach((key) => {
      if (key.startsWith(`${this.prefix}${this.bucket}`)) {
        task.push(this.engine.remove(key));
      }
    });
    await Promise.all(task);
  }
  async flushExpired() {
    const pre = `${this.prefix}${this.bucket}`;
    const keys = await this.engine.keys();
    const task: Promise<any>[] = [];
    keys.forEach((key) => {
      if (key.startsWith(pre) && !key.endsWith(this.suffix)) {
        task.push(this.flushExpiredItem(key.replace(pre, '')));
      }
    });
    await Promise.all(task);
  }
  async flushExpiredItem(key: string): Promise<boolean> {
    var exprKey = this.genExpirationKey(key);
    let time = await this.engine.get(exprKey);
    if (time) {
      if (typeof time !== 'number') {
        time = parseInt(time);
      }
      if (+new Date() >= time) {
        await Promise.all([
          this.engine.remove(exprKey),
          this.engine.remove(this.genKey(key)),
        ]);
        return true;
      }
    }
    return false;
  }
  async set(key: string, value: any, opt?: TimeOpt): Promise<boolean> {
    await this.engine.set(this.genKey(key), value);
    if (opt) {
      const invalidTime = +new Date() + getMilliseconds(opt);
      await this.engine.set(this.genExpirationKey(key), invalidTime);
    }
    return true;
  }
  async get(key: string): Promise<any> {
    if (await this.flushExpiredItem(key)) {
      return;
    }
    return await this.engine.get(this.genKey(key));
  }
  async remove(key: string) {
    await Promise.all([
      this.engine.remove(this.genKey(key)),
      this.engine.remove(this.genExpirationKey(key)),
    ]);
  }
}
