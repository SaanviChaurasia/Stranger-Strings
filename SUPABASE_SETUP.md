# Connect NeerSath to Supabase

1. Create a Supabase project.
2. In **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql). If you ran the older Ward-based schema before, first run [`supabase/location_upgrade.sql`](supabase/location_upgrade.sql), then run the schema again.
3. Optional for the presentation: run [`supabase/demo_seed.sql`](supabase/demo_seed.sql) to load clearly fictional, area-level demo reports.
4. In **Connect**, copy the project URL and the **publishable** key (or legacy anon key).
5. Paste them into `supabase-config.js`:

```js
window.NEERSATH_SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT.supabase.co',
  publishableKey: 'YOUR_PUBLISHABLE_KEY'
};
```

6. Restart the local site. New reports are saved to `community_reports`; the dashboard loads aggregated inputs through `get_area_risk_inputs()`.

Never add a `service_role` or secret key to this frontend. The schema enables Row Level Security: visitors can submit an area-level report but cannot read individual reports.
