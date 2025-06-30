--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-0+deb12u1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-0+deb12u1)

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
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AccessControlRule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AccessControlRule" (
    id integer NOT NULL,
    page_route text NOT NULL,
    required_levels text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public."AccessControlRule" OWNER TO postgres;

--
-- Name: AccessControlRule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."AccessControlRule_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AccessControlRule_id_seq" OWNER TO postgres;

--
-- Name: AccessControlRule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."AccessControlRule_id_seq" OWNED BY public."AccessControlRule".id;


--
-- Name: Chemical; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Chemical" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    notes text,
    purchase_link character varying(1024),
    in_use boolean DEFAULT true,
    purpose text,
    image_url text
);


ALTER TABLE public."Chemical" OWNER TO postgres;

--
-- Name: ChemicalLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChemicalLog" (
    id integer NOT NULL,
    tank_id integer NOT NULL,
    chemical_name text NOT NULL,
    amount text,
    notes text,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."ChemicalLog" OWNER TO postgres;

--
-- Name: ChemicalLog_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ChemicalLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ChemicalLog_id_seq" OWNER TO postgres;

--
-- Name: ChemicalLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ChemicalLog_id_seq" OWNED BY public."ChemicalLog".id;


--
-- Name: Chemical_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Chemical_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Chemical_id_seq" OWNER TO postgres;

--
-- Name: Chemical_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Chemical_id_seq" OWNED BY public."Chemical".id;


--
-- Name: Coral; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Coral" (
    id integer NOT NULL,
    name text,
    water_type text,
    ph_low numeric,
    ph_high numeric,
    hardness_low numeric,
    hardness_high numeric,
    temp_low numeric,
    temp_high numeric,
    in_use boolean DEFAULT true,
    aggressiveness text
);


ALTER TABLE public."Coral" OWNER TO postgres;

--
-- Name: Coral_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Coral_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Coral_id_seq" OWNER TO postgres;

--
-- Name: Coral_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Coral_id_seq" OWNED BY public."Coral".id;


--
-- Name: Corals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Corals" (
    id integer NOT NULL,
    name text NOT NULL,
    ph_low numeric,
    ph_high numeric,
    hardness_low numeric,
    hardness_high numeric,
    temp_low numeric,
    temp_high numeric,
    aggressiveness text
);


ALTER TABLE public."Corals" OWNER TO postgres;

--
-- Name: Corals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Corals_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Corals_id_seq" OWNER TO postgres;

--
-- Name: Corals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Corals_id_seq" OWNED BY public."Corals".id;


--
-- Name: Feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Feedback" (
    id integer NOT NULL,
    user_id integer,
    subject text NOT NULL,
    message text NOT NULL,
    rating text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."Feedback" OWNER TO postgres;

--
-- Name: Feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Feedback_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Feedback_id_seq" OWNER TO postgres;

--
-- Name: Feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Feedback_id_seq" OWNED BY public."Feedback".id;


--
-- Name: Fish; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Fish" (
    id integer NOT NULL,
    name text NOT NULL,
    species text,
    "tankNumber" integer,
    "addedOn" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    water_type character varying(20),
    number_of_fish integer,
    species_general character varying(100),
    ph_low numeric(3,2),
    ph_high numeric(3,2),
    hardness_low integer,
    hardness_high integer,
    temp_low numeric(4,1),
    temp_high numeric(4,1),
    in_use boolean DEFAULT true,
    aggressiveness text,
    keep_one boolean DEFAULT false
);


ALTER TABLE public."Fish" OWNER TO postgres;

--
-- Name: Fish_backup_20250627; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Fish_backup_20250627" (
    id integer,
    name text,
    species text,
    "tankNumber" integer,
    "addedOn" timestamp(3) without time zone,
    water_type character varying(20),
    number_of_fish integer,
    species_general character varying(100),
    ph_low numeric(3,2),
    ph_high numeric(3,2),
    hardness_low integer,
    hardness_high integer,
    temp_low numeric(4,1),
    temp_high numeric(4,1),
    in_use boolean,
    aggressiveness text
);


ALTER TABLE public."Fish_backup_20250627" OWNER TO postgres;

--
-- Name: Fish_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Fish_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Fish_id_seq" OWNER TO postgres;

--
-- Name: Fish_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Fish_id_seq" OWNED BY public."Fish".id;


--
-- Name: Invert; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Invert" (
    id integer NOT NULL,
    name text NOT NULL,
    ph_low numeric(3,2),
    ph_high numeric(3,2),
    temp_low numeric(4,1),
    temp_high numeric(4,1)
);


ALTER TABLE public."Invert" OWNER TO postgres;

--
-- Name: Invert_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Invert_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Invert_id_seq" OWNER TO postgres;

--
-- Name: Invert_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Invert_id_seq" OWNED BY public."Invert".id;


--
-- Name: Inverts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Inverts" (
    id integer NOT NULL,
    name text,
    water_type text,
    ph_low numeric,
    ph_high numeric,
    hardness_low numeric,
    hardness_high numeric,
    temp_low numeric,
    temp_high numeric,
    in_use boolean DEFAULT true,
    aggressiveness text
);


ALTER TABLE public."Inverts" OWNER TO postgres;

--
-- Name: Inverts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Inverts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Inverts_id_seq" OWNER TO postgres;

--
-- Name: Inverts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Inverts_id_seq" OWNED BY public."Inverts".id;


--
-- Name: MembershipLevel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MembershipLevel" (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."MembershipLevel" OWNER TO postgres;

--
-- Name: MembershipLevel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."MembershipLevel_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."MembershipLevel_id_seq" OWNER TO postgres;

--
-- Name: MembershipLevel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."MembershipLevel_id_seq" OWNED BY public."MembershipLevel".id;


--
-- Name: PageAccess; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PageAccess" (
    id integer NOT NULL,
    page_route text NOT NULL,
    required_level text DEFAULT 'free'::text NOT NULL
);


ALTER TABLE public."PageAccess" OWNER TO postgres;

--
-- Name: PageAccessControl; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PageAccessControl" (
    id integer NOT NULL,
    page_route text NOT NULL,
    required_levels text[]
);


ALTER TABLE public."PageAccessControl" OWNER TO postgres;

--
-- Name: PageAccessControl_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PageAccessControl_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PageAccessControl_id_seq" OWNER TO postgres;

--
-- Name: PageAccessControl_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PageAccessControl_id_seq" OWNED BY public."PageAccessControl".id;


--
-- Name: PageAccess_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PageAccess_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PageAccess_id_seq" OWNER TO postgres;

--
-- Name: PageAccess_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PageAccess_id_seq" OWNED BY public."PageAccess".id;


--
-- Name: Plant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Plant" (
    id integer NOT NULL,
    name text NOT NULL,
    light_level text,
    co2_required boolean,
    temperature_range text,
    in_use boolean DEFAULT true,
    ph_low numeric(3,2),
    ph_high numeric(3,2),
    temp_low numeric(4,1),
    temp_high numeric(4,1)
);


ALTER TABLE public."Plant" OWNER TO postgres;

--
-- Name: Plant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Plant_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Plant_id_seq" OWNER TO postgres;

--
-- Name: Plant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Plant_id_seq" OWNED BY public."Plant".id;


--
-- Name: Plants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Plants" (
    id integer NOT NULL,
    name text,
    water_type text,
    ph_low numeric,
    ph_high numeric,
    hardness_low numeric,
    hardness_high numeric,
    temp_low numeric,
    temp_high numeric,
    in_use boolean DEFAULT true,
    aggressiveness text
);


ALTER TABLE public."Plants" OWNER TO postgres;

--
-- Name: Plants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Plants_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Plants_id_seq" OWNER TO postgres;

--
-- Name: Plants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Plants_id_seq" OWNED BY public."Plants".id;


--
-- Name: ReferralCode; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReferralCode" (
    id integer NOT NULL,
    code text NOT NULL,
    role text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReferralCode_role_check" CHECK ((role = ANY (ARRAY['super_admin'::text, 'sub_admin'::text, 'user'::text, 'beta_tester'::text])))
);


ALTER TABLE public."ReferralCode" OWNER TO postgres;

--
-- Name: ReferralCode_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ReferralCode_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ReferralCode_id_seq" OWNER TO postgres;

--
-- Name: ReferralCode_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ReferralCode_id_seq" OWNED BY public."ReferralCode".id;


