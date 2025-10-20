-- ユーザープロフィール作成トリガー修正用SQL
-- 実行は一度だけでOKです。

-- ユーザー新規登録時に、より安全にプロフィールを作成する新しい関数に置き換えます。
-- これにより、プロフィール作成の失敗を防ぎます。
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 念のため、トリガーも再設定します。
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 以上です --
