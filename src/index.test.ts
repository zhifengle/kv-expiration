import {
  getMilliseconds,
  KvExpiration,
  KvExpirationAsync,
} from './kv-expiration';
import { JsonEngine } from './json-storage';
import { JsonEngineAsync } from './json-storage-async';

describe('KvExpiration', () => {
  test('getMilliseconds', () => {
    const ss = 1000;
    const minute = 60 * ss;
    const hour = 60 * minute;
    const day = 24 * hour;
    expect(getMilliseconds(3)).toBe(day * 3);
    expect(getMilliseconds({ hh: 3 })).toBe(hour * 3);
    expect(getMilliseconds({ dd: 3, hh: 1, mm: 20, ss: 15, ms: 1 })).toBe(
      day * 3 + hour + 20 * minute + 15 * ss + 1
    );
  });
  test('JsonEngine', () => {
    const engine = new JsonEngine('test-storage.json');
    const kv = new KvExpiration(engine, 'MY_PREFIX_');
    kv.set('foo', { a: 1 }, 1);
    kv.set('bar', 2, { mm: 1 });
    expect(kv.get('foo')).toEqual({ a: 1 });
    expect(kv.get('bar')).toEqual(2);
    jest.useFakeTimers().setSystemTime(+new Date() + 2 * 1000 * 60);
    expect(kv.get('bar')).toBeUndefined();
    jest.useFakeTimers().setSystemTime(+new Date() + 2 * 1000 * 60 * 60 * 24);
    expect(kv.get('foo')).toBeUndefined();
  });
});

describe('KvExpirationAsync', () => {
  test('JsonEngineAsync', async () => {
    const engine = new JsonEngineAsync('test-storage.json');
    const kv = new KvExpirationAsync(engine, 'MY_PREFIX_');
    await kv.set('foo', { a: 1 }, 1);
    await kv.set('bar', 2, { mm: 1 });
    expect(await kv.get('foo')).toEqual({ a: 1 });
    expect(await kv.get('bar')).toEqual(2);
    jest.useFakeTimers().setSystemTime(+new Date() + 2 * 1000 * 60);
    expect(await kv.get('bar')).toBeUndefined();
    jest.useFakeTimers().setSystemTime(+new Date() + 2 * 1000 * 60 * 60 * 24);
    expect(await kv.get('foo')).toBeUndefined();
  });
});
