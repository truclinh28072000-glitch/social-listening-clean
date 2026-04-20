import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from "recharts";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [platform, setPlatform] = useState("All");

  // =====================================
  // LOAD API
  // =====================================
  useEffect(() => {
    fetch("http://127.0.0.1:8000/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
      })
      .catch(() => setPosts([]));
  }, []);

  // =====================================
  // FULL PLATFORM LIST (NEW)
  // =====================================
  const defaultPlatforms = [
    "TikTok",
    "Facebook",
    "Instagram",
    "Threads",
    "YouTube",
    "Shopee",
    "Lazada",
    "Tiki",
    "News",
    "Google Trends",
    "Search Query",
    "Webtretho",
    "Reddit",
    "Forum",
    "Retail Feedback"
  ];

  const platformOptions = useMemo(() => {
    const apiPlatforms = posts.map((p) => p.platform?.trim()).filter(Boolean);
    const merged = [...new Set([...defaultPlatforms, ...apiPlatforms])];
    return ["All", ...merged];
  }, [posts]);

  // =====================================
  // FILTER
  // =====================================
  const filtered = useMemo(() => {
    return posts.filter((item) => {
      const matchKeyword =
        keyword === "" ||
        item.content?.toLowerCase().includes(keyword.toLowerCase());

      const matchPlatform =
        platform === "All" ||
        item.platform?.trim().toLowerCase() === platform.toLowerCase();

      return matchKeyword && matchPlatform;
    });
  }, [posts, keyword, platform]);

  // =====================================
  // KPI
  // =====================================
  const total = filtered.length;

  const positive = filtered.filter(
    (p) => p.sentiment?.toLowerCase() === "positive"
  ).length;

  const negative = filtered.filter(
    (p) => p.sentiment?.toLowerCase() === "negative"
  ).length;

  const neutral = total - positive - negative;

  const positiveRate = total ? Math.round((positive / total) * 100) : 0;
  const negativeRate = total ? Math.round((negative / total) * 100) : 0;

  const avgLikes = total
    ? Math.round(
        filtered.reduce((sum, item) => sum + Number(item.likes || 0), 0) / total
      )
    : 0;

  // Platform count
  const platformMap = {};
  filtered.forEach((item) => {
    platformMap[item.platform] = (platformMap[item.platform] || 0) + 1;
  });

  const topPlatform =
    Object.keys(platformMap).sort((a, b) => platformMap[b] - platformMap[a])[0] || "-";

  const sources = Object.keys(platformMap).length;

  // =====================================
  // CHART DATA
  // =====================================
  const trendData = [
    { month: "Jan", mentions: 5 },
    { month: "Feb", mentions: 7 },
    { month: "Mar", mentions: 8 },
    { month: "Apr", mentions: 10 },
    { month: "May", mentions: 12 },
    { month: "Jun", mentions: total }
  ];

  const sentimentData = [
    { name: "Positive", value: positive },
    { name: "Negative", value: negative },
    { name: "Neutral", value: neutral }
  ];

  const platformData = Object.keys(platformMap).map((key) => ({
    name: key,
    mentions: platformMap[key]
  }));

  // Keyword intelligence
  const keywordMap = {};
  filtered.forEach((item) => {
    item.content
      ?.toLowerCase()
      .replace(/[^\wÀ-ỹ\s]/g, "")
      .split(" ")
      .filter((w) => w.length > 2)
      .forEach((word) => {
        keywordMap[word] = (keywordMap[word] || 0) + 1;
      });
  });

  const keywordData = Object.keys(keywordMap)
    .map((key) => ({
      keyword: key,
      count: keywordMap[key]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const COLORS = ["#22c55e", "#ef4444", "#64748b"];

  return (
    <div style={page}>
      <h1 style={{ fontSize: 54 }}>📊 Social Listening ENTERPRISE</h1>
      <p style={{ color: "#94a3b8", marginTop: -10 }}>
        Real-Time Brand Intelligence | Ion Life
      </p>

      {/* FILTER */}
      <div style={{ display: "flex", gap: 15, margin: "25px 0", flexWrap: "wrap" }}>
        <input
          placeholder="Search keyword..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={inputStyle}
        />

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          style={inputStyle}
        >
          {platformOptions.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* KPI */}
      <div style={grid6}>
        <Card title="Total Mentions" value={total} />
        <Card title="Positive Rate" value={`${positiveRate}%`} />
        <Card title="Negative Rate" value={`${negativeRate}%`} />
        <Card title="Top Platform" value={topPlatform} />
        <Card title="Avg Likes" value={avgLikes} />
        <Card title="Sources" value={sources} />
      </div>

      {/* ROW 1 */}
      <div style={grid2}>
        <Panel title="Mention Trend">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="mentions"
                stroke="#38bdf8"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Sentiment Breakdown">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={sentimentData} dataKey="value" outerRadius={110} label>
                {sentimentData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* ROW 2 */}
      <div style={grid2}>
        <Panel title="Platform Performance">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="mentions" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Keyword Intelligence">
          <table style={{ width: "100%", color: "white" }}>
            <tbody>
              {keywordData.map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: 8 }}>{item.keyword}</td>
                  <td style={{ textAlign: "right" }}>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      {/* POSTS */}
      <Panel title="Recent Mentions">
        {filtered.length === 0 && (
          <p style={{ color: "#94a3b8" }}>No data found.</p>
        )}

        {filtered.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "14px 0",
              borderBottom: "1px solid #1e3a8a"
            }}
          >
            <b>{item.platform}</b> | {item.brand}
            <div style={{ marginTop: 6 }}>{item.content}</div>
            <small style={{ color: "#94a3b8" }}>
              {item.sentiment} 👍 {item.likes}
            </small>
          </div>
        ))}
      </Panel>

      {/* AI */}
      <Panel title="AI Strategic Recommendation">
        <ul style={{ lineHeight: 2 }}>
          <li>✅ {topPlatform} đang là nguồn thảo luận mạnh nhất.</li>
          <li>✅ Positive sentiment đạt {positiveRate}%.</li>
          <li>✅ Nên tăng creator review + social proof.</li>
          <li>✅ Tập trung messaging: sức khỏe + lifestyle.</li>
          <li>✅ Theo dõi pain point từ comment tiêu cực.</li>
          <li>✅ Expand sang TikTok + Shopee + Search Intent.</li>
        </ul>
      </Panel>
    </div>
  );
}

