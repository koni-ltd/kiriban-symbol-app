import React, { useEffect, useState } from 'react';
import aNewImg from '../assets/a_new.gif';

const TRANSFER_TRANSACTION_TYPE = 16724;
const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_SYMBOL_NODE_URL = 'https://0-0-0-5.symbol-nodes.jp:3001';
const DEFAULT_EPOCH_ADJUSTMENT_MS = 1615853185 * 1000;
const DEFAULT_CURRENCY_MOSAIC_ID = '6BED913FA20223F8';
const DEFAULT_CURRENCY_DIVISIBILITY = 6;

interface SymbolTransactionDTO {
  signerPublicKey?: string;
  mosaics?: Array<{ id?: string; amount?: string }>;
  message?: string;
}

interface SymbolTransactionMetaDTO {
  height?: string;
  timestamp?: string;
}

interface SymbolTransactionInfoDTO {
  id: string;
  meta?: SymbolTransactionMetaDTO;
  transaction?: SymbolTransactionDTO;
}

interface SymbolTransactionPageDTO {
  data?: SymbolTransactionInfoDTO[];
}

interface SymbolAccountInfoDTO {
  account?: {
    address?: string;
  };
}

interface SymbolBlockInfoDTO {
  block?: {
    timestamp?: string;
  };
}

interface SymbolMosaicInfoDTO {
  mosaic?: {
    divisibility?: number;
  };
}

interface SymbolNetworkConfigurationDTO {
  network?: {
    epochAdjustment?: string;
  };
  chain?: {
    currencyMosaicId?: string;
    currencyMosaicDivisibility?: string | number;
  };
}

interface KiribanReport {
  txId: string;
  postedAt: string;
  walletAddress: string;
  amount: string;
  message: string;
  sortTimestamp: number;
}

const normalizeNodeUrl = (value: string) => value.replace(/\/+$/, '');
const normalizeAddress = (value: string) => value.replace(/-/g, '').trim().toUpperCase();
const normalizeHex = (value: string) => value.replace(/^0x/i, '').replace(/[^a-fA-F0-9]/g, '').toUpperCase();
const keepDigits = (value: string) => value.replace(/[^0-9]/g, '');

const parseNumericString = (value?: string | number): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (!value) return null;

  const digits = keepDigits(value);
  if (!digits) return null;

  const asNumber = Number(digits);
  return Number.isFinite(asNumber) ? asNumber : null;
};

const parseBigIntString = (value?: string): bigint => {
  if (!value) return 0n;
  const digits = keepDigits(value);
  if (!digits) return 0n;

  try {
    return BigInt(digits);
  } catch {
    return 0n;
  }
};

