// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import DeviceChangeObserver from '../devicechangeobserver/DeviceChangeObserver';
import DeviceControllerBasedMediaStreamBroker from '../mediastreambroker/DeviceControllerBasedMediaStreamBroker';
import NoOpMediaStreamBroker from '../mediastreambroker/NoOpMediaStreamBroker';
import Device from './Device';
import DevicePermission from './DevicePermission';

export default class NoOpDeviceController extends NoOpMediaStreamBroker
  implements DeviceControllerBasedMediaStreamBroker {
  listAudioInputDevices(): Promise<MediaDeviceInfo[]> {
    return Promise.resolve([]);
  }

  listVideoInputDevices(): Promise<MediaDeviceInfo[]> {
    return Promise.resolve([]);
  }

  listAudioOutputDevices(): Promise<MediaDeviceInfo[]> {
    return Promise.resolve([]);
  }

  chooseAudioInputDevice(_device: Device): Promise<DevicePermission> {
    return Promise.reject();
  }

  chooseVideoInputDevice(_device: Device): Promise<DevicePermission> {
    return Promise.reject();
  }

  chooseAudioOutputDevice(_deviceId: string | null): Promise<void> {
    return Promise.reject();
  }

  addDeviceChangeObserver(_observer: DeviceChangeObserver): void {}

  removeDeviceChangeObserver(_observer: DeviceChangeObserver): void {}

  createAnalyserNodeForAudioInput(): AnalyserNode | null {
    return null;
  }

  startVideoPreviewForVideoInput(_element: HTMLVideoElement): void {}

  stopVideoPreviewForVideoInput(_element: HTMLVideoElement): void {}

  setDeviceLabelTrigger(_trigger: () => Promise<MediaStream>): void {}

  mixIntoAudioInput(_stream: MediaStream): MediaStreamAudioSourceNode {
    return null;
  }

  chooseVideoInputQuality(
    _width: number,
    _height: number,
    _frameRate: number,
    _maxBandwidthKbps: number
  ): void {}
}