--
-- Name: SpeciesCompatibility; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SpeciesCompatibility" (
    id integer NOT NULL,
    species1_id text NOT NULL,
    species2_id text NOT NULL,
    compatible boolean NOT NULL,
    reason text
);


ALTER TABLE public."SpeciesCompatibility" OWNER TO postgres;

--
-- Name: SpeciesCompatibility_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."SpeciesCompatibility_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."SpeciesCompatibility_id_seq" OWNER TO postgres;

--
-- Name: SpeciesCompatibility_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."SpeciesCompatibility_id_seq" OWNED BY public."SpeciesCompatibility".id;


--
-- Name: Tank; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tank" (
    id integer NOT NULL,
    name text,
    water_type text,
    gallons numeric,
    in_use boolean DEFAULT true,
    user_id integer
);


ALTER TABLE public."Tank" OWNER TO postgres;

--
-- Name: TankChemical; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TankChemical" (
    id integer NOT NULL,
    work_id integer,
    chemical_id integer,
    amount text,
    notes text,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."TankChemical" OWNER TO postgres;

--
-- Name: TankChemical_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TankChemical_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TankChemical_id_seq" OWNER TO postgres;

--
-- Name: TankChemical_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TankChemical_id_seq" OWNED BY public."TankChemical".id;


--
-- Name: TankCoral; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TankCoral" (
    id integer NOT NULL,
    tank_id integer,
    coral_id integer
);


ALTER TABLE public."TankCoral" OWNER TO postgres;

--
-- Name: TankCoral_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TankCoral_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TankCoral_id_seq" OWNER TO postgres;

--
-- Name: TankCoral_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TankCoral_id_seq" OWNED BY public."TankCoral".id;


--
-- Name: TankFish; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TankFish" (
    id integer NOT NULL,
    tank_id integer,
    fish_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."TankFish" OWNER TO postgres;

--
-- Name: TankFish_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TankFish_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TankFish_id_seq" OWNER TO postgres;

--
-- Name: TankFish_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TankFish_id_seq" OWNED BY public."TankFish".id;


--
-- Name: TankInvert; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TankInvert" (
    id integer NOT NULL,
    tank_id integer,
    invert_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."TankInvert" OWNER TO postgres;

--
-- Name: TankInvert_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TankInvert_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TankInvert_id_seq" OWNER TO postgres;

--
-- Name: TankInvert_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TankInvert_id_seq" OWNED BY public."TankInvert".id;


--
-- Name: TankPlant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TankPlant" (
    id integer NOT NULL,
    tank_id integer,
    plant_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."TankPlant" OWNER TO postgres;

--
-- Name: TankPlant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TankPlant_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TankPlant_id_seq" OWNER TO postgres;

--
-- Name: TankPlant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TankPlant_id_seq" OWNED BY public."TankPlant".id;


--
-- Name: TankReminder; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TankReminder" (
    id integer NOT NULL,
    tank_id integer,
    type text,
    frequency_days integer,
    last_done date,
    next_due date,
    notes text,
    in_use boolean DEFAULT true
);


ALTER TABLE public."TankReminder" OWNER TO postgres;

--
-- Name: TankReminder_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TankReminder_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TankReminder_id_seq" OWNER TO postgres;

--
-- Name: TankReminder_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TankReminder_id_seq" OWNED BY public."TankReminder".id;


--
-- Name: TankWaterTest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TankWaterTest" (
    id integer NOT NULL,
    tank_id integer NOT NULL,
    ph numeric(4,2),
    hardness numeric(4,2),
    salinity numeric(5,2),
    ammonia numeric(4,2),
    nitrite numeric(4,2),
    nitrate numeric(4,2),
    temperature numeric(4,1),
    test_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."TankWaterTest" OWNER TO postgres;

--
-- Name: TankWaterTest_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TankWaterTest_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TankWaterTest_id_seq" OWNER TO postgres;

--
-- Name: TankWaterTest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TankWaterTest_id_seq" OWNED BY public."TankWaterTest".id;


--
-- Name: Tank_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Tank_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Tank_id_seq" OWNER TO postgres;

--
-- Name: Tank_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Tank_id_seq" OWNED BY public."Tank".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text,
    email text,
    password_hash text DEFAULT ''::text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    referral_code text,
    paid_level text DEFAULT 'free'::text,
    CONSTRAINT "User_role_check" CHECK ((role = ANY (ARRAY['super_admin'::text, 'sub_admin'::text, 'user'::text, 'beta_tester'::text])))
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: WaterChange; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WaterChange" (
    id integer NOT NULL,
    tank_id integer NOT NULL,
    change_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    percent_changed numeric(5,2),
    notes text
);


ALTER TABLE public."WaterChange" OWNER TO postgres;

--
-- Name: WaterChange_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."WaterChange_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."WaterChange_id_seq" OWNER TO postgres;

--
-- Name: WaterChange_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."WaterChange_id_seq" OWNED BY public."WaterChange".id;


--
-- Name: WaterTest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WaterTest" (
    id integer NOT NULL,
    tank_id integer NOT NULL,
    test_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ph numeric(4,2),
    hardness numeric(5,2),
    kh numeric(5,2),
    ammonia numeric(4,2),
    nitrite numeric(4,2),
    nitrate numeric(4,2),
    salinity numeric(5,2),
    calcium numeric(5,2),
    magnesium numeric(5,2),
    alkalinity numeric(5,2),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."WaterTest" OWNER TO postgres;

--
-- Name: WaterTest_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."WaterTest_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."WaterTest_id_seq" OWNER TO postgres;

--
-- Name: WaterTest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."WaterTest_id_seq" OWNED BY public."WaterTest".id;


--
-- Name: Work; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Work" (
    id integer NOT NULL,
    user_id integer,
    tank_id integer,
    current_step text,
    is_complete boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    water_type text,
    gallons numeric
);


ALTER TABLE public."Work" OWNER TO postgres;

--
-- Name: Work_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Work_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Work_id_seq" OWNER TO postgres;

--
-- Name: Work_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Work_id_seq" OWNED BY public."Work".id;


--
-- Name: AccessControlRule id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AccessControlRule" ALTER COLUMN id SET DEFAULT nextval('public."AccessControlRule_id_seq"'::regclass);


--
-- Name: Chemical id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Chemical" ALTER COLUMN id SET DEFAULT nextval('public."Chemical_id_seq"'::regclass);


--
-- Name: ChemicalLog id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChemicalLog" ALTER COLUMN id SET DEFAULT nextval('public."ChemicalLog_id_seq"'::regclass);


--
-- Name: Coral id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coral" ALTER COLUMN id SET DEFAULT nextval('public."Coral_id_seq"'::regclass);


--
-- Name: Corals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Corals" ALTER COLUMN id SET DEFAULT nextval('public."Corals_id_seq"'::regclass);


--
-- Name: Feedback id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Feedback" ALTER COLUMN id SET DEFAULT nextval('public."Feedback_id_seq"'::regclass);


--
-- Name: Fish id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fish" ALTER COLUMN id SET DEFAULT nextval('public."Fish_id_seq"'::regclass);


--
-- Name: Invert id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invert" ALTER COLUMN id SET DEFAULT nextval('public."Invert_id_seq"'::regclass);


--
-- Name: Inverts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inverts" ALTER COLUMN id SET DEFAULT nextval('public."Inverts_id_seq"'::regclass);


--
-- Name: MembershipLevel id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MembershipLevel" ALTER COLUMN id SET DEFAULT nextval('public."MembershipLevel_id_seq"'::regclass);


--
-- Name: PageAccess id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PageAccess" ALTER COLUMN id SET DEFAULT nextval('public."PageAccess_id_seq"'::regclass);


--
-- Name: PageAccessControl id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PageAccessControl" ALTER COLUMN id SET DEFAULT nextval('public."PageAccessControl_id_seq"'::regclass);


--
-- Name: Plant id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plant" ALTER COLUMN id SET DEFAULT nextval('public."Plant_id_seq"'::regclass);


--
-- Name: Plants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plants" ALTER COLUMN id SET DEFAULT nextval('public."Plants_id_seq"'::regclass);


--
-- Name: ReferralCode id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReferralCode" ALTER COLUMN id SET DEFAULT nextval('public."ReferralCode_id_seq"'::regclass);


--
-- Name: SpeciesCompatibility id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SpeciesCompatibility" ALTER COLUMN id SET DEFAULT nextval('public."SpeciesCompatibility_id_seq"'::regclass);


--
-- Name: Tank id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tank" ALTER COLUMN id SET DEFAULT nextval('public."Tank_id_seq"'::regclass);


