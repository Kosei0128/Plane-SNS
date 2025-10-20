-- Function to get top selling items
CREATE OR REPLACE FUNCTION get_top_selling_items(limit_count INT)
RETURNS TABLE (
  item_id UUID,
  title TEXT,
  total_quantity BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    oi.item_id,
    i.title,
    SUM(oi.quantity) AS total_quantity
  FROM
    order_items AS oi
  JOIN
    items AS i ON oi.item_id = i.id
  GROUP BY
    oi.item_id,
    i.title
  ORDER BY
    total_quantity DESC
  LIMIT
    limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily sales for the last N days
CREATE OR REPLACE FUNCTION get_daily_sales(days_count INT)
RETURNS TABLE (
  sale_date DATE,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(o.created_at) AS sale_date,
    SUM(o.total_amount) AS total_revenue
  FROM
    orders AS o
  WHERE
    o.created_at >= NOW() - (days_count || ' days')::INTERVAL
  GROUP BY
    sale_date
  ORDER BY
    sale_date ASC;
END;
$$ LANGUAGE plpgsql;
