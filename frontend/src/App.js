import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis,
  ResponsiveContainer, Legend
} from "recharts";

export default function App() {
  const API = "https://social-listening-clean.onrender.com";

  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [range, setRange] = useState("30");

  useEffect(() => {
    axios.get(`${API}/posts`)
      .then((res) => setPosts(res.data))
      .catch(console.log);
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const keyword = search.toLowerCase();

      const matchKeyword =
        post.content.toLowerCase().includes(keyword) ||
        post.brand.toLowerCase().includes(keyword);

      const matchPlatform =
        platformFilter === "All" ||
        post.platform === platformFilter;

      return matchKeyword && matchPlatform;
    });
  }, [posts, search, platformFilter, range]);

  const total = filteredPosts.length;
  const positive = filteredPosts.filter(p => p.sentiment === "Positive").length;
  const negative = filteredPosts.filter(p => p.sentiment === "Negative").length;

  const pieData = [
    { name: "Positive", value: positive },
    { name: "Negative", value: negative }
  ];

  const platformData = ["Facebook","TikTok","YouTube","News"].map((name) => ({
    name,
    value: filteredPosts.filter(p => p.platform === name).length
  }));

  const brandMap = {};
  filteredPosts.forEach((p) => {
    brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
  });

  const brandData = Object.keys(brandMap).map((key) => ({
    name: key,
    value: brandMap[key]
  }));

  const words = {};
  filteredPosts.forEach((p) => {
    p.content.split(" ").forEach((w) => {
      const clean = w.toLowerCase().replace(/[^\wÀ-ỹ]/g, "");
      if (clean.length > 3) {
        words[clean] = (words[clean] || 0) + 1;
      }
    });
  });

  const topWords = Object.entries(words)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,12);

  const insight = `
• Total mentions: ${total}
• Positive mentions: ${positive}
• Negative mentions: ${negative}
• Most active platform: ${
    platformData.sort((a,b)=>b.value-a.value)[0]?.name || "-"
  }

Recommendation:
${
  negative > positive
    ? "Urgent sentiment recovery campaign needed."
    : "Momentum is positive. Scale awareness & conversion."
}
`;

  const COLORS = ["#22c55e", "#ef4444"];

  return (
    <div className="page">
      <header className="header">
        <h1>📡 Social Listening Intelligence</h1>
        <p>Real-time Monitoring & Consumer Insights</p>
      </header>

      <div className="toolbar">
        <input
          placeholder="Search keyword..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />

        <select
          value={platformFilter}
          onChange={(e)=>setPlatformFilter(e.target.value)}
        >
          <option value="All">All Platforms</option>
          <option value="Facebook">Facebook</option>
          <option value="TikTok">TikTok</option>
          <option value="YouTube">YouTube</option>
          <option value="News">News</option>
        </select>

        <select
          value={range}
          onChange={(e)=>setRange(e.target.value)}
        >
          <option value="1">Today</option>
          <option value="7">7 Days</option>
          <option value="30">30 Days</option>
        </select>
      </div>

      <div className="statsRow">
        <div className="statCard"><h3>Total</h3><p>{total}</p></div>
        <div className="statCard"><h3>Positive</h3><p>{positive}</p></div>
        <div className="statCard"><h3>Negative</h3><p>{negative}</p></div>
      </div>

      <div className="chartGrid">
        <div className="box">
          <h2>Sentiment</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={95}>
                {pieData.map((e,i)=><Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="box">
          <h2>Platform Trend</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={platformData}>
              <XAxis dataKey="name" stroke="#fff"/>
              <YAxis stroke="#fff"/>
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="box">
          <h2>Competitor Compare</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={brandData}>
              <XAxis dataKey="name" stroke="#fff"/>
              <YAxis stroke="#fff"/>
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="box">
          <h2>Keyword Cloud</h2>
          <div className="wordCloud">
            {topWords.map(([word,count],i)=>(
              <span key={i} className="tag">
                {word} ({count})
              </span>
            ))}
          </div>
        </div>

        <div className="box full">
          <h2>AI Insight</h2>
          <pre className="insightBox">{insight}</pre>
        </div>
      </div>
    </div>
  );
}