--
-- Name: TankChemical id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankChemical" ALTER COLUMN id SET DEFAULT nextval('public."TankChemical_id_seq"'::regclass);


--
-- Name: TankCoral id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankCoral" ALTER COLUMN id SET DEFAULT nextval('public."TankCoral_id_seq"'::regclass);


--
-- Name: TankFish id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankFish" ALTER COLUMN id SET DEFAULT nextval('public."TankFish_id_seq"'::regclass);


--
-- Name: TankInvert id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankInvert" ALTER COLUMN id SET DEFAULT nextval('public."TankInvert_id_seq"'::regclass);


--
-- Name: TankPlant id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankPlant" ALTER COLUMN id SET DEFAULT nextval('public."TankPlant_id_seq"'::regclass);


--
-- Name: TankReminder id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankReminder" ALTER COLUMN id SET DEFAULT nextval('public."TankReminder_id_seq"'::regclass);


--
-- Name: TankWaterTest id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankWaterTest" ALTER COLUMN id SET DEFAULT nextval('public."TankWaterTest_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: WaterChange id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WaterChange" ALTER COLUMN id SET DEFAULT nextval('public."WaterChange_id_seq"'::regclass);


--
-- Name: WaterTest id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WaterTest" ALTER COLUMN id SET DEFAULT nextval('public."WaterTest_id_seq"'::regclass);


--
-- Name: Work id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Work" ALTER COLUMN id SET DEFAULT nextval('public."Work_id_seq"'::regclass);


--
-- Data for Name: AccessControlRule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AccessControlRule" (id, page_route, required_levels) FROM stdin;
1	/dashboard/feedback	{free}
2	/dashboard/tank	{free}
\.


--
-- Data for Name: Chemical; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Chemical" (id, name, notes, purchase_link, in_use, purpose, image_url) FROM stdin;
2	sadfasdfa	dfasdfasdf	asdfasdfas	f	sdfasdfasdf	\N
1	sdfg	sdfg	sdfg	f	sdfg	\N
4	fghjfg	fghjfghj	ghjfghj	f	hjfghjf	\N
5	dfgh	dfghdfgh	dfgh	f	dfghdfgh	\N
3	hdfghd	fghdfghd	ghdfghd	f	fghdfghdf	\N
6	dsfg	sdfgsdfg	sdfgdsfgsdfg	f	sdfg	\N
8	ghjkghjk	hjkghjkghjk	ghjkghjkg	f	ghjkghjk	\N
10	,m,nbnm,b	,bnm,bnm,	bnm,bnm	f	nm,bnm,bnm,	\N
7	nm,.nm	nm,.nm,.	,.nm,.nm,.	f	.nm,.nm,.nm	\N
12	sdfg	sdfgsdfg	gsdfgsdfg	f	sdfgsdfgsdf	\N
11	vbnmvbnm	vbnmvbnmvbnm	mvbnm	f	vbnmvbn	\N
9	vbnmvbnmvb	mvbnmvbnm	mvbnmvbn	f	nmvbnmv	\N
13	xcvbxcvb	xcvbxcvb	xcvbxcv	f	bxcvbxcvb	\N
14	asdf	asdf	asdf	f	asdf	\N
15	chem 1	chem 1	chem 1	f	chem 1	/uploads/a010c973-02d7-4d5d-bf48-f1a815611f81.jpg
16	chem 2	chem 2	chem 2	f	fghjk	
18	sdfg	sdfg	sdfg	f	sdfg	\N
20	Seachem Prime		https://www.seachem.com/prime.php	t	Water conditioner, removes chlorine/chloramine and detoxifies ammonia	
21	Seachem Stability		https://www.seachem.com/stability.php	t	Bacteria starter	
22	Seachem Flourish		https://www.seachem.com/flourish.php	t	General plant supplement	
23	Seachem Flourish Excel		https://www.seachem.com/flourish-excel.php	t	Carbon supplement for planted tanks	
24	Seachem Clarity		https://www.seachem.com/clarity.php	t	Water clarifier	
25	Seachem AmGuard		https://www.seachem.com/amguard.php	t	Ammonia detoxifier	
26	Seachem Purigen		https://www.seachem.com/purigen.php	t	Organic waste remover	
27	Seachem Equilibrium		https://www.seachem.com/equilibrium.php	t	Replenishes minerals in RO water	
28	Seachem PhosGuard		https://www.seachem.com/phosguard.php	t	Phosphate remover	
29	Seachem Neutral Regulator		https://www.seachem.com/neutral-regulator.php	t	Adjusts pH to neutral (7.0)	
30	API Stress Coat		https://apifishcare.com/product/stress-coat	t	Dechlorinator with aloe vera	
31	API Stress Zyme		https://apifishcare.com/product/stress-zyme	t	Bacteria booster	
32	API Ammo Lock		https://apifishcare.com/product/ammo-lock	t	Detoxifies ammonia	
33	API Tap Water Conditioner		https://apifishcare.com/product/tap-water-conditioner	t	Dechlorinator	
34	API Leaf Zone		https://apifishcare.com/product/leaf-zone	t	Plant fertilizer	
36	API pH Up		https://apifishcare.com/product/ph-up	t	Raises pH	
37	API pH Down		https://apifishcare.com/product/ph-down	t	Lowers pH	
38	Fritz FritzZyme 7		https://fritzaquatics.com/products/fritzzyme-7	t	Nitrifying bacteria	
39	Fritz Fritz Complete		https://fritzaquatics.com/products/fritz-complete	t	Water conditioner	
40	Fritz Fritz A.C.C.R.		https://fritzaquatics.com/products/fritz-accr	t	Chlorine/chloramine remover	
41	Brightwell MicroBacter7		https://brightwellaquatics.com/products/microbacter7_fresh.php	t	Bacteria supplement	
42	Brightwell NeoPhos		https://brightwellaquatics.com/products/neophos.php	t	Phosphate source for plants	
19	555	55	55	f	55	/uploads/cca88777-76e5-4b92-8118-ed9ac74d4582.jpg
17	chem 3	chem 3	chem 3	f	chem 3	/uploads/c3ca8d6d-d3a5-4101-b9ab-ba108f675532.jpg
43	dfgh			f		
35	API Algaefix	test	https://apifishcare.com/product/algaefix	t	Controls algae	
\.


--
-- Data for Name: ChemicalLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChemicalLog" (id, tank_id, chemical_name, amount, notes, added_at) FROM stdin;
\.


--
-- Data for Name: Coral; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Coral" (id, name, water_type, ph_low, ph_high, hardness_low, hardness_high, temp_low, temp_high, in_use, aggressiveness) FROM stdin;
1	coral1	\N	\N	4	\N	\N	44	66	t	\N
2	dfgh	\N	\N	\N	\N	\N	\N	\N	f	\N
\.


--
-- Data for Name: Corals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Corals" (id, name, ph_low, ph_high, hardness_low, hardness_high, temp_low, temp_high, aggressiveness) FROM stdin;
\.


--
-- Data for Name: Feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Feedback" (id, user_id, subject, message, rating, created_at) FROM stdin;
1	5	test 1	test data	≡ƒæì	2025-06-22 23:42:48.730083
2	15	I love you	You’re amazing! And always make me proud 	\N	2025-06-27 21:58:52.014107
\.


