// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as chai from 'chai';

import DefaultBrowserBehavior from '../../src/browserbehavior/DefaultBrowserBehavior';
import DOMMockBuilder from '../dommock/DOMMockBuilder';

describe('DefaultBrowserBehavior', () => {
  const expect: Chai.ExpectStatic = chai.expect;

  const CHROME_USERAGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3865.75 Safari/537.36';
  const FIREFOX_USERAGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:68.0) Gecko/20100101 Firefox/68.0';
  const SAFARI_USERAGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.2 Safari/605.1.15';
  const CHROMIUM_EDGE_USERAGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3729.48 Safari/537.36 Edg/79.1.96.24';
  const OPERA_USERAGENT = 'Opera/9.80 (Windows NT 6.1; WOW64) Presto/2.12.388 Version/12.18';

  const setUserAgent = (userAgent: string): void => {
    // @ts-ignore
    navigator.userAgent = userAgent;
  };

  let mockBuilder: DOMMockBuilder | null = null;

  beforeEach(() => {
    mockBuilder = new DOMMockBuilder();
  });

  afterEach(() => {
    mockBuilder.cleanup();
  });

  describe('platforms', () => {
    it('can detect Firefox', () => {
      setUserAgent(FIREFOX_USERAGENT);
      expect(new DefaultBrowserBehavior().name()).to.eq('firefox');
      expect(new DefaultBrowserBehavior().isSupported()).to.eq(true);
      expect(new DefaultBrowserBehavior().majorVersion()).to.eq(68);
    });

    it('can detect Chrome', () => {
      setUserAgent(CHROME_USERAGENT);
      expect(new DefaultBrowserBehavior().name()).to.eq('chrome');
      expect(new DefaultBrowserBehavior().isSupported()).to.eq(true);
      expect(new DefaultBrowserBehavior().majorVersion()).to.eq(78);
    });

    it('can detect Edge Chromium', () => {
      setUserAgent(CHROMIUM_EDGE_USERAGENT);
      expect(new DefaultBrowserBehavior().name()).to.eq('edge-chromium');
      expect(new DefaultBrowserBehavior().isSupported()).to.eq(true);
      expect(new DefaultBrowserBehavior().majorVersion()).to.eq(79);
    });

    it('can detect Safari', () => {
      setUserAgent(SAFARI_USERAGENT);
      expect(new DefaultBrowserBehavior().name()).to.eq('safari');
      expect(new DefaultBrowserBehavior().isSupported()).to.eq(false);
      expect(new DefaultBrowserBehavior().majorVersion()).to.eq(13);
    });

    it('can handle an unknown user agent', () => {
      setUserAgent(OPERA_USERAGENT);
      expect(new DefaultBrowserBehavior().isSupported()).to.eq(false);
    });
  });
});
