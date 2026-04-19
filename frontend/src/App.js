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
  ResponsiveContainer
} from "recharts";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/posts")
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

  const positive = filteredPosts.filter(
    (p) => p.sentiment === "Positive"
  ).length;

  const negative = filteredPosts.filter(
    (p) => p.sentiment === "Negative"
  ).length;

  const facebook = filteredPosts.filter(
    (p) => p.platform === "Facebook"
  ).length;

  const tiktok = filteredPosts.filter(
    (p) => p.platform === "TikTok"
  ).length;

  const youtube = filteredPosts.filter(
    (p) => p.platform === "YouTube"
  ).length;

  const pieData = [
    { name: "Positive", value: positive },
    { name: "Negative", value: negative }
  ];

  const barData = [
    { name: "Facebook", value: facebook },
    { name: "TikTok", value: tiktok },
    { name: "YouTube", value: youtube }
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  const topPlatform =
    facebook >= tiktok && facebook >= youtube
      ? "Facebook"
      : tiktok >= youtube
      ? "TikTok"
      : "YouTube";

  return (
    <div className="page">
      <h1>📊 Social Listening Dashboard</h1>

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
          <option value="All">All</option>
          <option value="Facebook">Facebook</option>
          <option value="TikTok">TikTok</option>
          <option value="YouTube">YouTube</option>
        </select>
      </div>

      <div className="statsRow">
        <div className="statCard">
          <h3>Total Posts</h3>
          <p>{filteredPosts.length}</p>
        </div>

        <div className="statCard">
          <h3>Positive</h3>
          <p>{positive}</p>
        </div>

        <div className="statCard">
          <h3>Negative</h3>
          <p>{negative}</p>
        </div>

        <div className="statCard">
          <h3>Top Platform</h3>
          <p>{topPlatform}</p>
        </div>
      </div>

      <div className="chartWrap">
        <div className="box">
          <h2>Sentiment Chart</h2>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={90}
                label
              >
                {pieData.map((item, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="box">
          <h2>Platform Chart</h2>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#ffffff" />
              <YAxis stroke="#ffffff" />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h2 className="titlePosts">Recent Posts</h2>

      {filteredPosts.map((post, i) => (
        <div key={i} className="card">
          <strong>{post.platform}</strong> | {post.brand}
          <br />
          {post.content}
          <br />
          <span
            style={{
              color:
                post.sentiment === "Positive"
                  ? "#22c55e"
                  : "#ef4444",
              fontWeight: "bold"
            }}
          >
            {post.sentiment}
          </span>
          {" "}👍 {post.likes}
        </div>
      ))}
    </div>
  );
}