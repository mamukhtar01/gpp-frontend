import React, { useCallback, useEffect, useState } from 'react';
import forge from 'node-forge';

const NCHL_PUBLIC_KEY = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAi0LF+eHiysi/etC2HBKIf1eZ6Fyr/hLzBQ6XPMRWNMEUcruDB4dFqsHL9JuvGfFLmhITt6DLa5XhZ0cXW5b2HPh4MHcjT4e7mX+S3olAek+2GTuF5VTICTrS8Gapln1Pbd4hZ1+vURQMaYF5QI+jHdJ6TvSBZjPFz7E/HPf2Z7eQE//5VGUbPU4cxbfEav9npc+E2+RAbAJVHNELSm28VDwnailRIpvsyUOpizDEbSB4gpEYEDZT0iX/iZF7PTSnvb0wVOtKXQt8nFPUi8sGzfg8yuhSQu/TYQRBoVmGAeBhsjBpF3zhsIRkhxmC7pv1Id0QtLhcNKCo//fvq7UWDwIDAQAB
-----END PUBLIC KEY-----
`;

function encryptApiToken(apiToken: string): string {
  const publicKey = forge.pki.publicKeyFromPem(NCHL_PUBLIC_KEY);
  const encrypted = publicKey.encrypt(apiToken, 'RSAES-PKCS1-V1_5');
  return window.btoa(encrypted);
}

type TPayload = {
  merchant_id: string;
  request_id: string;
  username: string;
  api_token_raw: string;
};

type TWebSocketPayload = {
  merchant_id: string;
  request_id: string;
  username: string;
  api_token: string;
};

async function websocketClient(payload: TWebSocketPayload): Promise<string> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('wss://devws.nepalpay.com.np/nqrws');

    ws.addEventListener('open', () => {
      // CONNECT
      const connectMsg = "CONNECT\naccept-version:1.1,1.0\nheart-beat:10000,10000\n\n\0";
      ws.send(connectMsg);

      // SUBSCRIBE
      const subscribeMsg = "SUBSCRIBE\nid:sub-0\ndestination:/user/nqrws/check-txn-status\n\n\0";
      ws.send(subscribeMsg);

      // SEND payload
      const sendPayload = JSON.stringify(payload);
      const sendMsg = `SEND\ndestination:/nqrws/check-txn-status\ncontent-length:${sendPayload.length}\n\n${sendPayload}\0`;
      ws.send(sendMsg);
    });

    ws.addEventListener('message', (event) => {
      const msg = typeof event.data === 'string' ? event.data : '';
      resolve(msg);
      ws.close();
    });

    ws.addEventListener('error', (err) => {
      reject(err);
    });

    ws.addEventListener('close', () => {
      // Optional: handle close
    });
  });
}

interface CheckTxnStatusProps {
  payload: TPayload;
  /** Optional: Called with result or error */
  onResult?: (result: string) => void;
  /** Optional: If true, will run automatically on mount. Otherwise, call runWebSocket() manually via ref. */
  autoRun?: boolean;
}

const CheckTxnStatus: React.FC<CheckTxnStatusProps> = ({ payload, onResult, autoRun = true }) => {
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const runWebSocket = useCallback(async () => {
    setResult('');
    setError('');
    setLoading(true);

    const { merchant_id, request_id, username, api_token_raw } = payload;
    if (!merchant_id || !request_id || !username || !api_token_raw) {
      setError('Missing parameters');
      setLoading(false);
      return;
    }
    let encryptedToken: string;
    try {
      encryptedToken = encryptApiToken(api_token_raw);
    } catch (e) {
      setError('Token encryption failed: ' + e);
      setLoading(false);
      return;
    }
    const wsPayload: TWebSocketPayload = {
      merchant_id,
      request_id,
      username,
      api_token: encryptedToken,
    };
    try {
      const wsResult = await websocketClient(wsPayload);
      setResult(wsResult);
      if (onResult) onResult(wsResult);
    } catch (e) {
      setError('WebSocket error: ' + e);
      if (onResult) onResult('WebSocket error: ' + e);
    }
    setLoading(false);
  }, [payload, onResult]);

  useEffect(() => {
    if (autoRun) {
      runWebSocket();
    }
    // If you want to re-run when payload changes, uncomment below:
   
    // }, [payload]);
  }, [autoRun, runWebSocket]);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      {result && <pre>{result}</pre>}
      {!autoRun && (
        <button onClick={runWebSocket} disabled={loading}>
          Check Transaction Status
        </button>
      )}
    </div>
  );
};

export default CheckTxnStatus;