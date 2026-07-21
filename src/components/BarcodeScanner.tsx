"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

// 端末のカメラで本の裏の ISBN バーコード（EAN-13）を読み取る。
// 読み取れたら onDetected(コード) を呼び、閉じるときは onClose を呼ぶ。
export default function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let stopped = false;
    // decodeFromVideoDevice が返す controls を保持して後で停止する
    let controls: { stop: () => void } | null = null;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (result && !stopped) {
          stopped = true;
          const text = result.getText();
          controls?.stop();
          onDetected(text);
        }
      })
      .then((c) => {
        controls = c;
        if (stopped) c.stop();
      })
      .catch((e) => {
        setError(
          e instanceof Error && e.name === "NotAllowedError"
            ? "カメラの使用が許可されませんでした。ブラウザの設定を確認してください。"
            : "カメラを起動できませんでした。",
        );
      });

    return () => {
      stopped = true;
      controls?.stop();
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-xl bg-black">
        <video ref={videoRef} className="aspect-[3/4] w-full object-cover" muted playsInline />
      </div>
      <p className="mt-3 text-center text-sm text-white">
        本の裏表紙のバーコード（ISBN）を枠に映してください
      </p>
      {error && (
        <p className="mt-2 max-w-sm rounded bg-red-500/90 px-3 py-2 text-center text-sm text-white">
          {error}
        </p>
      )}
      <button type="button" onClick={onClose} className="btn mt-4 bg-white text-gray-800">
        閉じる
      </button>
    </div>
  );
}