const formatDateTime = (unixMs: number): string => {
  if (!Number.isFinite(unixMs) || unixMs <= 0) return '不明';
  const date = new Date(unixMs);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const sec = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${sec}`;
};

const toUnixMsFromSymbolTimestamp = (symbolTimestamp: string | undefined, epochAdjustmentMs: number): number => {
  const asNumber = parseNumericString(symbolTimestamp);
  if (asNumber === null) return 0;
  return epochAdjustmentMs + asNumber;
};

const formatXymAmount = (amountAtomic: bigint, divisibility: number): string => {
  if (divisibility <= 0) return `${amountAtomic.toString()} XYM`;

  const base = 10n ** BigInt(divisibility);
  const integerPart = amountAtomic / base;
  const fractionPart = amountAtomic % base;

  if (fractionPart === 0n) {
    return `${integerPart.toString()} XYM`;
  }

  const rawFraction = fractionPart.toString().padStart(divisibility, '0');
  const trimmedFraction = rawFraction.replace(/0+$/, '');
  return `${integerPart.toString()}.${trimmedFraction} XYM`;
};

const shortenAddress = (value: string, head = 6, tail = 5): string => {
  if (!value) return value;
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
};

const decodeHexToUtf8 = (hex: string): string | null => {
  if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) return null;

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
  }

  try {
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
};

const decodeTransactionMessage = (rawMessage?: string): string => {
  const message = rawMessage?.trim() ?? '';
  if (!message) return 'あぼーん';

  if (/^[0-9a-fA-F]+$/.test(message)) {
    if (message.startsWith('00')) {
      const decoded = decodeHexToUtf8(message.slice(2));
      return decoded && decoded.trim() ? decoded : 'あぼーん';
    }

    if (message.startsWith('01')) {
      return '[暗号化メッセージ]';
    }

    const decoded = decodeHexToUtf8(message);
    if (decoded && decoded.trim()) return decoded;
  }

  return message;
};

const fetchJson = async <T,>(url: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return (await response.json()) as T;
};

const fetchSymbolSettings = async (nodeUrl: string, signal?: AbortSignal) => {
  const envMosaicId = normalizeHex(import.meta.env.VITE_SYMBOL_CURRENCY_MOSAIC_ID ?? '');
  const envDivisibility = parseNumericString(import.meta.env.VITE_SYMBOL_CURRENCY_DIVISIBILITY);

  let epochAdjustmentMs = DEFAULT_EPOCH_ADJUSTMENT_MS;
  let currencyMosaicId = envMosaicId || DEFAULT_CURRENCY_MOSAIC_ID;
  let currencyDivisibility = envDivisibility ?? DEFAULT_CURRENCY_DIVISIBILITY;

  try {
    const properties = await fetchJson<SymbolNetworkConfigurationDTO>(`${nodeUrl}/network/properties`, signal);

    const networkEpochMs = parseNumericString(properties?.network?.epochAdjustment);
    if (networkEpochMs !== null) {
      epochAdjustmentMs = networkEpochMs * 1000;
    }

    if (!envMosaicId) {
      const chainMosaicId = normalizeHex(properties?.chain?.currencyMosaicId ?? '');
      if (chainMosaicId) {
        currencyMosaicId = chainMosaicId;
      }
    }

    if (envDivisibility === null) {
      const chainDivisibility = parseNumericString(properties?.chain?.currencyMosaicDivisibility);
      if (chainDivisibility !== null) {
        currencyDivisibility = chainDivisibility;
      }
    }
  } catch (error) {
    console.warn('Failed to load /network/properties. Falling back to defaults.', error);
  }

  if (envDivisibility === null && currencyMosaicId) {
    try {
      const mosaicInfo = await fetchJson<SymbolMosaicInfoDTO>(`${nodeUrl}/mosaics/${currencyMosaicId}`, signal);
      const mosaicDivisibility = mosaicInfo?.mosaic?.divisibility;
      if (typeof mosaicDivisibility === 'number' && Number.isFinite(mosaicDivisibility)) {
        currencyDivisibility = mosaicDivisibility;
      }
    } catch (error) {
      console.warn('Failed to load currency mosaic divisibility. Using fallback.', error);
    }
  }

  return {
    epochAdjustmentMs,
    currencyMosaicId: normalizeHex(currencyMosaicId || DEFAULT_CURRENCY_MOSAIC_ID),
    currencyDivisibility: Number.isFinite(currencyDivisibility) ? Math.max(0, currencyDivisibility) : DEFAULT_CURRENCY_DIVISIBILITY,
  };
};

const sumXymAmountAtomic = (
  mosaics: Array<{ id?: string; amount?: string }> | undefined,
  currencyMosaicId: string,
): bigint => {
  if (!mosaics?.length) return 0n;

  const normalizedCurrencyId = normalizeHex(currencyMosaicId);
  let amount = 0n;
  let matchedCurrencyMosaic = false;

  for (const mosaic of mosaics) {
    if (!mosaic) continue;
    const mosaicId = normalizeHex(mosaic.id ?? '');
    const mosaicAmount = parseBigIntString(mosaic.amount);
    if (mosaicId && mosaicId === normalizedCurrencyId) {
      matchedCurrencyMosaic = true;
      amount += mosaicAmount;
    }
  }

  if (matchedCurrencyMosaic) {
    return amount;
  }

  return mosaics.reduce((total, mosaic) => total + parseBigIntString(mosaic?.amount), 0n);
};

const fetchKiribanReports = async (
  nodeUrl: string,
  adminAddress: string,
  signal?: AbortSignal,
): Promise<KiribanReport[]> => {
  const { epochAdjustmentMs, currencyMosaicId, currencyDivisibility } = await fetchSymbolSettings(nodeUrl, signal);

  const params = new URLSearchParams({
    recipientAddress: adminAddress,
    pageSize: String(DEFAULT_PAGE_SIZE),
    pageNumber: '1',
    order: 'desc',
  });
  params.append('type', String(TRANSFER_TRANSACTION_TYPE));

  const txPage = await fetchJson<SymbolTransactionPageDTO>(`${nodeUrl}/transactions/confirmed?${params.toString()}`, signal);
  const txs = txPage.data ?? [];

  const signerKeys = new Set<string>();
  const missingTimestampHeights = new Set<string>();

  for (const tx of txs) {
    const signerPublicKey = tx.transaction?.signerPublicKey;
    if (signerPublicKey) signerKeys.add(signerPublicKey);

    if (!tx.meta?.timestamp && tx.meta?.height) {
      missingTimestampHeights.add(tx.meta.height);
    }
  }

  const senderAddressEntries = await Promise.all(
    [...signerKeys].map(async (publicKey) => {
      try {
        const accountInfo = await fetchJson<SymbolAccountInfoDTO>(`${nodeUrl}/accounts/${publicKey}`, signal);
        const address = normalizeAddress(accountInfo?.account?.address ?? publicKey);
        return [publicKey, address] as const;
      } catch {
        return [publicKey, publicKey] as const;
      }
    }),
  );
  const senderAddressByPublicKey = new Map<string, string>(senderAddressEntries);

  const blockTimestampEntries = await Promise.all(
    [...missingTimestampHeights].map(async (height) => {
      try {
        const blockInfo = await fetchJson<SymbolBlockInfoDTO>(`${nodeUrl}/blocks/${height}`, signal);
        return [height, blockInfo?.block?.timestamp ?? '0'] as const;
      } catch {
        return [height, '0'] as const;
      }
    }),
  );
  const timestampByHeight = new Map<string, string>(blockTimestampEntries);

  const reports = txs.map((tx) => {
    const transaction = tx.transaction ?? {};
    const meta = tx.meta ?? {};
    const signerPublicKey = transaction.signerPublicKey ?? '';
    const walletAddress = senderAddressByPublicKey.get(signerPublicKey) ?? (signerPublicKey || 'UNKNOWN');
    const symbolTimestamp = meta.timestamp ?? (meta.height ? timestampByHeight.get(meta.height) : undefined);
    const unixMs = toUnixMsFromSymbolTimestamp(symbolTimestamp, epochAdjustmentMs);
    const amountAtomic = sumXymAmountAtomic(transaction.mosaics, currencyMosaicId);

    return {
      txId: tx.id,
      postedAt: formatDateTime(unixMs),
      walletAddress,
      amount: formatXymAmount(amountAtomic, currencyDivisibility),
      message: decodeTransactionMessage(transaction.message),
      sortTimestamp: unixMs,
    };
  });

  reports.sort((a, b) => b.sortTimestamp - a.sortTimestamp);
  return reports;
};

export const KiribanReports: React.FC = () => {
  const [reports, setReports] = useState<KiribanReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nodeUrlValue = import.meta.env.VITE_SYMBOL_NODE_URL ?? DEFAULT_SYMBOL_NODE_URL;
    const adminAddressValue = import.meta.env.VITE_SYMBOL_ADMIN_ADDRESS ?? '';

    const nodeUrl = normalizeNodeUrl(nodeUrlValue.trim());
    const adminAddress = normalizeAddress(adminAddressValue);

    if (!adminAddress) {
      setError('VITE_SYMBOL_ADMIN_ADDRESS を設定してください。');
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedReports = await fetchKiribanReports(nodeUrl, adminAddress, abortController.signal);
        setReports(fetchedReports);
      } catch (fetchError) {
        if (abortController.signal.aborted) return;
        console.error(fetchError);
        setError('キリバン報告の取得に失敗しました。時間をおいて再読込してください。');
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <div style={{ marginTop: '16px', backgroundColor: '#fff' }}>
      <div style={{ maxHeight: '420px', overflowY: 'auto', overflowX: 'hidden' }}>
        <table width="100%" border={0} cellPadding={0} cellSpacing={2}>
          <tbody>
            {isLoading && (
              <tr style={{ border: '3px double #b9b9b9' }}>
                <td style={{ border: '3px double #b9b9b9', padding: '10px 12px 14px' }}>
                  読み込み中...
                </td>
              </tr>
            )}

            {!isLoading && error && (
              <tr style={{ border: '3px double #b9b9b9' }}>
                <td style={{ border: '3px double #b9b9b9', padding: '10px 12px 14px', color: '#cc0000' }}>
                  {error}
                </td>
              </tr>
            )}

            {!isLoading && !error && reports.length === 0 && (
              <tr style={{ border: '3px double #b9b9b9' }}>
                <td style={{ border: '3px double #b9b9b9', padding: '10px 12px 14px' }}>
                  まだ書き込みはありません。
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              reports.map((report, index) => (
                <tr key={report.txId} style={{ border: '3px double #b9b9b9' }}>
                  <td style={{ border: '3px double #b9b9b9', padding: '10px 12px 14px' }}>
                    <div style={{ wordBreak: 'break-all' }}>
                      <a href={`#kiriban-${report.txId}`} id={`kiriban-${report.txId}`} style={{ color: '#0b6f24' }}>
                        {reports.length - index}
                      </a>
                      <span>: </span>
                      <span>{report.postedAt}</span>
                      <span style={{ marginLeft: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span title={report.walletAddress}>ID:{shortenAddress(report.walletAddress)}</span>
                        <span>送金額:{report.amount}</span>
                        {index === 0 && <img src={aNewImg} alt="NEW" />}
                      </span>
                    </div>
                    <div style={{ marginTop: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {report.message}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
