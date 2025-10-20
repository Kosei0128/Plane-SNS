-- 最終修正用SQL：Supabase推奨の堅牢なトリガーに置き換えます。

-- 古い関数とトリガーを完全に削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 新しい、より信頼性の高い関数を作成
-- set search_path = public を追加して、関数の実行時にpublicスキーマを確実に見つけられるようにします。
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- 新しい関数を呼び出すトリガーを作成
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 以上です --
