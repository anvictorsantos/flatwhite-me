-- One-time bootstrap for a fresh database (Neon, staging, local reset).
-- Generated from the local Postgres 16 schema on 2026-11-13. Source of truth is
-- prisma/schema.prisma plus the hand-written ranking view, checks and partial
-- unique index below; replace with migrations once Prisma 7 has a prisma.config.ts.

--
-- PostgreSQL database dump
--


-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

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
-- Name: CafeSource; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CafeSource" AS ENUM (
    'overture',
    'user'
);


--
-- Name: CafeStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CafeStatus" AS ENUM (
    'active',
    'possibly_closed',
    'closed',
    'hidden'
);


--
-- Name: MilkType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MilkType" AS ENUM (
    'whole',
    'oat',
    'lactose_free',
    'other'
);


--
-- Name: OvertureStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OvertureStatus" AS ENUM (
    'open',
    'temporarily_closed',
    'permanently_closed',
    'unknown'
);


--
-- Name: RatingStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RatingStatus" AS ENUM (
    'visible',
    'hidden'
);


--
-- Name: ReportReason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReportReason" AS ENUM (
    'spam',
    'offensive',
    'wrong_place',
    'other'
);


--
-- Name: ReportStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReportStatus" AS ENUM (
    'open',
    'actioned',
    'dismissed'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'user',
    'admin'
);


--
-- Name: Size; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Size" AS ENUM (
    'regular',
    'large'
);


--
-- Name: SuggestionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SuggestionStatus" AS ENUM (
    'pending',
    'approved',
    'rejected',
    'merged'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AdminAction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AdminAction" (
    id uuid NOT NULL,
    "actorUserId" uuid NOT NULL,
    action text NOT NULL,
    "targetType" text NOT NULL,
    "targetId" uuid NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Cafe; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Cafe" (
    id uuid NOT NULL,
    "overtureId" text,
    source public."CafeSource" NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    "normalizedName" text NOT NULL,
    "addressLine" text,
    neighborhood text,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    specialty boolean DEFAULT false NOT NULL,
    status public."CafeStatus" DEFAULT 'active'::public."CafeStatus" NOT NULL,
    "overtureStatus" public."OvertureStatus" DEFAULT 'unknown'::public."OvertureStatus" NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "lastImportedAt" timestamp with time zone,
    freguesia text
);


--
-- Name: CafeSuggestion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CafeSuggestion" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    name text NOT NULL,
    "addressLine" text,
    latitude double precision,
    longitude double precision,
    note text,
    status public."SuggestionStatus" DEFAULT 'pending'::public."SuggestionStatus" NOT NULL,
    "matchedCafeId" uuid,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reviewedAt" timestamp with time zone,
    "reviewedBy" uuid
);


--
-- Name: Rating; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Rating" (
    id uuid NOT NULL,
    "cafeId" uuid NOT NULL,
    "userId" uuid,
    taste smallint NOT NULL,
    "milkTexture" smallint NOT NULL,
    temperature smallint NOT NULL,
    value smallint NOT NULL,
    "priceCents" integer NOT NULL,
    currency character(3) DEFAULT 'EUR'::bpchar NOT NULL,
    "milkType" public."MilkType" DEFAULT 'whole'::public."MilkType" NOT NULL,
    size public."Size" DEFAULT 'regular'::public."Size" NOT NULL,
    "visitedOn" date NOT NULL,
    note text,
    status public."RatingStatus" DEFAULT 'visible'::public."RatingStatus" NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "Rating_note_length" CHECK (((note IS NULL) OR (char_length(note) <= 280))),
    CONSTRAINT "Rating_price_range" CHECK ((("priceCents" >= 0) AND ("priceCents" <= 2000))),
    CONSTRAINT "Rating_scores_range" CHECK ((((taste >= 1) AND (taste <= 5)) AND (("milkTexture" >= 1) AND ("milkTexture" <= 5)) AND ((temperature >= 1) AND (temperature <= 5)) AND ((value >= 1) AND (value <= 5))))
);


--
-- Name: RatingReport; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RatingReport" (
    id uuid NOT NULL,
    "ratingId" uuid NOT NULL,
    "reporterUserId" uuid NOT NULL,
    reason public."ReportReason" NOT NULL,
    status public."ReportStatus" DEFAULT 'open'::public."ReportStatus" NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "resolvedAt" timestamp with time zone
);


--
-- Name: RatingRevision; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RatingRevision" (
    id uuid NOT NULL,
    "ratingId" uuid NOT NULL,
    snapshot jsonb NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastSeenAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id uuid NOT NULL,
    "googleSub" text,
    email text,
    "displayName" text,
    nickname text,
    "avatarUrl" text,
    role public."Role" DEFAULT 'user'::public."Role" NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: WantToTry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WantToTry" (
    "userId" uuid NOT NULL,
    "cafeId" uuid NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: cafe_scores; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.cafe_scores AS
 SELECT c.id AS cafe_id,
    (count(r.id))::integer AS sample_size,
    max(r."visitedOn") AS last_visited_on,
    (sum((w.weight * ((((0.40 * (r.taste)::numeric) + (0.30 * (r."milkTexture")::numeric)) + (0.10 * (r.temperature)::numeric)) + (0.20 * (r.value)::numeric)))) / sum(w.weight)) AS score
   FROM ((public."Cafe" c
     JOIN public."Rating" r ON (((r."cafeId" = c.id) AND (r.status = 'visible'::public."RatingStatus") AND (r."visitedOn" >= (CURRENT_DATE - '365 days'::interval)))))
     CROSS JOIN LATERAL ( SELECT power(0.5, (((CURRENT_DATE - r."visitedOn"))::numeric / 182.5)) AS weight) w)
  WHERE (c.status = 'active'::public."CafeStatus")
  GROUP BY c.id
  WITH NO DATA;


