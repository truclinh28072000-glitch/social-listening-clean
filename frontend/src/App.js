import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";

/* =========================================
   CONFIG
========================================= */
const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://social-listening-api-new.onrender.com";

/* =========================================
   COLORS
========================================= */
const COLORS = ["#22c55e", "#ef4444", "#64748b"];
const PLATFORM_COLORS = [
  "#06b6d4",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444"
];

/* =========================================
   STATIC BUSINESS DATA
========================================= */
const kpis = [
  { label: "Total Mentions", value: "12,480" },
  { label: "Positive Rate", value: "74%" },
  { label: "Engagement", value: "186K" },
  { label: "Growth MoM", value: "+18.2%" }
];

const platformData = [
  { name: "TikTok", value: 38 },
  { name: "Facebook", value: 22 },
  { name: "Shopee", value: 16 },
  { name: "YouTube", value: 11 },
  { name: "Search", value: 8 },
  { name: "Forum", value: 5 }
];

const sentimentData = [
  { name: "Positive", value: 74 },
  { name: "Negative", value: 8 },
  { name: "Neutral", value: 18 }
];

const monthlyTrend = [
  { month: "Jan", mentions: 6200 },
  { month: "Feb", mentions: 7100 },
  { month: "Mar", mentions: 7600 },
  { month: "Apr", mentions: 8800 },
  { month: "May", mentions: 10200 },
  { month: "Jun", mentions: 12480 }
];

const competitorData = [
  { brand: "Lavie", mentions: 28000 },
  { brand: "Aquafina", mentions: 24000 },
  { brand: "Ion Life", mentions: 12480 },
  { brand: "Satori", mentions: 9000 }
];

const keywordData = [
  { keyword: "nước ion kiềm", score: 98 },
  { keyword: "detox", score: 87 },
  { keyword: "gym", score: 82 },
  { keyword: "healthy", score: 79 },
  { keyword: "đẹp da", score: 75 },
  { keyword: "review thật", score: 70 }
];

const fallbackPosts = [
  {
    id: 1,
    platform: "TikTok",
    brand: "Ion Life",
    content: "Uống sau gym thấy nhẹ bụng thật.",
    sentiment: "Positive",
    likes: 1240
  },
  {
    id: 2,
    platform: "Shopee",
    brand: "Ion Life",
    content: "Giao nhanh, đóng gói đẹp.",
    sentiment: "Positive",
    likes: 310
  },
  {
    id: 3,
    platform: "Facebook",
    brand: "Ion Life",
    content: "Giá hơi cao nhưng chất lượng ổn.",
    sentiment: "Neutral",
    likes: 145
  },
  {
    id: 4,
    platform: "TikTok",
    brand: "Ion Life",
    content: "Packaging đẹp hợp lifestyle.",
    sentiment: "Positive",
    likes: 980
  },
  {
    id: 5,
    platform: "YouTube",
    brand: "Ion Life",
    content: "Review nước ion kiềm chi tiết.",
    sentiment: "Positive",
    likes: 540
  },
  {
    id: 6,
    platform: "Forum",
    brand: "Ion Life",
    content: "Ai uống lâu dài rồi cho xin feedback?",
    sentiment: "Neutral",
    likes: 92
  }
];

