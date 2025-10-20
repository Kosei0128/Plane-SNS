-- ====================================================================
-- WARNING: EXECUTING THIS SCRIPT WILL DELETE ALL TRANSACTIONAL DATA
-- FROM YOUR DATABASE. THIS ACTION IS IRREVERSIBLE.
--
-- It is recommended to back up your data before running this script.
--
-- This script will delete data from the following tables:
-- - orders
-- - order_items (via CASCADE)
-- - charge_history
-- - balance_transactions
-- - purchased_accounts
-- - item_history
--
-- It does NOT delete data from:
-- - profiles (user accounts)
-- - items (product master data)
-- ====================================================================

-- Truncate all transactional data
TRUNCATE
  public.orders,
  public.charge_history,
  public.balance_transactions,
  public.purchased_accounts,
  public.item_history
RESTART IDENTITY CASCADE;

-- ====================================================================
-- OPTIONAL: If you want to delete ALL user data as well,
-- uncomment and run the following line.
-- WARNING: This will delete all user accounts, including your own.
-- ====================================================================

-- TRUNCATE public.profiles RESTART IDENTITY CASCADE;

-- ====================================================================
-- After running this, you should run 00_master_schema.sql
-- to ensure the database is correctly set up and seeded with initial items.
-- ====================================================================
