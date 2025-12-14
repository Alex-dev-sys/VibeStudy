-- Create system_settings table for storing global configuration securely
create table if not exists public.system_settings (
    key text primary key,
    value text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.system_settings enable row level security;

-- Create policies (Only service role can manage settings, admins can view/edit)
create policy "Service role can do everything on system_settings"
    on public.system_settings
    for all
    using ( auth.role() = 'service_role' )
    with check ( auth.role() = 'service_role' );

-- NOTE: For now, we restrict access to service_role only. 
-- Regular authenticated users (even admins) usually access this via API functions.

-- Insert initial placeholder for AI_API_TOKEN if not exists
insert into public.system_settings (key, value, description)
values ('AI_API_TOKEN', '', 'Token for GPT Llama AI API')
on conflict (key) do nothing;
