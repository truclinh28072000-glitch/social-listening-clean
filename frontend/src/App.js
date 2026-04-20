import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis,
  ResponsiveContainer, Legend
} from "recharts";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");

  const API = "https://social-listening-clean.onrender.com";

  useEffect(() => {
    axios.get(`${API}/posts`)
      .then((res) => setPosts(res.data))
      .catch((err) => console.log(err));
  }, []);

  const filteredPosts = posts.filter((post) => {
    const keyword = search.toLowerCase();

    const matchKeyword =
      post.content.toLowerCase().includes(keyword) ||
      post.brand.toLowerCase().includes(keyword);

    const matchPlatform =
      platformFilter === "All" ||
      post.platform === platformFilter;

    return matchKeyword && matchPlatform;
  });

  const total = filteredPosts.length;
  const positive = filteredPosts.filter(p => p.sentiment === "Positive").length;
  const negative = filteredPosts.filter(p => p.sentiment === "Negative").length;

  const platformData = [
    { name: "Facebook", value: filteredPosts.filter(p => p.platform === "Facebook").length },
    { name: "TikTok", value: filteredPosts.filter(p => p.platform === "TikTok").length },
    { name: "YouTube", value: filteredPosts.filter(p => p.platform === "YouTube").length },
    { name: "News", value: filteredPosts.filter(p => p.platform === "News").length }
  ];

  const pieData = [
    { name: "Positive", value: positive },
    { name: "Negative", value: negative }
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  // keyword frequency
  const words = {};
  filteredPosts.forEach((p) => {
    p.content.split(" ").forEach((word) => {
      const clean = word.toLowerCase();
      if (clean.length > 3) {
        words[clean] = (words[clean] || 0) + 1;
      }
    });
  });

  const topWords = Object.entries(words)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  // competitor compare
  const brands = {};
  filteredPosts.forEach((p) => {
    brands[p.brand] = (brands[p.brand] || 0) + 1;
  });

  const brandData = Object.keys(brands).map((key) => ({
    name: key,
    value: brands[key]
  }));

  const insight =
    positive > negative
      ? "Brand sentiment is positive. Opportunity to scale awareness campaigns."
      : "Negative mentions are rising. Need immediate response strategy.";

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
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
        >
          <option value="All">All Platforms</option>
          <option value="Facebook">Facebook</option>
          <option value="TikTok">TikTok</option>
          <option value="YouTube">YouTube</option>
          <option value="News">News</option>
        </select>
      </div>

      <div className="statsRow">
        <div className="statCard"><h3>Total Mentions</h3><p>{total}</p></div>
        <div className="statCard"><h3>Positive</h3><p>{positive}</p></div>
        <div className="statCard"><h3>Negative</h3><p>{negative}</p></div>
      </div>

      <div className="chartGrid">

        <div className="box">
          <h2>Sentiment</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={60}
                outerRadius={95}
                label
              >
                {pieData.map((item, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
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
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="box">
          <h2>Competitor Compare</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={brandData}>
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="box">
          <h2>Keyword Cloud</h2>
          <div className="wordCloud">
            {topWords.map(([word, count], i) => (
              <span
                key={i}
                style={{ fontSize: `${14 + count * 6}px` }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="box full">
          <h2>AI Insight</h2>
          <div className="insightBox">{insight}</div>
        </div>

      </div>
    </div>
  );
}