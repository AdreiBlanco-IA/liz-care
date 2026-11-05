-- Liz Care · Incremento 1 (plan de implementación T-02 y T-03)
-- Tablas perfil y paciente del modelado de datos, con restricciones y reglas de acceso (RLS).
-- RF-01 / CA-01: alta de pacientes · RNF-02 / CA-09, CA-13: solo administración · RNF-03: datos mínimos.

-- perfil: rol de cada cuenta de Supabase Auth. Las contraseñas viven solo en Auth.
create table public.perfil (
  usuario_id uuid primary key references auth.users (id) on delete cascade,
  nombre     text not null check (btrim(nombre) <> ''),
  rol        text not null check (rol in ('administrador', 'paciente'))
);

-- paciente: expediente básico. usuario_id queda nulo hasta que el paciente active su portal.
create table public.paciente (
  id                     uuid primary key default gen_random_uuid(),
  usuario_id             uuid unique references public.perfil (usuario_id),
  nombres                text not null check (btrim(nombres) <> ''),
  primer_apellido        text not null check (btrim(primer_apellido) <> ''),
  segundo_apellido       text,
  nacimiento             date not null check (nacimiento <= current_date),
  sexo                   text not null check (sexo in ('F', 'M', 'X')),
  nacionalidad           text not null check (btrim(nacionalidad) <> ''),
  pais                   text not null check (pais ~ '^[A-Z]{2}$'),
  idioma                 text not null check (btrim(idioma) <> ''),
  telefono               text not null check (btrim(telefono) <> ''),
  correo                 text not null check (correo ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  emergencia_nombre      text not null check (btrim(emergencia_nombre) <> ''),
  emergencia_parentesco  text not null check (btrim(emergencia_parentesco) <> ''),
  emergencia_telefono    text not null check (btrim(emergencia_telefono) <> ''),
  padecimiento_principal text not null check (btrim(padecimiento_principal) <> ''),
  estado                 text not null default 'activo' check (estado in ('activo', 'terminado')),
  portal                 text not null default 'sin acceso' check (portal in ('activo', 'invitado', 'sin acceso')),
  fecha_alta             timestamptz not null default now()
);

-- CA-01 error: un correo solo puede pertenecer a un paciente, sin distinguir mayúsculas ni espacios.
create unique index paciente_correo_unico on public.paciente (lower(btrim(correo)));

-- ¿La sesión actual es de una administradora? security definer evita la recursión de RLS sobre perfil.
create function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfil
    where usuario_id = (select auth.uid()) and rol = 'administrador'
  );
$$;

revoke all on function public.es_admin() from public, anon;
grant execute on function public.es_admin() to authenticated;

alter table public.perfil enable row level security;
alter table public.paciente enable row level security;

-- Sin sesión (anon) no hay acceso a ninguna fila (CA-09).
revoke all on public.perfil, public.paciente from anon;

-- perfil: cada cuenta lee el suyo; la administración lee todos. Los perfiles se crean desde el panel de Supabase.
create policy perfil_lectura on public.perfil
  for select to authenticated
  using (usuario_id = (select auth.uid()) or (select public.es_admin()));

-- paciente: la administración consulta, registra y corrige (CA-13). No hay política de borrado:
-- no se eliminan expedientes de forma automática.
create policy paciente_admin_lectura on public.paciente
  for select to authenticated
  using ((select public.es_admin()));

create policy paciente_admin_alta on public.paciente
  for insert to authenticated
  with check ((select public.es_admin()));

create policy paciente_admin_correccion on public.paciente
  for update to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

-- El paciente con portal activo solo lee su propio expediente (CA-04).
create policy paciente_propio_lectura on public.paciente
  for select to authenticated
  using (usuario_id = (select auth.uid()));
