import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend
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

  const positiveRate = total ? ((positive / total) * 100).toFixed(0) : 0;
  const negativeRate = total ? ((negative / total) * 100).toFixed(0) : 0;

  const avgLikes = total
    ? Math.round(filteredPosts.reduce((a, b) => a + b.likes, 0) / total)
    : 0;

  const platformCounts = {
    Facebook: filteredPosts.filter(p => p.platform === "Facebook").length,
    TikTok: filteredPosts.filter(p => p.platform === "TikTok").length,
    YouTube: filteredPosts.filter(p => p.platform === "YouTube").length,
    News: filteredPosts.filter(p => p.platform === "News").length
  };

  const topPlatform = Object.keys(platformCounts).reduce((a, b) =>
    platformCounts[a] > platformCounts[b] ? a : b
  );

  const pieData = [
    { name: "Positive", value: positive },
    { name: "Negative", value: negative }
  ];

  const barData = Object.keys(platformCounts).map((key) => ({
    name: key,
    value: platformCounts[key]
  }));

  const likeData = filteredPosts.slice(0, 6).map((item, index) => ({
    name: `#${index + 1}`,
    likes: item.likes
  }));

  const COLORS = ["#22c55e", "#ef4444"];

  return (
    <div className="page">
      <header className="header">
        <h1>📊 Social Listening PRO</h1>
        <p>Real-time Brand Monitoring Dashboard</p>
      </header>

      <div className="toolbar">
        <input
          type="text"
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
        <div className="statCard">
          <h3>Total Mentions</h3>
          <p>{total}</p>
        </div>

        <div className="statCard">
          <h3>Positive Rate</h3>
          <p>{positiveRate}%</p>
        </div>

        <div className="statCard">
          <h3>Negative Rate</h3>
          <p>{negativeRate}%</p>
        </div>

        <div className="statCard">
          <h3>Top Platform</h3>
          <p>{topPlatform}</p>
        </div>

        <div className="statCard">
          <h3>Avg Likes</h3>
          <p>{avgLikes}</p>
        </div>
      </div>

      <div className="chartGrid">
        <div className="box">
          <h2>Sentiment Breakdown</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                label
              >
                {pieData.map((item, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="box">
          <h2>Platform Volume</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="box full">
          <h2>Top Likes</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={likeData}>
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Bar dataKey="likes" fill="#f59e0b" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h2 className="titlePosts">Recent Mentions</h2>

      <div className="tableWrap">
        {filteredPosts.map((post, i) => (
          <div key={i} className="row">
            <div>{post.platform}</div>
            <div>{post.brand}</div>
            <div>{post.content}</div>
            <div>
              <span className={post.sentiment === "Positive" ? "good" : "bad"}>
                {post.sentiment}
              </span>
            </div>
            <div>👍 {post.likes}</div>
          </div>
        ))}
      </div>
    </div>
  );
}