--
-- Name: AdminAction AdminAction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminAction"
    ADD CONSTRAINT "AdminAction_pkey" PRIMARY KEY (id);


--
-- Name: CafeSuggestion CafeSuggestion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CafeSuggestion"
    ADD CONSTRAINT "CafeSuggestion_pkey" PRIMARY KEY (id);


--
-- Name: Cafe Cafe_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Cafe"
    ADD CONSTRAINT "Cafe_pkey" PRIMARY KEY (id);


--
-- Name: RatingReport RatingReport_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RatingReport"
    ADD CONSTRAINT "RatingReport_pkey" PRIMARY KEY (id);


--
-- Name: RatingRevision RatingRevision_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RatingRevision"
    ADD CONSTRAINT "RatingRevision_pkey" PRIMARY KEY (id);


--
-- Name: Rating Rating_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WantToTry WantToTry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WantToTry"
    ADD CONSTRAINT "WantToTry_pkey" PRIMARY KEY ("userId", "cafeId");


--
-- Name: AdminAction_targetType_targetId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminAction_targetType_targetId_idx" ON public."AdminAction" USING btree ("targetType", "targetId");


--
-- Name: CafeSuggestion_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CafeSuggestion_status_createdAt_idx" ON public."CafeSuggestion" USING btree (status, "createdAt");


--
-- Name: Cafe_freguesia_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Cafe_freguesia_status_idx" ON public."Cafe" USING btree (freguesia, status);


--
-- Name: Cafe_lower_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Cafe_lower_name_idx" ON public."Cafe" USING btree (lower(name));


--
-- Name: Cafe_normalizedName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Cafe_normalizedName_idx" ON public."Cafe" USING btree ("normalizedName");


--
-- Name: Cafe_overtureId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Cafe_overtureId_key" ON public."Cafe" USING btree ("overtureId");


--
-- Name: Cafe_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Cafe_slug_key" ON public."Cafe" USING btree (slug);


--
-- Name: Cafe_status_latitude_longitude_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Cafe_status_latitude_longitude_idx" ON public."Cafe" USING btree (status, latitude, longitude);


--
-- Name: RatingReport_ratingId_reporterUserId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "RatingReport_ratingId_reporterUserId_key" ON public."RatingReport" USING btree ("ratingId", "reporterUserId");


--
-- Name: RatingRevision_ratingId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RatingRevision_ratingId_idx" ON public."RatingRevision" USING btree ("ratingId");


--
-- Name: Rating_cafeId_status_visitedOn_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Rating_cafeId_status_visitedOn_idx" ON public."Rating" USING btree ("cafeId", status, "visitedOn");


--
-- Name: Rating_userId_cafeId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Rating_userId_cafeId_key" ON public."Rating" USING btree ("userId", "cafeId") WHERE ("userId" IS NOT NULL);


--
-- Name: Rating_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Rating_userId_createdAt_idx" ON public."Rating" USING btree ("userId", "createdAt");


--
-- Name: Session_tokenHash_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_tokenHash_key" ON public."Session" USING btree ("tokenHash");


--
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_googleSub_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_googleSub_key" ON public."User" USING btree ("googleSub");


--
-- Name: User_nickname_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_nickname_key" ON public."User" USING btree (nickname);


--
-- Name: cafe_scores_cafe_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX cafe_scores_cafe_id_key ON public.cafe_scores USING btree (cafe_id);


--
-- Name: AdminAction AdminAction_actorUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminAction"
    ADD CONSTRAINT "AdminAction_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CafeSuggestion CafeSuggestion_matchedCafeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CafeSuggestion"
    ADD CONSTRAINT "CafeSuggestion_matchedCafeId_fkey" FOREIGN KEY ("matchedCafeId") REFERENCES public."Cafe"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CafeSuggestion CafeSuggestion_reviewedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CafeSuggestion"
    ADD CONSTRAINT "CafeSuggestion_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CafeSuggestion CafeSuggestion_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CafeSuggestion"
    ADD CONSTRAINT "CafeSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RatingReport RatingReport_ratingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RatingReport"
    ADD CONSTRAINT "RatingReport_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES public."Rating"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RatingReport RatingReport_reporterUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RatingReport"
    ADD CONSTRAINT "RatingReport_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RatingRevision RatingRevision_ratingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RatingRevision"
    ADD CONSTRAINT "RatingRevision_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES public."Rating"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Rating Rating_cafeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES public."Cafe"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Rating Rating_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WantToTry WantToTry_cafeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WantToTry"
    ADD CONSTRAINT "WantToTry_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES public."Cafe"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WantToTry WantToTry_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WantToTry"
    ADD CONSTRAINT "WantToTry_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


