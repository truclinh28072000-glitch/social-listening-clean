import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

/* =========================
   CONFIG
========================= */
const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://social-listening-api-new.onrender.com";

const DEFAULT_PLATFORMS = [
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

const COLORS = ["#22c55e", "#ef4444", "#64748b"];

/* =========================
   APP
========================= */
export default function App() {
  const [posts, setPosts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [platform, setPlatform] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* LOAD DATA */
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${API_URL}/posts`);
        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid API response");
        }

        setPosts(data);
      } catch (err) {
        setError("Cannot connect API");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* PLATFORM OPTIONS */
  const platformOptions = useMemo(() => {
    const apiPlatforms = posts
      .map((p) => p.platform?.trim())
      .filter(Boolean);

    return ["All", ...new Set([...DEFAULT_PLATFORMS, ...apiPlatforms])];
  }, [posts]);

  /* FILTERED POSTS */
  const filtered = useMemo(() => {
    return posts.filter((item) => {
      const content = item.content?.toLowerCase() || "";
      const itemPlatform = item.platform?.toLowerCase() || "";

      const matchKeyword =
        keyword.trim() === "" ||
        content.includes(keyword.toLowerCase());

      const matchPlatform =
        platform === "All" ||
        itemPlatform === platform.toLowerCase();

      return matchKeyword && matchPlatform;
    });
  }, [posts, keyword, platform]);

  /* KPI */
  const total = filtered.length;

  const positive = filtered.filter(
    (x) => x.sentiment?.toLowerCase() === "positive"
  ).length;

  const negative = filtered.filter(
    (x) => x.sentiment?.toLowerCase() === "negative"
  ).length;

  const neutral = total - positive - negative;

  const positiveRate = total
    ? Math.round((positive / total) * 100)
    : 0;

  const negativeRate = total
    ? Math.round((negative / total) * 100)
    : 0;

  const avgLikes = total
    ? Math.round(
        filtered.reduce(
          (sum, x) => sum + Number(x.likes || 0),
          0
        ) / total
      )
    : 0;

  /* PLATFORM MAP */
  const platformMap = useMemo(() => {
    const map = {};

    filtered.forEach((item) => {
      const name = item.platform || "Unknown";
      map[name] = (map[name] || 0) + 1;
    });

    return map;
  }, [filtered]);

  const topPlatform =
    Object.keys(platformMap).sort(
      (a, b) => platformMap[b] - platformMap[a]
    )[0] || "-";

  const sources = Object.keys(platformMap).length;

  /* CHART DATA */
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

  /* KEYWORD DATA */
  const keywordData = useMemo(() => {
    const map = {};

    filtered.forEach((item) => {
      item.content
        ?.toLowerCase()
        .replace(/[^\wÀ-ỹ\s]/g, "")
        .split(" ")
        .filter((w) => w.length > 2)
        .forEach((word) => {
          map[word] = (map[word] || 0) + 1;
        });
    });

    return Object.keys(map)
      .map((key) => ({
        keyword: key,
        count: map[key]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filtered]);

  /* =========================
     UI
  ========================= */
  return (
    <div style={page}>
      <h1 style={title}>📊 Social Listening ENTERPRISE</h1>

      <p style={subtitle}>
        Real-Time Brand Intelligence | Ion Life
      </p>

      {/* FILTER */}
      <div style={filterWrap}>
        <input
          style={input}
          placeholder="Search keyword..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          style={input}
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          {platformOptions.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* STATES */}
      {loading && (
        <Panel title="Loading">
          <p>Fetching live data...</p>
        </Panel>
      )}

      {error && (
        <Panel title="API Error">
          <p>{error}</p>
        </Panel>
      )}

      {!loading && !error && (
        <>
          {/* KPI */}
          <div style={grid6}>
            <Card title="Total Mentions" value={total} />
            <Card title="Positive Rate" value={`${positiveRate}%`} />
            <Card title="Negative Rate" value={`${negativeRate}%`} />
            <Card title="Top Platform" value={topPlatform} />
            <Card title="Avg Likes" value={avgLikes} />
            <Card title="Sources" value={sources} />
          </div>

          {/* MAIN CHARTS */}
          <div style={grid2}>
            <Panel title="Mention Trend">
              <ChartLine data={trendData} />
            </Panel>

            <Panel title="Sentiment Breakdown">
              <ChartPie data={sentimentData} />
            </Panel>
          </div>

          <div style={grid2}>
            <Panel title="Platform Performance">
              <ChartBar data={platformData} />
            </Panel>

            <Panel title="Keyword Intelligence">
              {keywordData.map((item) => (
                <div key={item.keyword} style={row}>
                  <span>{item.keyword}</span>
                  <b>{item.count}</b>
                </div>
              ))}
            </Panel>
          </div>

          {/* RECENT MENTIONS */}
          <Panel title="Recent Mentions">
            {filtered.slice(0, 6).map((item) => (
              <div key={item.id} style={mentionItem}>
                <div style={{ fontWeight: "bold" }}>
                  {item.platform} | {item.brand}
                </div>

                <div style={{ marginTop: 6 }}>
                  {item.content}
                </div>

                <small style={{ color: "#94a3b8" }}>
                  {item.sentiment} 👍 {item.likes}
                </small>
              </div>
            ))}
          </Panel>

          {/* AI RECOMMENDATION */}
          <Panel title="AI Strategic Recommendation">
            <ul style={recommendList}>
              <li>
                ✅ {topPlatform} đang là nguồn thảo luận mạnh nhất.
              </li>
              <li>
                ✅ Positive sentiment đạt {positiveRate}%.
              </li>
              <li>
                ✅ Nên tăng creator review + social proof.
              </li>
              <li>
                ✅ Tập trung messaging: sức khỏe + lifestyle.
              </li>
              <li>
                ✅ Theo dõi pain point từ comment tiêu cực.
              </li>
              <li>
                ✅ Expand sang TikTok + Shopee + Search Intent.
              </li>
            </ul>
          </Panel>
        </>
      )}
    </div>
  );
}

/* =========================
   COMPONENTS
========================= */
function Card({ title, value }) {
  return (
    <div style={card}>
      <div style={small}>{title}</div>
      <div style={big}>{value}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={panel}>
      <h2 style={{ marginBottom: 16 }}>{title}</h2>
      {children}
    </div>
  );
}

function ChartLine({ data }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid stroke="#1e3a8a" strokeDasharray="3 3" />
        <XAxis dataKey="month" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip />
        <Line
          dataKey="mentions"
          stroke="#38bdf8"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ChartPie({ data }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          outerRadius={110}
          label
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

function ChartBar({ data }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid stroke="#1e3a8a" strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip />
        <Bar dataKey="mentions" fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* =========================
   STYLE
========================= */
const page = {
  background: "#020617",
  minHeight: "100vh",
  padding: 24,
  color: "white",
  fontFamily: "Arial, sans-serif"
};

const title = {
  fontSize: 48,
  marginBottom: 10
};

const subtitle = {
  color: "#94a3b8",
  marginBottom: 20
};

const filterWrap = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 20
};

const input = {
  padding: 12,
  minWidth: 240,
  background: "#0f172a",
  color: "white",
  border: "1px solid #2563eb",
  borderRadius: 10
};

const grid6 = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 16,
  marginBottom: 20
};

const grid2 = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(380px,1fr))",
  gap: 16,
  marginBottom: 20
};

const card = {
  background: "#0f172a",
  padding: 20,
  borderRadius: 18,
  border: "1px solid #1e3a8a"
};

const small = {
  color: "#94a3b8"
};

const big = {
  fontSize: 34,
  fontWeight: "bold",
  marginTop: 8,
  color: "#38bdf8"
};

const panel = {
  background: "#0f172a",
  padding: 20,
  borderRadius: 18,
  border: "1px solid #1e3a8a",
  marginBottom: 20
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid #1e3a8a"
};

const mentionItem = {
  padding: "14px 0",
  borderBottom: "1px solid #1e3a8a"
};

const recommendList = {
  lineHeight: "2",
  paddingLeft: 20
};