// =====================================
// COMPONENTS
// =====================================
function Card({ title, value }) {
  return (
    <div style={card}>
      <div style={{ color: "#94a3b8" }}>{title}</div>
      <div style={cardValue}>{value}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={panel}>
      <h2 style={{ marginBottom: 20 }}>{title}</h2>
      {children}
    </div>
  );
}

// STYLES
// =====================================
const page = {
  background: "#020617",
  minHeight: "100vh",
  color: "white",
  padding: 20,
  fontFamily: "Arial, sans-serif"
};

const inputStyle = {
  background: "#0f172a",
  color: "white",
  border: "1px solid #2563eb",
  borderRadius: 10,
  padding: "14px 16px",
  minWidth: 220,
  fontSize: 16,
  outline: "none"
};

const grid6 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 16,
  marginBottom: 20
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(500px,1fr))",
  gap: 16,
  marginBottom: 20
};

const card = {
  background: "#0f172a",
  border: "1px solid #1e3a8a",
  borderRadius: 18,
  padding: 22,
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
};

const cardValue = {
  fontSize: 34,
  fontWeight: "bold",
  color: "#38bdf8",
  marginTop: 10
};

const panel = {
  background: "#0f172a",
  border: "1px solid #1e3a8a",
  borderRadius: 18,
  padding: 22,
  marginBottom: 20,
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
};