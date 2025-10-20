-- 古くて動作しなかった自動作成機能（トリガーと関数）を完全に削除します。
-- これにより、新しいAPIのロジックと競合しなくなります。

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