--
-- Data for Name: Fish; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Fish" (id, name, species, "tankNumber", "addedOn", water_type, number_of_fish, species_general, ph_low, ph_high, hardness_low, hardness_high, temp_low, temp_high, in_use, aggressiveness, keep_one) FROM stdin;
4	Oscar	\N	\N	2025-06-17 20:33:27.933	fresh	\N	\N	3.00	5.00	3	6	33.0	66.0	f	high	t
2	qwer	\N	\N	2025-06-17 18:08:32.776	fresh	3	\N	3.00	4.00	3	45	33.0	44.0	f	low	t
1	test 13	\N	\N	2025-06-17 18:01:40.716	fresh	1	test	7.00	8.00	1	15	70.0	80.0	f	medium	t
3	pizza	\N	\N	2025-06-17 20:33:23.566	fresh	\N	\N	3.00	5.00	3	8	33.0	66.0	f	\N	t
6	pi	\N	\N	2025-06-17 20:36:01.893	fresh	\N	\N	4.00	6.00	4	6	44.0	66.0	f	\N	t
10	xcvb	\N	\N	2025-06-17 20:39:12.056	fresh	\N	\N	3.00	4.00	3	4	33.0	44.0	f	\N	t
11	ssss	\N	\N	2025-06-17 20:52:03.146	fresh	\N	\N	3.00	6.00	3	6	33.0	66.0	f	\N	t
12	sdfg	\N	\N	2025-06-17 20:53:57.874	fresh	\N	\N	3.00	6.00	3	6	33.0	66.0	f	\N	t
13	3	\N	\N	2025-06-17 20:54:07.357	fresh	\N	\N	3.00	6.00	3	6	33.0	66.0	f	\N	t
14	ggg	\N	\N	2025-06-17 21:07:38.299	fresh	\N	\N	3.00	6.00	3	6	22.0	77.0	f	\N	t
15	3456	\N	\N	2025-06-17 21:14:18.276	fresh	\N	\N	2.10	4.50	2	9	22.0	77.0	f	\N	t
16	Peacock Chiclid	\N	\N	2025-06-18 12:32:01.339	fresh	\N	\N	5.00	9.00	5	9	55.0	99.0	t	high	t
17	Betta (Betta splendens)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	8.00	1	5	76.0	82.0	t	High	t
18	Neon Tetra (Paracheirodon innesi)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	5.00	7.50	1	2	72.0	78.0	t	Low	t
19	Guppy (Poecilia reticulata)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.80	7.80	8	12	72.0	82.0	t	Low	t
20	Angelfish (Pterophyllum scalare)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	7.00	3	10	75.0	86.0	t	Medium	t
21	Zebra Danio (Danio rerio)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.50	7.00	5	12	64.0	74.0	t	Low	t
22	Corydoras Catfish	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	8.00	2	12	72.0	78.0	t	Low	t
23	Bristlenose Pleco (Ancistrus)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.50	7.50	2	20	73.0	80.0	t	Low	t
24	Cherry Barb	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	8.00	5	19	73.0	81.0	t	Low	t
25	Swordtail (Xiphophorus hellerii)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	7.00	8.40	12	30	72.0	79.0	t	Low	t
26	Bolivian Ram (Mikrogeophagus ramirezi)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	7.50	1	10	74.0	78.0	t	Medium	t
27	White Cloud Mountain Minnow	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	7.00	5	12	64.0	72.0	t	Low	t
28	Platy (Xiphophorus spp.)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	7.00	8.00	10	25	72.0	82.0	t	Low	t
29	Molly (Poecilia sphenops)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	7.00	8.00	10	25	72.0	82.0	t	Low	t
30	Harlequin Rasbora	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	7.50	5	12	72.0	80.0	t	Low	t
31	Serpae Tetra	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	7.50	5	15	74.0	79.0	t	Medium	t
32	Tiger Barb (Puntigrus tetrazona)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	7.50	5	19	75.0	80.0	t	Medium	t
33	Black Tetra (Gymnocorymbus ternetzi)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	7.50	5	15	72.0	80.0	t	Medium	t
34	Emerald Cory (Corydoras splendens)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	5.80	8.00	2	30	72.0	82.0	t	Low	t
35	Goldfish (Carassius auratus)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	7.00	7.80	4	12	60.0	75.0	t	Low	t
36	Kuhli Loach	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	7.50	5	10	75.0	82.0	t	Low	t
37	Pleco (Hypostomus plecostomus)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.50	7.50	5	20	72.0	82.0	t	Low	t
38	Discus (Symphysodon spp.)	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	5.50	7.00	1	10	78.0	86.0	t	Medium	t
41	Rummy-nose Tetra	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	5.50	7.00	5	15	74.0	82.0	t	Low	t
42	Black Tetra	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	15	72.0	80.0	t	Medium	t
44	Glass Catfish	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	15	75.0	82.0	t	Low	t
45	Silver Dollar	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.00	5	15	75.0	82.0	t	Low-Medium	t
46	Bala Shark	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.50	5	12	72.0	82.0	t	Low-Medium	t
47	Siamese Algae Eater	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.00	5	12	75.0	82.0	t	Low-Medium	t
48	Dwarf Gourami	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	20	75.0	82.0	t	Low-Medium	t
49	Pearl Gourami	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	20	75.0	82.0	t	Low-Medium	t
50	Blue Ram	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.00	5	12	78.0	86.0	t	Medium	t
51	Bloodfin Tetra	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	15	70.0	79.0	t	Low-Medium	t
52	Congo Tetra	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	15	76.0	82.0	t	Low-Medium	t
53	Ember Tetra	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	10	72.0	78.0	t	Low-Medium	t
54	Brassy Nose Pleco	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.50	2	20	73.0	80.0	t	Low	t
55	Otocinclus Catfish	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.50	4	15	72.0	79.0	t	Low	t
56	Golden Wonder Cichlid	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.50	5	20	75.0	83.0	t	Medium-High	t
57	Jack Dempsey Cichlid	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.50	5	15	75.0	82.0	t	High	t
58	Jaguar Cichlid	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	7.00	8.00	10	20	77.0	85.0	t	High	t
68	test	\N	\N	2025-06-20 09:40:47.123	\N	\N	\N	5.00	\N	2	\N	\N	\N	f	low	t
69	dfgh	\N	\N	2025-06-20 10:00:24.218	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	t
\.


