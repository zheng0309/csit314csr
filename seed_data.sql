--
-- PostgreSQL database dump
--

\restrict jx3n2JJB7ZvhWBgV79wvw7TmdTPgyrQUE5j2ai4jRl5nmWO92kUCdNfFhwQEjhF

-- Dumped from database version 14.19 (Debian 14.19-1.pgdg13+1)
-- Dumped by pg_dump version 14.19 (Debian 14.19-1.pgdg13+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    categories_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255)
);


ALTER TABLE public.categories OWNER TO csruser;

--
-- Name: categories_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_categories_id_seq OWNER TO csruser;

--
-- Name: categories_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_categories_id_seq OWNED BY public.categories.categories_id;


--
-- Name: csr_shortlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.csr_shortlist (
    csr_shortlist_id integer NOT NULL,
    csr_id integer,
    request_id integer,
    shortlisted_at timestamp without time zone
);


ALTER TABLE public.csr_shortlist OWNER TO csruser;

--
-- Name: csr_shortlist_csr_shortlist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.csr_shortlist_csr_shortlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.csr_shortlist_csr_shortlist_id_seq OWNER TO csruser;

--
-- Name: csr_shortlist_csr_shortlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.csr_shortlist_csr_shortlist_id_seq OWNED BY public.csr_shortlist.csr_shortlist_id;


--
-- Name: match_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.match_history (
    match_history_id integer NOT NULL,
    csr_id integer,
    request_id integer,
    matched_at timestamp without time zone,
    match_status character varying(20)
);


ALTER TABLE public.match_history OWNER TO csruser;

--
-- Name: match_history_match_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.match_history_match_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.match_history_match_history_id_seq OWNER TO csruser;

--
-- Name: match_history_match_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.match_history_match_history_id_seq OWNED BY public.match_history.match_history_id;


--
-- Name: pin_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pin_requests (
    pin_requests_id integer NOT NULL,
    user_id integer NOT NULL,
    category_id integer,
    title character varying(100) NOT NULL,
    description text,
    location character varying(100),
    status character varying(20),
    urgency character varying(20),
    completion_note text,
    created_at timestamp without time zone,
    completed_at timestamp without time zone
);


ALTER TABLE public.pin_requests OWNER TO csruser;

--
-- Name: pin_requests_pin_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pin_requests_pin_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pin_requests_pin_requests_id_seq OWNER TO csruser;

--
-- Name: pin_requests_pin_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pin_requests_pin_requests_id_seq OWNED BY public.pin_requests.pin_requests_id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    reports_id integer NOT NULL,
    manager_id integer,
    report_type character varying(50),
    content text,
    generated_at timestamp without time zone
);


ALTER TABLE public.reports OWNER TO csruser;

--
-- Name: reports_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reports_reports_id_seq OWNER TO csruser;

--
-- Name: reports_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_reports_id_seq OWNED BY public.reports.reports_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    users_id integer NOT NULL,
    username character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    role character varying(50) NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO csruser;

--
-- Name: users_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_users_id_seq OWNER TO csruser;

--
-- Name: users_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_users_id_seq OWNED BY public.users.users_id;


--
-- Name: categories categories_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN categories_id SET DEFAULT nextval('public.categories_categories_id_seq'::regclass);


--
-- Name: csr_shortlist csr_shortlist_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.csr_shortlist ALTER COLUMN csr_shortlist_id SET DEFAULT nextval('public.csr_shortlist_csr_shortlist_id_seq'::regclass);


--
-- Name: match_history match_history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_history ALTER COLUMN match_history_id SET DEFAULT nextval('public.match_history_match_history_id_seq'::regclass);


--
-- Name: pin_requests pin_requests_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pin_requests ALTER COLUMN pin_requests_id SET DEFAULT nextval('public.pin_requests_pin_requests_id_seq'::regclass);


--
-- Name: reports reports_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN reports_id SET DEFAULT nextval('public.reports_reports_id_seq'::regclass);


