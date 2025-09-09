import React, { useEffect, useMemo, useState } from "react";
import {
  getTrades,
  getTradeCodes,
  patchTrade,
  deleteTrade,
  createTrade,
} from "./api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer
} from "recharts";

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(true);
  
  // constants
  const PAGE_SIZE = 50;

  // filters
  const [codes, setCodes] = useState([]);
  const [code, setCode] = useState("");

  // data + ui
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // edit state
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({ close: "", volume: "" });

  // create state
  const [newRow, setNewRow] = useState({
    date: "",
    trade_code: "",
    open: "",
    high: "",
    low: "",
    close: "",
    volume: "",
  });

  // Toggle theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light');
    document.body.classList.toggle('dark');
  };

  // Apply theme class on initial render
  useEffect(() => {
    document.body.classList.add(darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // helpers
  const num = (v) =>
    v === "" || v == null ? 0 : Number(String(v).replace(/,/g, ""));

  // load codes once
  useEffect(() => {
    getTradeCodes().then(setCodes).catch(() => setCodes([]));
  }, []);

  // load trades on filter/page change
  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await getTrades({
          trade_code: code || undefined,
          sort: "date",
          order: "asc",
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
        });
        if (!on) return;
        setRows(res.items || []);
        setTotal(Number(res.total || 0));
      } catch {
        if (on) setErr("Failed to load data");
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [code, page]);

  const chartData = useMemo(() => rows, [rows]);

  // edit handlers
  const startEdit = (r) => {
    setEditingId(r.id);
    setEdit({ close: r.close, volume: r.volume });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEdit({ close: "", volume: "" });
  };
  const saveEdit = async (id) => {
    const payload = { close: num(edit.close), volume: num(edit.volume) };
    await patchTrade(id, payload);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...payload } : r)));
    cancelEdit();
  };

  // create handler
  const addRow = async () => {
    if (!newRow.date || !newRow.trade_code) {
      alert("date and trade_code are required");
      return;
    }
    const payload = {
      date: newRow.date.trim(),
      trade_code: newRow.trade_code.trim(),
      open: num(newRow.open),
      high: num(newRow.high),
      low: num(newRow.low),
      close: num(newRow.close),
      volume: num(newRow.volume),
    };
    const created = await createTrade(payload);
    // append locally; consider jumping to last page if you want to see it
    setRows((prev) => [...prev, created]);
    setTotal((t) => t + 1);
    setNewRow({
      date: "",
      trade_code: "",
      open: "",
      high: "",
      low: "",
      close: "",
      volume: "",
    });
  };

  // delete handler
  const removeRow = async (id) => {
    await deleteTrade(id);
    setRows((prev) => prev.filter((r) => r.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  };

  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  // Theme variables
  const theme = {
    background: darkMode ? '#0f172a' : '#f8fafc',
    surface: darkMode ? '#1e293b' : '#ffffff',
    surfaceElevated: darkMode ? '#334155' : '#f1f5f9',
    text: darkMode ? '#e2e8f0' : '#334155',
    textMuted: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0',
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    chartLine: '#8b5cf6',
    chartBar: '#3b82f6',
  };

  const styles = {
    container: {
      maxWidth: 1200,
      margin: "24px auto",
      padding: "24px 16px",
      fontFamily: "'Inter', system-ui, sans-serif",
      backgroundColor: theme.background,
      color: theme.text,
      minHeight: "100vh",
      transition: "all 0.3s ease",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
      flexWrap: "wrap",
      gap: "12px",
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      marginBottom: "24px",
      border: `1px solid ${theme.border}`,
      transition: "all 0.3s ease",
    },
    filterContainer: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
      marginBottom: "20px",
      flexWrap: "wrap",
    },
    select: {
      padding: "10px 12px",
      borderRadius: "8px",
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.surfaceElevated,
      color: theme.text,
      fontSize: "14px",
      minWidth: "150px",
    },
    button: {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "none",
      fontWeight: "500",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    buttonPrimary: {
      backgroundColor: theme.primary,
      color: "white",
    },
    buttonSecondary: {
      backgroundColor: theme.surfaceElevated,
      color: theme.text,
      border: `1px solid ${theme.border}`,
    },
    buttonDanger: {
      backgroundColor: theme.danger,
      color: "white",
    },
    buttonSuccess: {
      backgroundColor: theme.success,
      color: "white",
    },
    input: {
      padding: "10px 12px",
      borderRadius: "8px",
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.surfaceElevated,
      color: theme.text,
      fontSize: "14px",
      minWidth: "120px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      backgroundColor: theme.surface,
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    },
    th: {
      padding: "16px 12px",
      textAlign: "left",
      fontSize: "14px",
      fontWeight: "600",
      color: theme.text,
      backgroundColor: theme.surfaceElevated,
      borderBottom: `1px solid ${theme.border}`,
    },
    td: {
      padding: "14px 12px",
      borderBottom: `1px solid ${theme.border}`,
      whiteSpace: "nowrap",
    },
    pagination: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
      justifyContent: "center",
      marginTop: "20px",
    },
    chartContainer: {
      backgroundColor: theme.surface,
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "24px",
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>
          Stocks Dashboard
        </h2>
        <button 
          onClick={toggleTheme} 
          style={{
            ...styles.button,
            ...styles.buttonSecondary,
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Filters */}
      <div style={{...styles.card, padding: "16px 20px"}}>
        <div style={styles.filterContainer}>
          <label htmlFor="code" style={{fontWeight: "500"}}>Trade Code:</label>
          <select
            id="code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setPage(0);
            }}
            style={styles.select}
          >
            <option value="">All Codes</option>
            {codes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          
          {loading && (
            <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
              <div style={{
                width: "16px",
                height: "16px",
                border: `2px solid ${theme.border}`,
                borderTop: `2px solid ${theme.primary}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}></div>
              <span>Loading...</span>
            </div>
          )}
          
          {err && (
            <span style={{ 
              color: theme.danger, 
              display: "flex", 
              alignItems: "center", 
              gap: "6px" 
            }}>
              <span>⚠️</span> {err}
            </span>
          )}
        </div>
      </div>

      {/* Charts */}
      <div style={styles.chartContainer}>
        <h3 style={{margin: "0 0 16px 0", fontSize: "18px"}}>Price Trend</h3>
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
              <XAxis dataKey="date" hide />
              <YAxis yAxisId="left" stroke={theme.textMuted} />
              <YAxis yAxisId="right" orientation="right" stroke={theme.textMuted} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme.surface, 
                  border: `1px solid ${theme.border}`,
                  borderRadius: "8px",
                  color: theme.text
                }} 
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="close" 
                stroke={theme.chartLine} 
                strokeWidth={2}
                dot={false} 
                activeDot={{ r: 6, fill: theme.chartLine }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.chartContainer}>
        <h3 style={{margin: "0 0 16px 0", fontSize: "18px"}}>Volume</h3>
        <div style={{ height: "200px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
              <XAxis dataKey="date" hide />
              <YAxis stroke={theme.textMuted} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme.surface, 
                  border: `1px solid ${theme.border}`,
                  borderRadius: "8px",
                  color: theme.text
                }} 
              />
              <Bar dataKey="volume" fill={theme.chartBar} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Create new row */}
      <div style={styles.card}>
        <h3 style={{margin: "0 0 16px 0", fontSize: "18px"}}>Add New Trade</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px" }}>
          <input
            placeholder="Date (YYYY-MM-DD)"
            value={newRow.date}
            onChange={(e) => setNewRow({ ...newRow, date: e.target.value })}
            style={styles.input}
          />
          <input
            placeholder="Trade Code"
            value={newRow.trade_code}
            onChange={(e) =>
              setNewRow({ ...newRow, trade_code: e.target.value })
            }
            style={styles.input}
          />
          <input
            placeholder="Open"
            value={newRow.open}
            onChange={(e) => setNewRow({ ...newRow, open: e.target.value })}
            style={styles.input}
          />
          <input
            placeholder="High"
            value={newRow.high}
            onChange={(e) => setNewRow({ ...newRow, high: e.target.value })}
            style={styles.input}
          />
          <input
            placeholder="Low"
            value={newRow.low}
            onChange={(e) => setNewRow({ ...newRow, low: e.target.value })}
            style={styles.input}
          />
          <input
            placeholder="Close"
            value={newRow.close}
            onChange={(e) => setNewRow({ ...newRow, close: e.target.value })}
            style={styles.input}
          />
          <input
            placeholder="Volume"
            value={newRow.volume}
            onChange={(e) => setNewRow({ ...newRow, volume: e.target.value })}
            style={styles.input}
          />
          <button 
            onClick={addRow} 
            style={{...styles.button, ...styles.buttonSuccess, gridColumn: "1 / -1", justifySelf: "start"}}
          >
            + Add Trade
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={styles.card}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px"}}>
          <h3 style={{margin: 0, fontSize: "18px"}}>Trade Records</h3>
          <div style={{color: theme.textMuted, fontSize: "14px"}}>
            Total: {total} records
          </div>
        </div>
        
        <div style={{ overflowX: "auto", borderRadius: "8px", border: `1px solid ${theme.border}` }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {[
                  "ID",
                  "Date",
                  "Code",
                  "Open",
                  "High",
                  "Low",
                  "Close",
                  "Volume",
                  "Actions",
                ].map((h) => (
                  <th key={h} style={styles.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{transition: "background-color 0.2s ease"}}>
                  <td style={styles.td}>{r.id}</td>
                  <td style={styles.td}>{r.date}</td>
                  <td style={{...styles.td, fontWeight: "500"}}>{r.trade_code}</td>
                  <td style={styles.td}>{r.open}</td>
                  <td style={styles.td}>{r.high}</td>
                  <td style={styles.td}>{r.low}</td>

                  {/* editable close */}
                  <td style={styles.td}>
                    {editingId === r.id ? (
                      <input
                        value={edit.close}
                        onChange={(e) =>
                          setEdit({ ...edit, close: e.target.value })
                        }
                        style={{...styles.input, width: "90px", padding: "6px 8px"}}
                      />
                    ) : (
                      r.close
                    )}
                  </td>

                  {/* editable volume */}
                  <td style={styles.td}>
                    {editingId === r.id ? (
                      <input
                        value={edit.volume}
                        onChange={(e) =>
                          setEdit({ ...edit, volume: e.target.value })
                        }
                        style={{...styles.input, width: "110px", padding: "6px 8px"}}
                      />
                    ) : (
                      r.volume
                    )}
                  </td>

                  <td style={styles.td}>
                    {editingId === r.id ? (
                      <div style={{display: "flex", gap: "8px"}}>
                        <button 
                          onClick={() => saveEdit(r.id)} 
                          style={{...styles.button, ...styles.buttonPrimary, padding: "6px 12px"}}
                        >
                          Save
                        </button>
                        <button 
                          onClick={cancelEdit} 
                          style={{...styles.button, ...styles.buttonSecondary, padding: "6px 12px"}}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{display: "flex", gap: "8px"}}>
                        <button 
                          onClick={() => startEdit(r)} 
                          style={{...styles.button, ...styles.buttonSecondary, padding: "6px 12px"}}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeRow(r.id)}
                          style={{...styles.button, ...styles.buttonDanger, padding: "6px 12px"}}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} style={{ padding: "32px", color: theme.textMuted, textAlign: "center" }}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={styles.pagination}>
          <button 
            disabled={page === 0} 
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
              opacity: page === 0 ? 0.5 : 1
            }}
          >
            Previous
          </button>
          <span style={{color: theme.textMuted}}>
            Page <strong>{Math.min(page + 1, maxPage + 1)}</strong> of <strong>{maxPage + 1}</strong>
          </span>
          <button
            disabled={page >= maxPage}
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
              opacity: page >= maxPage ? 0.5 : 1
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add CSS animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          
          tr:hover {
            background-color: ${theme.surfaceElevated};
          }
        `}
      </style>
    </div>
  );
}