--
-- Data for Name: Fish_backup_20250627; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Fish_backup_20250627" (id, name, species, "tankNumber", "addedOn", water_type, number_of_fish, species_general, ph_low, ph_high, hardness_low, hardness_high, temp_low, temp_high, in_use, aggressiveness) FROM stdin;
4	Oscar	\N	\N	2025-06-17 20:33:27.933	fresh	\N	\N	3.00	5.00	3	6	33.0	66.0	f	high
9	pi	\N	\N	2025-06-17 20:36:08.893	fresh	\N	\N	4.00	6.00	4	6	44.0	66.0	f	low
2	qwer	\N	\N	2025-06-17 18:08:32.776	fresh	3	\N	3.00	4.00	3	45	33.0	44.0	f	low
1	test 13	\N	\N	2025-06-17 18:01:40.716	fresh	1	test	7.00	8.00	1	15	70.0	80.0	f	medium
3	pizza	\N	\N	2025-06-17 20:33:23.566	fresh	\N	\N	3.00	5.00	3	8	33.0	66.0	f	\N
6	pi	\N	\N	2025-06-17 20:36:01.893	fresh	\N	\N	4.00	6.00	4	6	44.0	66.0	f	\N
7	pi	\N	\N	2025-06-17 20:36:08.514	fresh	\N	\N	4.00	6.00	4	6	44.0	66.0	f	\N
8	pi	\N	\N	2025-06-17 20:36:08.698	fresh	\N	\N	4.00	6.00	4	6	44.0	66.0	f	\N
10	xcvb	\N	\N	2025-06-17 20:39:12.056	fresh	\N	\N	3.00	4.00	3	4	33.0	44.0	f	\N
11	ssss	\N	\N	2025-06-17 20:52:03.146	fresh	\N	\N	3.00	6.00	3	6	33.0	66.0	f	\N
12	sdfg	\N	\N	2025-06-17 20:53:57.874	fresh	\N	\N	3.00	6.00	3	6	33.0	66.0	f	\N
13	3	\N	\N	2025-06-17 20:54:07.357	fresh	\N	\N	3.00	6.00	3	6	33.0	66.0	f	\N
14	ggg	\N	\N	2025-06-17 21:07:38.299	fresh	\N	\N	3.00	6.00	3	6	22.0	77.0	f	\N
15	3456	\N	\N	2025-06-17 21:14:18.276	fresh	\N	\N	2.10	4.50	2	9	22.0	77.0	f	\N
16	Peacock Chiclid	\N	\N	2025-06-18 12:32:01.339	fresh	\N	\N	5.00	9.00	5	9	55.0	99.0	t	high
17	Betta (Betta splendens)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	8.00	1	5	76.0	82.0	t	High
18	Neon Tetra (Paracheirodon innesi)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	5.00	7.50	1	2	72.0	78.0	t	Low
19	Guppy (Poecilia reticulata)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.80	7.80	8	12	72.0	82.0	t	Low
20	Angelfish (Pterophyllum scalare)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	7.00	3	10	75.0	86.0	t	Medium
21	Zebra Danio (Danio rerio)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.50	7.00	5	12	64.0	74.0	t	Low
22	Corydoras Catfish	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	8.00	2	12	72.0	78.0	t	Low
23	Bristlenose Pleco (Ancistrus)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.50	7.50	2	20	73.0	80.0	t	Low
24	Cherry Barb	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	8.00	5	19	73.0	81.0	t	Low
25	Swordtail (Xiphophorus hellerii)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	7.00	8.40	12	30	72.0	79.0	t	Low
26	Bolivian Ram (Mikrogeophagus ramirezi)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	7.50	1	10	74.0	78.0	t	Medium
27	White Cloud Mountain Minnow	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	7.00	5	12	64.0	72.0	t	Low
28	Platy (Xiphophorus spp.)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	7.00	8.00	10	25	72.0	82.0	t	Low
29	Molly (Poecilia sphenops)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	7.00	8.00	10	25	72.0	82.0	t	Low
30	Harlequin Rasbora	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	7.50	5	12	72.0	80.0	t	Low
31	Serpae Tetra	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	7.50	5	15	74.0	79.0	t	Medium
32	Tiger Barb (Puntigrus tetrazona)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	7.50	5	19	75.0	80.0	t	Medium
33	Black Tetra (Gymnocorymbus ternetzi)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	7.50	5	15	72.0	80.0	t	Medium
34	Emerald Cory (Corydoras splendens)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	5.80	8.00	2	30	72.0	82.0	t	Low
35	Goldfish (Carassius auratus)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	7.00	7.80	4	12	60.0	75.0	t	Low
36	Kuhli Loach	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.00	7.50	5	10	75.0	82.0	t	Low
37	Pleco (Hypostomus plecostomus)	\N	\N	2025-06-19 21:49:38.629	Fresh	\N	\N	6.50	7.50	5	20	72.0	82.0	t	Low
38	Discus (Symphysodon spp.)	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	5.50	7.00	1	10	78.0	86.0	t	Medium
39	Harlequin Rasbora	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	12	72.0	80.0	t	Low
40	Serpae Tetra	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	15	74.0	79.0	t	Medium
41	Rummy-nose Tetra	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	5.50	7.00	5	15	74.0	82.0	t	Low
42	Black Tetra	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	15	72.0	80.0	t	Medium
43	Kuhli Loach	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	10	75.0	82.0	t	Low
44	Glass Catfish	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	15	75.0	82.0	t	Low
45	Silver Dollar	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.00	5	15	75.0	82.0	t	Low-Medium
46	Bala Shark	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.50	5	12	72.0	82.0	t	Low-Medium
47	Siamese Algae Eater	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.00	5	12	75.0	82.0	t	Low-Medium
48	Dwarf Gourami	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	20	75.0	82.0	t	Low-Medium
49	Pearl Gourami	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	20	75.0	82.0	t	Low-Medium
50	Blue Ram	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.00	5	12	78.0	86.0	t	Medium
51	Bloodfin Tetra	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	15	70.0	79.0	t	Low-Medium
52	Congo Tetra	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	15	76.0	82.0	t	Low-Medium
53	Ember Tetra	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	10	72.0	78.0	t	Low-Medium
54	Brassy Nose Pleco	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.50	2	20	73.0	80.0	t	Low
55	Otocinclus Catfish	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.50	4	15	72.0	79.0	t	Low
56	Golden Wonder Cichlid	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.50	5	20	75.0	83.0	t	Medium-High
57	Jack Dempsey Cichlid	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.50	5	15	75.0	82.0	t	High
58	Jaguar Cichlid	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	7.00	8.00	10	20	77.0	85.0	t	High
59	Silver Dollar	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.00	5	15	75.0	82.0	t	Low-Medium
60	Bala Shark	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.50	5	12	72.0	82.0	t	Low-Medium
61	Siamese Algae Eater	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.00	5	12	75.0	82.0	t	Low-Medium
62	Dwarf Gourami	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	20	75.0	82.0	t	Low-Medium
63	Pearl Gourami	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	20	75.0	82.0	t	Low-Medium
64	Bloodfin Tetra	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	15	70.0	79.0	t	Low-Medium
65	Congo Tetra	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	15	76.0	82.0	t	Low-Medium
66	Ember Tetra	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.00	7.50	5	10	72.0	78.0	t	Low-Medium
68	test	\N	\N	2025-06-20 09:40:47.123	\N	\N	\N	5.00	\N	2	\N	\N	\N	f	low
69	dfgh	\N	\N	2025-06-20 10:00:24.218	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N
67	Brassy Nose Pleco	\N	\N	2025-06-19 21:49:50.278	Fresh	\N	\N	6.50	7.50	2	20	73.0	80.0	t	Low
\.


--
-- Data for Name: Invert; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Invert" (id, name, ph_low, ph_high, temp_low, temp_high) FROM stdin;
\.


--
-- Data for Name: Inverts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Inverts" (id, name, water_type, ph_low, ph_high, hardness_low, hardness_high, temp_low, temp_high, in_use, aggressiveness) FROM stdin;
27	Vampire Shrimp (Atya gabonensis)	fresh	6.5	7.5	5	15	75	82	t	Peaceful
1	xcvb	\N	3	6	\N	\N	\N	\N	f	\N
26	Indian Whisker Shrimp (Macrobrachium lamarrei)	fresh	6.0	7.5	3	15	72	78	t	Semi-aggressive
3	shrimp2	\N	\N	\N	\N	\N	\N	\N	f	\N
2	shrimp1	\N	5	6	5	6	5	66	f	\N
4	Ghost Shrimp (Palaemonetes paludosus)	fresh	6.5	8.0	3	15	68	82	t	peaceful
5	Amano Shrimp (Caridina multidentata)	fresh	6.0	7.5	3	12	65	78	t	peaceful
6	Cherry Shrimp (Neocaridina davidi)	fresh	6.2	8.0	3	12	65	78	t	peaceful
7	Bamboo Shrimp (Atyopsis moluccensis)	fresh	6.5	7.5	3	15	75	82	t	peaceful
8	Tiger Shrimp (Caridina cf. cantonensis)	fresh	6.0	7.0	3	10	68	75	t	peaceful
9	Sulawesi Cardinal Shrimp (Caridina dennerli)	fresh	7.8	8.4	3	10	78	84	t	peaceful
10	Ninja Shrimp (Caridina serratirostris)	fresh	6.5	7.5	3	10	70	78	t	peaceful
11	Mexican Dwarf Crayfish (Cambarellus patzcuarensis)	fresh	6.5	8.0	4	15	70	78	t	semi-aggressive
15	Snowball Shrimp (Neocaridina cf. zhangjiajiensis)	fresh	6.2	7.8	2	12	68	78	t	Peaceful
12	Assassin Snail (Anentome helena)	fresh	6.5	8.0	4	12	68	78	t	semi-aggressive
13	Mystery Snail (Pomacea diffusa)	fresh	7.0	8.0	3	15	68	78	t	peaceful
14	Blue Velvet Shrimp (Neocaridina davidi)	fresh	6.5	8.0	3	10	65	78	t	Peaceful
36	Spixi Snail (Asolene spixi)	fresh	6.5	8.0	4	10	72	78	t	Peaceful
35	Mini Ramshorn Snail (Planorbella sp.)	fresh	6.5	8.0	4	15	70	78	t	Peaceful
34	Trumpet Snail (Melanoides tuberculata)	fresh	6.5	8.0	5	15	72	80	t	Peaceful
33	Pagoda Snail (Brotia pagodula)	fresh	6.5	7.5	4	12	70	80	t	Peaceful
32	Rabbit Snail (Tylomelania zemis)	fresh	6.8	7.5	3	8	72	80	t	Peaceful
31	Horned Nerite (Clithon corona)	fresh	6.5	8.5	6	12	70	80	t	Peaceful
30	Tiger Snail (Neritina semiconica)	fresh	6.5	8.0	5	15	72	78	t	Peaceful
29	Sunkist Orange Shrimp (Neocaridina davidi)	fresh	6.5	7.5	4	10	68	78	t	Peaceful
28	Red Rili Shrimp (Neocaridina davidi)	fresh	6.2	7.8	4	10	65	78	t	Peaceful
25	Green Babaulti Shrimp (Caridina babaulti)	fresh	6.8	7.8	4	10	70	78	t	Peaceful
24	Black King Kong Shrimp (Caridina cf. cantonensis)	fresh	5.8	6.8	0	4	68	74	t	Peaceful
23	Blue Bolt Shrimp (Caridina cf. cantonensis)	fresh	5.8	6.8	0	4	68	74	t	Peaceful
22	Red Wine Shrimp (Caridina cf. cantonensis)	fresh	5.8	6.5	1	4	68	72	t	Peaceful
21	Panda Shrimp (Caridina cf. cantonensis)	fresh	6.0	6.8	0	4	68	74	t	Peaceful
20	King Kong Shrimp (Caridina cf. cantonensis)	fresh	6.0	6.8	0	4	68	74	t	Peaceful
19	Bloody Mary Shrimp (Neocaridina davidi)	fresh	6.2	7.8	3	10	65	78	t	Peaceful
18	Blue Dream Shrimp (Neocaridina davidi)	fresh	6.2	7.8	4	10	65	78	t	Peaceful
17	Green Jade Shrimp (Neocaridina davidi)	fresh	6.0	8.0	3	10	65	78	t	Peaceful
16	Carbon Rili Shrimp (Neocaridina davidi)	fresh	6.2	7.8	4	10	65	78	t	Peaceful
37	Sun Snail (Clithon corona)	fresh	6.5	8.0	4	12	72	78	t	
38	dfgh	\N	\N	\N	\N	\N	\N	\N	f	\N
\.


