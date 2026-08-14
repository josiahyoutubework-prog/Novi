// Novi — migrate + seed. Seeds the demo user "Alex Mercer" with the Vancouver
// mission and everything around it, matching the design handoff copy exactly.
import { randomUUID } from 'node:crypto';
import { db, migrate } from './db.js';

const now = () => new Date().toISOString();
const run = (sql, ...p) => db.prepare(sql).run(...p);
const one = (sql, ...p) => db.prepare(sql).get(...p);

export function seed(force = false) {
  migrate();
  if (force) {
    for (const t of ['chat_messages', 'activity', 'memory', 'agents', 'intelligence', 'actions', 'forgotten', 'missions', 'sessions', 'users']) {
      db.exec(`DELETE FROM ${t};`);
    }
  }
  if (one('SELECT id FROM users LIMIT 1')) return; // already seeded

  const uid = 'user_alex';
  run(
    `INSERT INTO users (id,name,email,password,plan,autonomy_level,theme,calendar_connected,notifications,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    uid, 'Alex Mercer', 'alex@mercer.co', 'password123', 'Novi Pro', 'Co-pilot', 'system', 0, 'Important only', now()
  );

  // ---- Missions ---------------------------------------------------------
  const vanId = 'mission_vancouver';
  run(
    `INSERT INTO missions (id,user_id,title,outcome,target_date,target_label,status,progress,status_note,phases,constraints,what_matters,handling,working_on,dependency,sort,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    vanId, uid, 'Move to Vancouver',
    'Living in Vancouver by mid-June with a job secured and housing arranged.',
    '2027-06-15', 'Target June 15, 2027 · 10 months out',
    'on_track', 62, '3 actions need you',
    JSON.stringify([
      { name: 'Research the market', status: 'complete', note: 'Neighbourhoods, salaries, cost of living' },
      { name: 'Secure employment', status: 'in_progress', note: 'Offer signed before housing is committed' },
      { name: 'Arrange housing', status: 'in_progress', note: 'Viewings, application, lease' },
      { name: 'Fund the move', status: 'behind', note: '$9,400 needed by May' },
      { name: 'Make the move', status: 'not_started', note: 'Logistics, admin, arrival' },
    ]),
    'Lease ends May 31 · Partner · One cat',
    'Three actions need you. The Shopify application closes tonight and blocks the housing phase.',
    JSON.stringify([
      { state: 'done', text: 'Reviewed 47 job listings this week' },
      { state: 'done', text: 'Filtered 12 matching opportunities' },
      { state: 'active', text: 'Monitoring 8 apartment listings' },
      { state: 'active', text: 'Updating the savings projection daily' },
    ]),
    JSON.stringify([
      { label: 'Job search', value: '12 opportunities' },
      { label: 'Apartment search', value: '8 listings' },
    ]),
    'Employment must land before housing can be committed.',
    0, now()
  );

  run(
    `INSERT INTO missions (id,user_id,title,outcome,target_date,target_label,status,progress,status_note,phases,working_on,handling,sort,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    'mission_save', uid, 'Save $10,000',
    'Reach $10,000 in the moving fund by the start of May.',
    '2027-05-01', 'Target May 1, 2027', 'behind', 41, '$800 short of pace',
    JSON.stringify([
      { name: 'Set the target', status: 'complete', note: '$10,000 by May 1' },
      { name: 'Automate deposits', status: 'in_progress', note: '$600 a month' },
      { name: 'Trim recurring costs', status: 'behind', note: 'Two subscriptions still open' },
      { name: 'Close the gap', status: 'not_started', note: 'Add $175 a month' },
    ]),
    JSON.stringify([{ label: 'Savings projection', value: 'Updated today' }]),
    JSON.stringify([{ state: 'active', text: 'Tracking your pace against the target' }]),
    1, now()
  );

  run(
    `INSERT INTO missions (id,user_id,title,outcome,target_date,target_label,status,progress,status_note,phases,sort,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    'mission_thesis', uid, 'Finish my thesis',
    'Submit the final thesis, approved by your supervisor.',
    null, 'Waiting on your supervisor since Aug 4', 'blocked', 74, 'Waiting on your supervisor since Aug 4',
    JSON.stringify([
      { name: 'Draft all chapters', status: 'complete', note: '' },
      { name: 'Supervisor review', status: 'behind', note: 'Sent Aug 4, no reply' },
      { name: 'Revisions', status: 'not_started', note: '' },
      { name: 'Submit', status: 'not_started', note: '' },
    ]),
    2, now()
  );

  run(
    `INSERT INTO missions (id,user_id,title,outcome,target_date,target_label,status,progress,status_note,phases,sort,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    'mission_driving', uid, 'Pass my driving test',
    'Hold a full driving licence.',
    null, 'Finished March 2, five weeks early', 'complete', 100, 'Finished March 2, five weeks early',
    JSON.stringify([]),
    3, now()
  );

  // ---- Actions (Action Center) -----------------------------------------
  const actions = [
    {
      kind: 'approve', title: 'Send your application to Shopify?',
      subtitle: 'Novi prepared the cover letter. Closes at midnight.',
      category: 'apply', options: [],
      draft: {
        to: 'Careers, Shopify',
        body: "I'm applying for the Senior Product Marketing role. I'm relocating to Vancouver in June and bring five years in product marketing. My CV and a tailored cover letter are attached.",
        disclosures: ['Sent from your connected Gmail account', 'Your CV from Aug 2 is attached'],
      },
    },
    {
      kind: 'decide', title: 'Which apartment should Novi prioritise?',
      subtitle: 'Mount Pleasant is $180 more but cuts your commute in half.',
      category: 'organise', options: ['Mount Pleasant', 'East Van'], draft: null,
    },
    {
      kind: 'review', title: 'Three roles match your criteria',
      subtitle: 'Filtered from 47 listings this week', category: 'organise', options: [], draft: null,
    },
    {
      kind: 'confirm', title: 'Is $2,300 still your rent ceiling?',
      subtitle: 'Set six months ago, before the salary range changed.', category: 'organise',
      options: ['Yes, keep it', 'Change it'], draft: null,
    },
  ];
  actions.forEach((a, i) => run(
    `INSERT INTO actions (id,user_id,mission_id,kind,title,subtitle,options,category,draft,sort,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    randomUUID(), uid, vanId, a.kind, a.title, a.subtitle,
    JSON.stringify(a.options), a.category, a.draft ? JSON.stringify(a.draft) : '', i, now()
  ));

  // ---- Intelligence -----------------------------------------------------
  const intel = [
    { kind: 'risk', when_label: 'RISK · YESTERDAY', headline: "You're $800 behind the savings target", detail: 'At the current pace you reach $8,600 by May, not $9,400. Adding $175 a month closes the gap.', cta_label: 'Review the plan' },
    { kind: 'opportunity', when_label: 'OPPORTUNITY · 2 DAYS AGO', headline: 'A senior role at Hootsuite went up in Gastown', detail: 'Salary band is $12k above your floor and they list relocation support.', cta_label: 'See the role' },
    { kind: 'dependency', when_label: 'DEPENDENCY', headline: 'Housing is waiting on your employment offer', detail: 'Landlords here ask for proof of income, so Novi is holding applications until an offer lands.', cta_label: '' },
    { kind: 'change', when_label: 'CHANGE', headline: 'One-bedroom rents in East Van fell 4%', detail: 'Your budget now covers 31 listings, up from 19.', cta_label: '' },
  ];
  intel.forEach((it, i) => run(
    `INSERT INTO intelligence (id,user_id,mission_id,kind,when_label,headline,detail,cta_label,sort,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    randomUUID(), uid, vanId, it.kind, it.when_label, it.headline, it.detail, it.cta_label, i, now()
  ));

  // ---- Agents -----------------------------------------------------------
  const agents = [
    { name: 'Career Agent', status: 'active', summary: 'Watching 6 job boards · 12 opportunities open', description: 'Finds and filters roles that fit your field and relocation plans.', does: ['Watches 6 job boards', 'Filters roles by your criteria', 'Drafts tailored applications'], needs: ['Your CV and target roles'], limitation: 'It never applies without your approval.' },
    { name: 'Home Agent', status: 'active', summary: 'Monitoring 8 listings · 2 new since Tuesday', description: 'Tracks listings inside your budget and near transit.', does: ['Monitors listings in your budget', 'Flags new matches', 'Books viewings on request'], needs: ['Your budget and must-haves'], limitation: 'It never signs a lease for you.' },
    { name: 'Finance Agent', status: 'suggested', summary: 'Would keep your savings pace honest week to week', description: 'Keeps your money goals honest. Watches what you actually save and tells you early when the date is at risk.', does: ['Tracks your pace against the target', 'Flags the month a goal slips', 'Sizes deposits, fees and one-off costs', 'Suggests where the gap can close'], needs: ['Read-only access to one account', 'Your target amount and date'], limitation: 'It can never move money. Spending always requires your approval.' },
    { name: 'Life Admin Agent', status: 'suggested', summary: 'Licences, insurance, address changes, utilities', description: 'Handles the paperwork of a move so nothing lapses.', does: ['Tracks licences and insurance', 'Reminds you before deadlines', 'Drafts address-change notices'], needs: ['Your key dates and providers'], limitation: 'It never submits anything without asking.' },
    { name: 'Travel', status: 'available', summary: '', description: 'Plans trips and logistics.', does: [], needs: [], limitation: '' },
    { name: 'Research', status: 'available', summary: '', description: 'Gathers and organises research.', does: [], needs: [], limitation: '' },
    { name: 'Education', status: 'available', summary: '', description: 'Tracks courses and study plans.', does: [], needs: [], limitation: '' },
    { name: 'Business', status: 'available', summary: '', description: 'Supports business setup and operations.', does: [], needs: [], limitation: '' },
    { name: 'Health', status: 'available', summary: '', description: 'Keeps health goals and appointments on track.', does: [], needs: [], limitation: '' },
  ];
  agents.forEach((a, i) => run(
    `INSERT INTO agents (id,user_id,mission_id,name,status,summary,description,does,needs,limitation,sort,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    randomUUID(), uid, a.status === 'available' ? null : vanId, a.name, a.status, a.summary, a.description,
    JSON.stringify(a.does), JSON.stringify(a.needs), a.limitation, i, now()
  ));

  // ---- Memory -----------------------------------------------------------
  const memory = [
    { category: 'ABOUT YOU', text: 'Wants to live in Vancouver, ideally Mount Pleasant' },
    { category: 'ABOUT YOU', text: 'Works in product marketing, 5 years in' },
    { category: 'ABOUT YOU', text: 'Rent ceiling $2,300 a month' },
    { category: 'ABOUT YOU', text: 'Moving with a partner and one cat' },
    { category: 'ABOUT YOU', text: 'Would rather commute longer than share a flat', learned_at: 'Aug 9' },
    { category: 'ABOUT YOU', text: 'Prefers email over phone calls' },
    { category: 'DATES THAT MATTER', text: 'Lease ends May 31, 2027' },
    { category: 'DATES THAT MATTER', text: "Sister's wedding, August 2027" },
    { category: 'DATES THAT MATTER', text: 'Shopify application closes tonight' },
  ];
  memory.forEach((m, i) => run(
    `INSERT INTO memory (id,user_id,category,text,learned_at,sort,created_at) VALUES (?,?,?,?,?,?,?)`,
    randomUUID(), uid, m.category, m.text, m.learned_at || '', i, now()
  ));

  // ---- Activity / Timeline (Vancouver) ---------------------------------
  const activity = [
    { actor: 'NOVI', date_label: 'AUG 11 · NOVI', text: 'Filtered 47 job listings down to 12', future: 0, is_today: 0 },
    { actor: 'YOU', date_label: 'AUG 12 · YOU', text: 'Raised your rent ceiling to $2,300', future: 0, is_today: 0 },
    { actor: 'RISK', date_label: 'YESTERDAY · RISK', text: 'Savings pace fell behind by $800', future: 0, is_today: 0 },
    { actor: 'TODAY', date_label: 'TODAY', text: 'Shopify application closes at midnight', future: 0, is_today: 1 },
    { actor: 'UPCOMING', date_label: 'SEP 8 · UPCOMING', text: 'Two apartment viewings booked', future: 1, is_today: 0 },
    { actor: 'DEADLINE', date_label: 'MAR 31 · DEADLINE', text: 'Last day to give notice on your lease', future: 1, is_today: 0 },
    { actor: 'TARGET', date_label: 'JUN 15 · TARGET', text: 'In Vancouver', future: 1, is_today: 0 },
  ];
  activity.forEach((a, i) => run(
    `INSERT INTO activity (id,user_id,mission_id,actor,date_label,text,future,is_today,sort,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    randomUUID(), uid, vanId, a.actor, a.date_label, a.text, a.future, a.is_today, i, now()
  ));

  // ---- "What am I forgetting?" -----------------------------------------
  const forgotten = [
    { grouping: 'NEEDS A DECISION THIS MONTH', title: 'Give notice on your lease', reason: "60 days required — that's March 31 at the latest" },
    { grouping: 'NEEDS A DECISION THIS MONTH', title: 'Book movers for peak season', reason: 'June is the busiest month; prices climb after February' },
    { grouping: 'BEFORE YOU ARRIVE', title: "Swap to a BC driver's licence", reason: '90 days after arrival' },
    { grouping: 'BEFORE YOU ARRIVE', title: 'Register for MSP health coverage', reason: 'Three-month waiting period applies' },
    { grouping: 'BEFORE YOU ARRIVE', title: 'Update tenant insurance', reason: "Current policy doesn't cover BC" },
    { grouping: 'LESS URGENT', title: 'Transfer your utilities', reason: 'Set up hydro and internet before move-in' },
    { grouping: 'LESS URGENT', title: 'Redirect your mail', reason: 'Canada Post forwarding takes a few days' },
    { grouping: 'LESS URGENT', title: 'Find a new vet', reason: 'For the cat, near Mount Pleasant' },
  ];
  forgotten.forEach((f, i) => run(
    `INSERT INTO forgotten (id,user_id,mission_id,grouping,title,reason,sort,created_at)
     VALUES (?,?,?,?,?,?,?,?)`,
    randomUUID(), uid, vanId, f.grouping, f.title, f.reason, i, now()
  ));

  // ---- Seed chat --------------------------------------------------------
  run(
    `INSERT INTO chat_messages (id,user_id,mission_id,role,text,what_moved,created_at) VALUES (?,?,?,?,?,?,?)`,
    randomUUID(), uid, vanId, 'user', 'Can I still move in June?', '', now()
  );
  run(
    `INSERT INTO chat_messages (id,user_id,mission_id,role,text,what_moved,created_at) VALUES (?,?,?,?,?,?,?)`,
    randomUUID(), uid, vanId, 'novi',
    "Yes, but you're about two weeks behind the original plan. If you have housing secured by April 10, June 15 still holds.",
    JSON.stringify([
      { label: 'Housing secured', value: 'Mar 27 → Apr 10', tone: 'warning' },
      { label: 'Move date', value: 'Unchanged', tone: 'success' },
    ]),
    now()
  );

  console.log('[seed] Novi demo data seeded for Alex Mercer (alex@mercer.co / password123).');
}
