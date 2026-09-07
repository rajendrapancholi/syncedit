-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: project_access_level; Type: TYPE; Schema: public; Owner: rajeusr
--

CREATE TYPE public.project_access_level AS ENUM (
    'view',
    'edit',
    'admin',
    'owner'
);


ALTER TYPE public.project_access_level OWNER TO rajeusr;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: rajeusr
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'admin'
);


ALTER TYPE public.user_role OWNER TO rajeusr;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: files; Type: TABLE; Schema: public; Owner: rajeusr
--

CREATE TABLE public.files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    folder_id uuid,
    project_id uuid,
    content text DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.files OWNER TO rajeusr;

--
-- Name: folders; Type: TABLE; Schema: public; Owner: rajeusr
--

CREATE TABLE public.folders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    project_id uuid,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.folders OWNER TO rajeusr;

--
-- Name: project_members; Type: TABLE; Schema: public; Owner: rajeusr
--

CREATE TABLE public.project_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    user_id uuid,
    access_level public.project_access_level DEFAULT 'view'::public.project_access_level,
    joined_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.project_members OWNER TO rajeusr;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: rajeusr
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text,
    owner_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.projects OWNER TO rajeusr;

--
-- Name: users; Type: TABLE; Schema: public; Owner: rajeusr
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO rajeusr;

--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: rajeusr
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: folders folders_pkey; Type: CONSTRAINT; Schema: public; Owner: rajeusr
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_pkey PRIMARY KEY (id);


--
-- Name: project_members project_members_pkey; Type: CONSTRAINT; Schema: public; Owner: rajeusr
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_pkey PRIMARY KEY (id);


--
-- Name: project_members project_members_project_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: rajeusr
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_project_id_user_id_key UNIQUE (project_id, user_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: rajeusr
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: rajeusr
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: rajeusr
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_files_name_search; Type: INDEX; Schema: public; Owner: rajeusr
--

CREATE INDEX idx_files_name_search ON public.files USING btree (folder_id, name);


--
-- Name: idx_files_project_folder; Type: INDEX; Schema: public; Owner: rajeusr
--

CREATE INDEX idx_files_project_folder ON public.files USING btree (project_id, folder_id);


--
-- Name: idx_folders_hierarchy; Type: INDEX; Schema: public; Owner: rajeusr
--

CREATE INDEX idx_folders_hierarchy ON public.folders USING btree (project_id, parent_id);


--
-- Name: idx_folders_name_search; Type: INDEX; Schema: public; Owner: rajeusr
--

CREATE INDEX idx_folders_name_search ON public.folders USING btree (project_id, name);


--
-- Name: idx_member_project_lookup; Type: INDEX; Schema: public; Owner: rajeusr
--

CREATE INDEX idx_member_project_lookup ON public.project_members USING btree (project_id);


--
-- Name: idx_member_user_lookup; Type: INDEX; Schema: public; Owner: rajeusr
--

CREATE INDEX idx_member_user_lookup ON public.project_members USING btree (user_id);


--
-- Name: idx_projects_name; Type: INDEX; Schema: public; Owner: rajeusr
--

CREATE INDEX idx_projects_name ON public.projects USING btree (name);


--
-- Name: idx_projects_owner; Type: INDEX; Schema: public; Owner: rajeusr
--

CREATE INDEX idx_projects_owner ON public.projects USING btree (owner_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: rajeusr
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: rajeusr
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: files files_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rajeusr
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.folders(id) ON DELETE CASCADE;


--
-- Name: files files_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rajeusr
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: folders folders_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rajeusr
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.folders(id) ON DELETE CASCADE;


--
-- Name: folders folders_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rajeusr
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_members project_members_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rajeusr
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_members project_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rajeusr
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rajeusr
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict f0KFCA6ijTf4OfCmwjwLHIcVRChsGmdFNEpJ51SFwG1S8h7lWJukEBioWuVOswH



-- -- Global system roles
-- CREATE TYPE user_role AS ENUM ('user', 'admin'); 

-- -- Project-specific roles
-- CREATE TYPE project_access_level AS ENUM ('view', 'edit', 'admin', 'owner');

-- CREATE TABLE users (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name TEXT NOT NULL,
--   email TEXT UNIQUE NOT NULL,
--   password_hash TEXT NOT NULL,  
--   role user_role DEFAULT 'user',
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
-- CREATE INDEX idx_users_email ON users(email);
-- CREATE INDEX idx_users_role ON users(role);

-- -- Projects
-- CREATE TABLE projects (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name TEXT NOT NULL,
--   description TEXT DEFAULT '',
--   owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
-- CREATE INDEX idx_projects_owner ON projects(owner_id);
-- CREATE INDEX idx_projects_name ON projects(name);


-- CREATE TABLE project_members (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
--   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
--   access_level project_access_level DEFAULT 'view',
--   joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   UNIQUE(project_id, user_id)
-- );
-- CREATE INDEX idx_member_user_lookup ON project_members(user_id);
-- CREATE INDEX idx_member_project_lookup ON project_members(project_id);

-- -- Folders
-- CREATE TABLE folders (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name TEXT NOT NULL,
--   project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
--   parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
-- -- Unique index name for folder hierarchy
-- CREATE INDEX idx_folders_hierarchy ON folders(project_id, parent_id);
-- CREATE INDEX idx_folders_name_search ON folders(project_id, name);

-- -- Files
-- CREATE TABLE files (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name TEXT NOT NULL,
--     folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
--     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
--     content TEXT DEFAULT '',
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
-- CREATE INDEX idx_files_project_folder ON files(project_id, folder_id);
-- CREATE INDEX idx_files_name_search ON files(folder_id, name);

CREATE TABLE chat_messages (
           id UUID PRIMARY KEY,
           project_id VARCHAR(255) NOT NULL,
           user_id VARCHAR(255),
           username VARCHAR(255) NOT NULL,
           message TEXT NOT NULL,
           created_at TIMESTAMPTZ NOT NULL DEFAULT now()
         );

CREATE INDEX idx_chat_messages_project_created
             ON chat_messages (project_id, created_at);

