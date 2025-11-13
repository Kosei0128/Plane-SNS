"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Package, RefreshCw, Trash2, Plus, Edit } from "lucide-react";

type HistoryEntry = {
  id: string;
  itemId: string;
  action: "created" | "updated" | "deleted" | "stock_changed";
  changes: Record<string, unknown>;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  performedBy: string;
  timestamp: string;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = selectedItemId
        ? `/api/site-control-a4b7/history?itemId=${selectedItemId}`
        : "/api/site-control-a4b7/history";

      const res = await fetch(url);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `履歴の取得に失敗しました。 (${res.status})`);
      }

      const data = await res.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error("History fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedItemId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Plus className="h-5 w-5 text-green-600" />;
      case "updated":
        return <Edit className="h-5 w-5 text-blue-600" />;
      case "deleted":
        return <Trash2 className="h-5 w-5 text-red-600" />;
      case "stock_changed":
        return <RefreshCw className="h-5 w-5 text-orange-600" />;
      default:
        return <Package className="h-5 w-5 text-slate-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "created":
        return "作成";
      case "updated":
        return "更新";
      case "deleted":
        return "削除";
      case "stock_changed":
        return "在庫変更";
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-green-100 text-green-800";
      case "updated":
        return "bg-blue-100 text-blue-800";
      case "deleted":
        return "bg-red-100 text-red-800";
      case "stock_changed":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const formatTimestamp = (timestamp: string | null | undefined) => {
    if (!timestamp) {
      return "---";
    }
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "無効な日付";
    }
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const renderChanges = (entry: HistoryEntry) => {
    if (entry.action === "created") {
      return <div className="text-sm text-slate-600">新しい商品が作成されました</div>;
    }

    if (entry.action === "deleted") {
      return <div className="text-sm text-slate-600">商品が削除されました</div>;
    }

    if (entry.action === "stock_changed") {
      const change = entry.changes.stock as number;
      const prevStock = entry.previousValue?.stock as number | undefined;
      const newStock = entry.newValue?.stock as number | undefined;
      return (
        <div className="text-sm text-slate-600">
          在庫: {prevStock || 0} → {newStock || 0}
          <span className={change > 0 ? "text-green-600" : "text-red-600"}>
            {" "}
            ({change > 0 ? "+" : ""}
            {change})
          </span>
        </div>
      );
    }

    if (entry.action === "updated") {
      return (
        <div className="space-y-1 text-sm">
          {Object.entries(entry.changes).map(([key, value]) => (
            <div key={key} className="text-slate-600">
              <span className="font-semibold">{key}:</span>{" "}
              {entry.previousValue?.[key] !== undefined && (
                <span className="text-slate-400">{String(entry.previousValue[key])} → </span>
              )}
              <span>{String(value)}</span>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-blue">変更履歴</h1>
            <p className="text-slate-600">商品の作成・更新・削除履歴を確認できます</p>
          </div>
          <button
            onClick={fetchHistory}
            className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 font-semibold text-white transition hover:bg-brand-blue/90"
          >
            <RefreshCw className="h-4 w-4" />
            更新
          </button>
        </div>

        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            商品IDでフィルター (オプション)
          </label>
          <input
            type="text"
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            placeholder="item-xxx または 空欄で全履歴"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-600">読み込み中...</div>
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <Clock className="mx-auto mb-4 h-12 w-12 text-slate-400" />
            <p className="text-lg font-semibold text-slate-700">履歴がありません</p>
            <p className="text-sm text-slate-600">商品の編集を行うと履歴が記録されます</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">{getActionIcon(entry.action)}</div>

                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getActionColor(
                          entry.action,
                        )}`}
                      >
                        {getActionLabel(entry.action)}
                      </span>
                      <span className="text-sm text-slate-600">
                        商品ID:{" "}
                        <code className="rounded bg-slate-100 px-2 py-1 text-xs">
                          {entry.itemId}
                        </code>
                      </span>
                      <span className="text-sm text-slate-600">
                        実行者: <span className="font-semibold">{entry.performedBy}</span>
                      </span>
                    </div>

                    {renderChanges(entry)}

                    <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(entry.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
