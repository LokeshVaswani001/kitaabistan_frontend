const BASE = process.argv[2] || "https://kitaabistanfrontend.vercel.app";

const results = [];
const ok = (name, cond, extra = "") => {
  results.push({ name, pass: !!cond, extra });
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  [" + extra + "]" : ""}`);
};

(async () => {
  const home = await fetch(BASE + "/");
  const homeHtml = await home.text();
  ok("landing 200", home.status === 200, `status=${home.status}`);
  ok("landing renders", homeHtml.includes("Kitaabistan"));
  ok("landing ships css", /<link[^>]+stylesheet|\.css/.test(homeHtml));

  const email = `smoke${Date.now()}@test.com`;
  const signup = await fetch(BASE + "/api/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Smoke", email, password: "Secret#1234" }),
  });
  const cookie = signup.headers.get("set-cookie") || "";
  ok("signup 201 (sqlite on /tmp)", signup.status === 201, `status=${signup.status}`);
  ok("session cookie", cookie.includes("kitaabistan_session="));

  const token = cookie.split(";")[0];
  const me = await fetch(BASE + "/api/auth/me", { headers: { cookie: token } });
  const meJson = await me.json().catch(() => ({}));
  ok("me returns user", me.status === 200 && (meJson.user?.email || meJson.email), JSON.stringify(meJson).slice(0, 90));

  const login = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: "Secret#1234" }),
  });
  ok("login 200", login.status === 200, `status=${login.status}`);

  const chat = await fetch(BASE + "/api/auth/demo", { method: "POST", headers: { "content-type": "application/json" } });
  ok("demo endpoint", chat.status < 500, `status=${chat.status}`);

  for (const p of ["/chatbot", "/poems", "/stories", "/terms", "/privacy", "/onboarding", "/book/n9"]) {
    const r = await fetch(BASE + p);
    ok(`page ${p}`, r.status === 200, `status=${r.status}`);
  }

  const homeAuth = await fetch(BASE + "/home", { headers: { cookie: token }, redirect: "manual" });
  ok("/home with session", homeAuth.status === 200, `status=${homeAuth.status}`);

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} PASS`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
