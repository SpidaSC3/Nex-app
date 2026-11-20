import { RTCPeerConnection } from "react-native-webrtc";

const HOST = "your.server.com";

export async function login(username: string, password: string) {
  const r = await fetch(`https://${HOST}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) throw new Error("Login failed");
  return (await r.json()).token as string;
}

export function findPeer(
  token: string,
  onConnected: (channel: any) => void
) {
  const ws = new WebSocket(`wss://${HOST}/ws?token=${token}`);
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  const sendSignal = (data: object) =>
    ws.send(JSON.stringify({ type: "signal", data }));

  pc.onicecandidate = (e: any) => {
    if (e.candidate) sendSignal({ candidate: e.candidate });
  };

  const setupChannel = (ch: any) => {
    ch.onopen = () => {
      ws.send(JSON.stringify({ type: "peer_connected" })); // server drops us
      onConnected(ch);
    };
  };

  pc.ondatachannel = (e: any) => setupChannel(e.channel);

  ws.onopen = () => ws.send(JSON.stringify({ type: "find_match" }));

  ws.onmessage = async (e) => {
    const msg = JSON.parse(e.data);

    if (msg.type === "matched" && msg.initiator) {
      setupChannel(pc.createDataChannel("data"));
      const offer = await pc.createOffer({});
      await pc.setLocalDescription(offer);
      sendSignal({ sdp: offer });
    }

    if (msg.type === "signal") {
      const { sdp, candidate } = msg.data;
      if (sdp) {
        await pc.setRemoteDescription(sdp);
        if (sdp.type === "offer") {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal({ sdp: answer });
        }
      } else if (candidate) {
        await pc.addIceCandidate(candidate);
      }
    }
  };

  return { cancel: () => ws.close(), pc };
}
