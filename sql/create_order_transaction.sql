-- ====================================================================
-- 注文処理用のストアドプロシージャ
-- トランザクションを使用してデータの整合性を保証します
-- ====================================================================

CREATE OR REPLACE FUNCTION public.create_order_transaction(
  p_user_id UUID,
  p_items JSONB,
  p_total_amount INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_available_accounts JSONB;
  v_account JSONB;
  v_accounts_to_update UUID[];
  v_user_balance INTEGER;
  v_new_balance INTEGER;
  v_result JSONB;
  v_purchased_items JSONB := '[]'::JSONB;
BEGIN
  -- ============================================
  -- 1. ユーザーの残高を確認
  -- ============================================
  SELECT credit_balance INTO v_user_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE; -- 行ロックを取得

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ユーザーが見つかりません';
  END IF;

  IF v_user_balance < p_total_amount THEN
    RAISE EXCEPTION '残高が不足しています';
  END IF;

  -- ============================================
  -- 2. 在庫を確認して予約
  -- ============================================
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- 利用可能なアカウントを取得
    SELECT jsonb_agg(jsonb_build_object('id', id, 'account_info', account_info))
    INTO v_available_accounts
    FROM (
      SELECT id, account_info
      FROM public.purchased_accounts
      WHERE item_id = (v_item->>'itemId')::UUID
        AND is_purchased = FALSE
      ORDER BY created_at
      LIMIT (v_item->>'quantity')::INTEGER
      FOR UPDATE -- 行ロックを取得
    ) sub;

    -- 在庫チェック
    IF v_available_accounts IS NULL OR jsonb_array_length(v_available_accounts) < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION '在庫不足です: %', v_item->>'itemTitle';
    END IF;

    -- 予約するアカウントのIDを収集
    FOR v_account IN SELECT * FROM jsonb_array_elements(v_available_accounts)
    LOOP
      v_accounts_to_update := array_append(v_accounts_to_update, (v_account->>'id')::UUID);
      v_purchased_items := v_purchased_items || jsonb_build_object(
        'itemTitle', v_item->>'itemTitle',
        'accountInfo', v_account->>'account_info'
      );
    END LOOP;
  END LOOP;

  -- ============================================
  -- 3. 注文を作成
  -- ============================================
  INSERT INTO public.orders (user_id, total, status)
  VALUES (p_user_id, p_total_amount, 'completed')
  RETURNING id INTO v_order_id;

  -- ============================================
  -- 4. 注文アイテムを作成
  -- ============================================
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (order_id, item_id, quantity, price)
    VALUES (
      v_order_id,
      (v_item->>'itemId')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price')::INTEGER
    );
  END LOOP;

  -- ============================================
  -- 5. 購入済みアカウントを更新
  -- ============================================
  UPDATE public.purchased_accounts
  SET 
    is_purchased = TRUE,
    order_id = v_order_id,
    purchased_at = NOW()
  WHERE id = ANY(v_accounts_to_update);

  -- ============================================
  -- 6. ユーザーの残高を更新
  -- ============================================
  v_new_balance := v_user_balance - p_total_amount;

  UPDATE public.profiles
  SET credit_balance = v_new_balance
  WHERE id = p_user_id;

  -- ============================================
  -- 7. 残高取引履歴を記録
  -- ============================================
  INSERT INTO public.balance_transactions (
    user_id,
    amount,
    type,
    order_id,
    balance_before,
    balance_after
  )
  VALUES (
    p_user_id,
    -p_total_amount,
    'purchase',
    v_order_id,
    v_user_balance,
    v_new_balance
  );

  -- ============================================
  -- 8. 結果を返す
  -- ============================================
  v_result := jsonb_build_object(
    'success', TRUE,
    'orderId', v_order_id,
    'purchasedItems', v_purchased_items,
    'newBalance', v_new_balance
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- エラーが発生した場合、すべての変更をロールバック
    RAISE EXCEPTION 'トランザクションエラー: %', SQLERRM;
END;
$$;

-- ============================================
-- 権限設定
-- ============================================
-- Service Roleのみがこの関数を実行できるようにする
REVOKE ALL ON FUNCTION public.create_order_transaction(UUID, JSONB, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_transaction(UUID, JSONB, INTEGER) TO service_role;

-- ============================================
-- 使用例
-- ============================================
-- SELECT public.create_order_transaction(
--   'user-uuid-here'::UUID,
--   '[
--     {"itemId": "item-uuid-1", "itemTitle": "商品1", "price": 1000, "quantity": 2},
--     {"itemId": "item-uuid-2", "itemTitle": "商品2", "price": 2000, "quantity": 1}
--   ]'::JSONB,
--   4000
-- );

