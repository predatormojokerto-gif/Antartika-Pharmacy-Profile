import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  company_name: string;
  tagline: string;
  hero_title: string;
  hero_subtitle: string;
  about_title: string;
  about_text: string;
  vision: string;
  mission: string;
  stat_years: string;
  stat_branches: string;
  stat_products: string;
  stat_customers: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
};

export type Service = { id: string; title: string; description: string; icon: string; sort_order: number };
export type Category = { id: string; name: string; description: string; sort_order: number; image_url: string | null };

export function useSiteSettings() {
  const [data, setData] = useState<SiteSettings | null>(null);
  useEffect(() => {
    supabase.from("site_settings").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data) setData(data as SiteSettings);
    });
  }, []);
  return data;
}

export function useServices() {
  const [data, setData] = useState<Service[]>([]);
  useEffect(() => {
    supabase.from("services").select("*").order("sort_order").then(({ data }) => {
      setData((data ?? []) as Service[]);
    });
  }, []);
  return data;
}

export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  useEffect(() => {
    supabase.from("product_categories").select("*").order("sort_order").then(({ data }) => {
      setData((data ?? []) as Category[]);
    });
  }, []);
  return data;
}