--
-- Name: users users_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN users_id SET DEFAULT nextval('public.users_users_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (categories_id, name, description) FROM stdin;
1	Groceries & Errands	Help with buying groceries, collecting parcels, or small daily errands
2	Home Maintenance	Assistance with basic household repairs, cleaning, or moving light items
3	Technical Support	Help with smartphones, computers, or connecting to the internet
4	Healthcare Assistance	Support for medical appointments, medication collection, or elderly care
5	Education & Tutoring	Help with studies, homework, or online learning setup
6	Transportation Help	Assistance getting to appointments, work, or school
7	Pet Care	Help walking, feeding, or bringing pets to the vet
8	Financial Guidance	Support in understanding bills, budgeting, or filling aid applications
9	Meal Preparation	Help with cooking or preparing daily meals for those unable to do so
10	Companionship & Check-ins	Friendly visits, phone calls, or welfare check-ins for elderly or isolated individuals
\.


--
-- Data for Name: csr_shortlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.csr_shortlist (csr_shortlist_id, csr_id, request_id, shortlisted_at) FROM stdin;
\.


--
-- Data for Name: match_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.match_history (match_history_id, csr_id, request_id, matched_at, match_status) FROM stdin;
1	1	31	2025-09-02 12:00:00	completed
2	1	32	2025-09-06 10:00:00	completed
3	1	33	2025-09-09 11:00:00	completed
4	1	34	2025-09-12 11:00:00	completed
5	2	35	2025-09-02 17:00:00	completed
6	2	36	2025-09-05 10:30:00	completed
7	2	37	2025-09-10 09:00:00	completed
8	2	38	2025-09-12 15:00:00	completed
9	3	39	2025-09-03 13:00:00	completed
10	3	40	2025-09-05 20:00:00	completed
11	3	41	2025-09-07 11:00:00	completed
12	3	42	2025-09-09 16:00:00	completed
13	4	43	2025-09-11 14:30:00	completed
14	4	44	2025-09-13 10:30:00	completed
15	4	45	2025-09-15 18:00:00	completed
16	4	46	2025-09-17 11:30:00	completed
17	5	47	2025-09-20 09:30:00	completed
18	5	48	2025-09-21 14:15:00	completed
19	5	49	2025-09-22 12:30:00	completed
20	5	50	2025-09-23 20:30:00	completed
21	6	51	2025-09-24 10:30:00	completed
22	6	52	2025-09-25 16:30:00	completed
23	6	53	2025-09-26 12:00:00	completed
24	6	54	2025-09-27 10:30:00	completed
25	7	55	2025-09-28 16:00:00	completed
26	7	56	2025-09-29 10:30:00	completed
27	7	57	2025-09-30 11:00:00	completed
28	7	58	2025-09-30 15:30:00	completed
29	8	59	2025-10-01 11:30:00	completed
30	8	60	2025-10-02 08:30:00	completed
31	8	61	2025-10-03 10:30:00	completed
32	8	62	2025-10-04 15:30:00	completed
33	9	63	2025-10-05 14:30:00	completed
34	9	64	2025-10-06 09:30:00	completed
35	9	65	2025-10-07 17:00:00	completed
36	9	66	2025-10-08 10:00:00	completed
37	10	67	2025-10-09 09:30:00	completed
38	10	68	2025-10-10 14:15:00	completed
39	10	69	2025-10-11 13:30:00	completed
40	10	70	2025-10-12 19:15:00	completed
41	11	71	2025-10-15 11:15:00	completed
42	11	72	2025-10-17 12:15:00	completed
43	11	73	2025-10-19 15:30:00	completed
44	11	74	2025-10-21 09:30:00	completed
45	12	75	2025-10-22 16:45:00	completed
46	12	76	2025-10-24 10:15:00	completed
47	12	77	2025-10-25 09:15:00	completed
48	12	78	2025-10-26 15:45:00	completed
49	13	79	2025-10-27 13:45:00	completed
50	13	80	2025-10-28 19:15:00	completed
51	14	81	2025-10-29 11:45:00	completed
52	14	82	2025-10-30 15:15:00	completed
53	14	83	2025-10-31 14:15:00	completed
54	14	84	2025-11-01 10:30:00	completed
55	15	85	2025-11-02 16:15:00	completed
56	15	86	2025-11-03 10:15:00	completed
57	15	87	2025-11-04 08:15:00	completed
58	15	88	2025-11-05 16:15:00	completed
59	16	89	2025-11-06 13:15:00	completed
60	16	90	2025-11-07 19:15:00	completed
\.


--
-- Data for Name: pin_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pin_requests (pin_requests_id, user_id, category_id, title, description, location, status, urgency, completion_note, created_at, completed_at) FROM stdin;
1	5	1	Help with grocery shopping at NTUC	Need help buying weekly groceries and carrying them up to my flat.	Tampines St 81	open	medium	\N	2025-08-01 09:30:00	\N
2	12	1	Need help collecting parcel	A parcel is arriving tomorrow afternoon, I need help collecting it from SingPost outlet.	Jurong West Ave 5	open	low	\N	2025-08-04 14:00:00	\N
3	38	1	Assistance with wet market groceries	Looking for someone to help carry groceries from Toa Payoh market.	Toa Payoh Lorong 5	open	high	\N	2025-08-10 10:15:00	\N
4	9	2	Light bulb replacement help	The light in my kitchen is out and I cannot reach it safely.	Woodlands Dr 14	open	medium	\N	2025-08-05 16:20:00	\N
5	20	2	Assistance moving furniture	Need help shifting a small sofa to another room.	Bukit Batok Ave 2	open	low	\N	2025-08-12 11:00:00	\N
6	46	2	Fixing leaky tap	The kitchen tap is dripping constantly; need help tightening or replacing washer.	Hougang Ave 8	open	high	\N	2025-08-18 09:40:00	\N
7	8	3	Phone not connecting to WiFi	My mobile phone cannot connect to home WiFi after recent router change.	Punggol Walk	open	low	\N	2025-08-07 15:00:00	\N
8	27	3	Printer setup help	Need assistance installing a new printer for home use.	Choa Chu Kang St 62	open	medium	\N	2025-08-15 17:20:00	\N
9	61	3	Laptop slow and lagging	Would like help clearing unused programs or speeding up laptop.	Clementi Ave 3	open	medium	\N	2025-08-22 10:00:00	\N
10	14	4	Accompany to doctor appointment	I have a check-up at Jurong Polyclinic, need someone to accompany me.	Jurong Polyclinic	open	medium	\N	2025-08-09 09:00:00	\N
11	52	4	Collect medication from pharmacy	Need help collecting medication from SGH pharmacy this week.	Singapore General Hospital	open	high	\N	2025-08-21 13:30:00	\N
12	70	4	Assistance with blood test visit	Looking for help getting to the polyclinic for a blood test.	Bedok North Rd	open	low	\N	2025-08-29 08:45:00	\N
13	23	5	Math tutoring for Primary 5	Looking for help guiding my son through fractions and decimals.	Serangoon Ave 2	open	medium	\N	2025-09-02 14:00:00	\N
14	44	5	English writing guidance	Need help improving composition skills for upcoming PSLE.	Pasir Ris St 21	open	low	\N	2025-09-05 15:00:00	\N
15	77	5	Computer literacy lessons	Would like to learn basic computer and email usage.	Yishun Ave 9	open	medium	\N	2025-09-10 11:30:00	\N
16	11	6	Ride to hospital	Need a ride to Tan Tock Seng Hospital for physiotherapy.	Toa Payoh Lorong 8	open	high	\N	2025-09-12 09:00:00	\N
17	32	6	Help bringing wheelchair to appointment	Require help transporting my wheelchair for an appointment in Woodlands.	Woodlands St 13	open	medium	\N	2025-09-15 10:15:00	\N
18	83	6	Need assistance travelling to community centre	Would like help getting to Toa Payoh CC for senior activity.	Toa Payoh Lorong 1	open	low	\N	2025-09-18 09:45:00	\N
19	25	7	Dog walking help	Looking for someone to walk my dog in the mornings for the next week.	Bukit Panjang Ring Rd	open	low	\N	2025-09-21 07:30:00	\N
20	60	7	Cat feeding assistance	Need help feeding my cat while I recover from a sprained ankle.	Bedok Reservoir Rd	open	medium	\N	2025-09-23 10:00:00	\N
21	95	7	Bring pet to vet clinic	Need someone to accompany me and my pet to a routine vet check.	Bukit Timah Rd	open	medium	\N	2025-09-26 11:00:00	\N
22	19	8	Help understanding bills	Need assistance reviewing recent SP bills to identify excess charges.	Ang Mo Kio Ave 10	open	low	\N	2025-09-27 14:10:00	\N
23	56	8	Filling assistance scheme forms	Would like help filling out the ComCare support form.	Jurong East St 24	open	medium	\N	2025-09-30 15:00:00	\N
24	84	8	Advice on bank account setup	Need help opening a bank account for monthly allowance transfers.	Bukit Merah View	open	low	\N	2025-10-01 13:30:00	\N
25	21	9	Need help preparing lunch	Recovering from surgery, need help cooking simple meals for a week.	Sengkang East Way	open	medium	\N	2025-10-03 11:00:00	\N
26	48	9	Meal prep for elderly parent	Looking for someone to help cook and pack daily meals for my elderly father.	Tampines Ave 4	open	high	\N	2025-10-05 12:00:00	\N
27	99	9	Assistance with weekly groceries and cooking	Would appreciate help cooking and portioning meals for the week.	Clementi West St 2	open	low	\N	2025-10-08 10:30:00	\N
28	13	10	Daily phone call check-in	I live alone and would like a daily phone check to ensure I’m okay.	Bishan St 22	open	low	\N	2025-10-10 09:30:00	\N
29	42	10	Evening visit for conversation	Would like someone to visit for short evening chats a few times a week.	Bedok North Ave 3	open	medium	\N	2025-10-12 18:30:00	\N
30	86	10	Reading sessions for elderly	Need someone patient to read newspapers to my elderly parent in Mandarin.	Bukit Batok St 21	open	medium	\N	2025-10-14 10:00:00	\N
31	1	1	Help buying groceries at NTUC	Need help buying essentials for the week from nearby NTUC.	Tampines Ave 8	matched	medium	CSR was punctual and friendly.	2025-09-01 10:00:00	2025-09-02 12:30:00
32	1	2	Fixing faulty door hinge	The bedroom door hinge came loose, need basic tool assistance.	Tampines St 82	matched	low	Task completed successfully.	2025-09-05 14:00:00	2025-09-06 10:00:00
33	1	3	Assistance with old tablet setup	My tablet needs help reconnecting to WiFi and updating apps.	Tampines Central	matched	medium	Tablet connected and working fine.	2025-09-09 09:00:00	2025-09-09 11:00:00
34	1	4	Collect medication from clinic	Need help collecting medication from nearby clinic.	Tampines Polyclinic	matched	high	Medication collected on time.	2025-09-12 08:00:00	2025-09-12 10:30:00
35	2	5	Math tutoring for my daughter	Need help teaching P3 math for one hour per week.	Bedok North St 1	matched	medium	Child enjoyed the lesson and improved confidence.	2025-09-01 15:00:00	2025-09-02 17:00:00
36	2	6	Need transport to hospital	Need a ride to SGH for my physiotherapy appointment.	Bedok North Ave 3	matched	high	Arrived safely and on time.	2025-09-05 09:00:00	2025-09-05 10:00:00
37	2	7	Dog walking help	Need someone to walk my dog daily for 30 minutes.	Bedok Reservoir Rd	matched	medium	Dog enjoyed the walk, will request again.	2025-09-10 07:30:00	2025-09-10 09:00:00
38	2	8	Help filling out assistance forms	Need help applying for government financial aid forms.	Bedok South Rd	matched	low	Forms submitted successfully.	2025-09-12 13:00:00	2025-09-12 14:30:00
39	3	9	Help with meal prep for elderly mother	Need assistance cooking and packing simple meals.	Hougang Ave 8	matched	medium	Meals prepared neatly.	2025-09-03 12:00:00	2025-09-03 14:00:00
40	3	10	Evening companionship	Would appreciate someone to talk with for an hour in evenings.	Hougang St 21	matched	low	Nice conversation, very kind volunteer.	2025-09-05 19:00:00	2025-09-05 20:00:00
41	3	1	Groceries run at Sheng Siong	Help buying rice, milk, and eggs.	Hougang Mall	matched	medium	Groceries bought successfully.	2025-09-07 09:30:00	2025-09-07 11:00:00
42	3	2	Clean ceiling fan	Need help safely cleaning ceiling fan in living room.	Hougang Ave 1	matched	high	Fan cleaned and working great.	2025-09-09 14:00:00	2025-09-09 15:00:00
43	4	3	Computer restart issue	Laptop not turning on properly, need help diagnosing.	Yishun Ave 2	matched	medium	Repaired and system restored.	2025-09-11 13:00:00	2025-09-11 15:30:00
44	4	4	Assistance to collect medicine	Need help getting prescription refill from Yishun Polyclinic.	Yishun Ring Rd	matched	low	CSR picked up medicine on schedule.	2025-09-13 09:00:00	2025-09-13 10:15:00
45	4	5	Tutoring for secondary math	Need assistance revising algebra topics.	Yishun St 11	matched	medium	Great tutoring session.	2025-09-15 16:00:00	2025-09-15 18:00:00
46	4	6	Ride to physiotherapy	Help transporting me to nearby rehab centre.	Yishun Ave 9	matched	high	On-time and helpful volunteer.	2025-09-17 09:30:00	2025-09-17 11:00:00
47	5	7	Feed my cat for two days	Need someone to check on my cat and refill food while I’m away.	Sengkang East Ave	matched	low	Cat taken care of properly.	2025-09-19 09:00:00	2025-09-20 09:00:00
48	5	8	Help reading SP bill	Need help understanding SP electricity bill charges.	Sengkang West Ave	matched	medium	Explained clearly.	2025-09-21 13:00:00	2025-09-21 14:00:00
49	5	9	Prepare dinner for elderly father	Assistance preparing simple meals for father.	Sengkang Square	matched	medium	Meals turned out great.	2025-09-22 11:00:00	2025-09-22 12:30:00
50	5	10	Friendly conversation in evenings	Would like someone to talk to after dinner.	Sengkang East Way	matched	low	Enjoyed talking with CSR.	2025-09-23 19:30:00	2025-09-23 20:30:00
51	6	1	Weekly grocery trip to NTUC	Need help buying rice and canned food.	Jurong East Ave 1	matched	medium	Groceries delivered home.	2025-09-24 09:00:00	2025-09-24 10:30:00
52	6	2	Repair bathroom light	Need help replacing a bulb in the bathroom ceiling.	Jurong West St 52	matched	low	Light fixed easily.	2025-09-25 15:00:00	2025-09-25 16:30:00
53	6	3	Phone app installation help	Need help installing TraceTogether app on phone.	Jurong Central	matched	low	App installed successfully.	2025-09-26 11:00:00	2025-09-26 12:00:00
54	6	4	Escort to dental appointment	Need someone to accompany me to dentist appointment.	Jurong West Clinic	matched	high	Very helpful volunteer.	2025-09-27 08:00:00	2025-09-27 10:00:00
55	7	5	English tutoring help	Would like to improve grammar and essay writing.	Bukit Batok East Ave 5	matched	medium	Improved writing skills.	2025-09-28 14:00:00	2025-09-28 16:00:00
56	7	6	Transport to community centre	Need help getting to Bukit Batok CC for senior activity.	Bukit Batok CC	matched	low	Arrived safely.	2025-09-29 09:00:00	2025-09-29 10:00:00
57	7	7	Assist with bathing pet	Need help bathing my small dog.	Bukit Batok West Ave 3	matched	medium	Pet bathed successfully.	2025-09-30 09:30:00	2025-09-30 11:00:00
58	7	8	Help applying for MediSave	Need help updating MediSave account details online.	Bukit Batok East Ave 3	matched	high	Account updated.	2025-09-30 14:00:00	2025-09-30 15:00:00
59	8	9	Cook porridge for recovery	Need assistance cooking congee while recovering from flu.	Woodlands Ave 3	matched	low	Tasty and simple porridge prepared.	2025-10-01 10:00:00	2025-10-01 12:00:00
60	8	10	Morning walk companionship	Looking for company for daily morning walks.	Woodlands Dr 14	matched	low	Great morning chats.	2025-10-02 07:00:00	2025-10-02 08:30:00
61	8	1	Help buying vegetables	Need help buying fresh produce at market.	Woodlands Market	matched	medium	Groceries delivered.	2025-10-03 09:00:00	2025-10-03 10:30:00
62	8	2	Clean window grills	Need help cleaning high window grills safely.	Woodlands Ring Rd	matched	high	Grills cleaned perfectly.	2025-10-04 14:00:00	2025-10-04 15:30:00
63	9	3	Fix printer connection	Printer not connecting to laptop, need help setting it up.	Pasir Ris Dr 3	matched	medium	Printer fixed successfully.	2025-10-05 13:00:00	2025-10-05 14:30:00
64	9	4	Collect medicine from CGH	Need help collecting prescription medication.	Changi General Hospital	matched	medium	CSR collected meds promptly.	2025-10-06 08:00:00	2025-10-06 09:00:00
65	9	5	Tutoring help for grandson	Need help revising science topics.	Pasir Ris St 12	matched	low	Very patient tutor.	2025-10-07 15:00:00	2025-10-07 17:00:00
66	9	6	Need transport to dental clinic	Help getting to dental appointment at nearby mall.	Pasir Ris Dr 1	matched	high	Arrived safely, great help.	2025-10-08 09:00:00	2025-10-08 10:00:00
67	10	7	Assist feeding my cat	Need help feeding and changing water for my cat.	Toa Payoh Central	matched	low	Cat well fed.	2025-10-09 08:00:00	2025-10-09 09:00:00
68	10	8	Explain CPF letter	Need help understanding CPF policy letter.	Toa Payoh Lorong 1	matched	medium	Explained clearly.	2025-10-10 13:00:00	2025-10-10 14:00:00
69	10	9	Prepare weekly meal portions	Looking for help cooking and dividing meals into containers.	Toa Payoh North	matched	medium	Meals packaged neatly.	2025-10-11 11:00:00	2025-10-11 13:00:00
70	10	10	Evening chat sessions	Would like a volunteer to chat once a week.	Toa Payoh Lorong 6	matched	low	Very kind and attentive CSR.	2025-10-12 18:00:00	2025-10-12 19:00:00
71	11	1	Weekly grocery run	Need help buying groceries and carrying them to my 3rd-floor flat.	Pasir Ris St 21	matched	medium	CSR was very helpful and on time.	2025-10-15 09:00:00	2025-10-15 11:00:00
72	11	2	Fix squeaky window	Need help tightening loose screws in bedroom window.	Pasir Ris St 12	matched	low	Window fixed successfully.	2025-10-17 10:00:00	2025-10-17 12:00:00
73	11	3	Phone contact backup	Need help saving contacts to Google account.	Pasir Ris Dr 6	matched	medium	Contacts successfully synced.	2025-10-19 14:00:00	2025-10-19 15:30:00
74	11	4	Collect prescription	Help collect medicine from Changi General Hospital pharmacy.	Tampines Ave 5	matched	high	CSR collected medication promptly.	2025-10-21 08:30:00	2025-10-21 09:30:00
75	12	5	Tuition for English	Looking for help improving spoken English.	Bedok Reservoir Rd	matched	medium	Conversation sessions went well.	2025-10-22 15:00:00	2025-10-22 16:30:00
76	12	6	Need lift to community centre	Need help getting to community event at CC.	Bedok North Ave 4	matched	low	CSR gave me a safe and friendly ride.	2025-10-24 09:00:00	2025-10-24 10:00:00
77	12	7	Feed cat for two days	Need someone to feed and check on cat while away.	Bedok South Ave 3	matched	low	Pet care completed successfully.	2025-10-25 08:00:00	2025-10-25 09:00:00
78	12	8	Help reading CPF statement	Need help understanding CPF interest rates.	Bedok Central	matched	medium	CSR explained everything clearly.	2025-10-26 14:30:00	2025-10-26 15:30:00
79	13	9	Cook dinner after surgery	Need help preparing porridge and light meals for 3 days.	Tampines St 82	matched	high	Meals cooked perfectly.	2025-10-27 12:00:00	2025-10-27 13:30:00
80	13	10	Evening reading session	Looking for someone to read newspapers with me in the evening.	Tampines Ave 2	matched	low	Friendly CSR and enjoyable reading.	2025-10-28 18:00:00	2025-10-28 19:00:00
81	14	1	Need grocery shopping companion	Would like company while buying groceries at FairPrice.	Jurong East Central	matched	low	Shopping completed safely.	2025-10-29 10:00:00	2025-10-29 11:30:00
82	14	2	Fix loose door handle	My kitchen door handle came off, need minor repair.	Jurong East St 21	matched	medium	Door fixed within minutes.	2025-10-30 14:00:00	2025-10-30 15:00:00
83	14	3	Laptop virus cleanup	Suspect virus infection, need help running antivirus.	Jurong Ave 4	matched	high	Laptop now running smoothly.	2025-10-31 13:00:00	2025-10-31 14:00:00
84	14	4	Accompany to clinic	Need help getting to Jurong Polyclinic for check-up.	Jurong West St 61	matched	medium	CSR was punctual and polite.	2025-11-01 09:00:00	2025-11-01 10:00:00
85	15	5	Tutoring for PSLE Science	Need volunteer to go through past papers.	Bukit Batok Ave 2	matched	medium	Topics well explained.	2025-11-02 14:00:00	2025-11-02 16:00:00
86	15	6	Transport to hospital	Need ride for minor surgery follow-up.	Bukit Batok West Ave 3	matched	high	Safe and comfortable trip.	2025-11-03 09:00:00	2025-11-03 10:00:00
87	15	7	Dog walking help	Need morning dog walks for the next two days.	Bukit Batok St 22	matched	low	Dog walked happily.	2025-11-04 07:00:00	2025-11-04 08:00:00
88	15	8	Fill out medical claim form	Need help with insurance form submission.	Bukit Batok Central	matched	medium	Form submitted successfully.	2025-11-05 15:00:00	2025-11-05 16:00:00
89	16	9	Prepare lunch after discharge	Need help cooking lunch after hospital discharge.	Toa Payoh Lor 5	matched	medium	CSR cooked delicious food.	2025-11-06 11:00:00	2025-11-06 13:00:00
90	16	10	Evening companion	Would like someone to drop by for evening chat.	Toa Payoh North	matched	low	CSR was friendly and patient.	2025-11-07 18:00:00	2025-11-07 19:00:00
91	21	1	Request for personal delivery daily	I want someone to come every morning to deliver my breakfast personally.	Bedok South Ave 2	closed	low	Closed: Request exceeds volunteer scope.	2025-10-10 09:00:00	2025-10-10 09:15:00
92	22	2	Need someone to repaint my house	Looking for help painting my entire flat for free.	Hougang St 91	closed	medium	Closed: Commercial-scale work not allowed.	2025-10-12 11:00:00	2025-10-12 11:20:00
93	23	3	Install CCTV system	Need someone to install CCTV cameras at home.	Jurong West St 24	closed	high	Closed: Professional service required.	2025-10-14 10:00:00	2025-10-14 10:15:00
94	24	4	Medical advice needed urgently	Need volunteer doctor to prescribe medication for fever.	Pasir Ris St 12	closed	high	Closed: Medical advice not permitted.	2025-10-15 08:30:00	2025-10-15 08:40:00
95	25	5	Need someone to teach me daily for free	Requesting a volunteer to teach me full-time for the next month.	Serangoon North Ave 4	closed	medium	Closed: Request exceeds volunteer hours limit.	2025-10-16 14:00:00	2025-10-16 14:10:00
96	26	6	Rent a car for me	Looking for a volunteer to lend their car for my use.	Woodlands Ave 9	closed	high	Closed: Violates transport policy.	2025-10-18 09:00:00	2025-10-18 09:15:00
97	27	7	Babysit overnight	Need someone to stay overnight to watch my children.	Bukit Panjang Ring Rd	closed	high	Closed: Overnight stays not permitted.	2025-10-19 17:00:00	2025-10-19 17:20:00
98	28	8	Personal financial loan request	Need financial assistance of $500 urgently.	Toa Payoh Central	closed	high	Closed: Monetary requests prohibited.	2025-10-21 10:00:00	2025-10-21 10:15:00
99	29	9	Catering for wedding	Looking for volunteers to cook for my wedding celebration.	Clementi Ave 4	closed	medium	Closed: Event-related catering outside platform scope.	2025-10-23 13:00:00	2025-10-23 13:10:00
100	30	10	Private companionship request	Looking for a female volunteer to accompany me privately at home.	Yishun Ave 9	closed	high	Closed: Inappropriate or unsafe request.	2025-10-25 18:00:00	2025-10-25 18:10:00
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (reports_id, manager_id, report_type, content, generated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (users_id, username, name, email, password, role, created_at) FROM stdin;
1	admin1	System Admin	admin1@helpme.sg	admin123	admin	2025-07-24 09:00:00
2	manager1	Platform Manager	manager1@helpme.sg	manager123	platform_manager	2025-07-25 09:00:00
3	pin001	Tan Wei Ming	weiming.tan@helpme.sg	pin001	pin	2025-07-24 10:00:00
4	pin002	Lim Jia Hui	jiahui.lim@helpme.sg	pin002	pin	2025-07-25 10:00:00
5	pin003	Ng Shi Qi	shiqi.ng@helpme.sg	pin003	pin	2025-07-26 10:00:00
6	pin004	Ong Jun Jie	junjie.ong@helpme.sg	pin004	pin	2025-07-27 10:00:00
7	pin005	Chua Li Ting	liting.chua@helpme.sg	pin005	pin	2025-07-28 10:00:00
8	pin006	Teo Zi Xuan	zixuan.teo@helpme.sg	pin006	pin	2025-07-29 10:00:00
9	pin007	Tan Yu Han	yuhan.tan@helpme.sg	pin007	pin	2025-07-30 10:00:00
10	pin008	Lim Wei Jie	weijie.lim@helpme.sg	pin008	pin	2025-07-31 10:00:00
11	pin009	Lee Hui Min	huimin.lee@helpme.sg	pin009	pin	2025-08-01 10:00:00
12	pin010	Goh Zi Hao	zihao.goh@helpme.sg	pin010	pin	2025-08-02 10:00:00
13	pin011	Tay Mei Ling	meiling.tay@helpme.sg	pin011	pin	2025-08-03 10:00:00
14	pin012	Yeo Wei Ting	weiting.yeo@helpme.sg	pin012	pin	2025-08-04 10:00:00
15	pin013	Chong Jia Wen	jiawen.chong@helpme.sg	pin013	pin	2025-08-05 10:00:00
16	pin014	Koh Jia Hao	jiahao.koh@helpme.sg	pin014	pin	2025-08-06 10:00:00
17	pin015	Tan Hui En	huien.tan@helpme.sg	pin015	pin	2025-08-07 10:00:00
18	pin016	Lim Jun Wei	junwei.lim@helpme.sg	pin016	pin	2025-08-08 10:00:00
19	pin017	Loh Jia Xin	jiaxin.loh@helpme.sg	pin017	pin	2025-08-09 10:00:00
20	pin018	Toh Zi Ying	ziying.toh@helpme.sg	pin018	pin	2025-08-10 10:00:00
21	pin019	Chee Hui Jun	huijun.chee@helpme.sg	pin019	pin	2025-08-11 10:00:00
22	pin020	Yong Wei En	weien.yong@helpme.sg	pin020	pin	2025-08-12 10:00:00
23	pin021	Tan Xin Yi	xinyi.tan@helpme.sg	pin021	pin	2025-08-13 10:00:00
24	pin022	Wong Jia Le	jiale.wong@helpme.sg	pin022	pin	2025-08-14 10:00:00
25	pin023	Lim Zi Hao	zihao.lim@helpme.sg	pin023	pin	2025-08-15 10:00:00
26	pin024	Ng Hui Ting	huiting.ng@helpme.sg	pin024	pin	2025-08-16 10:00:00
27	pin025	Koh Jing Wei	jingwei.koh@helpme.sg	pin025	pin	2025-08-17 10:00:00
28	pin026	Tan Ming Jie	mingjie.tan@helpme.sg	pin026	pin	2025-08-18 10:00:00
29	pin027	Ong Jia Qi	jiaqi.ong@helpme.sg	pin027	pin	2025-08-19 10:00:00
30	pin028	Goh Yi Xuan	yixuan.goh@helpme.sg	pin028	pin	2025-08-20 10:00:00
31	pin029	Teo Kai Xin	kaixin.teo@helpme.sg	pin029	pin	2025-08-21 10:00:00
32	pin030	Chua Wei Hong	weihong.chua@helpme.sg	pin030	pin	2025-08-22 10:00:00
33	pin031	Tan Li Wei	liwei.tan@helpme.sg	pin031	pin	2025-08-23 10:00:00
34	pin032	Lim Mei Qi	meiqi.lim@helpme.sg	pin032	pin	2025-08-24 10:00:00
35	pin033	Loh Sheng Yi	shengyi.loh@helpme.sg	pin033	pin	2025-08-25 10:00:00
36	pin034	Chee Jia Xin	jiaxin.chee@helpme.sg	pin034	pin	2025-08-26 10:00:00
37	pin035	Toh Hui Ling	huiling.toh@helpme.sg	pin035	pin	2025-08-27 10:00:00
38	pin036	Yong Kai Jie	kaijie.yong@helpme.sg	pin036	pin	2025-08-28 10:00:00
39	pin037	Tan Zi Ning	zining.tan@helpme.sg	pin037	pin	2025-08-29 10:00:00
40	pin038	Ng Yu Xin	yuxin.ng@helpme.sg	pin038	pin	2025-08-30 10:00:00
41	pin039	Ong Kai Wen	kaiwen.ong@helpme.sg	pin039	pin	2025-08-31 10:00:00
42	pin040	Chong Li Na	lina.chong@helpme.sg	pin040	pin	2025-09-01 10:00:00
43	pin041	Wong Wei Jie	weijie.wong@helpme.sg	pin041	pin	2025-09-02 10:00:00
44	pin042	Tay Hui Xin	huixin.tay@helpme.sg	pin042	pin	2025-09-03 10:00:00
45	pin043	Yeo Ming Xuan	mingxuan.yeo@helpme.sg	pin043	pin	2025-09-04 10:00:00
46	pin044	Tan Siti Nur	siti.tan@helpme.sg	pin044	pin	2025-09-05 10:00:00
47	pin045	Rahim Ahmad	rahim.ahmad@helpme.sg	pin045	pin	2025-09-06 10:00:00
48	pin046	Aliyah Binte Rahman	aliyah.rahman@helpme.sg	pin046	pin	2025-09-07 10:00:00
49	pin047	Syafiq Iskandar	syafiq.iskandar@helpme.sg	pin047	pin	2025-09-08 10:00:00
50	pin048	Aisyah Abdullah	aisyah.abdullah@helpme.sg	pin048	pin	2025-09-09 10:00:00
51	pin049	Firdaus Hassan	firdaus.hassan@helpme.sg	pin049	pin	2025-09-10 10:00:00
52	pin050	Siti Khadijah	khadijah.siti@helpme.sg	pin050	pin	2025-09-11 10:00:00
53	pin051	Devi Raj	devi.raj@helpme.sg	pin051	pin	2025-09-12 10:00:00
54	pin052	Kumar Prasad	kumar.prasad@helpme.sg	pin052	pin	2025-09-13 10:00:00
55	pin053	Rajesh Nair	rajesh.nair@helpme.sg	pin053	pin	2025-09-14 10:00:00
56	pin054	Anita Menon	anita.menon@helpme.sg	pin054	pin	2025-09-15 10:00:00
57	pin055	Suresh Pillai	suresh.pillai@helpme.sg	pin055	pin	2025-09-16 10:00:00
58	pin056	Meera D/O Rajan	meera.rajan@helpme.sg	pin056	pin	2025-09-17 10:00:00
59	pin057	Balraj Singh	balraj.singh@helpme.sg	pin057	pin	2025-09-18 10:00:00
60	pin058	Priya Nair	priya.nair@helpme.sg	pin058	pin	2025-09-19 10:00:00
61	pin059	Rahul Reddy	rahul.reddy@helpme.sg	pin059	pin	2025-09-20 10:00:00
62	pin060	Selvam Ramasamy	selvam.ramasamy@helpme.sg	pin060	pin	2025-09-21 10:00:00
63	pin061	Tan Yu Qi	yuqi.tan@helpme.sg	pin061	pin	2025-09-22 10:00:00
64	pin062	Lim Hui Xian	huixian.lim@helpme.sg	pin062	pin	2025-09-23 10:00:00
65	pin063	Ong Ming Jie	mingjie.ong@helpme.sg	pin063	pin	2025-09-24 10:00:00
66	pin064	Ng Li Xin	lixin.ng@helpme.sg	pin064	pin	2025-09-25 10:00:00
67	pin065	Chong Yu Wei	yuwei.chong@helpme.sg	pin065	pin	2025-09-26 10:00:00
68	pin066	Goh Xin Ning	xinning.goh@helpme.sg	pin066	pin	2025-09-27 10:00:00
69	pin067	Teo Yi Hao	yihao.teo@helpme.sg	pin067	pin	2025-09-28 10:00:00
70	pin068	Tan Mei Yen	meiyen.tan@helpme.sg	pin068	pin	2025-09-29 10:00:00
71	pin069	Lim Wen Qi	wenqi.lim@helpme.sg	pin069	pin	2025-09-30 10:00:00
72	pin070	Loh Jun Hao	junhao.loh@helpme.sg	pin070	pin	2025-10-01 10:00:00
73	pin071	Wong Li Fang	lifang.wong@helpme.sg	pin071	pin	2025-10-02 10:00:00
74	pin072	Yeo Zi Xian	zixian.yeo@helpme.sg	pin072	pin	2025-10-03 10:00:00
75	pin073	Tan Karthik	karthik.tan@helpme.sg	pin073	pin	2025-10-04 10:00:00
76	pin074	Lim Deepa	deepa.lim@helpme.sg	pin074	pin	2025-10-05 10:00:00
77	pin075	Ong Ravi	ravi.ong@helpme.sg	pin075	pin	2025-10-06 10:00:00
78	pin076	Goh Siti	siti.goh@helpme.sg	pin076	pin	2025-10-07 10:00:00
79	pin077	Chong Iskandar	iskandar.chong@helpme.sg	pin077	pin	2025-10-08 10:00:00
80	pin078	Teo Devi	devi.teo@helpme.sg	pin078	pin	2025-10-09 10:00:00
81	pin079	Tan Mani	mani.tan@helpme.sg	pin079	pin	2025-10-10 10:00:00
82	pin080	Lim Nisha	nisha.lim@helpme.sg	pin080	pin	2025-10-11 10:00:00
83	pin081	Ong Rajesh	rajesh.ong@helpme.sg	pin081	pin	2025-10-12 10:00:00
84	pin082	Ng Kavita	kavita.ng@helpme.sg	pin082	pin	2025-10-13 10:00:00
85	pin083	Chua Hari	hari.chua@helpme.sg	pin083	pin	2025-10-14 10:00:00
86	pin084	Yeo Divya	divya.yeo@helpme.sg	pin084	pin	2025-10-15 10:00:00
87	pin085	Tan Rafi	rafi.tan@helpme.sg	pin085	pin	2025-10-16 10:00:00
88	pin086	Lim Afiq	afiq.lim@helpme.sg	pin086	pin	2025-10-17 10:00:00
89	pin087	Ong Harini	harini.ong@helpme.sg	pin087	pin	2025-10-18 10:00:00
90	pin088	Ng Aisyah	aisyah.ng@helpme.sg	pin088	pin	2025-10-19 10:00:00
91	pin089	Chong Kumar	kumar.chong@helpme.sg	pin089	pin	2025-10-20 10:00:00
92	pin090	Goh Suresh	suresh.goh@helpme.sg	pin090	pin	2025-10-21 10:00:00
93	pin091	Teo Farah	farah.teo@helpme.sg	pin091	pin	2025-10-22 10:00:00
94	pin092	Tan Raj	raj.tan@helpme.sg	pin092	pin	2025-10-23 09:00:00
95	pin093	Lim Devi	devi.lim@helpme.sg	pin093	pin	2025-10-23 09:30:00
96	pin094	Ong Hariharan	hariharan.ong@helpme.sg	pin094	pin	2025-10-23 10:00:00
97	pin095	Ng Lakshmi	lakshmi.ng@helpme.sg	pin095	pin	2025-10-23 10:30:00
98	pin096	Chua Surya	surya.chua@helpme.sg	pin096	pin	2025-10-23 11:00:00
99	pin097	Yeo Kavitha	kavitha.yeo@helpme.sg	pin097	pin	2025-10-23 11:30:00
100	pin098	Tan Harish	harish.tan@helpme.sg	pin098	pin	2025-10-23 12:00:00
101	pin099	Lim Anjali	anjali.lim@helpme.sg	pin099	pin	2025-10-23 12:30:00
102	pin100	Ong Sanjay	sanjay.ong@helpme.sg	pin100	pin	2025-10-24 10:00:00
103	csr001	Chong Wei Lun	weilun.chong@helpme.sg	csr001	csr_rep	2025-07-25 10:00:00
104	csr002	Lee Hui Shan	huishan.lee@helpme.sg	csr002	csr_rep	2025-07-26 10:00:00
105	csr003	Tan Yong Sheng	yongsheng.tan@helpme.sg	csr003	csr_rep	2025-07-27 10:00:00
106	csr004	Lim Pei Wen	peiwEn.lim@helpme.sg	csr004	csr_rep	2025-07-28 10:00:00
107	csr005	Ong Kelvin	kelvin.ong@helpme.sg	csr005	csr_rep	2025-07-29 10:00:00
108	csr006	Chew Min Hui	minhui.chew@helpme.sg	csr006	csr_rep	2025-07-30 10:00:00
109	csr007	Tay Yong Jie	yongjie.tay@helpme.sg	csr007	csr_rep	2025-07-31 10:00:00
110	csr008	Lau Jia Ning	jianing.lau@helpme.sg	csr008	csr_rep	2025-08-01 10:00:00
111	csr009	Seah Wei Xian	weixian.seah@helpme.sg	csr009	csr_rep	2025-08-02 10:00:00
112	csr010	Ho Li Xuan	lixuan.ho@helpme.sg	csr010	csr_rep	2025-08-03 10:00:00
113	csr011	Tan Jun Hong	junhong.tan@helpme.sg	csr011	csr_rep	2025-08-04 10:00:00
114	csr012	Lim Qian Yi	qianyi.lim@helpme.sg	csr012	csr_rep	2025-08-05 10:00:00
115	csr013	Ong Sheryl	sheryl.ong@helpme.sg	csr013	csr_rep	2025-08-06 10:00:00
116	csr014	Chua Alvin	alvin.chua@helpme.sg	csr014	csr_rep	2025-08-07 10:00:00
117	csr015	Tay Crystal	crystal.tay@helpme.sg	csr015	csr_rep	2025-08-08 10:00:00
118	csr016	Loh Benjamin	benjamin.loh@helpme.sg	csr016	csr_rep	2025-08-09 10:00:00
119	csr017	Koh Charmaine	charmaine.koh@helpme.sg	csr017	csr_rep	2025-08-10 10:00:00
120	csr018	Goh Desmond	desmond.goh@helpme.sg	csr018	csr_rep	2025-08-11 10:00:00
121	csr019	Wong Alicia	alicia.wong@helpme.sg	csr019	csr_rep	2025-08-12 10:00:00
122	csr020	Yeo Daniel	daniel.yeo@helpme.sg	csr020	csr_rep	2025-08-13 10:00:00
123	csr021	Rahman Iskandar	iskandar.rahman@helpme.sg	csr021	csr_rep	2025-08-14 10:00:00
124	csr022	Siti Zulaikha	zulaikha.siti@helpme.sg	csr022	csr_rep	2025-08-15 10:00:00
125	csr023	Nora Binte Hassan	nora.hassan@helpme.sg	csr023	csr_rep	2025-08-16 10:00:00
126	csr024	Syafiq Rahim	syafiq.rahim@helpme.sg	csr024	csr_rep	2025-08-17 10:00:00
127	csr025	Farah Nabila	farah.nabila@helpme.sg	csr025	csr_rep	2025-08-18 10:00:00
128	csr026	Ryan Pinto	ryan.pinto@helpme.sg	csr026	csr_rep	2025-08-19 10:00:00
129	csr027	Natalie Tan	natalie.tan@helpme.sg	csr027	csr_rep	2025-08-20 10:00:00
130	csr028	Christopher Pereira	christopher.pereira@helpme.sg	csr028	csr_rep	2025-08-21 10:00:00
131	csr029	Andrea Lee	andrea.lee@helpme.sg	csr029	csr_rep	2025-08-22 10:00:00
132	csr030	Darren Goh	darren.goh@helpme.sg	csr030	csr_rep	2025-08-23 10:00:00
133	csr031	Melissa Raj	melissa.raj@helpme.sg	csr031	csr_rep	2025-09-01 10:00:00
134	csr032	Selvam Mani	selvam.mani@helpme.sg	csr032	csr_rep	2025-09-02 10:00:00
135	csr033	Serena DSouza	serena.dsouza@helpme.sg	csr033	csr_rep	2025-09-03 10:00:00
136	csr034	Anand Subramaniam	anand.subramaniam@helpme.sg	csr034	csr_rep	2025-09-04 10:00:00
137	csr035	Deepa Chandran	deepa.chandran@helpme.sg	csr035	csr_rep	2025-09-05 10:00:00
138	csr036	Ravi Karthik	ravi.karthik@helpme.sg	csr036	csr_rep	2025-09-06 10:00:00
139	csr037	Nisha Raj	nisha.raj@helpme.sg	csr037	csr_rep	2025-09-07 10:00:00
140	csr038	Hari Kumar	hari.kumar@helpme.sg	csr038	csr_rep	2025-09-08 10:00:00
141	csr039	Kavitha Das	kavitha.das@helpme.sg	csr039	csr_rep	2025-09-09 10:00:00
142	csr040	Sanjay Ramesh	sanjay.ramesh@helpme.sg	csr040	csr_rep	2025-09-10 10:00:00
143	csr041	Lakshmi Devi	lakshmi.devi@helpme.sg	csr041	csr_rep	2025-09-11 10:00:00
144	csr042	Harini Joseph	harini.joseph@helpme.sg	csr042	csr_rep	2025-09-12 10:00:00
145	csr043	Karthik Narayan	karthik.narayan@helpme.sg	csr043	csr_rep	2025-09-13 10:00:00
146	csr044	Rafi Abdullah	rafi.abdullah@helpme.sg	csr044	csr_rep	2025-09-14 10:00:00
147	csr045	Afiq Ali	afiq.ali@helpme.sg	csr045	csr_rep	2025-09-15 10:00:00
148	csr046	Siti Mariam	siti.mariam@helpme.sg	csr046	csr_rep	2025-09-16 10:00:00
149	csr047	Noraini Hassan	noraini.hassan@helpme.sg	csr047	csr_rep	2025-09-17 10:00:00
150	csr048	Zulkifli Omar	zulkifli.omar@helpme.sg	csr048	csr_rep	2025-09-18 10:00:00
151	csr049	Hafiz Rahman	hafiz.rahman@helpme.sg	csr049	csr_rep	2025-09-19 10:00:00
152	csr050	Clarence Pinto	clarence.pinto@helpme.sg	csr050	csr_rep	2025-09-20 10:00:00
153	csr051	Marcus Tan	marcus.tan@helpme.sg	csr051	csr_rep	2025-09-21 10:00:00
154	csr052	Vanessa Lim	vanessa.lim@helpme.sg	csr052	csr_rep	2025-09-22 10:00:00
155	csr053	Jonathan Ong	jonathan.ong@helpme.sg	csr053	csr_rep	2025-09-23 10:00:00
156	csr054	Amanda Lee	amanda.lee@helpme.sg	csr054	csr_rep	2025-09-24 10:00:00
157	csr055	Joshua Ng	joshua.ng@helpme.sg	csr055	csr_rep	2025-09-25 10:00:00
158	csr056	Nicholas Teo	nicholas.teo@helpme.sg	csr056	csr_rep	2025-09-26 10:00:00
159	csr057	Michelle Tan	michelle.tan@helpme.sg	csr057	csr_rep	2025-09-27 10:00:00
160	csr058	Caleb Koh	caleb.koh@helpme.sg	csr058	csr_rep	2025-09-28 10:00:00
161	csr059	Samantha Yeo	samantha.yeo@helpme.sg	csr059	csr_rep	2025-09-29 10:00:00
162	csr060	Adrian Chua	adrian.chua@helpme.sg	csr060	csr_rep	2025-09-30 10:00:00
163	csr061	Ismail Hakim	ismail.hakim@helpme.sg	csr061	csr_rep	2025-10-01 10:00:00
164	csr062	Nur Aisyah	nur.aisyah@helpme.sg	csr062	csr_rep	2025-10-02 10:00:00
165	csr063	Hidayah Binte Ali	hidayah.ali@helpme.sg	csr063	csr_rep	2025-10-03 10:00:00
166	csr064	Amirul Rahman	amirul.rahman@helpme.sg	csr064	csr_rep	2025-10-04 10:00:00
167	csr065	Farhan Abdullah	farhan.abdullah@helpme.sg	csr065	csr_rep	2025-10-05 10:00:00
168	csr066	Rina Binte Hassan	rina.hassan@helpme.sg	csr066	csr_rep	2025-10-06 10:00:00
169	csr067	Aqilah Rahim	aqilah.rahim@helpme.sg	csr067	csr_rep	2025-10-07 10:00:00
170	csr068	Shahrul Nizam	shahrul.nizam@helpme.sg	csr068	csr_rep	2025-10-08 10:00:00
171	csr069	Rosnah Ahmad	rosnah.ahmad@helpme.sg	csr069	csr_rep	2025-10-09 10:00:00
172	csr070	Hafiza Binte Omar	hafiza.omar@helpme.sg	csr070	csr_rep	2025-10-10 10:00:00
173	csr071	Arun Menon	arun.menon@helpme.sg	csr071	csr_rep	2025-10-11 10:00:00
174	csr072	Kavita Rajan	kavita.rajan@helpme.sg	csr072	csr_rep	2025-10-12 10:00:00
175	csr073	Ramesh Kumar	ramesh.kumar@helpme.sg	csr073	csr_rep	2025-10-13 10:00:00
176	csr074	Anjali Devi	anjali.devi@helpme.sg	csr074	csr_rep	2025-10-14 10:00:00
177	csr075	Adrian Rodrigues	adrian.rodrigues@helpme.sg	csr075	csr_rep	2025-10-15 10:00:00
178	csr076	Meenakshi Nair	meenakshi.nair@helpme.sg	csr076	csr_rep	2025-10-16 10:00:00
179	csr077	Vikram Singh	vikram.singh@helpme.sg	csr077	csr_rep	2025-10-17 10:00:00
180	csr078	Divya Sharma	divya.sharma@helpme.sg	csr078	csr_rep	2025-10-18 10:00:00
181	csr079	Rajiv Menon	rajiv.menon@helpme.sg	csr079	csr_rep	2025-10-19 10:00:00
182	csr080	Anita Letchmi	anita.letchmi@helpme.sg	csr080	csr_rep	2025-10-20 10:00:00
183	csr081	Daniel Pereira	daniel.pereira@helpme.sg	csr081	csr_rep	2025-10-21 10:00:00
184	csr082	Natalie DCosta	natalie.dcosta@helpme.sg	csr082	csr_rep	2025-10-22 10:00:00
185	csr083	Ryan Gomez	ryan.gomez@helpme.sg	csr083	csr_rep	2025-10-23 10:00:00
186	csr084	Clarissa Pinto	clarissa.pinto@helpme.sg	csr084	csr_rep	2025-10-24 10:00:00
187	csr085	Ashley De Silva	ashley.desilva@helpme.sg	csr085	csr_rep	2025-10-25 10:00:00
188	csr086	Matthew DSouza	matthew.dsouza@helpme.sg	csr086	csr_rep	2025-10-26 10:00:00
189	csr087	Julian Fernandez	julian.fernandez@helpme.sg	csr087	csr_rep	2025-10-27 10:00:00
190	csr088	Tanya Pereira	tanya.pereira@helpme.sg	csr088	csr_rep	2025-10-28 10:00:00
191	csr089	Adeline Pinto	adeline.pinto@helpme.sg	csr089	csr_rep	2025-10-29 10:00:00
192	csr090	Jerome De Cruz	jerome.decruz@helpme.sg	csr090	csr_rep	2025-10-30 10:00:00
193	csr091	Cheryl Fernandez	cheryl.fernandez@helpme.sg	csr091	csr_rep	2025-10-31 10:00:00
194	csr092	Darren Pereira	darren.pereira@helpme.sg	csr092	csr_rep	2025-11-01 10:00:00
195	csr093	Isabelle Gomes	isabelle.gomes@helpme.sg	csr093	csr_rep	2025-11-02 10:00:00
196	csr094	Sean Rodrigues	sean.rodrigues@helpme.sg	csr094	csr_rep	2025-11-03 10:00:00
197	csr095	Gabriel Pinto	gabriel.pinto@helpme.sg	csr095	csr_rep	2025-11-04 10:00:00
198	csr096	Stephanie Pereira	stephanie.pereira@helpme.sg	csr096	csr_rep	2025-11-05 10:00:00
199	csr097	Lydia De Souza	lydia.desouza@helpme.sg	csr097	csr_rep	2025-11-06 10:00:00
200	csr098	Andrew Fernandes	andrew.fernandes@helpme.sg	csr098	csr_rep	2025-11-07 10:00:00
201	csr099	Sabrina Toh	sabrina.toh@helpme.sg	csr099	csr_rep	2025-11-08 10:00:00
202	csr100	Marcus De Costa	marcus.decosta@helpme.sg	csr100	csr_rep	2025-11-09 10:00:00
\.


--
-- Name: categories_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_categories_id_seq', 10, true);


--
-- Name: csr_shortlist_csr_shortlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.csr_shortlist_csr_shortlist_id_seq', 1, false);


--
-- Name: match_history_match_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.match_history_match_history_id_seq', 60, true);


--
-- Name: pin_requests_pin_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pin_requests_pin_requests_id_seq', 100, true);


--
-- Name: reports_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reports_reports_id_seq', 1, false);


--
-- Name: users_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_users_id_seq', 202, true);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (categories_id);


--
-- Name: csr_shortlist csr_shortlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.csr_shortlist
    ADD CONSTRAINT csr_shortlist_pkey PRIMARY KEY (csr_shortlist_id);


--
-- Name: match_history match_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_history
    ADD CONSTRAINT match_history_pkey PRIMARY KEY (match_history_id);


--
-- Name: pin_requests pin_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pin_requests
    ADD CONSTRAINT pin_requests_pkey PRIMARY KEY (pin_requests_id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (reports_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (users_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: csr_shortlist csr_shortlist_csr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.csr_shortlist
    ADD CONSTRAINT csr_shortlist_csr_id_fkey FOREIGN KEY (csr_id) REFERENCES public.users(users_id);


--
-- Name: csr_shortlist csr_shortlist_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.csr_shortlist
    ADD CONSTRAINT csr_shortlist_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.pin_requests(pin_requests_id);


--
-- Name: match_history match_history_csr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_history
    ADD CONSTRAINT match_history_csr_id_fkey FOREIGN KEY (csr_id) REFERENCES public.users(users_id);


--
-- Name: match_history match_history_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_history
    ADD CONSTRAINT match_history_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.pin_requests(pin_requests_id);


--
-- Name: pin_requests pin_requests_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pin_requests
    ADD CONSTRAINT pin_requests_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(categories_id);


--
-- Name: pin_requests pin_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pin_requests
    ADD CONSTRAINT pin_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(users_id);


--
-- Name: reports reports_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(users_id);


--
-- PostgreSQL database dump complete
--

\unrestrict jx3n2JJB7ZvhWBgV79wvw7TmdTPgyrQUE5j2ai4jRl5nmWO92kUCdNfFhwQEjhF

