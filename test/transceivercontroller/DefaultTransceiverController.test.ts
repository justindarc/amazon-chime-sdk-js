// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as chai from 'chai';

import LogLevel from '../../src/logger/LogLevel';
import NoOpLogger from '../../src/logger/NoOpLogger';
import TimeoutScheduler from '../../src/scheduler/TimeoutScheduler';
import {
  SdkIndexFrame,
  SdkStreamDescriptor,
  SdkStreamMediaType,
  SdkSubscribeAckFrame,
  SdkTrackMapping,
} from '../../src/signalingprotocol/SignalingProtocol.js';
import DefaultTransceiverController from '../../src/transceivercontroller/DefaultTransceiverController';
import TransceiverController from '../../src/transceivercontroller/TransceiverController';
import DefaultVideoStreamIdSet from '../../src/videostreamidset/DefaultVideoStreamIdSet';
import VideoStreamIdSet from '../../src/videostreamidset/VideoStreamIdSet';
import DefaultVideoStreamIndex from '../../src/videostreamindex/DefaultVideoStreamIndex';
import DOMMockBehavior from '../dommock/DOMMockBehavior';
import DOMMockBuilder from '../dommock/DOMMockBuilder';

describe('DefaultTransceiverController', () => {
  const expect: Chai.ExpectStatic = chai.expect;
  const logger = new NoOpLogger(LogLevel.DEBUG);
  const domMockBehavior: DOMMockBehavior = new DOMMockBehavior();
  let tc: TransceiverController;
  let domMockBuilder: DOMMockBuilder;

  beforeEach(() => {
    domMockBehavior.browserName = 'firefox';
    domMockBuilder = new DOMMockBuilder(domMockBehavior);
    tc = new DefaultTransceiverController(logger);
  });

  afterEach(() => {
    tc = new DefaultTransceiverController(logger);
    domMockBuilder.cleanup();
  });

  describe('construction', () => {
    it('can be constructed', () => {
      expect(tc).to.not.equal(null);
    });
  });

  describe('useTransceivers', () => {
    it('can set peer connection and reset', () => {
      expect(tc.useTransceivers()).to.equal(false);

      const peer: RTCPeerConnection = new RTCPeerConnection();
      tc.setPeer(peer);
      expect(tc.useTransceivers()).to.equal(true);

      tc.reset();
      expect(tc.useTransceivers()).to.equal(false);
    });
  });

  describe('setupLocalTransceivers', () => {
    it('can not set up transceivers if peer connection is not set', () => {
      const peer: RTCPeerConnection = new RTCPeerConnection();
      tc.setupLocalTransceivers();
      expect(peer.getTransceivers().length).to.equal(0);
    });

    it('can set up transceivers once', () => {
      const peer: RTCPeerConnection = new RTCPeerConnection();
      tc.setPeer(peer);
      expect(peer.getTransceivers().length).to.equal(0);
      tc.setupLocalTransceivers();

      const transceivers = peer.getTransceivers();
      expect(transceivers.length).to.equal(2);

      const audioTransceiver = transceivers[0];
      expect(audioTransceiver.direction).to.equal('inactive');
      expect(audioTransceiver.receiver.track.kind).to.equal('audio');
      expect(audioTransceiver.sender.track.kind).to.equal('audio');

      const videoTransceiver = transceivers[1];
      expect(videoTransceiver.direction).to.equal('inactive');
      expect(videoTransceiver.receiver.track.kind).to.equal('video');
      expect(videoTransceiver.sender.track.kind).to.equal('video');

      tc.setupLocalTransceivers();
      expect(peer.getTransceivers()[0]).to.equal(audioTransceiver);
      expect(peer.getTransceivers()[1]).to.equal(videoTransceiver);
    });
  });

  describe('trackIsVideoInput', () => {
    it('can check whether the given track is a video input', () => {
      const peer: RTCPeerConnection = new RTCPeerConnection();
      tc.setPeer(peer);
      tc.setupLocalTransceivers();

      const audioTrack = peer.getTransceivers()[0].receiver.track;
      expect(tc.trackIsVideoInput(audioTrack)).to.equal(false);

      const videoTrack = peer.getTransceivers()[1].receiver.track;
      expect(tc.trackIsVideoInput(videoTrack)).to.equal(true);
    });

    it('can not check if it has reset transceivers', () => {
      const peer: RTCPeerConnection = new RTCPeerConnection();
      tc.setPeer(peer);
      tc.setupLocalTransceivers();

      const videoTrack = peer.getTransceivers()[1].receiver.track;
      tc.reset();

      expect(tc.trackIsVideoInput(videoTrack)).to.equal(false);
    });
  });

  describe('setAudioInput', () => {
    it('can set the audio track to null', done => {
      const peer: RTCPeerConnection = new RTCPeerConnection();
      tc.setPeer(peer);
      tc.setupLocalTransceivers();
      tc.setAudioInput(null);

      new TimeoutScheduler(domMockBehavior.asyncWaitMs + 10).start(() => {
        const audioTransceiver = peer.getTransceivers()[0];
        expect(audioTransceiver.sender.track).to.equal(null);
        done();
      });
    });

    it('can set the audio track', done => {
      const peer: RTCPeerConnection = new RTCPeerConnection();
      tc.setPeer(peer);
      tc.setupLocalTransceivers();

      const newAudioTrack = new MediaStreamTrack();
      tc.setAudioInput(newAudioTrack);

      new TimeoutScheduler(domMockBehavior.asyncWaitMs + 10).start(() => {
        const audioTransceiver = peer.getTransceivers()[0];
        expect(audioTransceiver.direction).to.equal('sendrecv');
        expect(audioTransceiver.sender.track).to.equal(newAudioTrack);
        done();
      });
    });

    it('can not set the audio track if transceivers have not been set up', done => {
      const peer: RTCPeerConnection = new RTCPeerConnection();
      tc.setPeer(peer);

      const newAudioTrack = new MediaStreamTrack();
      tc.setAudioInput(newAudioTrack);

      new TimeoutScheduler(domMockBehavior.asyncWaitMs + 10).start(() => {
        const audioTransceiver = peer.getTransceivers()[0];
        expect(audioTransceiver).to.be.undefined;
        done();
      });
    });
  });

  describe('setVideoInput', () => {
    it('can set the video track to null', done => {
      const peer: RTCPeerConnection = new RTCPeerConnection();
      tc.setPeer(peer);
      tc.setupLocalTransceivers();
      tc.setVideoInput(null);

      new TimeoutScheduler(domMockBehavior.asyncWaitMs + 10).start(() => {
        const videoTransceiver = peer.getTransceivers()[1];
        expect(videoTransceiver.sender.track).to.equal(null);
        done();
      });
    });

    it('can set the video track', done => {
      const peer: RTCPeerConnection = new RTCPeerConnection();
      tc.setPeer(peer);
      tc.setupLocalTransceivers();

      const newVideoTrack = new MediaStreamTrack();
      tc.setVideoInput(newVideoTrack);

      new TimeoutScheduler(domMockBehavior.asyncWaitMs + 10).start(() => {
        const videoTransceiver = peer.getTransceivers()[1];
        expect(videoTransceiver.direction).to.equal('sendrecv');
        expect(videoTransceiver.sender.track).to.equal(newVideoTrack);
        done();
      });
    });

    it('can not set the video track if transceivers have not been set up', done => {
      const peer: RTCPeerConnection = new RTCPeerConnection();
      tc.setPeer(peer);

      const newVideoTrack = new MediaStreamTrack();
      tc.setVideoInput(newVideoTrack);

      new TimeoutScheduler(domMockBehavior.asyncWaitMs + 10).start(() => {
        const videoTransceiver = peer.getTransceivers()[1];
        expect(videoTransceiver).to.be.undefined;
        done();
      });
    });
  });

  describe('updateVideoTransceivers', () => {
    let peer: RTCPeerConnection;

    function prepareIndex(streamIds: number[]): DefaultVideoStreamIndex {
      const index: DefaultVideoStreamIndex = new DefaultVideoStreamIndex(logger);
      const sources: SdkStreamDescriptor[] = [];
      for (const id of streamIds) {
        sources.push(
          new SdkStreamDescriptor({
            streamId: id,
            groupId: id,
            maxBitrateKbps: 100,
            mediaType: SdkStreamMediaType.VIDEO,
          })
        );
      }
      index.integrateIndexFrame(
        new SdkIndexFrame({
          atCapacity: false,
          sources: sources,
        })
      );
      return index;
    }

    function verifyTransceiverDirections(directions: string[]): void {
      const transceivers: RTCRtpTransceiver[] = peer.getTransceivers();
      const actualDirections = transceivers.map(transceiver => transceiver.direction);
      expect(actualDirections).deep.equal(directions);
    }

    beforeEach(() => {
      peer = new RTCPeerConnection();
      tc.setPeer(peer);
    });

    it('cannot update video transceivers if it has reset transceivers', () => {
      tc.reset();

      const videoStreamIndex = prepareIndex([7]);
      const videosToReceive: VideoStreamIdSet = new DefaultVideoStreamIdSet();
      const videoSubscriptions: number[] = tc.updateVideoTransceivers(
        videoStreamIndex,
        videosToReceive
      );

      expect(videoSubscriptions).to.deep.equal([]);
      expect(peer.getTransceivers().length).to.equal(0);
    });

    it('includes a zero for a potential local video', () => {
      const videoStreamIndex = prepareIndex([7]);
      const videosToReceive: VideoStreamIdSet = new DefaultVideoStreamIdSet();
      const videoSubscriptions: number[] = tc.updateVideoTransceivers(
        videoStreamIndex,
        videosToReceive
      );

      expect(videoSubscriptions).to.deep.equal([0]);
      expect(peer.getTransceivers().length).to.equal(0);
    });

    it('creates a transceiver to subscribe to one remote video', () => {
      const videoStreamIndex = prepareIndex([7]);
      const videosToReceive: VideoStreamIdSet = new DefaultVideoStreamIdSet([7]);
      const videoSubscriptions: number[] = tc.updateVideoTransceivers(
        videoStreamIndex,
        videosToReceive
      );
      expect(videoSubscriptions).to.deep.equal([0, 7]);
      verifyTransceiverDirections(['recvonly']);
    });

    it('when unsubscribing from a remote video, marks the transceiver inactive and leaves a zero in the video subscriptions slot', () => {
      const videoStreamIndex = prepareIndex([7]);
      let videosToReceive: VideoStreamIdSet = new DefaultVideoStreamIdSet([7]);
      let videoSubscriptions: number[] = tc.updateVideoTransceivers(
        videoStreamIndex,
        videosToReceive
      );
      expect(videoSubscriptions).to.deep.equal([0, 7]);
      verifyTransceiverDirections(['recvonly']);

      videosToReceive = new DefaultVideoStreamIdSet();
      videoSubscriptions = tc.updateVideoTransceivers(videoStreamIndex, videosToReceive);
      expect(videoSubscriptions).to.deep.equal([0, 0]);
      verifyTransceiverDirections(['inactive']);
    });

    it('with two subscriptions, unsubscribes from the last', () => {
      const videoStreamIndex = prepareIndex([7, 8]);
      let videosToReceive: VideoStreamIdSet = new DefaultVideoStreamIdSet([7, 8]);
      let videoSubscriptions: number[] = tc.updateVideoTransceivers(
        videoStreamIndex,
        videosToReceive
      );
      expect(videoSubscriptions).to.deep.equal([0, 7, 8]);
      verifyTransceiverDirections(['recvonly', 'recvonly']);

      videosToReceive = new DefaultVideoStreamIdSet([7]);
      videoSubscriptions = tc.updateVideoTransceivers(videoStreamIndex, videosToReceive);
      expect(videoSubscriptions).to.deep.equal([0, 7, 0]);
      verifyTransceiverDirections(['recvonly', 'inactive']);
    });

    it('with two subscriptions, unsubscribes from both, then resubscribes to both', () => {
      const videoStreamIndex = prepareIndex([7, 8]);
      let videosToReceive: VideoStreamIdSet = new DefaultVideoStreamIdSet([7, 8]);
      let videoSubscriptions: number[] = tc.updateVideoTransceivers(
        videoStreamIndex,
        videosToReceive
      );
      expect(videoSubscriptions).to.deep.equal([0, 7, 8]);
      verifyTransceiverDirections(['recvonly', 'recvonly']);

      videosToReceive = new DefaultVideoStreamIdSet([7]);
      videoSubscriptions = tc.updateVideoTransceivers(videoStreamIndex, videosToReceive);
      expect(videoSubscriptions).to.deep.equal([0, 7, 0]);
      verifyTransceiverDirections(['recvonly', 'inactive']);

      videosToReceive = new DefaultVideoStreamIdSet([]);
      videoSubscriptions = tc.updateVideoTransceivers(videoStreamIndex, videosToReceive);
      expect(videoSubscriptions).to.deep.equal([0, 0, 0]);
      verifyTransceiverDirections(['inactive', 'inactive']);

      videosToReceive = new DefaultVideoStreamIdSet([7]);
      videoSubscriptions = tc.updateVideoTransceivers(videoStreamIndex, videosToReceive);
      expect(videoSubscriptions).to.deep.equal([0, 7, 0]);
      verifyTransceiverDirections(['recvonly', 'inactive']);

      videosToReceive = new DefaultVideoStreamIdSet([7, 8]);
      videoSubscriptions = tc.updateVideoTransceivers(videoStreamIndex, videosToReceive);
      expect(videoSubscriptions).to.deep.equal([0, 7, 8]);
      verifyTransceiverDirections(['recvonly', 'recvonly']);
    });

    it('will use local transceivers', () => {
      tc.setupLocalTransceivers();

      const videoStreamIndex = prepareIndex([7, 8]);
      let videosToReceive: VideoStreamIdSet = new DefaultVideoStreamIdSet([7, 8]);
      let videoSubscriptions: number[] = tc.updateVideoTransceivers(
        videoStreamIndex,
        videosToReceive
      );
      videoSubscriptions = tc.updateVideoTransceivers(videoStreamIndex, videosToReceive);
      expect(videoSubscriptions).to.deep.equal([0, 7, 8]);
      verifyTransceiverDirections(['inactive', 'inactive', 'recvonly', 'recvonly']);
    });

    it('will use a transceiver\'s mid prefixed with "v_" to get the streamId for the track', () => {
      const streamId = 4;
      const videoStreamIndex = prepareIndex([streamId, 8]);
      const subackFrame = new SdkSubscribeAckFrame({
        tracks: [
          new SdkTrackMapping({ streamId: 2, trackLabel: 'b18b9db2' }),
          new SdkTrackMapping({ streamId: streamId, trackLabel: 'v_mock-mid-id' }),
          new SdkTrackMapping({ streamId: 9, trackLabel: '9318' }),
        ],
      });
      videoStreamIndex.integrateSubscribeAckFrame(subackFrame);

      let videosToReceive: VideoStreamIdSet = new DefaultVideoStreamIdSet([streamId, 8]);
      let videoSubscriptions: number[] = tc.updateVideoTransceivers(
        videoStreamIndex,
        videosToReceive
      );
      videoSubscriptions = tc.updateVideoTransceivers(videoStreamIndex, videosToReceive);
      expect(videoSubscriptions).to.deep.equal([0, streamId, 8]);
      verifyTransceiverDirections(['recvonly', 'recvonly']);
    });
  });

  describe('setVideoSendingBitrateKbps', () => {
    it('will not set bitrate if transceiver is not set up', () => {
      tc.setVideoSendingBitrateKbps(100);
    });

    it('sets bitrate on RTCRtpSender correctly', done => {
      const peer: RTCPeerConnection = new RTCPeerConnection();
      tc.setPeer(peer);
      tc.setupLocalTransceivers();

      const newVideoTrack = new MediaStreamTrack();
      tc.setVideoInput(newVideoTrack);

      new TimeoutScheduler(domMockBehavior.asyncWaitMs + 10).start(() => {
        const videoTransceiver = peer.getTransceivers()[1];
        expect(videoTransceiver.direction).to.equal('sendrecv');
        expect(videoTransceiver.sender.track).to.equal(newVideoTrack);

        // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
        const parameter = {
          degradationPreference: null,
          transactionId: '',
        } as RTCRtpSendParameters;
        videoTransceiver.sender.setParameters(parameter);
        tc.setVideoSendingBitrateKbps(100);
      });

      new TimeoutScheduler(domMockBehavior.asyncWaitMs + 10).start(() => {
        tc.setVideoSendingBitrateKbps(200);
        const parameter = peer.getTransceivers()[1].sender.getParameters();
        expect(parameter.encodings[0].maxBitrate).to.equal(200 * 1000);
        done();
      });
    });
  });
});
