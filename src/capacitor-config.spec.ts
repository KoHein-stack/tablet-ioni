import config from '../capacitor.config';

describe('capacitor.config', () => {
  it('exports expected Capacitor config basics', () => {
    expect(config.appId).toBe('com.tkks.gic.tablet');
    expect(config.appName).toBe('TKKS');
    expect(config.webDir).toBe('www');
  });

  it('enables CapacitorHttp plugin', () => {
    expect((config as any).plugins?.CapacitorHttp?.enabled).toBeTrue();
  });

  it('sets server allowNavigation and android mixed content options', () => {
    expect((config as any).server?.allowNavigation).toContain('https://122.103.187.60');
    expect((config as any).server?.cleartext).toBeTrue();
    expect((config as any).android?.allowMixedContent).toBeTrue();
  });
});