--
-- Data for Name: MembershipLevel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MembershipLevel" (id, name) FROM stdin;
7	Free
8	Beta
9	Pro1
10	Pro2
11	Admin
\.


--
-- Data for Name: PageAccess; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PageAccess" (id, page_route, required_level) FROM stdin;
\.


--
-- Data for Name: PageAccessControl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PageAccessControl" (id, page_route, required_levels) FROM stdin;
1	/dashboard/feedback	{Free,Beta,Admin,Pro1,Pro2}
2	/dashboard/tank	{Free}
3	/dashboard/products	{Free}
4	/dashboard/compatibility	{Free}
\.


--
-- Data for Name: Plant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Plant" (id, name, light_level, co2_required, temperature_range, in_use, ph_low, ph_high, temp_low, temp_high) FROM stdin;
6	Rotala Rotundifolia	High	t	72-82├╕F	t	\N	\N	\N	\N
7	Pogostemon Stellatus	High	t	70-82├╕F	t	\N	\N	\N	\N
8	Vallisneria Spiralis	Low	f	64-82├╕F	t	\N	\N	\N	\N
9	Bacopa Caroliniana	Medium	f	68-82├╕F	t	\N	\N	\N	\N
10	Water Wisteria	Medium	f	70-82├╕F	t	\N	\N	\N	\N
11	Hydrocotyle Tripartita	Medium	t	68-82├╕F	t	\N	\N	\N	\N
12	Dwarf Hairgrass	High	t	68-82├╕F	t	\N	\N	\N	\N
13	Monte Carlo	High	t	70-78├╕F	t	\N	\N	\N	\N
14	Bolbitis Heudelotii	Low	f	68-80├╕F	t	\N	\N	\N	\N
15	Limnophila Sessiliflora	Medium	f	70-82├╕F	t	\N	\N	\N	\N
16	Marsilea Hirsuta	Medium	f	68-82├╕F	t	\N	\N	\N	\N
17	Hygrophila Corymbosa	Medium	f	70-82├╕F	t	\N	\N	\N	\N
18	Red Tiger Lotus	High	t	72-82├╕F	t	\N	\N	\N	\N
19	Lilaeopsis Brasiliensis	High	t	70-80├╕F	t	\N	\N	\N	\N
20	Echinodorus Bleheri	Medium	f	72-82├╕F	t	\N	\N	\N	\N
21	Cryptocoryne Balansae	Low	f	72-82├╕F	t	\N	\N	\N	\N
22	Barclaya Longifolia	Medium	t	72-82├╕F	t	\N	\N	\N	\N
23	Nymphaea Zenkeri	High	t	72-82├╕F	t	\N	\N	\N	\N
24	Microsorum Pteropus "Windelov"	Low	f	68-82├╕F	t	\N	\N	\N	\N
25	Aponogeton Crispus	Medium	f	72-82├╕F	t	\N	\N	\N	\N
26	Bolbitis Heudelotii	Low	f	68-80├╕F	t	\N	\N	\N	\N
27	Anubias Barteri	Low	f	72-82├╕F	t	\N	\N	\N	\N
28	Java Fern	Low	f	68-82├╕F	t	\N	\N	\N	\N
29	Amazon Sword	Medium	f	72-82├╕F	t	\N	\N	\N	\N
30	Cryptocoryne Wendtii	Low	f	72-82├╕F	t	\N	\N	\N	\N
31	Hornwort	Low	f	59-86├╕F	t	\N	\N	\N	\N
32	Java Moss	Low	f	70-75├╕F	t	\N	\N	\N	\N
33	Duckweed	High	f	60-90├╕F	t	\N	\N	\N	\N
34	Dwarf Sagittaria	Medium	f	72-82├╕F	t	\N	\N	\N	\N
35	Ludwigia Repens	Medium	t	68-82├╕F	t	\N	\N	\N	\N
36	SUsswassertang	Low	f	68-78├╕F	t	\N	\N	\N	\N
3	Java Fern	\N	\N	\N	f	\N	\N	\N	\N
2	Anubias Nana	\N	t	\N	f	\N	\N	\N	\N
37	sdfg	high	f	\N	f	\N	\N	\N	\N
5	Hornwort	\N	\N	\N	f	\N	\N	\N	\N
4	Cryptocoryne	\N	\N	\N	f	\N	\N	\N	\N
\.


--
-- Data for Name: Plants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Plants" (id, name, water_type, ph_low, ph_high, hardness_low, hardness_high, temp_low, temp_high, in_use, aggressiveness) FROM stdin;
1	plant1	\N	1	\N	\N	\N	\N	\N	t	\N
2	plant2	\N	\N	5	\N	\N	\N	\N	t	\N
\.


--
-- Data for Name: ReferralCode; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReferralCode" (id, code, role, is_active, created_at) FROM stdin;
4	DEFAULT	user	t	2025-06-23 21:16:13.30784
5	beta456	user	t	2025-06-23 21:16:13.30784
3	BETA78	beta_tester	t	2025-06-23 21:16:13.30784
\.


--
-- Data for Name: SpeciesCompatibility; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SpeciesCompatibility" (id, species1_id, species2_id, compatible, reason) FROM stdin;
1	fish-1	fish-2	t	Peaceful community fish
2	fish-1	fish-3	f	Territorial behavior causes conflict
\.


--
-- Data for Name: Tank; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tank" (id, name, water_type, gallons, in_use, user_id) FROM stdin;
1	asdf	fresh	300	f	\N
3	test tank1	fresh	10	t	8
2	Shawns first tank	fresh	250	t	5
4	Tankasaurs	fresh	200	t	15
\.


--
-- Data for Name: TankChemical; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TankChemical" (id, work_id, chemical_id, amount, notes, added_at) FROM stdin;
1	1	\N	5	dgh	2025-06-19 21:03:16.007677
2	1	\N			2025-06-19 21:04:49.568834
3	1	\N			2025-06-19 21:06:01.835765
4	1	\N			2025-06-19 21:09:23.800932
5	1	\N			2025-06-19 21:17:36.153935
6	1	17			2025-06-19 21:19:53.212937
7	1	19			2025-06-19 21:19:58.011626
8	1	19	5ml	dfghdfghdfgh df hdfhdfgh	2025-06-19 21:24:39.355029
9	1	17	5ml	dfgh	2025-06-19 21:26:35.521911
10	1	17	55ml	dfghdfghdfghdfgh	2025-06-19 21:26:50.457614
11	2	35	5	dfgh	2025-06-22 11:02:24.687552
\.


--
-- Data for Name: TankCoral; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TankCoral" (id, tank_id, coral_id) FROM stdin;
2	1	1
3	1	1
4	1	1
\.


--
-- Data for Name: TankFish; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TankFish" (id, tank_id, fish_id, created_at) FROM stdin;
14	1	24	2025-06-26 22:40:20.120834
19	2	\N	2025-06-26 22:40:20.120834
20	2	\N	2025-06-26 22:40:20.120834
22	2	23	2025-06-26 22:40:20.120834
36	2	16	2025-06-26 22:40:20.120834
39	4	46	2025-06-26 22:40:20.120834
38	4	52	2025-06-26 22:40:20.120834
\.


--
-- Data for Name: TankInvert; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TankInvert" (id, tank_id, invert_id, created_at) FROM stdin;
1	1	\N	2025-06-27 15:26:38.191748
13	2	9	2025-06-27 15:26:38.191748
14	2	5	2025-06-27 15:26:38.191748
16	2	19	2025-06-27 15:26:38.191748
17	2	21	2025-06-27 15:26:38.191748
23	2	22	2025-06-27 15:26:38.191748
24	2	20	2025-06-27 15:26:38.191748
29	2	37	2025-06-27 15:26:38.191748
33	4	22	2025-06-27 15:26:38.191748
\.


