-- Prevent duplicate product/category records when save requests arrive twice.
-- Existing duplicate rows are left untouched; clean them first if either index cannot be created.

do $$
begin
  if not exists (
    select 1
    from (
      select lower(btrim(name)) as key_name, count(*) as total
      from public.product_categories
      where btrim(coalesce(name, '')) <> ''
      group by lower(btrim(name))
      having count(*) > 1
    ) duplicates
  ) then
    create unique index if not exists product_categories_unique_name_idx
      on public.product_categories (lower(btrim(name)))
      where btrim(coalesce(name, '')) <> '';
  else
    raise notice 'Skipped product_categories_unique_name_idx because duplicate category names already exist.';
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'sku'
  ) and not exists (
    select 1
    from (
      select lower(btrim(sku)) as key_sku, count(*) as total
      from public.products
      where btrim(coalesce(sku, '')) <> ''
      group by lower(btrim(sku))
      having count(*) > 1
    ) duplicates
  ) then
    create unique index if not exists products_unique_sku_idx
      on public.products (lower(btrim(sku)))
      where btrim(coalesce(sku, '')) <> '';
  else
    raise notice 'Skipped products_unique_sku_idx because the sku column is missing or duplicate SKUs already exist.';
  end if;
end $$;

notify pgrst, 'reload schema';