/* =========================================
   MAIN APP
========================================= */
export default function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [platform, setPlatform] = useState("All");

  useEffect(() => {
    fetch(`${API_URL}/posts`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data);
        } else {
          setPosts(fallbackPosts);
        }
      })
      .catch(() => {
        setPosts(fallbackPosts);
      })
      .finally(() => setLoading(false));
  }, []);

  const platforms = useMemo(() => {
    const list = [...new Set(posts.map((p) => p.platform))];
    return ["All", ...list];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((item) => {
      const matchKeyword =
        item.content.toLowerCase().includes(keyword.toLowerCase()) ||
        item.brand.toLowerCase().includes(keyword.toLowerCase());

      const matchPlatform =
        platform === "All" ? true : item.platform === platform;

      return matchKeyword && matchPlatform;
    });
  }, [posts, keyword, platform]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.hero}>
          <h1 style={styles.title}>📊 Social Listening ENTERPRISE</h1>
          <p style={styles.subtitle}>
            Real-Time Brand Intelligence Dashboard | Ion Life
          </p>

          <div style={styles.filterRow}>
            <input
              placeholder="Search keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={styles.input}
            />

            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              style={styles.select}
            >
              {platforms.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI */}
        <SectionTitle text="Executive KPI" />
        <div style={styles.kpiGrid}>
          {kpis.map((item) => (
            <div key={item.label} style={styles.card}>
              <div style={styles.kpiValue}>{item.value}</div>
              <div style={styles.kpiLabel}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <SectionTitle text="Performance Dashboard" />
        <div style={styles.grid2}>
          <Card title="Sentiment Breakdown">
            <ChartBox>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    dataKey="value"
                    outerRadius={90}
                    label
                  >
                    {sentimentData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartBox>
          </Card>

          <Card title="Platform Share">
            <ChartBox>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip />
                  <Bar dataKey="value">
                    {platformData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PLATFORM_COLORS[i % PLATFORM_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>
          </Card>
        </div>

        <div style={styles.grid2}>
          <Card title="Mention Growth Trend">
            <ChartBox>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mentions"
                    stroke="#22c55e"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>
          </Card>

          <Card title="Competitor Benchmark">
            <ChartBox>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={competitorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="brand" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip />
                  <Bar dataKey="mentions" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>
          </Card>
        </div>

        {/* KEYWORD */}
        <SectionTitle text="Trending Keywords" />
        <div style={styles.keywordGrid}>
          {keywordData.map((item) => (
            <div key={item.keyword} style={styles.keywordCard}>
              <div style={{ fontWeight: 700 }}>{item.keyword}</div>
              <div style={{ color: "#22c55e", marginTop: 8 }}>
                Score: {item.score}
              </div>
            </div>
          ))}
        </div>

        {/* POSTS */}
        <SectionTitle text="Recent Mentions" />
        <div style={styles.card}>
          {loading ? (
            <div>Loading...</div>
          ) : filteredPosts.length === 0 ? (
            <div>No data found.</div>
          ) : (
            filteredPosts.map((item) => (
              <div key={item.id} style={styles.postItem}>
                <div style={styles.postTop}>
                  <strong>{item.platform}</strong> | {item.brand}
                </div>
                <div style={styles.postContent}>{item.content}</div>
                <div style={styles.postMeta}>
                  {item.sentiment} 👍 {item.likes}
                </div>
              </div>
            ))
          )}
        </div>

        {/* RECOMMENDATION */}
        <SectionTitle text="AI Strategic Recommendation" />
        <div style={styles.card}>
          <ul style={styles.ul}>
            <li>✅ TikTok tạo 38% tổng thảo luận → tiếp tục creator seeding.</li>
            <li>✅ Shopee sentiment cao nhất → đẩy conversion bundle.</li>
            <li>
              ✅ Search volume tăng mạnh với keyword “nước ion kiềm gym”.
            </li>
            <li>✅ Negative chủ yếu đến từ price concern.</li>
            <li>✅ Launch dòng premium lifestyle cho Gen Z.</li>
            <li>✅ Expand retail trial tại Circle K / GS25 / FamilyMart.</li>
          </ul>
        </div>

        {/* FOOTER */}
        <div style={styles.footer}>
          Built for Business Case Presentation • Consulting Demo Version
        </div>
      </div>
    </div>
  );
}

/* =========================================
   COMPONENTS
========================================= */
function SectionTitle({ text }) {
  return <h2 style={styles.sectionTitle}>{text}</h2>;
}

function Card({ title, children }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      {children}
    </div>
  );
}

function ChartBox({ children }) {
  return <div style={{ width: "100%", height: 300 }}>{children}</div>;
}

/* =========================================
   STYLES
========================================= */
const styles = {
  page: {
    background: "#020617",
    minHeight: "100vh",
    color: "white",
    fontFamily: "Inter, Arial, sans-serif"
  },
  container: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: 24
  },
  hero: {
    marginBottom: 24
  },
  title: {
    fontSize: 48,
    fontWeight: 800,
    marginBottom: 8
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: 20
  },
  filterRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap"
  },
  input: {
    padding: 12,
    width: 280,
    borderRadius: 10,
    border: "1px solid #2563eb",
    background: "#0f172a",
    color: "white"
  },
  select: {
    padding: 12,
    width: 220,
    borderRadius: 10,
    border: "1px solid #2563eb",
    background: "#0f172a",
    color: "white"
  },
  sectionTitle: {
    fontSize: 30,
    marginTop: 30,
    marginBottom: 16,
    fontWeight: 800
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: 16
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16
  },
  keywordGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16
  },
  card: {
    background: "#0f172a",
    border: "1px solid #1d4ed8",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 14
  },
  kpiValue: {
    fontSize: 34,
    fontWeight: 800,
    color: "#22c55e"
  },
  kpiLabel: {
    marginTop: 8,
    color: "#94a3b8"
  },
  keywordCard: {
    background: "#0f172a",
    border: "1px solid #1d4ed8",
    borderRadius: 14,
    padding: 18
  },
  postItem: {
    padding: "14px 0",
    borderBottom: "1px solid #1e293b"
  },
  postTop: {
    fontSize: 22,
    marginBottom: 6
  },
  postContent: {
    fontSize: 18,
    marginBottom: 6
  },
  postMeta: {
    color: "#94a3b8"
  },
  ul: {
    lineHeight: 2,
    fontSize: 18,
    paddingLeft: 22
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    color: "#64748b",
    paddingBottom: 20
  }
};