--
-- Data for Name: TankPlant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TankPlant" (id, tank_id, plant_id, created_at) FROM stdin;
12	1	2	2025-06-27 15:26:16.964562
15	2	25	2025-06-27 15:26:16.964562
18	2	29	2025-06-27 15:26:16.964562
20	4	32	2025-06-27 15:26:16.964562
\.


--
-- Data for Name: TankReminder; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TankReminder" (id, tank_id, type, frequency_days, last_done, next_due, notes, in_use) FROM stdin;
1	1	Water Change	7	2025-06-26	2025-07-03	Initial reminder test	t
4	2	Water Change	7	2025-05-26	2025-06-02	Initial reminder test	t
3	2	Water Change	7	2025-06-26	2025-07-03	Initial reminder test	t
2	2	Water Change	7	2025-06-26	2025-07-03	Initial reminder test	f
\.


--
-- Data for Name: TankWaterTest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TankWaterTest" (id, tank_id, ph, hardness, salinity, ammonia, nitrite, nitrate, temperature, test_date) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, password_hash, role, created_at, referral_code, paid_level) FROM stdin;
2	Your Name	your@email.com	securehashedpassword	super_admin	2025-06-20 10:06:20.933696	\N	free
1	Test User	test@example.com		user	2025-06-20 10:06:09.251915	\N	free
8	test	testemail@testemail.com	$2b$10$hEUQvzn/QqtCtS2lnCmRgeJbpZD0C6ajPe9uAwC97vumRnnsHxrgq	beta_tester	2025-06-22 19:40:19.542701	BETA789	Beta
14	shawn	shawnscreed2@gmail.com	$2b$10$ZxDhTl72hFajfUb8Tt1W5ea1OqLp0HkqOfl7bn2k7lbnS6aJRRRwa	user	2025-06-24 23:46:41.262388	\N	free
5	Shawn Rossbach	shawnscreed@gmail.com	$2a$06$PaeRu/JF2YnZj64v57Jyg.fJ/0p7cICbaiJVxsD2rn75151bdJ3xS	super_admin	2025-06-20 10:42:13.761372	\N	free
15	Silvia	franco.silviacaro@gmail.com	$2b$10$wIVCcmw9eovJJHyoSuzzNed0pGLxzw7OjBn8dwi/B4AOnGsv96Z2G	user	2025-06-26 01:20:03.362429	\N	free
16	ryan	thorscreed@gmail.com	$2b$10$yjJi.bS8C/WTb77IuyaTq.vyMLsjzvhfK48/gzNo3Kn5zYiabmyVW	user	2025-06-26 12:01:29.620691	\N	free
18	Victoria Vasilca	victoriavasilca@comcast.net	$2b$10$8a0ch2.gX4MmiW97ICR85uZ4QrRcQD97NaspDDtIWQ5oRLmkERSJO	user	2025-06-28 12:31:17.847081	\N	free
19	tester 1	tester3@3.com	$2b$10$rFikJJEHHBBOycx38vuH0.1/dmsJBP21OUU2Q7g0of29Gp.HCFZPa	user	2025-06-28 12:38:44.919519	\N	free
\.


--
-- Data for Name: WaterChange; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WaterChange" (id, tank_id, change_date, percent_changed, notes) FROM stdin;
1	1	2025-06-19 17:57:05.288548	100.00	dfgh
2	1	2025-06-19 17:57:11.647209	50.00	sdfgsdfgs
3	1	2025-06-19 17:58:36.72736	13.00	sdfgsdfgsdfgsdfgsdfgdfg
4	1	2025-06-19 20:10:30.100934	20.00	xcvb
5	1	2025-06-19 21:17:32.67605	10.00	
6	2	2025-06-22 11:02:15.008627	50.00	
7	2	2025-06-22 11:02:19.733413	4.00	
\.


--
-- Data for Name: WaterTest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WaterTest" (id, tank_id, test_date, ph, hardness, kh, ammonia, nitrite, nitrate, salinity, calcium, magnesium, alkalinity, notes, created_at) FROM stdin;
1	1	2025-06-19 15:54:30.594884	1.00	2.00	1.00	\N	\N	\N	2.00	\N	\N	\N	\N	2025-06-20 15:41:38.063155
2	1	2025-06-19 15:59:11.466104	2.00	5.00	3.00	6.00	4.00	7.00	\N	\N	\N	\N	asdfgsdfgd	2025-06-20 15:41:38.063155
3	1	2025-06-19 16:03:36.720847	1.00	4.00	2.00	5.00	3.00	6.00	\N	\N	\N	\N	7	2025-06-20 15:41:38.063155
5	2	2025-06-21 10:37:33.700806	5.00	\N	\N	5.00	\N	5.00	\N	\N	\N	\N	\N	2025-06-21 10:37:33.700806
4	2	2025-06-21 10:37:29.732356	5.00	\N	\N	4.00	\N	\N	\N	\N	\N	\N	\N	2025-06-21 10:37:29.732356
6	4	2025-06-26 01:50:19.68153	2.00	5.00	\N	2.00	11.00	13.00	9.00	\N	\N	\N	\N	2025-06-26 01:50:19.68153
7	2	2025-06-26 23:07:50.593223	1.00	4.00	\N	2.00	5.00	3.00	6.00	\N	\N	\N	7	2025-06-26 23:07:50.593223
\.


--
-- Data for Name: Work; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Work" (id, user_id, tank_id, current_step, is_complete, created_at, water_type, gallons) FROM stdin;
1	\N	\N	\N	f	2025-06-18 12:16:21.339212	fresh	50
2	\N	\N	\N	f	2025-06-18 12:18:05.688531	fresh	60
3	\N	\N	\N	f	2025-06-18 12:30:13.740214	fresh	300
4	\N	\N	\N	f	2025-06-18 12:37:42.601242	fresh	50
\.


--
-- Name: AccessControlRule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."AccessControlRule_id_seq"', 2, true);


--
-- Name: ChemicalLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ChemicalLog_id_seq"', 1, false);


--
-- Name: Chemical_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Chemical_id_seq"', 43, true);


--
-- Name: Coral_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Coral_id_seq"', 2, true);


--
-- Name: Corals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Corals_id_seq"', 1, false);


--
-- Name: Feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Feedback_id_seq"', 2, true);


--
-- Name: Fish_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Fish_id_seq"', 69, true);


--
-- Name: Invert_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Invert_id_seq"', 1, false);


--
-- Name: Inverts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Inverts_id_seq"', 38, true);


--
-- Name: MembershipLevel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."MembershipLevel_id_seq"', 11, true);


--
-- Name: PageAccessControl_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PageAccessControl_id_seq"', 4, true);


--
-- Name: PageAccess_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PageAccess_id_seq"', 1, false);


--
-- Name: Plant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Plant_id_seq"', 37, true);


--
-- Name: Plants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Plants_id_seq"', 2, true);


--
-- Name: ReferralCode_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ReferralCode_id_seq"', 5, true);


--
-- Name: SpeciesCompatibility_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SpeciesCompatibility_id_seq"', 2, true);


--
-- Name: TankChemical_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TankChemical_id_seq"', 11, true);


--
-- Name: TankCoral_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TankCoral_id_seq"', 4, true);


--
-- Name: TankFish_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TankFish_id_seq"', 39, true);


--
-- Name: TankInvert_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TankInvert_id_seq"', 33, true);


--
-- Name: TankPlant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TankPlant_id_seq"', 20, true);


--
-- Name: TankReminder_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TankReminder_id_seq"', 4, true);


--
-- Name: TankWaterTest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TankWaterTest_id_seq"', 1, false);


--
-- Name: Tank_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Tank_id_seq"', 4, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 19, true);


--
-- Name: WaterChange_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."WaterChange_id_seq"', 7, true);


--
-- Name: WaterTest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."WaterTest_id_seq"', 7, true);


--
-- Name: Work_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Work_id_seq"', 8, true);


--
-- Name: AccessControlRule AccessControlRule_page_route_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AccessControlRule"
    ADD CONSTRAINT "AccessControlRule_page_route_key" UNIQUE (page_route);


--
-- Name: AccessControlRule AccessControlRule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AccessControlRule"
    ADD CONSTRAINT "AccessControlRule_pkey" PRIMARY KEY (id);


