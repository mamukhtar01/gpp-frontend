"use client";

import {  useEffect } from "react";
import forge from "node-forge"; // Ensure node-forge is installed

const NCHL_PUBLIC_KEY = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAi0LF+eHiysi/etC2HBKIf1eZ6Fyr/hLzBQ6XPMRWNMEUcruDB4dFqsHL9JuvGfFLmhITt6DLa5XhZ0cXW5b2HPh4MHcjT4e7mX+S3olAek+2GTuF5VTICTrS8Gapln1Pbd4hZ1+vURQMaYF5QI+jHdJ6TvSBZjPFz7E/HPf2Z7eQE//5VGUbPU4cxbfEav9npc+E2+RAbAJVHNELSm28VDwnailRIpvsyUOpizDEbSB4gpEYEDZT0iX/iZF7PTSnvb0wVOtKXQt8nFPUi8sGzfg8yuhSQu/TYQRBoVmGAeBhsjBpF3zhsIRkhxmC7pv1Id0QtLhcNKCo//fvq7UWDwIDAQAB
-----END PUBLIC KEY-----
`;

const api_token_raw = "sfHFLRZYJPCtKkdjUQH9ugMJ1ttULcyCQ1dTGXWbJSI="; // Replace with actual API token

function encryptApiToken(apiToken: string): string {
  const publicKey = forge.pki.publicKeyFromPem(NCHL_PUBLIC_KEY);
  const encrypted = publicKey.encrypt(apiToken, "RSAES-PKCS1-V1_5");
  return window.btoa(encrypted);
}

type TPayload = {
  merchant_id: string;
  request_id: string;
  username: string;
};

async function websocketClient(payload: TPayload): Promise<string> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket("wss://devws.nepalpay.com.np/nqrws");
    let connected = false;

    ws.addEventListener("open", () => {
      // Only send CONNECT frame here
      const connectMsg =
        "CONNECT\naccept-version:1.1,1.0\nheart-beat:10000,10000\n\n\0";
      ws.send(connectMsg);
    });

    // build payload with encrypted token
    const encryptedApiToken = encryptApiToken(api_token_raw);

    const fullPayload = { ...payload, api_token: encryptedApiToken };

    ws.addEventListener("message", (event) => {
      const msg = typeof event.data === "string" ? event.data : "";
      console.log("Message event received", event);
      console.log("Received:", msg);

      if (!connected && msg.startsWith("CONNECTED")) {
        connected = true;
        // Now safe to SUBSCRIBE
        const subscribeMsg =
          "SUBSCRIBE\nid:sub-0\ndestination:/user/nqrws/check-txn-status\n\n\0";
        ws.send(subscribeMsg);

        // Now safe to SEND
        const sendPayload = JSON.stringify(fullPayload);
        const sendMsg = `SEND\ndestination:/nqrws/check-txn-status\ncontent-length:${sendPayload.length}\n\n${sendPayload}\0`;
        ws.send(sendMsg);
       
        console.log("Payload sent:", sendPayload);
        return;
      }

      // Handle actual response messages here (could filter by frame type)
      console.log("Final message received:", msg);
      resolve(msg);
      ws.close();
    });

    ws.addEventListener("error", (err) => {
      console.error("WebSocket error:", err);
      reject(err);
    });

    ws.addEventListener("close", () => {
      console.log("WebSocket connection closed");
    });
  });
}

export default function CheckTxnSatus({ validationTraceId }: { validationTraceId: string  }) {
  const runWebSocketClient = async () => {
    try {
      const response = await websocketClient({
        merchant_id: "Terminal1",
        request_id: validationTraceId,
        username: "iomnqr",
      });
      console.log("WebSocket response:", response);
    } catch (error) {
      console.error("Error occurred while connecting to WebSocket:", error);
    }

   
  };

   useEffect(() => {
      runWebSocketClient();
    }, []);

    return <div>WebSocket Client Module</div>;
}
