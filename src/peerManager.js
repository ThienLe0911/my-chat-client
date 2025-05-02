// peerManager.js
class PeerManager {
  constructor() {
    this.peer = null;
    this.localStream = null;
    this.remoteStream = null;
    this.onRemoteStream = null;
    this.onIceCandidate = null;
  }

  async initLocalStream() {
    if (!this.localStream) {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    }
    return this.localStream;
  }

  createPeer() {
    this.peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    this.remoteStream = new MediaStream();

    this.peer.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    this.peer.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate);
      }
    };

    return this.peer;
  }

  async call(isCaller, remoteSDP = null, remoteICECandidates = []) {
    await this.initLocalStream();
    this.createPeer();

    this.localStream.getTracks().forEach((track) => {
      this.peer.addTrack(track, this.localStream);
    });

    if (isCaller) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      return { sdp: offer };
    } else {
      await this.peer.setRemoteDescription(new RTCSessionDescription(remoteSDP));
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      return { sdp: answer };
    }
  }

  async receiveSDP(sdp) {
    await this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  async addIceCandidate(candidate) {
    try {
      await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("Add ICE error", err);
    }
  }

  close() {
    if (this.peer) {
      this.peer.close();
      this.peer = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    this.remoteStream = null;
  }
}

export default new PeerManager();