--
-- Name: ChemicalLog ChemicalLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChemicalLog"
    ADD CONSTRAINT "ChemicalLog_pkey" PRIMARY KEY (id);


--
-- Name: Chemical Chemical_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Chemical"
    ADD CONSTRAINT "Chemical_pkey" PRIMARY KEY (id);


--
-- Name: Coral Coral_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coral"
    ADD CONSTRAINT "Coral_pkey" PRIMARY KEY (id);


--
-- Name: Corals Corals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Corals"
    ADD CONSTRAINT "Corals_pkey" PRIMARY KEY (id);


--
-- Name: Feedback Feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Feedback"
    ADD CONSTRAINT "Feedback_pkey" PRIMARY KEY (id);


--
-- Name: Fish Fish_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fish"
    ADD CONSTRAINT "Fish_pkey" PRIMARY KEY (id);


--
-- Name: Invert Invert_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invert"
    ADD CONSTRAINT "Invert_pkey" PRIMARY KEY (id);


--
-- Name: Inverts Inverts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inverts"
    ADD CONSTRAINT "Inverts_pkey" PRIMARY KEY (id);


--
-- Name: MembershipLevel MembershipLevel_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MembershipLevel"
    ADD CONSTRAINT "MembershipLevel_name_key" UNIQUE (name);


--
-- Name: MembershipLevel MembershipLevel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MembershipLevel"
    ADD CONSTRAINT "MembershipLevel_pkey" PRIMARY KEY (id);


--
-- Name: PageAccessControl PageAccessControl_page_route_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PageAccessControl"
    ADD CONSTRAINT "PageAccessControl_page_route_key" UNIQUE (page_route);


--
-- Name: PageAccessControl PageAccessControl_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PageAccessControl"
    ADD CONSTRAINT "PageAccessControl_pkey" PRIMARY KEY (id);


--
-- Name: PageAccess PageAccess_page_route_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PageAccess"
    ADD CONSTRAINT "PageAccess_page_route_key" UNIQUE (page_route);


--
-- Name: PageAccess PageAccess_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PageAccess"
    ADD CONSTRAINT "PageAccess_pkey" PRIMARY KEY (id);


--
-- Name: Plant Plant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plant"
    ADD CONSTRAINT "Plant_pkey" PRIMARY KEY (id);


--
-- Name: Plants Plants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plants"
    ADD CONSTRAINT "Plants_pkey" PRIMARY KEY (id);


--
-- Name: ReferralCode ReferralCode_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReferralCode"
    ADD CONSTRAINT "ReferralCode_code_key" UNIQUE (code);


--
-- Name: ReferralCode ReferralCode_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReferralCode"
    ADD CONSTRAINT "ReferralCode_pkey" PRIMARY KEY (id);


--
-- Name: SpeciesCompatibility SpeciesCompatibility_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SpeciesCompatibility"
    ADD CONSTRAINT "SpeciesCompatibility_pkey" PRIMARY KEY (id);


--
-- Name: TankChemical TankChemical_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankChemical"
    ADD CONSTRAINT "TankChemical_pkey" PRIMARY KEY (id);


--
-- Name: TankCoral TankCoral_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankCoral"
    ADD CONSTRAINT "TankCoral_pkey" PRIMARY KEY (id);


--
-- Name: TankFish TankFish_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankFish"
    ADD CONSTRAINT "TankFish_pkey" PRIMARY KEY (id);


--
-- Name: TankInvert TankInvert_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankInvert"
    ADD CONSTRAINT "TankInvert_pkey" PRIMARY KEY (id);


--
-- Name: TankPlant TankPlant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankPlant"
    ADD CONSTRAINT "TankPlant_pkey" PRIMARY KEY (id);


--
-- Name: TankReminder TankReminder_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankReminder"
    ADD CONSTRAINT "TankReminder_pkey" PRIMARY KEY (id);


--
-- Name: TankWaterTest TankWaterTest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankWaterTest"
    ADD CONSTRAINT "TankWaterTest_pkey" PRIMARY KEY (id);


--
-- Name: Tank Tank_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tank"
    ADD CONSTRAINT "Tank_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WaterChange WaterChange_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WaterChange"
    ADD CONSTRAINT "WaterChange_pkey" PRIMARY KEY (id);


--
-- Name: WaterTest WaterTest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WaterTest"
    ADD CONSTRAINT "WaterTest_pkey" PRIMARY KEY (id);


--
-- Name: Work Work_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Work"
    ADD CONSTRAINT "Work_pkey" PRIMARY KEY (id);


--
-- Name: fish_name_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX fish_name_unique ON public."Fish" USING btree (name);


--
-- Name: ChemicalLog ChemicalLog_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChemicalLog"
    ADD CONSTRAINT "ChemicalLog_tank_id_fkey" FOREIGN KEY (tank_id) REFERENCES public."Tank"(id) ON DELETE CASCADE;


--
-- Name: Feedback Feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Feedback"
    ADD CONSTRAINT "Feedback_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id);


--
-- Name: TankChemical TankChemical_chemical_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankChemical"
    ADD CONSTRAINT "TankChemical_chemical_id_fkey" FOREIGN KEY (chemical_id) REFERENCES public."Chemical"(id);


--
-- Name: TankChemical TankChemical_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankChemical"
    ADD CONSTRAINT "TankChemical_work_id_fkey" FOREIGN KEY (work_id) REFERENCES public."Work"(id);


--
-- Name: TankCoral TankCoral_coral_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankCoral"
    ADD CONSTRAINT "TankCoral_coral_id_fkey" FOREIGN KEY (coral_id) REFERENCES public."Coral"(id);


--
-- Name: TankCoral TankCoral_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankCoral"
    ADD CONSTRAINT "TankCoral_tank_id_fkey" FOREIGN KEY (tank_id) REFERENCES public."Work"(id) ON DELETE CASCADE;


--
-- Name: TankFish TankFish_fish_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankFish"
    ADD CONSTRAINT "TankFish_fish_id_fkey" FOREIGN KEY (fish_id) REFERENCES public."Fish"(id);


--
-- Name: TankFish TankFish_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankFish"
    ADD CONSTRAINT "TankFish_tank_id_fkey" FOREIGN KEY (tank_id) REFERENCES public."Tank"(id);


--
-- Name: TankInvert TankInvert_invert_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankInvert"
    ADD CONSTRAINT "TankInvert_invert_id_fkey" FOREIGN KEY (invert_id) REFERENCES public."Inverts"(id);


--
-- Name: TankInvert TankInvert_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankInvert"
    ADD CONSTRAINT "TankInvert_tank_id_fkey" FOREIGN KEY (tank_id) REFERENCES public."Work"(id);


--
-- Name: TankPlant TankPlant_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankPlant"
    ADD CONSTRAINT "TankPlant_plant_id_fkey" FOREIGN KEY (plant_id) REFERENCES public."Plant"(id);


--
-- Name: TankPlant TankPlant_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankPlant"
    ADD CONSTRAINT "TankPlant_tank_id_fkey" FOREIGN KEY (tank_id) REFERENCES public."Work"(id);


--
-- Name: TankReminder TankReminder_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankReminder"
    ADD CONSTRAINT "TankReminder_tank_id_fkey" FOREIGN KEY (tank_id) REFERENCES public."Tank"(id);


--
-- Name: TankWaterTest TankWaterTest_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TankWaterTest"
    ADD CONSTRAINT "TankWaterTest_tank_id_fkey" FOREIGN KEY (tank_id) REFERENCES public."Tank"(id) ON DELETE CASCADE;


--
-- Name: Tank Tank_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tank"
    ADD CONSTRAINT "Tank_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id);


--
-- Name: WaterChange WaterChange_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WaterChange"
    ADD CONSTRAINT "WaterChange_tank_id_fkey" FOREIGN KEY (tank_id) REFERENCES public."Tank"(id) ON DELETE CASCADE;


--
-- Name: WaterTest WaterTest_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WaterTest"
    ADD CONSTRAINT "WaterTest_tank_id_fkey" FOREIGN KEY (tank_id) REFERENCES public."Tank"(id) ON DELETE CASCADE;


--
-- Name: Work Work_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Work"
    ADD CONSTRAINT "Work_tank_id_fkey" FOREIGN KEY (tank_id) REFERENCES public."Tank"(id);


--
-- PostgreSQL database dump complete
--

