import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./App.css";


function App() {

  const [monitors, setMonitors] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [showAddMonitor, setShowAddMonitor] = useState(false);

const [monitorForm, setMonitorForm] = useState({
  name: "",
  url: "",
  method: "GET",
  expected_status: 200,
  timeout: 5,
});
  const [loading, setLoading] = useState(true);
  const resolveIncident = async (incidentId) => {
  try {
    const response = await fetch(
  `https://smart-api-reliability-backend.onrender.com/api/incidents/${incidentId}/resolve/`,
  {
    method: "POST",
  }
);
    if (!response.ok) {
      throw new Error("Failed to resolve incident");
    }

    const updatedIncident = await response.json();

    setIncidents((currentIncidents) =>
      currentIncidents.map((incident) =>
        incident.id === incidentId
          ? updatedIncident
          : incident
      )
    );

  } catch (error) {
    console.error("Resolve Incident error:", error);
  }
};

  const [activePage, setActivePage] = useState("dashboard");
  const addMonitor = async () => {
  const payload = {
    name: monitorForm.name.trim(),
    url: monitorForm.url.trim(),
    method: monitorForm.method,
    expected_status: Number(monitorForm.expected_status),
    timeout: Number(monitorForm.timeout),
    is_active: true,
  };

  if (!payload.name || !payload.url) {
    alert("Please enter monitor name and API URL.");
    return;
  }

  try {
    const response = await fetch(
      "https://smart-api-reliability-backend.onrender.com/api/monitors/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Create monitor error:", data);
      alert("Failed to create monitor. Check the console.");
      return;
    }

    setMonitors((currentMonitors) => [
      ...currentMonitors,
      {
        ...data,
        check: null,
        metrics: {
          total_checks: 0,
          successful_checks: 0,
          failed_checks: 0,
          availability: 0,
          average_response_time: 0,
          reliability_score: 0,
        },
        results: [],
      },
    ]);

    setMonitorForm({
      name: "",
      url: "",
      method: "GET",
      expected_status: 200,
      timeout: 5,
    });

    setShowAddMonitor(false);
  } catch (error) {
    console.error("Add monitor error:", error);
    alert("Could not connect to Django.");
  }
};


  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
   



    const loadDashboardData = async () => {

      try {

        // Load incidents
        const incidentResponse = await fetch(
          "https://smart-api-reliability-backend.onrender.com/api/incidents/"
        );

        if (incidentResponse.ok) {

          const incidentData =
            await incidentResponse.json();

          setIncidents(incidentData);

        }


        // Load monitors
        const monitorResponse = await fetch(
          "https://smart-api-reliability-backend.onrender.com/api/monitors/"
        );

        const monitorList =
          await monitorResponse.json();


        // Load details for every monitor
        const detailedMonitors =
          await Promise.all(

            monitorList.map(async (monitor) => {

              try {

                const checkResponse =
                  await fetch(
                    `https://smart-api-reliability-backend.onrender.com/api/monitors/${monitor.id}/check/`,
                    {
                      method: "POST",
                    }
                  );

                const check =
                  await checkResponse.json();


                const metricsResponse =
                  await fetch(
                    `https://smart-api-reliability-backend.onrender.com/api/monitors/${monitor.id}/metrics/`
                  );

                const metrics =
                  await metricsResponse.json();


                const resultsResponse =
                  await fetch(
                    `https://smart-api-reliability-backend.onrender.com/api/monitors/${monitor.id}/results/`
                  );

                const results =
                  await resultsResponse.json();


                const degradationResponse =
                  await fetch(
                    `https://smart-api-reliability-backend.onrender.com/api/monitors/${monitor.id}/degradation/`
                  );

                const degradation =
                  await degradationResponse.json();


                return {
                  ...monitor,
                  check,
                  metrics,
                  results,
                  degradation,
                };

              } catch (error) {

                console.error(
                  `Monitor ${monitor.id} error:`,
                  error
                );

                return {
                  ...monitor,

                  check: {
                    status_code: null,
                    response_time: null,
                    is_healthy: false,
                  },

                  metrics: {
                    total_checks: 0,
                    successful_checks: 0,
                    failed_checks: 0,
                    availability: 0,
                    average_response_time: 0,
                    reliability_score: 0,
                  },

                  results: [],

                  degradation: {
                    is_degraded: false,
                  },
                };

              }

            })

          );


        setMonitors(detailedMonitors);

        setLoading(false);

      } catch (error) {

        console.error(
          "Dashboard API error:",
          error
        );

        setLoading(false);

      }

    };


    loadDashboardData();

  }, []);


  // ==========================================
  // RESOLVE INCIDENT
  // ==========================================

  


  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {

    return (

      <div className="dashboard">

        <div className="loading">
          Loading Smart API Reliability Platform...
        </div>

      </div>

    );

  }


  // ==========================================
  // DASHBOARD CALCULATIONS
  // ==========================================

  const totalApis =
    monitors.length;


  const healthyApis =
    monitors.filter(
      (monitor) =>
        monitor.check?.is_healthy === true
    ).length;


  const failedApis =
    totalApis - healthyApis;


  const responseTimes =
    monitors
      .map(
        (monitor) =>
          monitor.check?.response_time
      )
      .filter(
        (time) =>
          time !== null &&
          time !== undefined
      );


  const averageLatency =
    responseTimes.length > 0
      ? (
          responseTimes.reduce(
            (sum, time) =>
              sum + Number(time),
            0
          ) / responseTimes.length
        ).toFixed(2)
      : "0.00";


  const openIncidents =
    incidents.filter(
      (incident) =>
        incident.status === "OPEN"
    ).length;


  return (

    <div className="dashboard">


      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside className="sidebar">

        <div className="logo">
          Smart<span>API</span>
        </div>


        <nav>


          <div
            className={
              activePage === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }

            onClick={() =>
              setActivePage("dashboard")
            }
          >
            Dashboard
          </div>


          <div
            className={
              activePage === "monitors"
                ? "nav-item active"
                : "nav-item"
            }

            onClick={() =>
              setActivePage("monitors")
            }
          >
            Monitors
          </div>


          <div
            className={
              activePage === "incidents"
                ? "nav-item active"
                : "nav-item"
            }

            onClick={() =>
              setActivePage("incidents")
            }
          >
            Incidents

            {openIncidents > 0 && (
              <span className="nav-count">
                {openIncidents}
              </span>
            )}

          </div>


          <div
            className={
              activePage === "analytics"
                ? "nav-item active"
                : "nav-item"
            }

            onClick={() =>
              setActivePage("analytics")
            }
          >
            Analytics
          </div>


        </nav>

      </aside>


      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <main className="main-content">


        {/* ===================================
            DASHBOARD PAGE
        ==================================== */}

        {activePage === "dashboard" && (

          <>

            <header className="dashboard-header">

              <div>

                <span className="eyebrow">
                  API OBSERVABILITY
                </span>

                <h1>
                  API Reliability Dashboard
                </h1>

                <p>
                  Monitor availability, latency and API health
                </p>

              </div>


              <div className="system-status">

                <span className="status-dot"></span>

                System Operational

              </div>

            </header>


            {/* SUMMARY */}

            <section className="summary-grid">


              <div className="summary-card blue">

                <span>Total APIs</span>

                <strong>
                  {totalApis}
                </strong>

              </div>


              <div className="summary-card green">

                <span>Healthy APIs</span>

                <strong>
                  {healthyApis}
                </strong>

              </div>


              <div className="summary-card red">

                <span>Failed APIs</span>

                <strong>
                  {failedApis}
                </strong>

              </div>


              <div className="summary-card purple">

                <span>Avg Latency</span>

                <strong>
                  {averageLatency}s
                </strong>

              </div>


            </section>


            {/* API MONITORS */}

            <section>

              <div className="section-title">

                <div>

                  <h2>
                    API Monitors
                  </h2>

                  <span>
                    Live monitoring status
                  </span>

                </div>

                <span>
                  {totalApis} monitored
                </span>

              </div>


              <div className="monitor-grid">


                {monitors.map((monitor) => {

                  const healthy =
                    monitor.check?.is_healthy === true;

                  const reliability =
                    monitor.metrics
                      ?.reliability_score ?? 0;


                  return (

                    <div
                      className="monitor-card"
                      key={monitor.id}
                    >

                      <div className="monitor-header">

                        <div>

                          <h3>
                            {monitor.name}
                          </h3>

                          <p className="api-url">
                            {monitor.url}
                          </p>

                        </div>


                        <span
                          className={
                            healthy
                              ? "badge healthy"
                              : "badge failed"
                          }
                        >
                          ●{" "}
                          {healthy
                            ? "HEALTHY"
                            : "FAILED"}
                        </span>

                      </div>


                      <div className="monitor-info">


                        <div className="info-box">

                          <span>
                            HTTP STATUS
                          </span>

                          <strong>
                            {monitor.check?.status_code ??
                              "N/A"}
                          </strong>

                        </div>


                        <div className="info-box">

                          <span>
                            RESPONSE TIME
                          </span>

                          <strong>

                            {monitor.check?.response_time != null
                              ? `${Number(
                                  monitor.check.response_time
                                ).toFixed(2)}s`
                              : "N/A"}

                          </strong>

                        </div>


                        <div className="info-box">

                          <span>
                            TOTAL CHECKS
                          </span>

                          <strong>
                            {monitor.metrics?.total_checks ??
                              0}
                          </strong>

                        </div>


                        <div className="info-box">

                          <span>
                            FAILED CHECKS
                          </span>

                          <strong>
                            {monitor.metrics?.failed_checks ??
                              0}
                          </strong>

                        </div>


                      </div>


                      <div className="reliability">

                        <div className="reliability-header">

                          <span>
                            Reliability
                          </span>

                          <strong>
                            {reliability}%
                          </strong>

                        </div>


                        <div className="progress-bar">

                          <div
                            className="progress"
                            style={{
                              width:
                                `${reliability}%`,
                            }}
                          />

                        </div>

                      </div>


                    </div>

                  );

                })}

              </div>

            </section>


            {/* RESPONSE TIME */}

            <section className="chart-section">

              <div className="section-title">

                <div>

                  <h2>
                    Response Time History
                  </h2>

                  <span>
                    Recent monitoring performance
                  </span>

                </div>

              </div>


              <div className="chart-card">

                <ResponsiveContainer
                  width="100%"
                  height={320}
                >

                  <LineChart
                    data={
                      monitors[0]?.results
                        ?.slice(-10)
                        .map(
                          (result, index) => ({
                            check:
                              `Check ${index + 1}`,

                            responseTime:
                              result.response_time ??
                              0,
                          })
                        ) || []
                    }
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.08)"
                    />


                    <XAxis
                      dataKey="check"
                      stroke="#94a3b8"

                      tick={{
                        fill: "#94a3b8",
                        fontSize: 11,
                        fontFamily:
                          "Inter, sans-serif",
                      }}
                    />


                    <YAxis
                      stroke="#94a3b8"
                      unit="s"

                      tick={{
                        fill: "#94a3b8",
                        fontSize: 11,
                        fontFamily:
                          "Inter, sans-serif",
                      }}
                    />


                    <Tooltip

                      contentStyle={{
                        background: "#111827",
                        border:
                          "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        color: "#ffffff",
                        fontFamily:
                          "Inter, sans-serif",
                      }}

                      labelStyle={{
                        color: "#ffffff",
                        fontFamily:
                          "Inter, sans-serif",
                        fontWeight: 600,
                      }}

                      itemStyle={{
                        color: "#38bdf8",
                        fontFamily:
                          "Inter, sans-serif",
                      }}

                      formatter={(value) => [
                        `${Number(value).toFixed(2)}s`,
                        "Response Time",
                      ]}

                    />


                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#38bdf8"
                      strokeWidth={3}

                      dot={{
                        r: 5,
                        fill: "#38bdf8",
                      }}

                      activeDot={{
                        r: 7,
                      }}

                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            </section>

          </>

        )}


        {/* ===================================
            END OF PART 1
        ==================================== */}

        {/* ===================================
            MONITORS PAGE
        ==================================== */}

        {activePage === "monitors" && (

          <section className="page-section">

            <div className="page-header">

              <div>

                <span className="eyebrow">
                  API MONITORING
                </span>

                <h1>
                  Monitors
                </h1>

                <p>
                  Manage and inspect monitored APIs
                </p>
                <button
  type="button"
  className="add-monitor-btn"
  onClick={() => setShowAddMonitor(true)}
>
  + Add Monitor
</button>

              </div>
              {showAddMonitor && (
  <div className="add-monitor-form">

    <h2>Add API Monitor</h2>

    <input
      type="text"
      placeholder="Monitor name"
      value={monitorForm.name}
      onChange={(e) =>
        setMonitorForm({
          ...monitorForm,
          name: e.target.value,
        })
      }
    />

    <input
      type="url"
      placeholder="API URL"
      value={monitorForm.url}
      onChange={(e) =>
        setMonitorForm({
          ...monitorForm,
          url: e.target.value,
        })
      }
    />

    <select
      value={monitorForm.method}
      onChange={(e) =>
        setMonitorForm({
          ...monitorForm,
          method: e.target.value,
        })
      }
    >
      <option value="GET">GET</option>
      <option value="POST">POST</option>
    </select>

    <input
      type="number"
      placeholder="Expected Status"
      value={monitorForm.expected_status}
      onChange={(e) =>
        setMonitorForm({
          ...monitorForm,
          expected_status: e.target.value,
        })
      }
    />

    <input
      type="number"
      placeholder="Timeout"
      value={monitorForm.timeout}
      onChange={(e) =>
        setMonitorForm({
          ...monitorForm,
          timeout: e.target.value,
        })
      }
    />

    <button
      type="button"
      onClick={addMonitor}
    >
      Add Monitor
    </button>

    <button
      type="button"
      onClick={() => setShowAddMonitor(false)}
    >
      Cancel
    </button>

  </div>
)}


              <div className="system-status">

                <span className="status-dot"></span>

                Live Monitoring

              </div>

            </div>


            <div className="monitor-grid">

              {monitors.map((monitor) => {

                const healthy =
                  monitor.check?.is_healthy === true;

                const metrics =
                  monitor.metrics || {};

                const reliability =
                  metrics.reliability_score ?? 0;

                const degraded =
                  monitor.degradation?.is_degraded === true;


                return (

                  <div
                    className="monitor-card"
                    key={monitor.id}
                  >

                    {/* MONITOR HEADER */}

                    <div className="monitor-header">

                      <div>

                        <h3>
                          {monitor.name}
                        </h3>

                        <p className="api-url">
                          {monitor.url}
                        </p>

                      </div>


                      <span
                        className={
                          healthy
                            ? "badge healthy"
                            : "badge failed"
                        }
                      >
                        ●{" "}
                        {healthy
                          ? "HEALTHY"
                          : "FAILED"}
                      </span>

                    </div>


                    {/* MONITOR DETAILS */}

                    <div className="monitor-info">

                      <div className="info-box">

                        <span>
                          METHOD
                        </span>

                        <strong>
                          {monitor.method}
                        </strong>

                      </div>


                      <div className="info-box">

                        <span>
                          HTTP STATUS
                        </span>

                        <strong>
                          {monitor.check?.status_code ??
                            "N/A"}
                        </strong>

                      </div>


                      <div className="info-box">

                        <span>
                          AVG RESPONSE
                        </span>

                        <strong>

                          {metrics.average_response_time != null
                            ? `${Number(
                                metrics.average_response_time
                              ).toFixed(2)}s`
                            : "N/A"}

                        </strong>

                      </div>


                      <div className="info-box">

                        <span>
                          AVAILABILITY
                        </span>

                        <strong>
                          {metrics.availability ?? 0}%
                        </strong>

                      </div>

                    </div>


                    {/* RELIABILITY */}

                    <div className="reliability">

                      <div className="reliability-header">

                        <span>
                          Reliability Score
                        </span>

                        <strong>
                          {reliability}%
                        </strong>

                      </div>


                      <div className="progress-bar">

                        <div
                          className="progress"
                          style={{
                            width:
                              `${reliability}%`,
                          }}
                        />

                      </div>

                    </div>


                    {/* DEGRADATION */}

                    {degraded && (

                      <div className="degradation-warning">

                        ⚠ Performance degradation detected

                      </div>

                    )}

                  </div>

                );

              })}

            </div>

          </section>

        )}


        {/* ===================================
            INCIDENTS PAGE
        ==================================== */}

        {activePage === "incidents" && (

          <section className="page-section">

            <div className="page-header">

              <div>

                <span className="eyebrow">
                  INCIDENT MANAGEMENT
                </span>

                <h1>
                  Incidents
                </h1>

                <p>
                  Track and manage API reliability incidents
                </p>

              </div>


              <div className="incident-summary">

                <span className="incident-dot"></span>

                {openIncidents} Open

              </div>

            </div>


            <div className="incident-grid">


              {incidents.length === 0 ? (

                <div className="empty-state">

                  <h2>
                    All Systems Operational
                  </h2>

                  <p>
                    No incidents have been detected.
                  </p>

                </div>

              ) : (

                incidents.map((incident) => (

                  <div
                    className="incident-card"
                    key={incident.id}
                  >

                    {/* INCIDENT HEADER */}

                    <div className="incident-card-header">

                      <div>

                        <h2>
                          {incident.incident_type}
                        </h2>

                        <p>
                          Monitor #{incident.monitor}
                        </p>

                      </div>


                      <span
                        className={
                          incident.status === "OPEN"
                            ? "incident-status open"
                            : "incident-status resolved"
                        }
                      >
                        {incident.status}
                      </span>

                    </div>


                    {/* MESSAGE */}

                    <div className="incident-message">

                      {incident.message}

                    </div>


                    {/* CREATED TIME */}

                    <div className="incident-meta">

                      Created:{" "}

                      {incident.created_at
                        ? new Date(
                            incident.created_at
                          ).toLocaleString()
                        : "N/A"}

                    </div>


                    {/* RESOLVE */}

                    {incident.status === "OPEN" && (

                      <button
                        className="resolve-btn"

                        onClick={() =>
                          resolveIncident(
                            incident.id
                          )
                        }
                      >
                        Resolve Incident
                      </button>

                    )}

                  </div>

                ))

              )}

            </div>

          </section>

        )}
        {/* ===================================
            ANALYTICS PAGE
        ==================================== */}

        {activePage === "analytics" && (

          <section className="page-section">

            {/* PAGE HEADER */}

            <div className="page-header">

              <div>

                <span className="eyebrow">
                  PERFORMANCE ANALYTICS
                </span>

                <h1>
                  Analytics
                </h1>

                <p>
                  Reliability and performance overview
                </p>

              </div>

            </div>


            {/* ANALYTICS SUMMARY */}

            <div className="analytics-grid">


              <div className="analytics-card">

                <span>
                  Overall Availability
                </span>

                <strong>

                  {monitors.length > 0
                    ? (
                        monitors.reduce(
                          (sum, monitor) =>
                            sum +
                            Number(
                              monitor.metrics?.availability || 0
                            ),
                          0
                        ) / monitors.length
                      ).toFixed(2)
                    : "0.00"}

                  %

                </strong>

              </div>


              <div className="analytics-card">

                <span>
                  Average Response Time
                </span>

                <strong>
                  {averageLatency}s
                </strong>

              </div>


              <div className="analytics-card">

                <span>
                  Total Checks
                </span>

                <strong>

                  {monitors.reduce(
                    (sum, monitor) =>
                      sum +
                      Number(
                        monitor.metrics?.total_checks || 0
                      ),
                    0
                  )}

                </strong>

              </div>


              <div className="analytics-card">

                <span>
                  Failed Checks
                </span>

                <strong className="danger-text">

                  {monitors.reduce(
                    (sum, monitor) =>
                      sum +
                      Number(
                        monitor.metrics?.failed_checks || 0
                      ),
                    0
                  )}

                </strong>

              </div>

            </div>


            {/* RELIABILITY OVERVIEW */}

            <div className="analytics-panel">

              <div className="section-title">

                <div>

                  <h2>
                    Reliability Overview
                  </h2>

                  <span>
                    Current reliability by API
                  </span>

                </div>

              </div>


              <div className="analytics-bars">

                {monitors.map((monitor) => {

                  const score =
                    Number(
                      monitor.metrics?.reliability_score || 0
                    );


                  return (

                    <div
                      className="analytics-bar"
                      key={monitor.id}
                    >

                      <div className="bar-header">

                        <span>
                          {monitor.name}
                        </span>

                        <strong>
                          {score}%
                        </strong>

                      </div>


                      <div className="bar-track">

                        <div
                          className="bar-fill"
                          style={{
                            width: `${score}%`,
                          }}
                        />

                      </div>

                    </div>

                  );

                })}

              </div>

            </div>


            {/* INCIDENT OVERVIEW */}

            <div className="analytics-panel">

              <div className="section-title">

                <div>

                  <h2>
                    Incident Overview
                  </h2>

                  <span>
                    Current incident status
                  </span>

                </div>

              </div>


              <div className="incident-analytics-grid">


                <div className="analytics-stat">

                  <span>
                    Total Incidents
                  </span>

                  <strong>
                    {incidents.length}
                  </strong>

                </div>


                <div className="analytics-stat">

                  <span>
                    Open
                  </span>

                  <strong className="danger-text">
                    {openIncidents}
                  </strong>

                </div>


                <div className="analytics-stat">

                  <span>
                    Resolved
                  </span>

                  <strong>

                    {
                      incidents.filter(
                        (incident) =>
                          incident.status === "RESOLVED"
                      ).length
                    }

                  </strong>

                </div>


              </div>

            </div>

          </section>

        )}


      </main>

    </div>

  );

}


export default App;