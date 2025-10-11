/**
 * PayPay送金リンク処理用TypeScriptラッパー
 * Pythonスクリプトを呼び出してPayPay操作を実行
 */

import { spawn } from "child_process";
import path from "path";

export type PayPayLinkInfo = {
  amount: number;
  money_light: number;
  money: number;
  has_password: boolean;
  chat_room_id: string;
  status: "PENDING" | "COMPLETED" | "REJECTED" | "FAILED";
  order_id: string;
};

export type PayPayBalance = {
  all_balance: number;
  useable_balance: number;
  money_light: number;
  money: number;
  points: number;
};

export type PayPayCreateLinkResult = {
  link: string;
  chat_room_id: string;
};

export type PayPayTokens = {
  access_token: string;
  refresh_token: string;
};

export class PayPayClient {
  private pythonPath: string;
  private scriptPath: string;
  private accessToken?: string;
  private refreshToken?: string;

  constructor(accessToken?: string, refreshToken?: string) {
    this.pythonPath = process.env.PYTHON_PATH || "python";
    this.scriptPath = path.join(process.cwd(), "lib", "paypay", "client.py");
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  /**
   * Pythonスクリプトを実行
   */
  private async executePython(input: Record<string, string | number | undefined>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const python = spawn(this.pythonPath, [this.scriptPath]);

      let stdout = "";
      let stderr = "";

      python.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      python.stderr.on("data", (data) => {
        const stderrText = data.toString();
        stderr += stderrText;
        // デバッグログをコンソールに出力
        if (stderrText.includes("DEBUG:")) {
          console.log("PayPay Python Debug:", stderrText);
        }
      });

      python.on("close", (code) => {
        if (code !== 0) {
          console.error("Python stderr:", stderr);
          reject(new Error(`Python script failed: ${stderr || stdout}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          if (result.success) {
            resolve(result.data);
          } else {
            reject(new Error(result.error || "Unknown error"));
          }
        } catch {
          console.error("Failed to parse output. stdout:", stdout);
          reject(new Error(`Failed to parse Python output: ${stdout}`));
        }
      });

      python.on("error", (error: Error) => {
        reject(new Error(`Failed to spawn Python: ${error.message}`));
      });

      // 入力データを送信
      python.stdin.write(JSON.stringify({
        ...input,
        access_token: this.accessToken,
        refresh_token: this.refreshToken
      }));
      python.stdin.end();
    });
  }

  /**
   * 送金リンクの情報を確認
   */
  async checkLink(linkUrl: string): Promise<PayPayLinkInfo> {
    return this.executePython({
      action: "link_check",
      link_url: linkUrl
    }) as Promise<PayPayLinkInfo>;
  }

  /**
   * 送金リンクを受け取る
   */
  async receiveLink(linkUrl: string, passcode?: string): Promise<{
    message: string;
    balance: PayPayBalance;
  }> {
    return this.executePython({
      action: "link_receive",
      link_url: linkUrl,
      passcode
    }) as Promise<{ message: string; balance: PayPayBalance; }>;
  }

  /**
   * 送金リンクを辞退
   */
  async rejectLink(linkUrl: string): Promise<{ message: string }> {
    return this.executePython({
      action: "link_reject",
      link_url: linkUrl
    }) as Promise<{ message: string }>;
  }

  /**
   * 送金リンクを作成
   */
  async createLink(
    amount: number,
    passcode?: string
  ): Promise<PayPayCreateLinkResult> {
    return this.executePython({
      action: "create_link",
      amount,
      passcode
    }) as Promise<PayPayCreateLinkResult>;
  }

  /**
   * 残高を取得
   */
  async getBalance(): Promise<PayPayBalance> {
    return this.executePython({
      action: "get_balance"
    }) as Promise<PayPayBalance>;
  }

  /**
   * トークンをリフレッシュ
   */
  async refreshTokens(): Promise<PayPayTokens> {
    const result = await this.executePython({
      action: "token_refresh"
    }) as PayPayTokens;

    // 新しいトークンを保存
    this.accessToken = result.access_token;
    this.refreshToken = result.refresh_token;

    return result;
  }

  /**
   * アクセストークンを取得
   */
  getAccessToken(): string | undefined {
    return this.accessToken;
  }

  /**
   * リフレッシュトークンを取得
   */
  getRefreshToken(): string | undefined {
    return this.refreshToken;
  }
}

/**
 * シングルトンインスタンス（サーバーサイドで共有）
 */
let paypayClientInstance: PayPayClient | null = null;

export function getPayPayClient(): PayPayClient {
  if (!paypayClientInstance) {
    const accessToken = process.env.PAYPAY_ACCESS_TOKEN;
    const refreshToken = process.env.PAYPAY_REFRESH_TOKEN;
    
    paypayClientInstance = new PayPayClient(accessToken, refreshToken);
  }
  
  return paypayClientInstance;
}

export function resetPayPayClient() {
  paypayClientInstance = null;
}
