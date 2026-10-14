// Health check of the BLiNX POS directory and this mirror. Exit 1 (workflow fails, GitHub emails the admins) on any problem.
// The canary is the demo store; its descriptor must be on both origins, equal, and have at least MIN_DAYS of validity left.
const DIR = process.env.DIRECTORY_ORIGIN ?? 'https://blinx-pos-directory.ajmfarlish.workers.dev';
const MIRROR = process.env.MIRROR_ORIGIN ?? 'https://blinx-lanka.github.io/blinx-pos-mirror';
const CODE = 'DEMV2345';
const FILE = 'v1/m/b10aa65301bab802e7ee2d15e9327d5a65ae3145.jws';
const MIN_DAYS = 21;
const problems = [];
const get = async (url) => { try { const r = await fetch(`${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`, { redirect: 'error', signal: AbortSignal.timeout(15000) }); return { status: r.status, text: (await r.text()).trim() }; } catch (e) { return { status: 0, text: '' }; } };
const claims = (jws) => { try { return JSON.parse(Buffer.from(jws.split('.')[1], 'base64url').toString()); } catch { return null; } };

const hz = await get(`${DIR}/healthz`);
if (hz.status !== 200) problems.push(`directory /healthz answered ${hz.status}`);
const d = await get(`${DIR}/v1/stores/${CODE}`);
if (d.status !== 200) problems.push(`directory canary answered ${d.status}`);
const m = await get(`${MIRROR}/${FILE}`);
if (m.status !== 200) problems.push(`mirror canary answered ${m.status}`);
const dc = d.status === 200 ? claims(d.text) : null; const mc = m.status === 200 ? claims(m.text) : null;
if (d.status === 200 && !dc) problems.push('directory canary is not a descriptor');
if (m.status === 200 && !mc) problems.push('mirror canary is not a descriptor');
if (dc && mc && dc.sequence !== mc.sequence) problems.push(`mirror is out of step (directory sequence ${dc.sequence}, mirror ${mc.sequence})`);
for (const [name, c] of [['directory', dc], ['mirror', mc]]) {
  if (!c) continue;
  const days = Math.floor((c.exp * 1000 - Date.now()) / 86_400_000);
  if (days < MIN_DAYS) problems.push(`${name} descriptor has ${days} days left (minimum ${MIN_DAYS}); re-publish it`);
}
if (problems.length) { console.error(`PROBLEMS:\n- ${problems.join('\n- ')}`); process.exit(1); }
console.log(`ok: directory and mirror healthy, descriptor sequence ${dc.sequence}`);
