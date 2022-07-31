# kv-expiration

A library for caching data with expiration time. You can use a custom key-value storage engine.

If you just want to use `localStorage`, you can use [lscache](https://github.com/pamelafox/lscache).

## Usage

npm i kv-expiration

buitin key-value storage engine: JsonEngine, GmEngine, LsEngine

```javascript
import { KvExpiration, JsonEngine, GmEngine } from 'kv-expiration';

const engine = new JsonEngine('my-storage.json');
const kvJson = new KvExpiration(engine, 'MY_PREFIX_', 'SOME_SUFFIX', 'BUCKET');
kvJson.set('expired in two day', 'some text', 2);
kvJson.set('never expired', 1);
// GmEngine only can be used in userscript manager. Tampermonkey, Violentmonkey
// suffix, bucket is optional
const kv = new KvExpiration(new GmEngine(), 'MY_PREFIX_');
// foo would expire in 1 day 10 hours and 1 minute.
kv.set(
  'foo',
  { a: 1 },
  {
    dd: 1,
    hh: 10,
    mm: 1,
  }
);
```

### Custom Engine

```typescript
import { KvExpiration } from 'kv-expiration';
import type { KvEngine } from 'kv-expiration';

class LsEngine implements KvEngine {
  set(key: string, value: any): boolean {
    try {
      value = JSON.stringify(value);
    } catch (e) {
      return false;
    }
    localStorage.setItem(key, value);
    return true;
  }
  get(key: string) {
    let value = localStorage.getItem(key);
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  remove(key: string): void {
    localStorage.removeItem(key);
  }
  keys(): string[] {
    var arr: string[] = [];
    return arr;
  }
}
const engine = new LsEngine();
const kvExpiration = new KvExpiration(
  engine,
  'MY_PREFIX_',
  'SOME_SUFFIX',
  'BUCKET'
);
// out of date in one day
kvExpiration.set('foo', 'bar', 1);
```

## API

```typescript
declare type TimeOpt =
  | number
  | {
      hh?: number;
      dd?: number;
      mm?: number;
      ss?: number;
      ms?: number;
    };
declare class KvExpiration {
  private engine;
  private prefix;
  private suffix;
  private bucket;
  // suffix, bucket is optional
  constructor(
    engine: KvEngine,
    prefix: string,
    suffix?: string,
    bucket?: string
  );
  // clear all data set by KvExpiration
  flush(): void;
  // clear expired data set by KvExpiration
  flushExpired(): void;
  // set key-value.
  // if opt is number, the value will expire after `opt` days.
  set(key: string, value: any, opt?: TimeOpt): boolean;
  // get value by key
  get(key: string): any;
  // remove value by key
  remove(key: string): void;
}

// If you want to custom engine, your engine must have to implement method.
interface KvEngine {
  set(key: string, value: any): boolean;
  get(key: string): any;
  remove(key: string): void;
  keys(): string[];
}
```
