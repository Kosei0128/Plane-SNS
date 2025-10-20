-- 最終修正：管理者ロールにpublicスキーマへのアクセス権限を再付与します。

-- 1. publicスキーマの使用を許可
GRANT USAGE ON SCHEMA public TO service_role;

-- 2. publicスキーマ内の「既存の」全てのテーブルに対する全権限を許可
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- 3. publicスキーマ内に「今後作成される」全てのテーブルに対する全権限を許可
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

-- 4. publicスキーマ内の「既存の」全てのシーケンスに対する全権限を許可
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 5. publicスキーマ内に「今後作成される」全てのシーケンスに対する全権限を許可
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
