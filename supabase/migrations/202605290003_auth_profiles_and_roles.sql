-- EduManage School OS - Auth profile helpers (no seeded users)

create or replace function public.link_current_auth_user_to_profile()
returns public.app_users
language plpgsql
security definer
set search_path = public
as $$
declare
  current_email text;
  profile public.app_users;
begin
  current_email := auth.email();
  if current_email is null then
    raise exception 'No authenticated user email available';
  end if;

  update public.app_users
  set auth_user_id = auth.uid(), updated_at = now()
  where email = current_email and (auth_user_id is null or auth_user_id = auth.uid())
  returning * into profile;

  if profile.id is null then
    raise exception 'No app profile found for %', current_email;
  end if;

  return profile;
end;
$$;

create or replace view public.v_app_user_profiles as
select
  u.id,
  u.organization_id,
  o.name as organization_name,
  u.name,
  u.email,
  u.role,
  u.active,
  u.created_at,
  u.updated_at
from public.app_users u
left join public.organizations o on o.id = u.organization_id;
