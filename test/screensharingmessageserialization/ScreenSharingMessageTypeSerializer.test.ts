// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as chai from 'chai';

import ScreenSharingMessageType from '../../src/screensharingmessage/ScreenSharingMessageType';
import ScreenSharingMessageTypeSerializer from '../../src/screensharingmessageserialization/ScreenSharingMessageTypeSerializer';

describe('ScreenSharingMessageTypeSerializer', () => {
  const subject = new ScreenSharingMessageTypeSerializer();

  before(() => {
    chai.should();
  });

  describe('#serialize', () => {
    const expected = [
      [ScreenSharingMessageType.UnknownType, 0x0],
      [ScreenSharingMessageType.StreamStart, 0x03],
      [ScreenSharingMessageType.StreamEnd, 0x04],
      [ScreenSharingMessageType.StreamStop, 0x05],
      [ScreenSharingMessageType.HeartbeatRequestType, 0x06],
      [ScreenSharingMessageType.HeartbeatResponseType, 0x07],
      [ScreenSharingMessageType.PresenterSwitch, 0x10],
    ];

    for (const entry of expected) {
      it('is serialized', () => {
        subject.serialize(entry[0] as ScreenSharingMessageType).should.equal(entry[1]);
      });
    }
  });

  describe('#deserialize', () => {
    const expected = [
      [0x00, ScreenSharingMessageType.UnknownType],
      [0x03, ScreenSharingMessageType.StreamStart],
      [0x04, ScreenSharingMessageType.StreamEnd],
      [0x05, ScreenSharingMessageType.StreamStop],
      [0x06, ScreenSharingMessageType.HeartbeatRequestType],
      [0x07, ScreenSharingMessageType.HeartbeatResponseType],
    ];

    for (const entry of expected) {
      it('is deserialized', () => {
        subject.deserialize(entry[0] as number).should.equal(entry[1]);
      });
    }
  });
});
